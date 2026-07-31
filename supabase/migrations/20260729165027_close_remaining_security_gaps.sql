alter function public.get_default_image_for_blog_title(text) security invoker;

create schema if not exists private;
grant usage on schema private to anon, authenticated, service_role;

alter function public.has_role(uuid, text) set schema private;

revoke execute on function private.has_role(uuid, text) from public;
grant execute on function private.has_role(uuid, text) to anon, authenticated, service_role;

drop policy if exists media_public_read on storage.objects;

alter policy "Anyone can view fiscal attachments" on storage.objects to authenticated;
alter policy "Authenticated users can upload fiscal attachments" on storage.objects to authenticated;
alter policy "Users can update their own fiscal attachments" on storage.objects to authenticated;
alter policy "Users can delete their own fiscal attachments" on storage.objects to authenticated;
