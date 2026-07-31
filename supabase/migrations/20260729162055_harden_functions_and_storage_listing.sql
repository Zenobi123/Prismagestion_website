-- 1. Figer le search_path des 10 fonctions signalées (protection contre le
--    détournement de résolution de noms via un schéma malveillant).
do $$
declare f record;
begin
  for f in
    select p.oid::regprocedure as sig
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname in ('get_client_financial_details','get_client_financial_summary',
        'get_clients_with_financial_status','handle_paiement_delete','handle_updated_at',
        'update_actionnaires_updated_at','update_capital_social_updated_at',
        'update_facture_payment_status','update_fiscal_obligations_updated_at',
        'update_updated_at')
  loop
    execute format('alter function %s set search_path = public, pg_temp', f.sig);
  end loop;
end $$;

-- 2. Retirer EXECUTE aux fonctions de trigger : un trigger s'exécute avec les
--    droits du propriétaire de la table, il n'a pas besoin de ce privilège.
--    Cela ferme leur exposition via /rest/v1/rpc/.
do $$
declare f record;
begin
  for f in
    select p.oid::regprocedure as sig
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname in ('handle_new_user','handle_paiement_delete','handle_updated_at',
        'update_actionnaires_updated_at','update_capital_social_updated_at',
        'update_facture_payment_status','update_fiscal_obligations_updated_at',
        'update_updated_at')
  loop
    execute format('revoke execute on function %s from public, anon, authenticated', f.sig);
  end loop;
end $$;

-- 3. Les RPC financières relèvent de l'application métier : hors de portée d'un anonyme.
do $$
declare f record;
begin
  for f in
    select p.oid::regprocedure as sig
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname in ('get_client_financial_details','get_client_financial_summary',
        'get_clients_with_financial_status')
  loop
    execute format('revoke execute on function %s from anon', f.sig);
  end loop;
end $$;

-- 4. Empêcher l'énumération du bucket media. Les URL publiques des images
--    continuent de fonctionner : un bucket public sert ses objets sans RLS.
alter policy media_public_read on storage.objects to authenticated;
