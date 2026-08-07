-- Fermeture d'un avertissement du linter Supabase ouvert par la migration
-- precedente — 07/08/2026.
--
-- Toute fonction du schema `public` est exposee par PostgREST sur
-- /rest/v1/rpc/<nom>. `journaliser_modification()` etant en SECURITY DEFINER,
-- le linter signalait qu'elle etait appelable par `anon` et `authenticated`
-- (lints 0028 et 0029).
--
-- Le risque reel etait faible : appelee hors contexte de trigger, une fonction
-- trigger echoue immediatement. Mais une SECURITY DEFINER ne doit pas rester
-- ouverte a l'execution, et la revocation ne coute rien : PostgreSQL ne
-- verifie pas le privilege EXECUTE lorsqu'un trigger se declenche — seul
-- compte le proprietaire de la table. Verifie apres application : les trois
-- triggers continuent d'ecrire normalement.

revoke execute on function public.journaliser_modification() from public, anon, authenticated;
revoke execute on function public.marquer_auteur() from public, anon, authenticated;
revoke execute on function public.factures_interdire_suppression_piece() from public, anon, authenticated;
