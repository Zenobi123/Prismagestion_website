/**
 * Documents administratifs d'un client : libellés canoniques et nommage des
 * fichiers au téléchargement.
 *
 * Un document est identifié par son **libellé** (`documents_administratifs.nom`)
 * et non par une clé technique : c'est ce libellé que la checklist de l'onglet
 * Dossier rapproche des lignes qu'elle génère. Les deux attestations étant
 * désormais téléversables depuis deux écrans — l'onglet Fiscal et la checklist —
 * leurs libellés sont figés ici : deux orthographes divergentes créeraient deux
 * lignes distinctes pour un même document, chacune invisible depuis l'autre
 * écran.
 */

/** Attestation d'immatriculation — validité 30 jours. */
export const DOC_ATTESTATION_IMMATRICULATION = "Attestation d'immatriculation";

/** Attestation de conformité fiscale (ACF) — validité 90 jours. */
export const DOC_ATTESTATION_CONFORMITE_FISCALE = "Attestation de conformité fiscale";

/** Validité de l'attestation d'immatriculation, en jours. */
export const VALIDITE_IMMATRICULATION_JOURS = 30;

/**
 * Extensions réellement acceptées par le bucket `documents`
 * (`allowed_mime_types`). Une extension hors liste est ignorée au profit du
 * repli : le nom proposé au téléchargement ne doit jamais suggérer un format
 * que le stockage aurait refusé.
 */
const EXTENSIONS_AUTORISEES = ["pdf", "jpg", "jpeg", "png", "webp", "doc", "docx"];

/**
 * Caractères qu'un nom de fichier ne peut pas porter (séparateurs de chemin,
 * réservés Windows, caractères de contrôle). L'apostrophe et les lettres
 * accentuées sont conservées : « Attestation d'immatriculation.pdf » est un nom
 * valide partout, et c'est celui que l'utilisateur attend.
 */
// Les caractères de contrôle sont précisément ce qu'il s'agit de retirer d'un
// nom de fichier ; la règle no-control-regex vise leur usage accidentel.
// eslint-disable-next-line no-control-regex
const CARACTERES_INTERDITS = /[/\\:*?"<>|\u0000-\u001f]/g;

/**
 * Extension du fichier stocké, déduite du chemin dans le bucket.
 *
 * Les objets sont nommés par UUID (`<client>/<uuid>.pdf`) : l'extension est la
 * seule trace du format d'origine.
 */
export function extensionDepuisChemin(chemin: string, defaut = "pdf"): string {
  const dernierSegment = chemin.split("/").pop() ?? "";
  const point = dernierSegment.lastIndexOf(".");
  if (point <= 0) return defaut;

  const extension = dernierSegment.slice(point + 1).toLowerCase();
  return EXTENSIONS_AUTORISEES.includes(extension) ? extension : defaut;
}

/**
 * Nom lisible proposé au téléchargement d'un document.
 *
 * Le nom d'origine du fichier n'est conservé nulle part — l'objet est renommé
 * en UUID au téléversement. Le nom rendu à l'utilisateur est donc reconstruit
 * à partir du libellé du document et de l'extension du chemin stocké.
 */
export function nomFichierTelechargement(nomDocument: string, chemin: string): string {
  const base =
    nomDocument.replace(CARACTERES_INTERDITS, " ").replace(/\s+/g, " ").trim() ||
    "Document";

  return `${base}.${extensionDepuisChemin(chemin)}`;
}
