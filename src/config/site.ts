// Identité web du site PRISMA GESTION.
//
// Source unique du domaine public. Les réseaux sociaux (Facebook, LinkedIn,
// WhatsApp…) n'exécutent pas le JavaScript de la page et refusent les URLs
// d'images relatives : toute image de partage doit être absolue, d'où
// `absoluteUrl` ci-dessous.

// Domaine réellement servi. Doit rester identique à `DEFAULT_SITE_URL` de
// vite.config.ts, qui applique la même valeur aux URLs absolues d'index.html,
// de sitemap.xml et de robots.txt.
const DOMAINE_PAR_DEFAUT = 'https://prismagestionsite.vercel.app';

/**
 * Domaine canonique du site, sans barre oblique finale.
 *
 * Surchargeable au build par `VITE_SITE_URL` : une image de partage hébergée
 * sur un domaine qui ne résout pas n'est pas récupérable par les robots
 * sociaux, et l'aperçu reste vide. Au branchement du prochain nom de domaine,
 * poser `VITE_SITE_URL=https://<nouveau-domaine>` dans Vercel suffit.
 */
export const SITE_URL = (import.meta.env.VITE_SITE_URL || DOMAINE_PAR_DEFAUT).replace(/\/+$/, '');

/**
 * Rend une URL absolue sur le domaine canonique.
 * Les URLs déjà absolues (http/https, data:) sont retournées inchangées.
 */
export const absoluteUrl = (url: string): string => {
  if (!url) return SITE_URL;
  if (/^(https?:)?\/\//i.test(url) || url.startsWith('data:')) return url;
  return `${SITE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
};
