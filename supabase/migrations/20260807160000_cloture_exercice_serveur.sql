-- Clôture d'exercice côté serveur — 07/08/2026.
--
-- La clôture vivait dans le `localStorage` du navigateur (`clotureComptable.ts`,
-- clé `cloturesComptables`). Trois conséquences : vider le cache rouvrait tous
-- les exercices, un second appareil n'en voyait aucun, et une pièce « archivée »
-- restait parfaitement modifiable — le filtre n'était qu'un affichage.
--
-- La clôture devient une décision d'entreprise enregistrée en base, et elle
-- verrouille réellement les écritures de l'exercice clos.

-- =====================================================================
-- 1. Le registre des exercices
-- =====================================================================
-- Un exercice absent de la table est ouvert : c'est la sémantique qu'avait
-- déjà le stockage local, où seules les clôtures étaient enregistrées.

create table if not exists public.exercices (
  annee int primary key,
  statut text not null default 'clos' check (statut in ('ouvert', 'clos')),
  cloture_le timestamptz not null default now(),
  cloture_par uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.exercices is
  'Exercices comptables clotures. Une annee absente est ouverte. L''historique des clotures et reouvertures est trace par audit_log, cette table etant journalisee.';

alter table public.exercices enable row level security;

drop policy if exists "les admins gerent les exercices" on public.exercices;
create policy "les admins gerent les exercices"
  on public.exercices for all to authenticated
  using (private.has_role((select auth.uid()), 'admin'))
  with check (private.has_role((select auth.uid()), 'admin'));

drop trigger if exists set_exercices_updated_at on public.exercices;
create trigger set_exercices_updated_at
  before update on public.exercices
  for each row execute function public.handle_updated_at();

-- Clôturer et rouvrir doivent laisser une trace.
drop trigger if exists journaliser_modification on public.exercices;
create trigger journaliser_modification
  after insert or update or delete on public.exercices
  for each row execute function public.journaliser_modification();

-- =====================================================================
-- 2. Le verrou
-- =====================================================================

create or replace function public.exercice_est_clos(p_annee int)
returns boolean
language sql
stable
set search_path to 'public', 'pg_temp'
as $$
  select exists (
    select 1 from public.exercices
     where annee = p_annee and statut = 'clos'
  );
$$;

comment on function public.exercice_est_clos(int) is
  'Vrai si l''exercice est clos. Une annee absente de la table est ouverte.';

-- Trigger générique : le nom de la colonne portant la date de rattachement
-- est passé en argument, ce qui évite d'écrire une fonction par table.
create or replace function public.verrouiller_exercice_clos()
returns trigger
language plpgsql
set search_path to 'public', 'pg_temp'
as $$
declare
  v_colonne text := tg_argv[0];
  v_annee_avant int;
  v_annee_apres int;
begin
  if tg_op <> 'INSERT' then
    v_annee_avant := extract(year from (to_jsonb(old) ->> v_colonne)::timestamptz);
  end if;
  if tg_op <> 'DELETE' then
    v_annee_apres := extract(year from (to_jsonb(new) ->> v_colonne)::timestamptz);
  end if;

  -- Les deux bornes sont contrôlées : on ne sort pas plus d'un exercice clos
  -- qu'on n'y entre. Déplacer une facture d'une année close vers une année
  -- ouverte reviendrait à modifier un exercice arrêté.
  if v_annee_avant is not null and public.exercice_est_clos(v_annee_avant) then
    raise exception
      'L''exercice % est clos : aucune ecriture n''y est possible. Rouvrez-le depuis Parametres > Cloture annuelle.',
      v_annee_avant using errcode = 'restrict_violation';
  end if;

  if v_annee_apres is not null and public.exercice_est_clos(v_annee_apres) then
    raise exception
      'L''exercice % est clos : aucune ecriture n''y est possible. Rouvrez-le depuis Parametres > Cloture annuelle.',
      v_annee_apres using errcode = 'restrict_violation';
  end if;

  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;

comment on function public.verrouiller_exercice_clos() is
  'Trigger BEFORE INSERT/UPDATE/DELETE. Refuse toute ecriture rattachee a un exercice clos. La colonne de rattachement est passee en argument du trigger.';

revoke execute on function public.verrouiller_exercice_clos() from public, anon, authenticated;
revoke execute on function public.exercice_est_clos(int) from anon;

-- Les lignes de document (facture_prestations, devis_prestations) n'ont pas
-- de date propre et ne reçoivent pas de trigger : les modifier déclenche
-- `recalculer_ventilation_*`, qui met à jour le document parent — lequel est
-- verrouillé. La protection est donc acquise indirectement.

drop trigger if exists verrouiller_exercice_clos on public.factures;
create trigger verrouiller_exercice_clos
  before insert or update or delete on public.factures
  for each row execute function public.verrouiller_exercice_clos('date');

drop trigger if exists verrouiller_exercice_clos on public.paiements;
create trigger verrouiller_exercice_clos
  before insert or update or delete on public.paiements
  for each row execute function public.verrouiller_exercice_clos('date');

drop trigger if exists verrouiller_exercice_clos on public.devis;
create trigger verrouiller_exercice_clos
  before insert or update or delete on public.devis
  for each row execute function public.verrouiller_exercice_clos('date');

drop trigger if exists verrouiller_exercice_clos on public.propositions;
create trigger verrouiller_exercice_clos
  before insert or update or delete on public.propositions
  for each row execute function public.verrouiller_exercice_clos('date');

drop trigger if exists verrouiller_exercice_clos on public.courriers;
create trigger verrouiller_exercice_clos
  before insert or update or delete on public.courriers
  for each row execute function public.verrouiller_exercice_clos('date_creation');

drop trigger if exists verrouiller_exercice_clos on public.fiscal_obligations;
create trigger verrouiller_exercice_clos
  before insert or update or delete on public.fiscal_obligations
  for each row execute function public.verrouiller_exercice_clos('date_echeance');

-- Les tâches ne sont pas des pièces comptables : le planning reste libre,
-- y compris pour un exercice clos.
