-- Fonction de vérification de rôle (SECURITY DEFINER pour éviter la
-- récursion RLS sur user_roles).
create or replace function public.has_role(_user_id uuid, _role text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  );
$$;

-- RPC utilisée par le blog pour retrouver l'image associée à un titre.
create or replace function public.get_default_image_for_blog_title(title_to_check text)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select image_path
  from public.blog_image_mappings
  where lower(title_to_check) like '%' || lower(title_pattern) || '%'
  order by length(title_pattern) desc
  limit 1;
$$;

-- Attribue le rôle admin du site au compte du propriétaire.
-- (Adaptez l'adresse email au compte qui doit administrer le site.)
insert into public.user_roles (user_id, role)
select id, 'admin' from auth.users where email = 'admin@prisma.com'
on conflict (user_id) do update set role = 'admin';
