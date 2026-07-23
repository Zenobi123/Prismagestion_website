import { Rocket, ShieldCheck, Search, type LucideIcon } from 'lucide-react';

export interface Offer {
  id: string;
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

// Les trois offres phares (cf. STRATEGIE_OFFRES_COMMERCIALES.md).
//
// NOTE PRISMA : les libellés de prix sont volontairement « sur devis ».
// Pour afficher des tarifs d'appel (« À partir de … F CFA »), il suffit de
// renseigner `priceLabel` / `priceNote` ci-dessous une fois la grille
// tarifaire validée — aucun autre changement de code n'est nécessaire.
export const OFFERS: Offer[] = [
  {
    id: 'creation',
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
];
