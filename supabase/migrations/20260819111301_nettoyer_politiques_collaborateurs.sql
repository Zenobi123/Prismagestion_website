-- Audit du 18/08/2026, constat 4.
--
-- La table portait 15 politiques. Douze etaient le meme controle admin
-- recopie sur ALL, SELECT, INSERT, UPDATE et DELETE — sediment de migrations
-- successives. Les politiques RLS se combinent en OU : ces douze n'accordaient
-- rien que la politique ALL n'accordait deja, mais elles rendaient l'ensemble
-- illisible, et c'est dans ce bruit que les deux suivantes passaient inapercues.
--
-- 1. « Enable update for users on their own collaborateur profile »
--    (user_id = auth.uid()) autorisait la reecriture de TOUTE la ligne, donc
--    de la colonne `permissions`.
-- 2. « Enable insert for admins » faisait dependre le droit d'inserer de cette
--    meme colonne :
--       permissions @> '[{"module":"collaborateurs","niveau":"administration"}]'
--
--    Boucle complete : un collaborateur rattache a un compte s'octroyait le
--    niveau administration, puis creait des collaborateurs. Non exploitable au
--    moment de l'audit — les quatre lignes ont `user_id` a NULL — mais la
--    fenetre s'ouvrait au premier rattachement.
--
-- Aucun ecran n'edite son propre profil : la console entiere est derriere
-- ProtectedRoute requireAdmin, et toutes les ecritures passent par
-- collaborateurService, cible par `id`. La politique d'auto-modification ne
-- servait donc rien, et disparait avec le reste.

drop policy if exists "Accès aux collaborateurs pour utilisateurs authentifiés" on public.collaborateurs;
drop policy if exists "Allow public delete to collaborateurs" on public.collaborateurs;
drop policy if exists "Allow public insert to collaborateurs" on public.collaborateurs;
drop policy if exists "Allow public read access to collaborateurs" on public.collaborateurs;
drop policy if exists "Allow public update to collaborateurs" on public.collaborateurs;
drop policy if exists "Enable delete access for all authenticated users" on public.collaborateurs;
drop policy if exists "Enable delete for users" on public.collaborateurs;
drop policy if exists "Enable insert access for all authenticated users" on public.collaborateurs;
drop policy if exists "Enable insert for admins" on public.collaborateurs;
drop policy if exists "Enable insert for authenticated users" on public.collaborateurs;
drop policy if exists "Enable read access for all users" on public.collaborateurs;
drop policy if exists "Enable read access for authenticated users" on public.collaborateurs;
drop policy if exists "Enable update access for all authenticated users" on public.collaborateurs;
drop policy if exists "Enable update for users" on public.collaborateurs;
drop policy if exists "Enable update for users on their own collaborateur profile" on public.collaborateurs;

-- Une seule politique, alignee sur `employes`, `paie` et
-- `documents_administratifs`. Le WITH CHECK est pose explicitement plutot que
-- laisse au repli sur le USING : ce qui est verifie a l'ecriture doit se lire.
drop policy if exists collaborateurs_admin_all on public.collaborateurs;
create policy collaborateurs_admin_all on public.collaborateurs
  for all to authenticated
  using (private.has_role((select auth.uid()), 'admin'))
  with check (private.has_role((select auth.uid()), 'admin'));

comment on column public.collaborateurs.permissions is
  'Niveaux d''acces par module, saisis dans la fiche collaborateur. Purement
   descriptif : aucune politique RLS ni aucun ecran ne s''en sert pour
   autoriser quoi que ce soit. Ne pas en refaire une source d''autorisation —
   c''est ce qui avait cree une boucle d''auto-attribution (audit 18/08/2026,
   constat 4). La source d''autorisation est public.user_roles.';
