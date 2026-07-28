import {
  Compass,
  Code2,
  BrainCircuit,
  ClipboardList,
  Scale,
  FlaskConical,
  PlugZap,
  SlidersHorizontal,
  GraduationCap,
  ShieldCheck,
  Database,
  Wallet,
  Languages,
  Gauge,
  Server,
  FileSearch,
  Receipt,
  MessageSquare,
  LineChart,
  BellRing,
  FileCheck2,
  type LucideIcon,
} from 'lucide-react';

/**
 * Contenu du pôle « Génie logiciel & intelligence artificielle ».
 *
 * Ces données alimentent à la fois la section de la page d'accueil
 * (DigitalExpertiseSection) et la page dédiée /expertise/ia-et-genie-logiciel.
 * Tout le texte commercial du pôle est centralisé ici : le cabinet peut le
 * faire évoluer sans toucher aux composants.
 */

export const DIGITAL_EXPERTISE_ROUTE = '/expertise/ia-et-genie-logiciel';

export interface Pillar {
  id: string;
  icon: LucideIcon;
  title: string;
  promise: string;
  description: string;
  deliverables: string[];
  offerId: string;
}

/** Les trois métiers du pôle numérique. */
export const DIGITAL_PILLARS: Pillar[] = [
  {
    id: 'conseil',
    icon: Compass,
    title: "Conseil & orientation logicielle",
    promise: "Décider avant d'acheter.",
    description:
      "Nous partons de vos processus réels — devis, facturation, stocks, paie, trésorerie — pour dire quel outil vous manque vraiment, lequel se remplace et lequel se garde. Vous arbitrez sur des critères écrits, pas sur une démonstration commerciale.",
    deliverables: [
      "Cartographie des processus et des outils en place",
      "Schéma directeur du système d'information",
      "Cahier des charges et grille de comparaison des solutions",
      "Chiffrage, plan de migration et calendrier de déploiement",
    ],
    offerId: 'conseil-logiciel',
  },
  {
    id: 'developpement',
    icon: Code2,
    title: "Conception & développement logiciel",
    promise: "Construire ce que le marché ne vend pas.",
    description:
      "Quand aucun logiciel du commerce ne colle à votre métier, nous le construisons : application de gestion, portail client, automatisation d'un processus, connecteur entre deux outils qui ne se parlent pas. Livré par lots, testé avec vos équipes, maintenu dans la durée.",
    deliverables: [
      "Applications métier web et mobiles",
      "Automatisation des tâches répétitives et des relances",
      "Intégrations et reprise de vos données existantes",
      "Tableaux de bord de pilotage et hébergement sécurisé",
    ],
    offerId: 'developpement-logiciel',
  },
  {
    id: 'ia',
    icon: BrainCircuit,
    title: "Intelligence artificielle appliquée",
    promise: "Choisir le modèle, l'installer, le régler.",
    description:
      "Le sujet n'est pas « faire de l'IA », mais choisir le modèle adapté à votre cas d'usage, à votre budget et à la confidentialité de vos données — puis le mettre en place, le paramétrer sur vos documents et vos règles métier, et former ceux qui vont s'en servir.",
    deliverables: [
      "Sélection argumentée du modèle (propriétaire ou open source, cloud ou local)",
      "Preuve de concept mesurée sur vos propres données",
      "Paramétrage : instructions, base documentaire (RAG), garde-fous",
      "Intégration dans vos outils, formation et supervision",
    ],
    offerId: 'ia-sur-mesure',
  },
];

export interface MethodStep {
  step: string;
  icon: LucideIcon;
  title: string;
  description: string;
  output: string;
}

