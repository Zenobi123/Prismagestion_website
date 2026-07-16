-- Tables du site vitrine Prisma Gestion (préfixe logique : aucune collision
-- avec les tables de l'application taskplanner existante).

create table if not exists public.blog_posts (
  id serial primary key,
  title text not null,
  excerpt text default '',
  content text default '',
  author text default '',
  publish_date text default '',
  status text not null default 'Brouillon',
  image text default '',
  slug text not null unique,
  tags text[] default '{}',
  seo_title text default '',
  seo_description text default '',
  created_at timestamptz not null default now()
);

create table if not exists public.blog_image_mappings (
  title_pattern text primary key,
  image_path text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  email text not null,
  whatsapp text default '',
  subject text default '',
  message text not null,
  date timestamptz not null default now(),
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.quote_requests (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text default '',
  service text,
  details text default '',
  read boolean not null default false,
  status text not null default 'new',
  created_at timestamptz not null default now()
);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text default '',
  subject text default '',
  appointment_date date not null,
  appointment_time text not null,
  message text default '',
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists public.services (
  id text primary key,
  title text not null,
  description text default '',
  items text[] default '{}',
  image text default '',
  created_at timestamptz not null default now()
);

create table if not exists public.site_sections (
  id text primary key,
  content jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.contact_config (
  id text primary key,
  title text not null default '',
  description text default '',
  address text default '',
  email text default '',
  phone text default '',
  whatsapp text default '',
  form_title text default '',
  form_description text default '',
  updated_at timestamptz not null default now()
);

create table if not exists public.media_files (
  id uuid primary key default gen_random_uuid(),
  file_name text not null,
  url text not null,
  uploaded_at timestamptz not null default now(),
  uploaded_by text,
  size_in_bytes bigint,
  type text
);

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  role text not null check (role in ('admin', 'user')),
  created_at timestamptz not null default now()
);
