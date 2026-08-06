
// Données des tranches d'imposition
const taxClasses = [
  { classe: 1, min: 0, max: 499_999, montant: 20_000 },
  { classe: 2, min: 500_000, max: 999_999, montant: 30_000 },
  { classe: 3, min: 1_000_000, max: 1_499_999, montant: 40_000 },
  { classe: 4, min: 1_500_000, max: 1_999_999, montant: 50_000 },
  { classe: 5, min: 2_000_000, max: 2_499_999, montant: 60_000 },
  { classe: 6, min: 2_500_000, max: 4_999_999, montant: 150_000 },
  { classe: 7, min: 5_000_000, max: 9_999_999, montant: 300_000 },
  { classe: 8, min: 10_000_000, max: 19_999_999, montant: 500_000 },
  { classe: 9, min: 20_000_000, max: 29_999_999, montant: 1_000_000 },
  { classe: 10, min: 30_000_000, max: 49_999_999, montant: 2_000_000 },
];

// Barème de la TDL adossée à l'IGS (Article C 86 CGI / LF 2026)
const baremeTDL = [
  { max: 30_000, montant: 7_500 },
  { max: 60_000, montant: 9_000 },
  { max: 100_000, montant: 15_000 },
  { max: 150_000, montant: 22_500 },
  { max: 200_000, montant: 30_000 },
  { max: 300_000, montant: 45_000 },
  { max: 400_000, montant: 60_000 },
  { max: 500_000, montant: 75_000 },
  { max: Number.POSITIVE_INFINITY, montant: 90_000 },
];

export const calculateTDL = (montantIGSPrincipal: number): number => {
  const m = Math.round(montantIGSPrincipal || 0);
  if (m <= 0) return 0;
  const t = baremeTDL.find((item) => m <= item.max);
  return t ? t.montant : 0;
};

/**
 * Calcule la classe d'imposition, le montant de l'IGS et les pénalités éventuelles
 * @param chiffreAffaires - Le chiffre d'affaires annuel
 * @param moisRetardOrOptions - Nombre de mois de retard ou objet d'options
 * @returns Objet contenant la classe, le montant, les pénalités et les informations de paiement
 */
export const calculateTaxClass = (
  chiffreAffaires: number,
  moisRetardOrOptions: number | { moisRetard?: number } = 0
) => {
  const moisRetard = typeof moisRetardOrOptions === 'number'
    ? Math.max(0, moisRetardOrOptions)
    : Math.max(0, moisRetardOrOptions?.moisRetard || 0);

  // Trouver la classe correspondante au chiffre d'affaires
  const taxClass = taxClasses.find((taxClass) => 
    chiffreAffaires >= taxClass.min && chiffreAffaires <= taxClass.max
  );
  
  // Si aucune classe ne correspond (par exemple, si CA > 50M), retourner une valeur spéciale
  if (!taxClass) {
    // Si le CA dépasse les 50M, on n'est plus éligible à l'IGS
    if (chiffreAffaires > taxClasses[taxClasses.length - 1].max) {
      return {
        classe: 0,
        montant: 0,
        penalites: 0,
        moisRetard: 0,
        chiffreAffaires,
        minRange: 0, 
        maxRange: 0,
        message: "Vous n'êtes plus éligible au régime de l'IGS. Veuillez vous référer au régime du réel."
      };
    }
    
    return {
      classe: 0,
      montant: 0,
      penalites: 0,
      moisRetard: 0,
      chiffreAffaires,
      minRange: 0, 
      maxRange: 0,
      message: "Erreur de calcul. Veuillez vérifier votre chiffre d'affaires."
    };
  }
  
  // Calculer la Taxe de Développement Local (TDL) selon le barème officiel par tranches (Loi de Finances 2026)
  const tdl = calculateTDL(taxClass.montant);
  
  // Pénalités de retard : 10 % du principal IGS par mois de retard
  const penalites = Math.round(taxClass.montant * 0.10 * moisRetard);
  
  const total = taxClass.montant + tdl + penalites;
  const montantTrimestriel = Math.round(total / 4);

  // Échéances de paiement trimestrielles (ramenées de 2 mois vers l'arrière)
  const echeancesTrimestrielles = [
    "15 Février",
    "15 Mai",
    "15 Août",
    "15 Novembre",
  ];

  // Échéance de la déclaration annuelle (fixée au 15 juin)
  const echeanceAnnuelle = "15 Juin";

  // Retourner les informations de la classe trouvée
  return {
    classe: taxClass.classe,
    montant: taxClass.montant,
    tdl,
    penalites,
    moisRetard,
    total,
    montantTrimestriel,
    echeancesTrimestrielles,
    echeanceAnnuelle,
    chiffreAffaires,
    minRange: taxClass.min,
    maxRange: taxClass.max
  };
};