/** La méthode d'un projet IA, du cadrage à l'exploitation. */
export const AI_METHOD_STEPS: MethodStep[] = [
  {
    step: '01',
    icon: ClipboardList,
    title: "Cadrage des cas d'usage",
    description:
      "Nous observons le travail réel et retenons les deux ou trois tâches où l'IA fait gagner du temps mesurable. Les cas d'usage sans gain clair sont écartés — c'est ce qui évite les projets vitrines.",
    output: "Livrable : liste priorisée des cas d'usage, gain estimé, critères de réussite.",
  },
  {
    step: '02',
    icon: Scale,
    title: "Choix du modèle",
    description:
      "Chaque modèle a un profil : qualité de raisonnement, coût par usage, langue, vitesse, hébergement possible. Nous confrontons ces critères à votre contexte et documentons l'arbitrage, y compris les modèles écartés.",
    output: "Livrable : note de choix technique, coût prévisionnel, scénario de repli.",
  },
  {
    step: '03',
    icon: FlaskConical,
    title: "Preuve de concept",
    description:
      "Avant tout engagement lourd, le modèle est testé sur un échantillon de vos données, avec vos utilisateurs. Les résultats sont comparés à la façon de faire actuelle.",
    output: "Livrable : maquette fonctionnelle, résultats chiffrés, décision go / no-go.",
  },
  {
    step: '04',
    icon: PlugZap,
    title: "Mise en place & intégration",
    description:
      "Le modèle est déployé dans l'environnement retenu et branché là où le travail se fait : votre logiciel de gestion, votre messagerie, WhatsApp, un portail interne. Accès et journalisation sont réglés dès le départ.",
    output: "Livrable : environnement en production, comptes, droits, journalisation.",
  },
  {
    step: '05',
    icon: SlidersHorizontal,
    title: "Paramétrage & garde-fous",
    description:
      "C'est l'étape qui fait la différence entre un gadget et un outil de travail : instructions métier, connexion à votre base documentaire, vocabulaire de votre secteur, limites explicites et validation humaine sur les décisions sensibles.",
    output: "Livrable : jeu d'instructions versionné, base documentaire indexée, règles de contrôle.",
  },
  {
    step: '06',
    icon: GraduationCap,
    title: "Formation, supervision & amélioration",
    description:
      "Vos équipes sont formées aux usages et aux limites de l'outil. Nous suivons ensuite la qualité des réponses, les coûts et les usages réels, et nous ajustons le paramétrage au fil des retours.",
    output: "Livrable : sessions de formation, guide d'usage, tableau de suivi et revues périodiques.",
  },
];

export interface SelectionCriterion {
  icon: LucideIcon;
  title: string;
  question: string;
}

/** Les critères sur lesquels se joue le choix d'un modèle. */
export const MODEL_SELECTION_CRITERIA: SelectionCriterion[] = [
  {
    icon: ShieldCheck,
    title: "Confidentialité",
    question:
      "Vos données peuvent-elles sortir de l'entreprise ? Selon la réponse, on s'oriente vers un modèle hébergé ou vers un modèle ouvert installé sur votre propre infrastructure.",
  },
  {
    icon: Wallet,
    title: "Coût d'usage",
    question:
      "Combien coûte réellement une requête, multipliée par votre volume mensuel ? Un modèle plus modeste suffit souvent — et coûte parfois dix fois moins cher.",
  },
  {
    icon: Gauge,
    title: "Niveau de raisonnement",
    question:
      "S'agit-il de classer des documents ou d'analyser un dossier complexe ? Le besoin réel détermine la puissance nécessaire, pas la mode du moment.",
  },
  {
    icon: Languages,
    title: "Langue & contexte local",
    question:
      "Le modèle maîtrise-t-il le français professionnel, le vocabulaire OHADA et les réalités du contexte camerounais ? Nous le vérifions sur vos propres documents.",
  },
  {
    icon: Server,
    title: "Hébergement & disponibilité",
    question:
      "Cloud, serveur privé ou poste local ? Nous tenons compte de votre connexion internet et prévoyons un fonctionnement dégradé quand elle faiblit.",
  },
  {
    icon: Database,
    title: "Données & maintenabilité",
    question:
      "Quelles données alimentent le modèle, qui les met à jour, et comment change-t-on de modèle demain sans tout reconstruire ?",
  },
];

export interface UseCase {
  icon: LucideIcon;
  title: string;
  description: string;
}

