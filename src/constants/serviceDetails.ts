/**
 * Descriptions par défaut des domaines d'expertise affichés dans la section
 * « Nos domaines d'expertise ».
 *
 * Ces contenus servent de repli lorsque la table `services` de Supabase est
 * vide ou inaccessible. Un contenu saisi dans l'administration reste prioritaire.
 */
export interface ServiceDetail {
  description: string;
  items: string[];
}

export const SERVICE_DETAILS: Record<string, ServiceDetail> = {
  comptabilite: {
    description:
      "Une comptabilité tenue à jour, conforme au référentiel OHADA, et des états financiers qui vous servent à décider — pas seulement à déclarer.",
    items: [
      "Tenue et révision de la comptabilité",
      "États financiers annuels (SYSCOHADA)",
      "Comptabilité analytique et suivi budgétaire",
      "Assistance à l'inventaire et aux contrôles",
    ],
  },
  finance: {
    description:
      "Piloter la trésorerie, préparer un financement, mesurer la rentabilité réelle de votre activité : la finance mise au service de vos décisions.",
    items: [
      "Plan de trésorerie et suivi des flux",
      "Business plan et dossiers de financement",
      "Analyse de rentabilité et tableaux de bord",
      "Évaluation d'entreprise et prévisions",
    ],
  },
  fiscalite: {
    description:
      "Sécuriser vos déclarations, anticiper les échéances et défendre vos positions : une fiscalité maîtrisée, sans mauvaise surprise.",
    items: [
      "Déclarations fiscales (TVA, IGS, patente, DSF)",
      "Optimisation et sécurisation fiscale",
      "Assistance en cas de contrôle fiscal",
      "Veille sur les évolutions réglementaires",
    ],
  },
  'ressources-humaines': {
    description:
      "De la paie aux obligations sociales, une gestion des ressources humaines conforme et allégée pour vos équipes administratives.",
    items: [
      "Bulletins de paie et déclarations CNPS",
      "Contrats de travail et procédures internes",
      "Suivi des congés, absences et charges sociales",
      "Conseil en organisation et en recrutement",
    ],
  },
  'genie-logiciel': {
    description:
      "Conseil en orientation logicielle et développement sur mesure : nous vous aidons à choisir les bons outils, puis nous construisons ceux qui manquent à votre métier.",
    items: [
      "Audit du système d'information et schéma directeur",
      "Cahier des charges et sélection des solutions",
      "Développement d'applications métier web et mobiles",
      "Automatisation des processus et intégrations",
      "Reprise de données, hébergement et maintenance",
    ],
  },
  'intelligence-artificielle': {
    description:
      "Choix des modèles d'intelligence artificielle, mise en place et paramétrage sur vos propres données : de l'identification du cas d'usage jusqu'à l'adoption par vos équipes.",
    items: [
      "Identification et chiffrage des cas d'usage",
      "Choix du modèle : propriétaire ou open source, cloud ou local",
      "Preuve de concept mesurée sur vos données",
      "Paramétrage : instructions, base documentaire (RAG), garde-fous",
      "Intégration métier, gouvernance des données et formation",
    ],
  },
};
