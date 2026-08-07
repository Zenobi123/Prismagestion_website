-- Piste d'audit — 07/08/2026.
--
-- Aucune table métier ne portait d'attribution ni d'historique : la base
-- disait ce qui est, jamais ce qui s'était passé. En cas de litige client ou
-- de contrôle, rien ne permettait d'établir quand une facture avait été émise
-- ni ce qu'une déclaration valait avant d'être corrigée.
--
-- La console n'ayant qu'un seul utilisateur, l'intérêt porte moins sur
-- « qui » que sur « quand » et « quoi » : le journal conserve donc le **diff**
-- de chaque modification, pas seulement son occurrence. `created_by` reste
-- utile pour distinguer une écriture faite par l'application authentifiée
-- d'une intervention directe en base (console Supabase, clé service_role).

-- =====================================================================
-- 1. `clients` n'avait pas de date de modification
-- =====================================================================
-- C'est pourtant la table la plus écrite : `fiscal_data` y est réenregistré
-- en entier à chaque sauvegarde d'obligations.

alter table public.clients
  add column if not exists updated_at timestamptz not null default now();

drop trigger if exists update_clients_updated_at on public.clients;
create trigger update_clients_updated_at
  before update on public.clients
  for each row execute function public.handle_updated_at();

-- =====================================================================
-- 2. Attribution : created_by / updated_by
-- =====================================================================

create or replace function public.marquer_auteur()
returns trigger
language plpgsql
set search_path to 'public', 'pg_temp'
as $$
begin
  if tg_op = 'INSERT' then
    new.created_by := coalesce(new.created_by, auth.uid());
  end if;
  new.updated_by := auth.uid();
  return new;
end;
$$;

comment on function public.marquer_auteur() is
  'Renseigne created_by a l''insertion et updated_by a chaque ecriture. auth.uid() vaut NULL lorsque l''ecriture ne vient pas d''une session authentifiee (console Supabase, cle service_role) : cette absence est elle-meme une information.';

do $$
declare t text;
begin
  foreach t in array array[
    'clients', 'factures', 'paiements', 'devis', 'propositions',
    'courriers', 'tasks', 'fiscal_obligations', 'documents_administratifs',
    'cabinet_config'
  ]
  loop
    execute format('alter table public.%I add column if not exists created_by uuid references auth.users(id) on delete set null', t);
    execute format('alter table public.%I add column if not exists updated_by uuid references auth.users(id) on delete set null', t);
    execute format('drop trigger if exists marquer_auteur on public.%I', t);
    execute format('create trigger marquer_auteur before insert or update on public.%I for each row execute function public.marquer_auteur()', t);
  end loop;
end $$;

-- =====================================================================
-- 3. Le journal
-- =====================================================================

create table if not exists public.audit_log (
  id bigint generated always as identity primary key,
  table_name text not null,
  -- text et non uuid : les clés primaires sont hétérogènes
  -- (`factures.id` est le numéro de facture, en text).
  row_id text,
  action text not null check (action in ('INSERT', 'UPDATE', 'DELETE')),
  acteur uuid,
  acteur_email text,
  fait_le timestamptz not null default now(),
  avant jsonb,
  apres jsonb
);

comment on table public.audit_log is
  'Journal des ecritures sur les tables metier. Alimente exclusivement par le trigger journaliser_modification() ; aucune policy d''ecriture n''existe pour les utilisateurs, le journal est donc en lecture seule depuis l''application.';
comment on column public.audit_log.avant is
  'Sur UPDATE : uniquement les colonnes dont la valeur a change, dans leur etat anterieur. Sur DELETE : la ligne entiere. Sur INSERT : NULL.';
comment on column public.audit_log.apres is
  'Sur UPDATE : uniquement les colonnes modifiees, dans leur nouvel etat. Sur INSERT : la ligne entiere. Sur DELETE : NULL.';

create index if not exists audit_log_ligne_idx
  on public.audit_log (table_name, row_id, fait_le desc);
create index if not exists audit_log_date_idx
  on public.audit_log (fait_le desc);

alter table public.audit_log enable row level security;

drop policy if exists "lecture du journal reservee aux admins" on public.audit_log;
create policy "lecture du journal reservee aux admins"
  on public.audit_log for select to authenticated
  using (private.has_role((select auth.uid()), 'admin'));

-- Aucune policy INSERT / UPDATE / DELETE : le journal ne se modifie pas.
-- Le trigger ci-dessous ecrit en SECURITY DEFINER, donc sous l'identite du
-- proprietaire de la fonction, qui n'est pas soumis a RLS.

create or replace function public.journaliser_modification()
returns trigger
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $$
declare
  v_row_id  text;
  v_avant   jsonb;
  v_apres   jsonb;
  v_acteur  uuid := auth.uid();
begin
  if tg_op = 'DELETE' then
    v_row_id := to_jsonb(old) ->> 'id';
    v_avant  := to_jsonb(old);

  elsif tg_op = 'INSERT' then
    v_row_id := to_jsonb(new) ->> 'id';
    v_apres  := to_jsonb(new);

  else
    v_row_id := to_jsonb(new) ->> 'id';

    -- Seules les colonnes reellement modifiees sont conservees. `updated_at`
    -- et `updated_by` changent a chaque ecriture : les inclure remplirait le
    -- journal de lignes sans contenu.
    select jsonb_object_agg(key, value) into v_avant
      from jsonb_each(to_jsonb(old))
     where key not in ('updated_at', 'updated_by')
       and value is distinct from (to_jsonb(new) -> key);

    select jsonb_object_agg(key, value) into v_apres
      from jsonb_each(to_jsonb(new))
     where key not in ('updated_at', 'updated_by')
       and value is distinct from (to_jsonb(old) -> key);

    -- Ecriture sans changement de fond : rien a journaliser.
    if v_apres is null and v_avant is null then
      return null;
    end if;
  end if;

  insert into public.audit_log
    (table_name, row_id, action, acteur, acteur_email, avant, apres)
  values
    (tg_table_name, v_row_id, tg_op, v_acteur,
     (select u.email from auth.users u where u.id = v_acteur),
     v_avant, v_apres);

  return null;
end;
$$;

comment on function public.journaliser_modification() is
  'Trigger generique AFTER INSERT/UPDATE/DELETE. Sur UPDATE, ne conserve que le differentiel des colonnes modifiees, hors updated_at/updated_by.';

do $$
declare t text;
begin
  foreach t in array array[
    'clients', 'factures', 'facture_prestations', 'paiements',
    'devis', 'devis_prestations', 'propositions', 'courriers', 'tasks',
    'fiscal_obligations', 'documents_administratifs',
    'procedures_administratives', 'collaborateurs', 'employes', 'paie',
    'conges', 'contrats_employes', 'rapports_mission', 'cabinet_config',
    'capital_social', 'actionnaires'
  ]
  loop
    execute format('drop trigger if exists journaliser_modification on public.%I', t);
    execute format('create trigger journaliser_modification after insert or update or delete on public.%I for each row execute function public.journaliser_modification()', t);
  end loop;
end $$;
