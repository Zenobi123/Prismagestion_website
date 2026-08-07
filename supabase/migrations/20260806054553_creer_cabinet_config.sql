-- Identite du cabinet : du localStorage vers la base.
--
-- Jusqu'ici, cabinetConfig.ts stockait l'identite du cabinet (telephone, NIU,
-- siege, signataire, signature, cachet, coordonnees de paiement) dans le
-- localStorage du navigateur. Ce stockage est cloisonne par navigateur ET par
-- domaine : une meme facture pouvait donc porter un pied de page different
-- selon le poste depuis lequel elle etait emise, et toute correction devait
-- etre ressaisie sur chaque appareil. C'est arrive le 06/08/2026, quand les
-- trois numeros du cabinet ont ete reordonnes dans le code sans atteindre les
-- configurations deja enregistrees.
--
-- La table porte une ligne unique (contrainte id = 1). Les valeurs par defaut
-- refletent DEFAULT_CABINET_CONFIG afin qu'une base fraiche soit d'emblee
-- coherente, meme si aucune migration depuis le localStorage n'a lieu.
--
-- signature et cachet restent du texte : ce sont des data URL base64, telles
-- que le front les produit deja (plafonnees a 1 Mo par la validation de
-- CabinetConfigSettings). Les deplacer vers un bucket serait plus propre, mais
-- imposerait un chantier de stockage sans rapport avec le probleme traite ici.

create table if not exists public.cabinet_config (
  id smallint primary key default 1,
  nom_cabinet text not null default 'PRISMA GESTION',
  slogan text not null default 'Comptabilité - Finance - Fiscalité',
  siege text not null default 'Yaoundé - Bata Longkak',
  telephone text not null default '(237) 694 310 554 / 676 277 662 / 656 752 475',
  niu text not null default 'M052116042979Z',
  signataire_nom text not null default 'OBIANG TIME Nathan',
  signataire_titre text not null default 'Directeur Associé',
  signature text,
  cachet text,
  signature_promo text not null default 'PRISMA Manager — PRISMA GESTION : L''expertise qui sécurise votre gestion.',
  mode_paiement text not null default 'Mobile Money / Espèces',
  numeros_paiement text not null default '694 31 05 54 / 676 27 76 62 / 656 75 24 75 — OBIANG TIME Nathan',
  echeance_facture text not null default '30 jours à compter de la date d''émission',
  updated_at timestamptz not null default now(),
  constraint cabinet_config_ligne_unique check (id = 1)
);

drop trigger if exists set_cabinet_config_updated_at on public.cabinet_config;
create trigger set_cabinet_config_updated_at
  before update on public.cabinet_config
  for each row execute function public.handle_updated_at();

alter table public.cabinet_config enable row level security;

-- Modele en vigueur depuis le durcissement du 29/07/2026 :
-- private.has_role(auth.uid(), 'admin') reserve au role authenticated.
-- Coherent avec l'acces a la console, filtre en amont par ProtectedRoute
-- requireAdmin.
drop policy if exists "auth manage cabinet_config" on public.cabinet_config;
create policy "auth manage cabinet_config" on public.cabinet_config
  for all to authenticated
  using (private.has_role((select auth.uid()), 'admin'))
  with check (private.has_role((select auth.uid()), 'admin'));

-- La ligne unique existe des l'application : le front la met a jour, il n'a
-- jamais a la creer, ce qui evite une course entre deux onglets ouverts.
insert into public.cabinet_config (id) values (1)
on conflict (id) do nothing;
