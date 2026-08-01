-- Cree le bucket `documents`, reference par le code depuis longtemps mais
-- jamais cree en base. Meme classe de defaut que rapports_mission : trois
-- fonctionnalites appelaient un bucket inexistant.
--
--   - components/parametres/ProfileSettings.tsx        photo de profil
--   - components/gestion/tabs/hooks/useDocumentMutations.ts  televersement
--   - components/gestion/tabs/GestionDossier.tsx       telechargement
--
-- Prive : tous les acces passent par createSignedUrl().
--
-- Taille : 10 Mo, la plus large des deux limites appliquees cote client
-- (2 Mo pour les avatars, 10 Mo pour les pieces de dossier).
--
-- Types MIME : union exacte des deux listes du code. La validation existe deja
-- cote client ; la repeter ici est une defense en profondeur, le client pouvant
-- etre contourne. Ajouter un type ici si le code en accepte un nouveau.
--
-- Policies : modele en vigueur, private.has_role(auth.uid(), 'admin') reserve
-- au role authenticated. La console entiere est deja derriere un
-- ProtectedRoute requireAdmin, donc tout utilisateur qui y accede est admin.
-- A revoir le jour ou des collaborateurs non-admin y auront acces : ils ne
-- pourraient alors ni deposer une piece, ni changer leur photo de profil.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'documents',
  'documents',
  false,
  10485760,
  array[
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
on conflict (id) do nothing;

drop policy if exists documents_storage_select on storage.objects;
create policy documents_storage_select on storage.objects
  for select to authenticated
  using (bucket_id = 'documents' and private.has_role((select auth.uid()), 'admin'));

drop policy if exists documents_storage_insert on storage.objects;
create policy documents_storage_insert on storage.objects
  for insert to authenticated
  with check (bucket_id = 'documents' and private.has_role((select auth.uid()), 'admin'));

-- UPDATE est necessaire : l'envoi d'un avatar utilise upsert: true.
drop policy if exists documents_storage_update on storage.objects;
create policy documents_storage_update on storage.objects
  for update to authenticated
  using (bucket_id = 'documents' and private.has_role((select auth.uid()), 'admin'))
  with check (bucket_id = 'documents' and private.has_role((select auth.uid()), 'admin'));

drop policy if exists documents_storage_delete on storage.objects;
create policy documents_storage_delete on storage.objects
  for delete to authenticated
  using (bucket_id = 'documents' and private.has_role((select auth.uid()), 'admin'));
