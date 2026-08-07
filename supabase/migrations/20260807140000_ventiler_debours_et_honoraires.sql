-- Ventilation débours / honoraires — 07/08/2026.
--
-- `factures.montant` est un total indifférencié : il additionne les honoraires
-- du cabinet et les impôts encaissés pour le compte du client (IGS, Patente,
-- TDL, PSL…). Tous les agrégats de « chiffre d'affaires » tapaient dessus.
--
-- Sur les données existantes, l'écart est d'un facteur cinq : 2 194 739 F CFA
-- facturés, dont 1 752 739 d'impôts et 442 000 d'honoraires.
--
-- Les impôts refacturés sont des opérations pour compte de tiers, pas un
-- produit du cabinet. Deux notions distinctes doivent donc coexister :
--
--   * ce que le client DOIT          -> `montant` (inchangé, impôts compris)
--   * ce que le cabinet a PRODUIT    -> `montant_honoraires`
--
-- La ventilation est calculée par la base à partir des lignes, et non par le
-- code applicatif : trois écrans différents créent des lignes de facture, et
-- un total maintenu à la main finit toujours par diverger.

-- =====================================================================
-- 1. Colonnes de ventilation
-- =====================================================================
-- Le type applicatif `Facture` déclarait déjà `montant_impots` et
-- `montant_honoraires` (types/facture.ts) — sans colonnes correspondantes.
-- Elles existent désormais.

alter table public.factures
  add column if not exists montant_impots numeric not null default 0,
  add column if not exists montant_honoraires numeric not null default 0;

alter table public.devis
  add column if not exists montant_impots numeric not null default 0,
  add column if not exists montant_honoraires numeric not null default 0;

comment on column public.factures.montant_honoraires is
  'Part des lignes de type « honoraire » : le produit reel du cabinet. C''est cette colonne, et non `montant`, qui doit alimenter tout calcul de chiffre d''affaires.';
comment on column public.factures.montant_impots is
  'Part des lignes de type « impot » : sommes refacturees pour le compte du client (operations pour compte de tiers). Dues par le client, mais jamais un produit du cabinet.';

-- =====================================================================
-- 2. Recalcul automatique depuis les lignes
-- =====================================================================

create or replace function public.recalculer_ventilation_facture()
returns trigger
language plpgsql
set search_path to 'public', 'pg_temp'
as $$
declare v_facture text := coalesce(new.facture_id, old.facture_id);
begin
  update public.factures f
     set montant_impots = coalesce((
           select sum(fp.montant) from public.facture_prestations fp
            where fp.facture_id = v_facture and fp.type = 'impot'), 0),
         montant_honoraires = coalesce((
           select sum(fp.montant) from public.facture_prestations fp
            where fp.facture_id = v_facture and fp.type = 'honoraire'), 0)
   where f.id = v_facture;
  return null;
end;
$$;

create or replace function public.recalculer_ventilation_devis()
returns trigger
language plpgsql
set search_path to 'public', 'pg_temp'
as $$
declare v_devis text := coalesce(new.devis_id, old.devis_id);
begin
  update public.devis d
     set montant_impots = coalesce((
           select sum(dp.montant) from public.devis_prestations dp
            where dp.devis_id = v_devis and dp.type = 'impot'), 0),
         montant_honoraires = coalesce((
           select sum(dp.montant) from public.devis_prestations dp
            where dp.devis_id = v_devis and dp.type = 'honoraire'), 0)
   where d.id = v_devis;
  return null;
end;
$$;

-- Le document parent peut avoir disparu (suppression d'un brouillon, qui
-- cascade sur ses lignes) : l'UPDATE ne trouve alors aucune ligne, sans erreur.

drop trigger if exists recalculer_ventilation on public.facture_prestations;
create trigger recalculer_ventilation
  after insert or update or delete on public.facture_prestations
  for each row execute function public.recalculer_ventilation_facture();

drop trigger if exists recalculer_ventilation on public.devis_prestations;
create trigger recalculer_ventilation
  after insert or update or delete on public.devis_prestations
  for each row execute function public.recalculer_ventilation_devis();

revoke execute on function public.recalculer_ventilation_facture() from public, anon, authenticated;
revoke execute on function public.recalculer_ventilation_devis() from public, anon, authenticated;

-- =====================================================================
-- 3. Reprise des documents existants
-- =====================================================================

update public.factures f set
  montant_impots = coalesce((
    select sum(fp.montant) from public.facture_prestations fp
     where fp.facture_id = f.id and fp.type = 'impot'), 0),
  montant_honoraires = coalesce((
    select sum(fp.montant) from public.facture_prestations fp
     where fp.facture_id = f.id and fp.type = 'honoraire'), 0);

update public.devis d set
  montant_impots = coalesce((
    select sum(dp.montant) from public.devis_prestations dp
     where dp.devis_id = d.id and dp.type = 'impot'), 0),
  montant_honoraires = coalesce((
    select sum(dp.montant) from public.devis_prestations dp
     where dp.devis_id = d.id and dp.type = 'honoraire'), 0);
