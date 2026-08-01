-- Table des abonnés / leads captés sur le site (calculateurs, lead magnets,
-- newsletter fiscale). Même modèle de sécurité que quote_requests :
-- un visiteur anonyme peut s'inscrire, seul l'admin peut lire/gérer.

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  -- Origine de la capture : 'calculateur-igs', 'guide-creation', 'footer', ...
  source text not null default 'site',
  -- Contexte optionnel (secteur, service d'intérêt, valeur calculée...).
  context text default '',
  consent boolean not null default true,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

-- Un même email ne s'inscrit qu'une fois par source.
create unique index if not exists newsletter_subscribers_email_source_idx
  on public.newsletter_subscribers (lower(email), source);

alter table public.newsletter_subscribers enable row level security;

-- Insertion publique (visiteur anonyme).
create policy "newsletter_public_insert"
  on public.newsletter_subscribers for insert
  with check (true);

-- Lecture / gestion réservées à l'administrateur.
create policy "newsletter_admin_select"
  on public.newsletter_subscribers for select to authenticated
  using (public.has_role((select auth.uid()), 'admin'));

create policy "newsletter_admin_update"
  on public.newsletter_subscribers for update to authenticated
  using (public.has_role((select auth.uid()), 'admin'));

create policy "newsletter_admin_delete"
  on public.newsletter_subscribers for delete to authenticated
  using (public.has_role((select auth.uid()), 'admin'));
