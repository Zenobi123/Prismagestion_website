do $$
declare p record;
begin
  for p in
    select tablename, policyname from pg_policies
    where schemaname = 'public'
      and tablename in ('actionnaires','capital_social','collaborateurs','conges',
                        'contrats_employes','documents_administratifs','employes',
                        'factures','fiscal_obligations','paie','paiements',
                        'prestations','procedures_administratives')
      and roles::text[] && array['anon','public']
  loop
    execute format('alter policy %I on public.%I to authenticated', p.policyname, p.tablename);
  end loop;
end $$;
