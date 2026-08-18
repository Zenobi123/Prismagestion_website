-- Audit du 18/08/2026, constats 1 a 3.
--
-- Deux systemes d'autorisation coexistaient. Les politiques RLS et le site
-- s'appuient sur public.user_roles via private.has_role() ; la console et les
-- deux fonctions edge s'appuyaient sur public.users.role. Or les politiques
-- UPDATE de public.users s'ecrivaient USING (auth.uid() = id) sans WITH CHECK :
-- PostgreSQL reutilise alors le USING comme controle d'ecriture, si bien que
-- l'utilisateur pouvait reecrire n'importe quelle colonne de sa propre ligne,
-- role comprise. L'auto-promotion en admin a ete confirmee par test.
--
-- Ce fichier ferme la porte cote base. Le basculement de la console et des
-- fonctions edge sur user_roles est fait dans le meme lot, cote code.

-- === 1. public.users : le role cesse d'etre auto-modifiable ===================

-- Les privileges de colonne sont verifies independamment de la RLS : c'est la
-- protection la plus sure ici. Un WITH CHECK comparant a la valeur courante
-- devrait relire public.users depuis sa propre politique, donc recursivement.
--
-- Un privilege UPDATE au niveau table couvre toutes les colonnes : il faut le
-- retirer avant de le redonner colonne par colonne.
revoke update, insert, delete on public.users from anon, authenticated;

-- Seules ces deux colonnes restent modifiables par leur proprietaire.
-- `role` en est volontairement absente, comme `id` et `created_at`.
grant update (email, collaborateur_id) on public.users to authenticated;

-- Les creations et suppressions de comptes passent par le dashboard ou la cle
-- service_role, jamais par l'application : rien ne leur est rendu ici.

-- Politiques : une seule par operation, portee au role authenticated, et un
-- WITH CHECK explicite pour que la ligne reste la sienne apres ecriture.
drop policy if exists "Users can view their own data" on public.users;
drop policy if exists "Users can view their own profile" on public.users;
drop policy if exists "Users can update their own data" on public.users;
drop policy if exists "Users can update their own profile" on public.users;

create policy users_select_self on public.users
  for select to authenticated
  using ((select auth.uid()) = id);

create policy users_update_self on public.users
  for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

comment on column public.users.role is
  'Role applicatif historique. N''est plus une source d''autorisation : celle-ci
   est public.user_roles, lue via private.has_role(). Colonne non modifiable par
   son proprietaire (privilege de colonne retire a authenticated).';

-- === 2. Bucket fiscal_attachments : lecture reservee aux administrateurs =====

-- La politique de lecture etait « bucket_id = 'fiscal_attachments' » pour tout
-- compte authentifie, sans aucun filtre : n'importe quel utilisateur connecte
-- aurait lu les pieces fiscales de tous les clients. Le bucket etant vide, rien
-- n'a ete expose. On l'aligne sur le bucket `documents`.
drop policy if exists "Anyone can view fiscal attachments" on storage.objects;
drop policy if exists "Authenticated users can upload fiscal attachments" on storage.objects;
drop policy if exists "Users can update their own fiscal attachments" on storage.objects;
drop policy if exists "Users can delete their own fiscal attachments" on storage.objects;

drop policy if exists fiscal_attachments_select on storage.objects;
create policy fiscal_attachments_select on storage.objects
  for select to authenticated
  using (bucket_id = 'fiscal_attachments'
         and private.has_role((select auth.uid()), 'admin'));

drop policy if exists fiscal_attachments_insert on storage.objects;
create policy fiscal_attachments_insert on storage.objects
  for insert to authenticated
  with check (bucket_id = 'fiscal_attachments'
              and private.has_role((select auth.uid()), 'admin'));

drop policy if exists fiscal_attachments_update on storage.objects;
create policy fiscal_attachments_update on storage.objects
  for update to authenticated
  using (bucket_id = 'fiscal_attachments'
         and private.has_role((select auth.uid()), 'admin'))
  with check (bucket_id = 'fiscal_attachments'
              and private.has_role((select auth.uid()), 'admin'));

drop policy if exists fiscal_attachments_delete on storage.objects;
create policy fiscal_attachments_delete on storage.objects
  for delete to authenticated
  using (bucket_id = 'fiscal_attachments'
         and private.has_role((select auth.uid()), 'admin'));

-- Le bucket n'avait ni plafond de taille ni liste de types : la validation
-- n'existait que dans le navigateur, donc contournable. Les valeurs reprennent
-- celles annoncees par l'ecran de televersement (5 Mo).
update storage.buckets
   set file_size_limit = 5242880,
       allowed_mime_types = array[
         'application/pdf',
         'image/jpeg',
         'image/jpg',
         'image/png',
         'application/msword',
         'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
       ]
 where id = 'fiscal_attachments';
