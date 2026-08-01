-- Repare la partie manquante de 20260604051652_mission_documents.sql.
--
-- Cette migration d'origine n'a jamais abouti : sa derniere instruction
-- utilisait « CREATE POLICY IF NOT EXISTS », syntaxe qui n'existe pas en
-- PostgreSQL. L'echec a annule la creation de la table, alors que les colonnes
-- ajoutees a `courriers` provenaient d'ailleurs et sont, elles, bien presentes.
-- Resultat : missionDocumentService.ts ecrit dans une table inexistante.
--
-- La policy d'origine etait « FOR ALL USING (true) WITH CHECK (true) », soit un
-- acces total ouvert a tous les roles, anon compris. Elle n'est pas reprise :
-- on applique le modele en vigueur depuis le durcissement du 29/07/2026,
-- private.has_role(auth.uid(), 'admin') reserve au role authenticated.

create table if not exists public.rapports_mission (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  file_format text not null default 'txt',
  contenu_parse text,
  file_path text,
  statut text not null default 'soumis',
  rapport_superviseur_id uuid,
  rapport_client_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- getRapportsMission filtre sur task_id et trie par created_at decroissant.
create index if not exists rapports_mission_task_id_created_at_idx
  on public.rapports_mission (task_id, created_at desc);

drop trigger if exists set_rapports_mission_updated_at on public.rapports_mission;
create trigger set_rapports_mission_updated_at
  before update on public.rapports_mission
  for each row execute function public.handle_updated_at();

alter table public.rapports_mission enable row level security;

drop policy if exists "rapports_mission_all" on public.rapports_mission;
drop policy if exists "auth manage rapports_mission" on public.rapports_mission;
create policy "auth manage rapports_mission" on public.rapports_mission
  for all to authenticated
  using (private.has_role((select auth.uid()), 'admin'))
  with check (private.has_role((select auth.uid()), 'admin'));

-- Bucket prive attendu par l'upload du service (5 Mo, comme la migration d'origine).
insert into storage.buckets (id, name, public, file_size_limit)
values ('rapports-mission', 'rapports-mission', false, 5242880)
on conflict (id) do nothing;

-- Policies de stockage calquees sur celles du bucket `media`.
drop policy if exists "rapports_mission_storage_all" on storage.objects;

drop policy if exists rapports_mission_storage_select on storage.objects;
create policy rapports_mission_storage_select on storage.objects
  for select to authenticated
  using (bucket_id = 'rapports-mission' and private.has_role((select auth.uid()), 'admin'));

drop policy if exists rapports_mission_storage_insert on storage.objects;
create policy rapports_mission_storage_insert on storage.objects
  for insert to authenticated
  with check (bucket_id = 'rapports-mission' and private.has_role((select auth.uid()), 'admin'));

drop policy if exists rapports_mission_storage_update on storage.objects;
create policy rapports_mission_storage_update on storage.objects
  for update to authenticated
  using (bucket_id = 'rapports-mission' and private.has_role((select auth.uid()), 'admin'));

drop policy if exists rapports_mission_storage_delete on storage.objects;
create policy rapports_mission_storage_delete on storage.objects
  for delete to authenticated
  using (bucket_id = 'rapports-mission' and private.has_role((select auth.uid()), 'admin'));
