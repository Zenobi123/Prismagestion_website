-- Les tables métier du cabinet accordaient tout à quiconque est
-- authentifié : USING (true) pour le rôle `authenticated`. Combiné à une
-- inscription publique ouverte, n'importe quel visiteur pouvait créer un
-- compte et lire la totalité des clients, factures, devis et paies via
-- l'API REST, sans passer par l'interface.
--
-- On applique le modèle déjà retenu le 16/07 pour les tables du site
-- vitrine : private.has_role((select auth.uid()), 'admin'). Le sous-select
-- évite de réévaluer auth.uid() ligne à ligne.
--
-- Seules les politiques totalement permissives sont réécrites. Celles qui
-- portent déjà une condition (profil propre, permissions par module) sont
-- laissées intactes : elles sont plus restrictives que la nouvelle règle.

do $$
declare
  p record;
  cond constant text := 'private.has_role((select auth.uid()), ''admin'')';
  tables_metier constant text[] := array[
    'actionnaires','capital_social','clients','collaborateurs','conges',
    'contrats_employes','courriers','devis','devis_prestations',
    'documents_administratifs','employes','facture_prestations','factures',
    'fiscal_obligations','paie','paiements','payment_reminders','prestations',
    'procedures_administratives','propositions','tasks'
  ];
begin
  -- Passe 1 : clauses de lecture (SELECT/UPDATE/DELETE/ALL).
  for p in
    select tablename, policyname from pg_policies
    where schemaname = 'public' and tablename = any(tables_metier) and qual = 'true'
  loop
    execute format('alter policy %I on public.%I using (%s)', p.policyname, p.tablename, cond);
  end loop;

  -- Passe 2 : clauses d'écriture (INSERT/UPDATE/ALL). Séparée de la
  -- première car une politique INSERT n'a pas de clause USING.
  for p in
    select tablename, policyname from pg_policies
    where schemaname = 'public' and tablename = any(tables_metier) and with_check = 'true'
  loop
    execute format('alter policy %I on public.%I with check (%s)', p.policyname, p.tablename, cond);
  end loop;
end $$;