/** Cas d'usage concrets, orientés TPE/PME. */
export const AI_USE_CASES: UseCase[] = [
  {
    icon: Receipt,
    title: "Saisie et classement des pièces",
    description:
      "Factures, reçus et relevés lus automatiquement, contrôlés puis versés dans la comptabilité. Le temps de saisie fond, les erreurs de recopie disparaissent.",
  },
  {
    icon: FileSearch,
    title: "Assistant documentaire interne",
    description:
      "Un assistant qui répond à partir de vos procédures, contrats et notes internes — avec la source citée — au lieu de faire chercher vos collaborateurs pendant vingt minutes.",
  },
  {
    icon: MessageSquare,
    title: "Réponses clients assistées",
    description:
      "Brouillons de réponses aux demandes courantes, sur e-mail ou WhatsApp, rédigés dans votre ton et validés par un humain avant envoi.",
  },
  {
    icon: LineChart,
    title: "Analyse de gestion et prévisions",
    description:
      "Lecture automatique de vos données de vente et de trésorerie, avec alertes sur les écarts et projections à trois mois.",
  },
  {
    icon: BellRing,
    title: "Veille réglementaire et échéances",
    description:
      "Suivi des textes fiscaux et sociaux, résumé de ce qui vous concerne, rappel des échéances déclaratives au bon moment.",
  },
  {
    icon: FileCheck2,
    title: "Contrôle et rédaction de documents",
    description:
      "Relecture de contrats et de dossiers, détection des clauses manquantes, génération de documents standards à partir de vos modèles.",
  },
];

/** Engagements du cabinet sur les projets numériques. */
export const DIGITAL_COMMITMENTS: { title: string; description: string }[] = [
  {
    title: "Vos données restent les vôtres",
    description:
      "Nous définissons avec vous ce qui peut être envoyé à un service externe et ce qui ne le sera jamais. Quand la confidentialité l'exige, le modèle tourne sur votre propre infrastructure.",
  },
  {
    title: "Aucun engagement avant preuve",
    description:
      "Un projet IA commence toujours par une preuve de concept chiffrée. Si le gain n'est pas au rendez-vous, nous le disons et le projet s'arrête là.",
  },
  {
    title: "Pas de dépendance imposée",
    description:
      "Code, paramétrages et documentation vous appartiennent. L'architecture est pensée pour changer de modèle ou de prestataire sans tout reconstruire.",
  },
  {
    title: "Un métier au service de l'autre",
    description:
      "Nous connaissons la comptabilité, la fiscalité et la paie. Les outils que nous concevons parlent le langage de vos obligations réelles, pas celui d'un logiciel générique.",
  },
];

export interface FaqItem {
  question: string;
  answer: string;
}

export const DIGITAL_FAQ: FaqItem[] = [
  {
    question: "Faut-il être une grande entreprise pour se lancer dans l'IA ?",
    answer:
      "Non. Les gains les plus rapides se trouvent souvent dans les petites structures, là où quelques tâches répétitives occupent une part importante du temps de travail. Un premier cas d'usage utile se met en place en quelques semaines, sur un périmètre volontairement réduit.",
  },
  {
    question: "Nos données confidentielles vont-elles se retrouver dans un modèle public ?",
    answer:
      "Seulement si vous le décidez. Le classement des données — publiques, internes, sensibles — fait partie du cadrage. Pour les données sensibles, nous privilégions un modèle ouvert installé sur votre infrastructure, ou des accords d'usage excluant tout entraînement sur vos contenus.",
  },
  {
    question: "Quel modèle d'IA recommandez-vous ?",
    answer:
      "Aucun par défaut. Le choix dépend du cas d'usage, du volume, du budget et du niveau de confidentialité ; nous comparons plusieurs modèles sur vos propres données avant de trancher, et nous documentons l'arbitrage pour que vous puissiez le rediscuter plus tard.",
  },
  {
    question: "Combien de temps prend un projet ?",
    answer:
      "Une mission de conseil et d'orientation logicielle dure généralement de deux à quatre semaines. Une preuve de concept IA se mène en trois à six semaines. Un développement sur mesure se livre par lots, le premier étant utilisable en production.",
  },
  {
    question: "Et si nous avons déjà des logiciels en place ?",
    answer:
      "C'est le cas le plus fréquent, et c'est un point de départ, pas un obstacle. Nous partons de l'existant : ce qui fonctionne est conservé et connecté, ce qui bloque est remplacé ou complété — jamais l'inverse.",
  },
  {
    question: "Que se passe-t-il si l'IA se trompe ?",
    answer:
      "Un modèle se trompe : c'est prévu dès la conception. Les décisions sensibles restent soumises à validation humaine, les réponses citent leurs sources, et les écarts sont suivis pour ajuster le paramétrage. L'IA prépare le travail ; la responsabilité reste humaine.",
  },
];
