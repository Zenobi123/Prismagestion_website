import {
  TAUX_DROIT_PROPORTIONNEL,
  TAUX_CAC,
  SEUIL_DROIT_PROPORTIONNEL,
  MARGE_ALERTE_SEUIL,
  DELAI_ENREGISTREMENT_JOURS,
  TAUX_PENALITE_RETARD,
  MARGE_ALERTE_DELAI_JOURS,
  TIMBRE_PAR_PAGE,
  FRAIS_MERCURIALE,
  FRAIS_ATTESTATIONS_DGI,
  CNE_FRAIS_OBTENTION,
  CNE_DATE_RESOLUTION,
  CNE_MONTANT_PLANCHER,
  GRILLE_CNE,
  GRILLE_CNE_ANTERIEURE,
  type TrancheCne,
} from '@/constants/baremesEnregistrement';

/**
 * Liquidation des frais d'enregistrement d'un bon de commande administratif.
 *
 * Un poste dont le montant ne peut pas être établi à partir des barèmes connus
 * vaut `null` : il est alors affiché « à déterminer » et remonte un avertissement,
 * plutôt que d'être estimé au jugé.
 */

export interface FraisMarcheInput {
  montantHT: number;
  /** Nombre de pages à timbrer (3 exemplaires originaux exigés par défaut). */
  nbPagesTimbrees: number;
  /**
   * Date de signature du bon de commande (ISO `AAAA-MM-JJ`) : elle détermine le
   * barème CNE applicable et fait courir le délai d'enregistrement.
   */
  dateSignature: string;
  /** Date de dépôt à l'enregistrement (ISO `AAAA-MM-JJ`), qui arrête le décompte du délai. */
  dateEnregistrement: string;
  /** Forfait TRESORPAY retenu, dans la fourchette documentée. */
  fraisTresorpay: number;
  inclureCne: boolean;
  inclureMercuriale: boolean;
  inclureAttestations: boolean;
}

export type CategorieLigne = 'fiscal' | 'annexe';

export interface LigneLiquidation {
  id: string;
  libelle: string;
  formule: string;
  /** `null` lorsque le montant ne peut pas être déterminé à partir des barèmes. */
  montant: number | null;
}

export interface FraisMarcheResult {
  lignesFiscales: LigneLiquidation[];
  lignesAnnexes: LigneLiquidation[];
  /** Somme des seuls postes chiffrés : partielle si `fiscalComplet` est faux. */
  totalFiscal: number;
  fiscalComplet: boolean;
  /** Somme des seuls postes chiffrés : partielle si `annexesCompletes` est faux. */
  totalAnnexes: number;
  annexesCompletes: boolean;
  /** `null` dès qu'un poste retenu n'a pas pu être chiffré. */
  coutTotal: number | null;
  avertissements: string[];
  trancheCne: TrancheCne | null;
  baremeCneAnterieur: boolean;
  /** Jours écoulés entre la signature et le dépôt ; `null` si une date manque. */
  joursEcoules: number | null;
  /** Vrai lorsque le dépôt intervient au-delà du délai d'enregistrement. */
  horsDelai: boolean;
}

/**
 * Formatage monétaire homogène : « 1 234 567 F CFA ».
 * Les séparateurs de milliers insérés par `toLocaleString` (espace insécable ou
 * fine insécable selon l'environnement) sont normalisés en espace simple.
 */
export const formatFcfa = (montant: number): string =>
  `${Math.round(montant).toLocaleString('fr-FR').replace(/[\u00A0\u202F\u2009]/g, ' ')} F CFA`;

const trouverTranche = (grille: TrancheCne[], montant: number): TrancheCne | null =>
  grille.find((t) => montant >= t.min && (t.max === null || montant <= t.max)) ?? null;

/** Somme des seuls postes chiffrés d'un bloc. */
const sommer = (lignes: LigneLiquidation[]): number =>
  lignes.reduce((total, l) => total + (l.montant ?? 0), 0);

/** Vrai lorsque tous les postes du bloc ont pu être chiffrés. */
const estComplet = (lignes: LigneLiquidation[]): boolean =>
  lignes.every((l) => l.montant !== null);

