/**
 * Cible de redirection après connexion, ramenée de force à un chemin interne.
 *
 * `//exemple.test` et `/\exemple.test` sont réinterprétés par le navigateur
 * comme des URL absolues : c'est la forme exacte de l'avis GHSA-wrjc-x8rr-h8h6,
 * ouvert sur toute la ligne 6.x de react-router et corrigé seulement en 7.18.
 * C'est ici la seule redirection de l'application construite sur une valeur qui
 * ne soit pas un littéral ; ce filtre rend l'avis sans objet.
 *
 * Fichier séparé de `AuthPage.tsx` : un module qui exporte autre chose qu'un
 * composant casse le rafraîchissement à chaud de React.
 */
export function cheminInterneOuDefaut(chemin: string | undefined, defaut = '/admin'): string {
  if (!chemin || !chemin.startsWith('/')) return defaut;
  if (chemin.startsWith('//') || chemin.startsWith('/\\')) return defaut;
  return chemin;
}
