// Préfixe sous lequel la console de gestion est montée dans le site.
//
// Les pages de la console ont été écrites pour une application autonome
// servie à la racine : leurs retours au tableau de bord pointaient vers
// "/". Sous /admin/gestion, un tel lien renvoie l'utilisateur sur le site
// vitrine au lieu de son tableau de bord.
//
// Tout chemin interne à la console passe donc par ces helpers plutôt que
// par une chaîne littérale : déplacer la console ne demandera de modifier
// que ce fichier.

export const GESTION_BASE = '/admin/gestion';

/**
 * Construit un chemin absolu vers une page de la console.
 *
 *   gestionPath()          -> "/admin/gestion"
 *   gestionPath('clients') -> "/admin/gestion/clients"
 *   gestionPath('/clients')-> "/admin/gestion/clients"
 */
export const gestionPath = (sousChemin = ''): string => {
  const propre = sousChemin.replace(/^\/+/, '');
  return propre ? `${GESTION_BASE}/${propre}` : GESTION_BASE;
};
