/**
 * Barèmes d'enregistrement des bons de commande administratifs (Cameroun).
 *
 * Source unique : `.claude/skills/prisma-gestion-docs/references/baremes_enregistrement.md`
 * (état au 28 juillet 2026). Toute mise à jour de barème — résolution ARMP, note DGI,
 * Loi de Finances — se fait d'abord dans ce fichier de référence, puis ici.
 *
 * Ces montants sont une base de travail, pas une source de droit : le calculateur du
 * site affiche systématiquement cet avertissement à l'utilisateur.
 */

export const BAREMES_DATE_ETAT = '28 juillet 2026';

/** Part fiscale : droit proportionnel et centimes additionnels communaux. */
export const TAUX_DROIT_PROPORTIONNEL = 0.07;
export const TAUX_CAC = 0.05;

/**
 * Seuil au-delà duquel le taux de 7 % ne doit pas être extrapolé : le taux
 * applicable est à revérifier dans le CGI avant liquidation.
 */
export const SEUIL_DROIT_PROPORTIONNEL = 5_000_000;

/**
 * Délai d'enregistrement, décompté à partir de la date de signature du bon de
 * commande. Au-delà, une pénalité de retard de 100 % de la part fiscale est due.
 */
export const DELAI_ENREGISTREMENT_JOURS = 30;
export const TAUX_PENALITE_RETARD = 1;

/** En deçà de ce reliquat, l'échéance des 30 jours est signalée comme imminente. */
export const MARGE_ALERTE_DELAI_JOURS = 5;

/** En deçà de cet écart au seuil, le montant est signalé comme « proche du seuil ». */
export const MARGE_ALERTE_SEUIL = 500_000;

/**
 * Timbre de dimension : élément fiscal, au même titre que le droit proportionnel
 * et les CAC — il entre donc dans le Total Fiscal, pas dans les frais annexes.
 */
export const TIMBRE_PAR_PAGE = 1_500;
export const NB_EXEMPLAIRES_ORIGINAUX = 3;

/** Frais annexes forfaitaires. */
export const FRAIS_MERCURIALE = 10_000;
export const FRAIS_ATTESTATIONS_DGI = 4_200;

/**
 * Frais de paiement TRESORPAY : fourchette selon le montant des droits liquidés.
 * Le montant exact est confirmé à la liquidation automatique sur la plateforme.
 */
export const TRESORPAY_MIN = 5_000;
export const TRESORPAY_MAX = 7_500;

/** Frais d'obtention du CNE, distincts du droit versé à l'ARMP. */
export const CNE_FRAIS_OBTENTION = 6_500;

/**
 * Date d'entrée en vigueur de la grille CNE-ARMP en cours
 * (Résolution n° 0357/ARMP/CA du 21 juillet 2026).
 */
export const CNE_DATE_RESOLUTION = '2026-07-21';
export const CNE_REFERENCE_RESOLUTION =
  "Résolution n° 0357/ARMP/CA du 21 juillet 2026, seizième session extraordinaire du Conseil d'Administration";

export interface TrancheCne {
  /** Borne basse incluse. */
  min: number;
  /** Borne haute incluse ; `null` pour la dernière tranche, ouverte. */
  max: number | null;
  droit: number;
  libelle: string;
}

/** Grille en vigueur depuis le 21 juillet 2026. */
export const GRILLE_CNE: TrancheCne[] = [
  { min: 500_000, max: 4_999_999, droit: 15_000, libelle: '500 000 à 4 999 999' },
  { min: 5_000_000, max: 49_999_999, droit: 20_000, libelle: '5 000 000 à 49 999 999' },
  { min: 50_000_000, max: 99_999_999, droit: 30_000, libelle: '50 000 000 à 99 999 999' },
  { min: 100_000_000, max: 499_999_999, droit: 40_000, libelle: '100 000 000 à 499 999 999' },
  { min: 500_000_000, max: null, droit: 50_000, libelle: '500 000 000 et au-delà' },
];

/**
 * Barème antérieur au 21 juillet 2026. La référence ne documente que la première
 * tranche : pour les autres, le droit applicable doit être vérifié auprès de l'ARMP
 * plutôt que déduit de la grille actuelle.
 */
export const GRILLE_CNE_ANTERIEURE: TrancheCne[] = [
  { min: 500_000, max: 4_999_999, droit: 10_000, libelle: '500 000 à 4 999 999' },
];

/** Montant plancher de la grille ARMP : en dessous, aucun droit n'est documenté. */
export const CNE_MONTANT_PLANCHER = 500_000;
