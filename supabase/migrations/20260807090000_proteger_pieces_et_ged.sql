-- Phase 1 de la remédiation structurelle de la console — 07/08/2026.
--
-- Trois corrections, toutes destinées à empêcher une perte de données que le
-- schéma rend aujourd'hui possible :
--
--   1. GED  — la référence d'un fichier devient un chemin, jamais une URL
--             signée (celles-ci expirent au bout d'une heure).
--   2. Pièces de facturation — un règlement ne disparaît plus avec la facture,
--             et une facture émise ne se supprime plus.
--   3. Dossiers clients — la suppression d'un client ne détruit plus en
--             cascade devis, propositions, pièces, obligations et employés.
--
-- Contexte d'usage : la console est utilisée par des stagiaires sous le rôle
-- `admin` (seul rôle défini à ce jour). Les garde-fous doivent donc vivre dans
-- la base, l'interface ne pouvant pas être la seule barrière.

-- =====================================================================
-- 1. GED : `fichier_url` -> `fichier_path`
-- =====================================================================
-- Le code persistait l'URL renvoyée par createSignedUrl(), valable 3600 s :
-- tout document déposé devenait inaccessible une heure plus tard. Le modèle
-- correct existait déjà dans `fiscalAttachmentService` (persister le chemin,
-- signer à la lecture) ; il est ici généralisé.
--
-- Aucune donnée à reprendre : `documents_administratifs` est vide (le bucket
-- `documents` lui-même n'existe que depuis le 01/08/2026, cf. docs/FUSION.md
-- § 3 bis). Le renommage est donc sans perte.

alter table public.documents_administratifs
  rename column fichier_url to fichier_path;

comment on column public.documents_administratifs.fichier_path is
  'Chemin de l''objet dans le bucket prive « documents » (forme : <client_id>/<uuid>.<ext>). Ne jamais y stocker une URL signee : elle expire au bout d''une heure. L''URL se genere a la lecture, via createSignedUrl().';

-- =====================================================================
-- 2. Immuabilite des pieces de facturation
-- =====================================================================

-- 2.1 Un paiement ne s'efface plus avec la facture qui l'a motive.
alter table public.paiements
  drop constraint if exists paiements_facture_id_fkey;

alter table public.paiements
  add constraint paiements_facture_id_fkey
  foreign key (facture_id) references public.factures(id)
  on delete restrict;

-- 2.2 Une facture sortie du brouillon a ete emise : elle s'annule
--     (status = 'annulee'), elle ne se supprime pas. Une facture deja annulee
--     reste une piece, donc reste protegee.
create or replace function public.factures_interdire_suppression_piece()
returns trigger
language plpgsql
set search_path to 'public', 'pg_temp'
as $$
begin
  if old.status is distinct from 'brouillon' then
    raise exception
      'La facture % a ete emise (statut : %) : elle ne peut pas etre supprimee. Annulez-la pour en conserver la trace.',
      old.id, old.status
      using errcode = 'restrict_violation';
  end if;
  return old;
end;
$$;

comment on function public.factures_interdire_suppression_piece() is
  'Refuse la suppression d''une facture qui n''est plus a l''etat de brouillon. Double le garde-fou applicatif de services/factureServices/factureDeleteService.ts, que l''API rendrait sinon contournable.';

drop trigger if exists factures_interdire_suppression_piece on public.factures;

create trigger factures_interdire_suppression_piece
  before delete on public.factures
  for each row
  execute function public.factures_interdire_suppression_piece();

-- =====================================================================
-- 3. Dossiers clients : fin des cascades destructrices
-- =====================================================================
-- `permanentDeleteClient()` ne verifiait que les taches non terminees. Pour un
-- client sans facture, la suppression emportait devis, propositions, pieces
-- administratives, obligations fiscales et employes (donc paies, conges et
-- contrats). RESTRICT rend l'operation impossible tant qu'un element subsiste :
-- la corbeille (statut « supprime » + deleted_at) reste la voie normale.

alter table public.devis
  drop constraint if exists devis_client_id_fkey;
alter table public.devis
  add constraint devis_client_id_fkey
  foreign key (client_id) references public.clients(id)
  on delete restrict;

alter table public.propositions
  drop constraint if exists propositions_client_id_fkey;
alter table public.propositions
  add constraint propositions_client_id_fkey
  foreign key (client_id) references public.clients(id)
  on delete restrict;

alter table public.documents_administratifs
  drop constraint if exists documents_administratifs_client_id_fkey;
alter table public.documents_administratifs
  add constraint documents_administratifs_client_id_fkey
  foreign key (client_id) references public.clients(id)
  on delete restrict;

alter table public.fiscal_obligations
  drop constraint if exists fiscal_obligations_client_id_fkey;
alter table public.fiscal_obligations
  add constraint fiscal_obligations_client_id_fkey
  foreign key (client_id) references public.clients(id)
  on delete restrict;

alter table public.procedures_administratives
  drop constraint if exists procedures_administratives_client_id_fkey;
alter table public.procedures_administratives
  add constraint procedures_administratives_client_id_fkey
  foreign key (client_id) references public.clients(id)
  on delete restrict;

alter table public.employes
  drop constraint if exists employes_client_id_fkey;
alter table public.employes
  add constraint employes_client_id_fkey
  foreign key (client_id) references public.clients(id)
  on delete restrict;

-- 3 bis. Contraintes dupliquees (trace d'une migration jouee deux fois).
-- Postgres appliquait la plus restrictive des deux ; la regle effective etait
-- donc illisible. On ne garde que celle qui exprime l'intention.
--
--   tasks.client_id        : fk_tasks_client (CASCADE) supprimee,
--                            tasks_client_id_fkey (NO ACTION) conservee.
--   tasks.collaborateur_id : fk_tasks_collaborateur (CASCADE) supprimee.
--                            L'historique des taches d'un stagiaire parti
--                            survit a son depart ; le collaborateur s'archive.
--   users.collaborateur_id : users_collaborateur_id_fkey (NO ACTION)
--                            supprimee, fk_users_collaborateur (SET NULL)
--                            conservee — un compte survit a son detachement.

alter table public.tasks drop constraint if exists fk_tasks_client;
alter table public.tasks drop constraint if exists fk_tasks_collaborateur;
alter table public.users drop constraint if exists users_collaborateur_id_fkey;