/** Nombre de jours calendaires entre deux dates ISO ; `null` si une date manque ou est invalide. */
const joursEntre = (debut: string, fin: string): number | null => {
  if (!debut || !fin) return null;
  const depart = Date.parse(`${debut}T00:00:00Z`);
  const arrivee = Date.parse(`${fin}T00:00:00Z`);
  if (Number.isNaN(depart) || Number.isNaN(arrivee)) return null;
  return Math.round((arrivee - depart) / 86_400_000);
};

export const calculerFraisMarche = (input: FraisMarcheInput): FraisMarcheResult => {
  const {
    montantHT,
    nbPagesTimbrees,
    dateSignature,
    dateEnregistrement,
    fraisTresorpay,
    inclureCne,
    inclureMercuriale,
    inclureAttestations,
  } = input;

  const avertissements: string[] = [];

  // ── Part fiscale ────────────────────────────────────────────────────────
  const sousLeSeuil = montantHT < SEUIL_DROIT_PROPORTIONNEL;
  const droitProportionnel = sousLeSeuil
    ? Math.round(montantHT * TAUX_DROIT_PROPORTIONNEL)
    : null;
  const cac = droitProportionnel === null ? null : Math.round(droitProportionnel * TAUX_CAC);

  if (!sousLeSeuil) {
    avertissements.push(
      "Le montant atteint ou dépasse 5 000 000 F CFA : le taux de 7 % ne s'extrapole pas. " +
        'Le taux applicable doit être revérifié dans le CGI avant liquidation.'
    );
  } else if (montantHT >= SEUIL_DROIT_PROPORTIONNEL - MARGE_ALERTE_SEUIL) {
    avertissements.push(
      'Montant proche du seuil de 5 000 000 F CFA : tout avenant ferait basculer à la fois ' +
        'le taux de liquidation et la tranche du CNE.'
    );
  }

  const lignesFiscales: LigneLiquidation[] = [
    {
      id: 'droit-proportionnel',
      libelle: 'Droit proportionnel',
      formule: sousLeSeuil
        ? `${formatFcfa(montantHT)} × 7 %`
        : 'Taux à revérifier dans le CGI au-delà de 5 000 000 F CFA',
      montant: droitProportionnel,
    },
    {
      id: 'cac',
      libelle: 'Centimes Additionnels Communaux (CAC)',
      formule:
        droitProportionnel === null
          ? 'Assis sur le droit proportionnel'
          : `${formatFcfa(droitProportionnel)} × 5 %`,
      montant: cac,
    },
    // Le timbre de dimension est un élément fiscal : il entre dans le Total
    // Fiscal, aux côtés du droit proportionnel et des CAC.
    {
      id: 'timbres',
      libelle: 'Timbre de dimension',
      formule: `${nbPagesTimbrees} page(s) × ${formatFcfa(TIMBRE_PAR_PAGE)}`,
      montant: nbPagesTimbrees * TIMBRE_PAR_PAGE,
    },
  ];

  // ── Pénalité de retard d'enregistrement ─────────────────────────────────
  // Au-delà du délai décompté depuis la signature, les droits sont majorés de
  // 100 %. L'assiette est le droit proportionnel augmenté des CAC : le timbre
  // de dimension, bien que fiscal, en est exclu.
  const joursEcoules = joursEntre(dateSignature, dateEnregistrement);
  const datesIncoherentes = joursEcoules !== null && joursEcoules < 0;
  const horsDelai =
    joursEcoules !== null && !datesIncoherentes && joursEcoules > DELAI_ENREGISTREMENT_JOURS;

  if (datesIncoherentes) {
    avertissements.push(
      "La date d'enregistrement est antérieure à la date de signature : le délai ne peut pas " +
        'être décompté. Vérifiez les dates saisies.'
    );
  }

  if (horsDelai) {
    const assietteComplete = droitProportionnel !== null && cac !== null;
    const assiettePenalite = (droitProportionnel ?? 0) + (cac ?? 0);

    avertissements.push(
      `Dépôt à ${joursEcoules} jours de la signature, au-delà du délai de ` +
        `${DELAI_ENREGISTREMENT_JOURS} jours : une pénalité de 100 % des droits est due.`
    );

    lignesFiscales.push({
      id: 'penalite-retard',
      libelle: "Pénalité de retard d'enregistrement",
      formule: assietteComplete
        ? `${formatFcfa(assiettePenalite)} × 100 % — droits hors timbre (dépôt à J+${joursEcoules})`
        : `100 % des droits, eux-mêmes à déterminer (dépôt à J+${joursEcoules})`,
      montant: assietteComplete ? Math.round(assiettePenalite * TAUX_PENALITE_RETARD) : null,
    });
  } else if (
    joursEcoules !== null &&
    !datesIncoherentes &&
    joursEcoules > DELAI_ENREGISTREMENT_JOURS - MARGE_ALERTE_DELAI_JOURS
  ) {
    const reste = DELAI_ENREGISTREMENT_JOURS - joursEcoules;
    avertissements.push(
      `Délai d'enregistrement bientôt expiré : il reste ${reste} jour(s) avant que la pénalité ` +
        'de 100 % des droits ne soit due.'
    );
  }

  // ── Frais annexes ───────────────────────────────────────────────────────
  const lignesAnnexes: LigneLiquidation[] = [];

  if (inclureMercuriale) {
    lignesAnnexes.push({
      id: 'mercuriale',
      libelle: "Frais d'exploitation de la mercuriale",
      formule: 'Forfait réglementaire par bon de commande',
      montant: FRAIS_MERCURIALE,
    });
  }

  lignesAnnexes.push({
    id: 'tresorpay',
    libelle: 'Frais de paiement TRESORPAY',
    formule: 'Forfait plateforme, confirmé à la liquidation automatique',
    montant: fraisTresorpay,
  });

  // Le droit versé à l'ARMP et les frais d'obtention du CNE restent sur deux
  // lignes distinctes : les agréger masquerait une hausse de tarif au client.
  let trancheCne: TrancheCne | null = null;
  let baremeCneAnterieur = false;

  if (inclureCne) {
    baremeCneAnterieur = dateSignature !== '' && dateSignature < CNE_DATE_RESOLUTION;
    const grille = baremeCneAnterieur ? GRILLE_CNE_ANTERIEURE : GRILLE_CNE;
    trancheCne = trouverTranche(grille, montantHT);

    if (montantHT < CNE_MONTANT_PLANCHER) {
      avertissements.push(
        `Montant inférieur à ${formatFcfa(CNE_MONTANT_PLANCHER)} : la grille ARMP ne documente ` +
          "aucun droit de délivrance sur cette tranche. Le montant est à confirmer auprès de l'ARMP."
      );
    } else if (trancheCne === null && baremeCneAnterieur) {
      avertissements.push(
        "Bon de commande signé avant le 21 juillet 2026 : le barème antérieur n'est documenté que " +
          "pour la tranche 500 000 à 4 999 999 F CFA. Le droit de délivrance applicable à cette " +
          "tranche est à vérifier auprès de l'ARMP."
      );
    }

    lignesAnnexes.push({
      id: 'cne-droit',
      libelle: 'Droit de délivrance du CNE-ARMP',
      formule: trancheCne
        ? `Tranche ${trancheCne.libelle} F CFA`
        : 'Tranche non documentée — à confirmer',
      montant: trancheCne ? trancheCne.droit : null,
    });

    lignesAnnexes.push({
      id: 'cne-obtention',
      libelle: "Frais d'obtention du CNE",
      formule: 'Constitution et retrait du certificat, hors grille ARMP',
      montant: CNE_FRAIS_OBTENTION,
    });
  }

  if (inclureAttestations) {
    lignesAnnexes.push({
      id: 'attestations',
      libelle: "Attestation de conformité fiscale et attestation d'immatriculation",
      formule: 'Forfait DGI',
      montant: FRAIS_ATTESTATIONS_DGI,
    });
  }

  if (baremeCneAnterieur && trancheCne) {
    avertissements.push(
      'Barème CNE antérieur au 21 juillet 2026 appliqué, conformément à la date de signature ' +
        'du bon de commande.'
    );
  }

  const totalFiscal = sommer(lignesFiscales);
  const fiscalComplet = estComplet(lignesFiscales);
  const totalAnnexes = sommer(lignesAnnexes);
  const annexesCompletes = estComplet(lignesAnnexes);
  const coutTotal =
    fiscalComplet && annexesCompletes ? totalFiscal + totalAnnexes : null;

  return {
    lignesFiscales,
    lignesAnnexes,
    totalFiscal,
    fiscalComplet,
    totalAnnexes,
    annexesCompletes,
    coutTotal,
    avertissements,
    trancheCne,
    baremeCneAnterieur,
    joursEcoules,
    horsDelai,
  };
};
