-- Deux colonnes que l'application écrit déjà mais qui n'existent pas dans
-- le schéma. PostgREST rejette toute requête citant une colonne inconnue :
-- ce ne sont donc pas des données silencieusement perdues, mais deux
-- fonctionnalités qui échouent intégralement.
--
-- date_accuse : horodatage de l'accusé de réception, écrit par
--   CourrierHistorique lorsque le statut passe à « accusé ». Sans la
--   colonne, le changement de statut lui-même échoue.
--
-- notes : champ libre alimenté par l'import CSV de courriers
--   (CourrierImportExport), transmis à chaque ligne importée — y compris
--   vide, donc aucun import de courrier n'aboutit aujourd'hui.
--
-- Ajout purement additif : colonnes nullables, aucune donnée existante
-- n'est touchée, aucune contrainte n'est ajoutée.

alter table public.courriers
  add column if not exists date_accuse timestamptz,
  add column if not exists notes text;

comment on column public.courriers.date_accuse is
  'Horodatage de l''accusé de réception du courrier.';
comment on column public.courriers.notes is
  'Notes libres sur le courrier (renseignées notamment à l''import CSV).';
