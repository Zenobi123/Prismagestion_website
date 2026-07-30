/**
 * Formatage sûr pour les documents générés avec jsPDF.
 *
 * Le format 'fr-FR' sépare les milliers par une espace insécable étroite
 * (U+202F, parfois U+00A0) que les polices intégrées de jsPDF ne savent pas
 * rendre : elles affichent un glyphe parasite (« / », d'où des montants du
 * type « 10/000/000 F CFA »). On normalise donc ces espaces en espace simple
 * avant toute écriture dans le PDF.
 *
 * À utiliser dans TOUS les générateurs jsPDF (factures, reçus, fiche client,
 * rapports…). Dans le DOM, `formatUtils.ts` reste valable : le navigateur rend
 * correctement les espaces insécables.
 */

/** Remplace les espaces insécables (étroite/normale) par une espace simple. */
export const toPdfSafeSpaces = (value: string): string =>
  value.replace(/[\u202F\u00A0]/g, ' ');

/** Nombre formaté « à la française » (séparateur de milliers), sûr pour jsPDF. */
export const formatNombrePdf = (value: number): string =>
  toPdfSafeSpaces(new Intl.NumberFormat('fr-FR').format(value || 0));

/** Montant en F CFA (arrondi), sûr pour jsPDF. */
export const formatMontantPdf = (value: number): string =>
  `${formatNombrePdf(Math.round(value || 0))} F CFA`;
