/**
 * Variante WebP d'une illustration d'article, quand elle existe.
 *
 * Les fichiers de `public/blog-images/` sont versionnés avec le site et
 * disposent tous d'un jumeau `.webp`, environ 36 % plus léger à qualité
 * équivalente. La substitution est volontairement limitée à ce dossier : une
 * image téléversée depuis l'administration n'a pas de jumeau, et l'originale
 * doit alors être servie telle quelle.
 *
 * Le repli se gère par `onError` sur le `<img>`, jamais par un `<source>` dans
 * un `<picture>` : le navigateur retient une source d'après son type déclaré
 * sans vérifier qu'elle existe, et un `<source>` en 404 laisserait un vide à
 * la place de l'image au lieu de retomber sur le JPEG.
 */
export const webpTwin = (src: string): string | null =>
  /^\/blog-images\/[^/]+\.jpe?g$/i.test(src) ? src.replace(/\.jpe?g$/i, '.webp') : null;
