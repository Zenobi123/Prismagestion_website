import {
  Rocket,
  ShieldCheck,
  Search,
  Compass,
  Code2,
  BrainCircuit,
  type LucideIcon,
} from 'lucide-react';

/** Les deux pôles de métier du cabinet. */
export type OfferPole = 'gestion' | 'numerique';

export interface Offer {
  id: string;
  pole: OfferPole;
  name: string;
  tagline: string;
  icon: LucideIcon;
  priceLabel: string;
  priceNote?: string;
  features: string[];
  ctaLabel: string;
  ctaType: 'quote' | 'appointment';
  highlighted?: boolean;
  badge?: string;
}

export interface PoleDefinition {
  id: OfferPole;
  title: string;
  subtitle: string;
}

export const OFFER_POLES: PoleDefinition[] = [
  {
    id: 'gestion',
    title: 'Gestion, comptabilité & fiscalité',
    subtitle:
      "Tenir vos obligations, sécuriser vos déclarations et piloter vos chiffres au quotidien.",
  },
  {
    id: 'numerique',
    title: 'Génie logiciel & intelligence artificielle',
    subtitle:
      "Choisir les bons outils, développer ce qui manque et mettre l'IA au travail sur vos propres données.",
  },
];

// Offres phares du cabinet (cf. STRATEGIE_OFFRES_COMMERCIALES.md).
//
// NOTE PRISMA : les libellés de prix sont volontairement « sur devis ».
// Pour afficher des tarifs d'appel (« À partir de … F CFA »), il suffit de
// renseigner `priceLabel` / `priceNote` ci-dessous une fois la grille
// tarifaire validée — aucun autre changement de code n'est nécessaire.
export const OFFERS: Offer[] = [
  // ── Pôle gestion ────────────────────────────────────────────────────────
  {
    id: 'creation',
    pole: 'gestion',
    name: "Pack Création d'Entreprise",
    tagline: "Votre entreprise créée et en règle en 15 jours, sans faux pas administratif.",
    icon: Rocket,
    priceLabel: 'Forfait sur devis',
    features: [
      "Choix de la forme juridique",
      "Immatriculation (RCCM, NIU, CNPS)",
      "Rédaction des statuts",
      "Ouverture du dossier au CFCE",
      "Première déclaration fiscale",
      "Kit de démarrage (facturier, registres)",
    ],
    ctaLabel: "Je lance mon entreprise",
    ctaType: 'quote',
  },
  {
    id: 'serenite',
    pole: 'gestion',
    name: "Sérénité Fiscale & Comptable",
    tagline: "Vos obligations tenues à jour, zéro pénalité, un interlocuteur dédié.",
    icon: ShieldCheck,
    priceLabel: 'Abonnement mensuel — sur devis',
    priceNote: "3 formules : Essentiel · Business · Premium",
    features: [
      "Tenue de la comptabilité",
      "Déclarations fiscales (IGS, patente, TVA)",
      "Rappels automatiques des échéances",
      "Paie & CNPS (formule Business)",
      "Reporting périodique",
      "Conseil fiscal proactif (formule Premium)",
    ],
    ctaLabel: "Demander un devis",
    ctaType: 'quote',
    highlighted: true,
    badge: 'Le plus choisi',
  },
  {
    id: 'diagnostic',
    pole: 'gestion',
    name: "Diagnostic & Mise en Conformité",
    tagline: "En 30 minutes, faites le point sur vos risques fiscaux — repartez avec un plan d'action.",
    icon: Search,
    priceLabel: 'Diagnostic offert',
    priceNote: "Sans engagement",
    features: [
      "Audit express de votre situation",
      "Identification des risques fiscaux",
      "Plan d'action personnalisé",
      "Estimation des régularisations",
    ],
    ctaLabel: "Réserver mon diagnostic gratuit",
    ctaType: 'appointment',
  },

  // ── Pôle numérique : génie logiciel & IA ────────────────────────────────
  {
    id: 'conseil-logiciel',
    pole: 'numerique',
    name: "Cap Logiciel — Conseil & orientation",
    tagline:
      "Investissez dans les bons outils : un système d'information choisi pour vos processus, pas l'inverse.",
    icon: Compass,
    priceLabel: 'Mission de conseil — sur devis',
    priceNote: "Forfait selon le périmètre (audit, cadrage, sélection)",
    features: [
      "Audit de l'existant : outils, données, processus",
      "Schéma directeur et priorisation des chantiers",
      "Cahier des charges et expression de besoin",
      "Comparatif objectif des solutions (ERP, CRM, compta, paie, caisse)",
      "Plan de migration et reprise des données",
      "Assistance à maîtrise d'ouvrage jusqu'au déploiement",
    ],
    ctaLabel: "Cadrer mon projet logiciel",
    ctaType: 'quote',
  },
  {
    id: 'developpement-logiciel',
    pole: 'numerique',
    name: "Studio Logiciel — développement sur mesure",
    tagline:
      "L'application métier qui automatise ce que vos équipes font encore à la main.",
    icon: Code2,
    priceLabel: 'Projet au forfait — sur devis',
    priceNote: "Cadrage puis livraisons par lots, testées avec vos équipes",
    features: [
      "Applications métier web et mobiles",
      "Automatisation des processus (facturation, relances, reporting)",
      "Intégration avec vos outils comptables, bancaires et de paie",
      "Reprise de données et tableaux de bord de pilotage",
      "Hébergement, sauvegardes et sécurité",
      "Maintenance corrective et évolutive",
    ],
    ctaLabel: "Décrire mon besoin",
    ctaType: 'quote',
  },
  {
    id: 'ia-sur-mesure',
    pole: 'numerique',
    name: "IA sur Mesure — modèles choisis, installés, paramétrés",
    tagline:
      "Du cas d'usage au modèle en production : le bon modèle, branché sur vos données, adopté par vos équipes.",
    icon: BrainCircuit,
    priceLabel: 'Accompagnement IA — sur devis',
    priceNote: "Cadrage · preuve de concept · mise en production · formation",
    features: [
      "Identification et chiffrage des cas d'usage prioritaires",
      "Choix du modèle : propriétaire ou open source, cloud ou local",
      "Preuve de concept mesurée avant tout engagement",
      "Paramétrage : instructions, connexion à vos documents (RAG), garde-fous",
      "Intégration dans vos outils métier et vos flux de travail",
      "Gouvernance des données, conformité et formation des équipes",
    ],
    ctaLabel: "Lancer mon projet IA",
    ctaType: 'quote',
    highlighted: true,
    badge: 'Notre différence',
  },
];

/** Offres d'un pôle donné, dans l'ordre de déclaration. */
export const getOffersByPole = (pole: OfferPole): Offer[] =>
  OFFERS.filter((offer) => offer.pole === pole);
