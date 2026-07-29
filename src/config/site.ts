// Identité web du site PRISMA GESTION.
//
// Source unique du domaine public. Les réseaux sociaux (Facebook, LinkedIn,
// WhatsApp…) n'exécutent pas le JavaScript de la page et refusent les URLs
// d'images relatives : toute image de partage doit être absolue, d'où
// `absoluteUrl` ci-dessous.

/** Domaine canonique du site, sans barre oblique finale. */
export const SITE_URL = 'https://prismagestion.site';

/**
 * Rend une URL absolue sur le domaine canonique.
 * Les URLs déjà absolues (http/https, data:) sont retournées inchangées.
 */
export const absoluteUrl = (url: string): string => {
  if (!url) return SITE_URL;
  if (/^(https?:)?\/\//i.test(url) || url.startsWith('data:')) return url;
  return `${SITE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
};
