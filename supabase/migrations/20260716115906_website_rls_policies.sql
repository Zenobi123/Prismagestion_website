-- Activer la RLS sur toutes les tables du site
alter table public.blog_posts enable row level security;
alter table public.blog_image_mappings enable row level security;
alter table public.contact_messages enable row level security;
alter table public.quote_requests enable row level security;
alter table public.appointments enable row level security;
alter table public.services enable row level security;
alter table public.site_sections enable row level security;
alter table public.contact_config enable row level security;
alter table public.media_files enable row level security;
alter table public.user_roles enable row level security;

-- blog_posts : lecture publique des articles publiés, gestion par l'admin
create policy "blog_posts_public_read"
  on public.blog_posts for select
  using (status = 'Publié' or public.has_role((select auth.uid()), 'admin'));

create policy "blog_posts_admin_insert"
  on public.blog_posts for insert to authenticated
  with check (public.has_role((select auth.uid()), 'admin'));

create policy "blog_posts_admin_update"
  on public.blog_posts for update to authenticated
  using (public.has_role((select auth.uid()), 'admin'));

create policy "blog_posts_admin_delete"
  on public.blog_posts for delete to authenticated
  using (public.has_role((select auth.uid()), 'admin'));

-- blog_image_mappings : lecture publique, écriture admin
create policy "blog_image_mappings_public_read"
  on public.blog_image_mappings for select using (true);

create policy "blog_image_mappings_admin_write"
  on public.blog_image_mappings for all to authenticated
  using (public.has_role((select auth.uid()), 'admin'))
  with check (public.has_role((select auth.uid()), 'admin'));

-- contact_messages : tout le monde peut écrire (formulaire public),
-- seul l'admin peut lire/gérer
create policy "contact_messages_public_insert"
  on public.contact_messages for insert
  with check (true);

create policy "contact_messages_admin_select"
  on public.contact_messages for select to authenticated
  using (public.has_role((select auth.uid()), 'admin'));

create policy "contact_messages_admin_update"
  on public.contact_messages for update to authenticated
  using (public.has_role((select auth.uid()), 'admin'));

create policy "contact_messages_admin_delete"
  on public.contact_messages for delete to authenticated
  using (public.has_role((select auth.uid()), 'admin'));

-- quote_requests : idem
create policy "quote_requests_public_insert"
  on public.quote_requests for insert
  with check (true);

create policy "quote_requests_admin_select"
  on public.quote_requests for select to authenticated
  using (public.has_role((select auth.uid()), 'admin'));

create policy "quote_requests_admin_update"
  on public.quote_requests for update to authenticated
  using (public.has_role((select auth.uid()), 'admin'));

create policy "quote_requests_admin_delete"
  on public.quote_requests for delete to authenticated
  using (public.has_role((select auth.uid()), 'admin'));

-- appointments : idem
create policy "appointments_public_insert"
  on public.appointments for insert
  with check (true);

create policy "appointments_admin_select"
  on public.appointments for select to authenticated
  using (public.has_role((select auth.uid()), 'admin'));

create policy "appointments_admin_update"
  on public.appointments for update to authenticated
  using (public.has_role((select auth.uid()), 'admin'));

create policy "appointments_admin_delete"
  on public.appointments for delete to authenticated
  using (public.has_role((select auth.uid()), 'admin'));

-- services / site_sections / contact_config / media_files :
-- lecture publique, écriture admin
create policy "services_public_read"
  on public.services for select using (true);

create policy "services_admin_write"
  on public.services for all to authenticated
  using (public.has_role((select auth.uid()), 'admin'))
  with check (public.has_role((select auth.uid()), 'admin'));

create policy "site_sections_public_read"
  on public.site_sections for select using (true);

create policy "site_sections_admin_write"
  on public.site_sections for all to authenticated
  using (public.has_role((select auth.uid()), 'admin'))
  with check (public.has_role((select auth.uid()), 'admin'));

create policy "contact_config_public_read"
  on public.contact_config for select using (true);

create policy "contact_config_admin_write"
  on public.contact_config for all to authenticated
  using (public.has_role((select auth.uid()), 'admin'))
  with check (public.has_role((select auth.uid()), 'admin'));

create policy "media_files_public_read"
  on public.media_files for select using (true);

create policy "media_files_admin_write"
  on public.media_files for all to authenticated
  using (public.has_role((select auth.uid()), 'admin'))
  with check (public.has_role((select auth.uid()), 'admin'));

-- user_roles : chacun ne lit que son propre rôle ; aucune écriture côté client
create policy "user_roles_read_own"
  on public.user_roles for select to authenticated
  using (user_id = (select auth.uid()));
