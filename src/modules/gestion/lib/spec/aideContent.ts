/**
 * Contenu du module d'Aide de PRISMA GESTION.
 *
 * ⚠️ MAINTENANCE — À mettre à jour à CHAQUE changement majeur de l'application :
 *   1. Incrémentez `APP_VERSION` et mettez `LAST_UPDATED` à la date du jour.
 *   2. Ajoutez une entrée en tête de `changelog` décrivant les nouveautés.
 *   3. Si une fonctionnalité est ajoutée/modifiée, ajustez la rubrique
 *      correspondante dans `aideSections` (ou ajoutez-en une nouvelle).
 *
 * Tout le contenu est centralisé ici pour que la page `Aide.tsx` reste générique.
 */

export interface AideArticle {
  /** Question / titre court de l'article. */
  question: string;
  /** Réponse détaillée. Le texte est affiché tel quel (sauts de ligne respectés). */
  answer: string;
}

export interface AideSection {
  /** Identifiant stable (utilisé comme clé et ancre). */
  id: string;
  /** Titre de la rubrique. */
  title: string;
  /** Nom de l'icône lucide-react associée (voir mapping dans Aide.tsx). */
  icon: string;
  /** Route de l'application concernée par la rubrique (facultatif). */
  route?: string;
  /** Courte description affichée sous le titre. */
  description: string;
  /** Liste des articles (questions/réponses) de la rubrique. */
  articles: AideArticle[];
}

export interface ChangelogEntry {
  version: string;
  date: string; // format ISO court AAAA-MM-JJ
  title: string;
  changes: string[];
}

/** Version courante de l'application telle qu'affichée dans l'aide. */
export const APP_VERSION = "1.17.0";

/** Date de la dernière mise à jour de l'aide (AAAA-MM-JJ). */
export const LAST_UPDATED = "2026-08-11";

/**
 * Journal des nouveautés : la première entrée est la plus récente.
 * Ajoutez une entrée à chaque changement majeur.
 */
export const changelog: ChangelogEntry[] = [
  {
    version: "1.17.0",
    date: "2026-08-11",
    title: "Les deux attestations se conservent et se téléchargent depuis l'onglet Fiscal",
    changes: [
      "L'Attestation de Conformité Fiscale et l'Attestation d'Immatriculation acceptent désormais leur pièce scannée directement dans l'onglet Fiscal : « Ajouter la pièce », puis « Consulter », « Télécharger » et « Remplacer ». Jusqu'ici seules les dates s'y saisissaient, et le document lui-même devait être rangé depuis l'onglet Dossier.",
      "La pièce est enregistrée dès qu'elle est choisie, sans attendre le bouton « Enregistrer » de l'onglet : un fichier envoyé puis abandonné ne se perd plus.",
      "C'est le même document des deux côtés : une attestation ajoutée depuis l'onglet Fiscal apparaît aussitôt « Fournie » dans la checklist de l'onglet Dossier, et inversement. La date de fin de validité — 30 jours pour l'immatriculation, 90 jours pour l'ACF — est enregistrée avec le fichier.",
      "Le téléchargement rend enfin un nom lisible. Le fichier arrivait sous son identifiant de stockage ; il s'enregistre maintenant sous « Attestation de conformité fiscale.pdf », accents et apostrophe compris.",
    ],
  },
  {
    version: "1.16.0",
    date: "2026-08-07",
    title: "Toute la console se consulte et se saisit sur téléphone",
    changes: [
      "Les deux grilles de la clôture d'exercice — activité commerciale mois par mois, activité de service marché par marché — passent en fiches sur téléphone. La seconde comptait onze colonnes dont quatre champs de saisie : chaque champ recevait une trentaine de pixels, la saisie y était impossible. Les champs mesurent désormais 44 pixels de haut.",
      "Le barème IGS de la page Outils s'affiche classe par classe au lieu d'un tableau où la fourchette de chiffre d'affaires se repliait sur quatre lignes.",
      "Avec cette version, plus aucun écran de la console n'impose de faire défiler un tableau latéralement sur téléphone.",
    ],
  },
  {
    version: "1.15.0",
    date: "2026-08-07",
    title: "Historique du courrier et journal des modifications sur téléphone",
    changes: [
      "L'historique du courrier passe en fiches : client et modèle en clair, référence, date et statut en dessous. Ses boutons d'action mesuraient 24 pixels de haut — la moitié de ce qu'un doigt peut viser ; ils passent à 44.",
      "Dans le journal des modifications, le comparatif avant/après s'empile au lieu de tenir sur deux colonnes étroites : une valeur longue reste lisible.",
      "Rien ne change sur ordinateur.",
    ],
  },
  {
    version: "1.14.0",
    date: "2026-08-07",
    title: "Échéances fiscales et prestations facturées lisibles sur téléphone",
    changes: [
      "Dans la situation clients, le rapport des échéances fiscales impayées passe en fiches sur téléphone : le nom du client et l'obligation s'affichent en clair, avec le montant restant et le délai.",
      "Dans le dossier d'un client, les onglets « Dossier fiscal annuel » et « Honoraires cabinet » présentent chaque prestation en fiche, désignation complète en tête, avec le total en pied de liste.",
      "Rien ne change sur ordinateur.",
    ],
  },
  {
    version: "1.13.0",
    date: "2026-08-07",
    title: "Les paiements et les factures clients se consultent sur téléphone",
    changes: [
      "La liste des paiements était un tableau de huit colonnes : sur téléphone, chaque cellule ne recevait que quelques caractères. Chaque paiement s'affiche désormais en fiche, montant et client en tête, avec la référence, la date, le mode et le solde restant en dessous.",
      "Dans la situation d'un client, l'onglet Factures présente les trois montants — total, payé, restant — côte à côte dans des encadrés lisibles, le restant en ambre lorsqu'il n'est pas soldé. L'onglet Paiements passe lui aussi en fiches.",
      "Les boutons d'action de ces écrans passent à la taille recommandée pour une cible tactile.",
      "Rien ne change sur ordinateur : les tableaux y sont conservés à l'identique.",
    ],
  },
  {
    version: "1.12.0",
    date: "2026-08-07",
    title: "Les tâches et les missions se lisent enfin correctement sur téléphone",
    changes: [
      "Sur le tableau de bord, la liste des tâches était un tableau à cinq colonnes. Sur un écran de téléphone, il ne restait que 73 pixels au titre de la tâche, soit quelques caractères par ligne. Elle s'affiche désormais en fiches : le titre dispose de 267 pixels et tient sur une ligne.",
      "Sur les cartes de mission, les boutons Ordre, Rapport, Statut et Supprimer mesuraient 36 pixels de haut, et deux d'entre eux moins de 30 pixels de large — difficiles à viser au doigt. Ils occupent maintenant une rangée complète sous la mission, à 44 pixels de haut, la taille recommandée pour une cible tactile.",
      "Le titre de la mission gagne au passage 68 % de largeur sur téléphone : il n'est plus coupé au bout de quelques mots.",
      "Rien ne change sur ordinateur : les deux écrans y gardent leur présentation en tableau et en colonnes.",
    ],
  },
  {
    version: "1.11.0",
    date: "2026-08-07",
    title: "Le statut « en retard » fonctionne enfin, et la console cesse de s'écrire toute seule",
    changes: [
      "Une tâche dont l'échéance est dépassée s'affiche « en retard ». C'était déjà le cas sur le tableau de bord, mais pas dans les Missions : le filtre « En retard » n'y trouvait jamais rien. Il fonctionne désormais partout, avec la même règle.",
      "Le retard n'est plus enregistré, il est déduit de la date de fin. C'est ce qui le rendait faux : une tâche encore à l'heure hier peut être en retard aujourd'hui, sans que rien n'ait changé dans la fiche.",
      "Le nombre de tâches en cours affiché sur chaque collaborateur est maintenant calculé au moment où vous le lisez. Il était auparavant recopié dans la fiche du collaborateur et pouvait rester figé sur une valeur périmée.",
      "Le tableau de bord ne se recharge plus toutes les minutes en arrière-plan. Il se met à jour quand vous agissez et quand vous revenez sur l'onglet — moins de données consommées, notamment en connexion mobile.",
    ],
  },
  {
    version: "1.10.0",
    date: "2026-08-07",
    title: "La clôture d'exercice verrouille vraiment, et suit tous vos appareils",
    changes: [
      "La clôture annuelle était enregistrée dans votre navigateur. Vider le cache rouvrait tous les exercices, et un autre appareil n'en voyait aucun. Elle est désormais enregistrée dans la base : elle vous suit partout et ne se perd plus.",
      "Surtout, elle verrouille réellement. Les factures, paiements, devis, propositions, courriers et obligations fiscales d'un exercice clos ne peuvent plus être ni modifiés, ni supprimés, ni créés. Jusqu'ici, « clôturer » ne faisait que masquer l'exercice dans les listes : tout restait modifiable.",
      "Le verrou est posé dans la base, pas dans l'écran : il s'applique quelle que soit la manière dont la donnée est touchée.",
      "Pour intervenir sur un exercice clos — encaisser un règlement tardif, corriger une écriture — rouvrez-le depuis Paramètres → Clôture annuelle, faites la correction, puis reclôturez. La clôture comme la réouverture apparaissent dans le journal des modifications.",
      "Les tâches et le planning ne sont pas verrouillés : ce ne sont pas des pièces comptables.",
      "Aucun exercice n'était clôturé jusqu'à présent : rien n'a été repris, la liste démarre vide.",
    ],
  },
  {
    version: "1.9.0",
    date: "2026-08-07",
    title: "Le calendrier fiscal génère vos tâches",
    changes: [
      "Tableau de bord → bouton « Échéances fiscales » : l'application confronte chaque client actif au calendrier — IGS et précompte sur loyer trimestriels, Patente, DSF, DARP, DBEF — selon son régime et son mode de paiement, puis crée les tâches correspondantes.",
      "Vous choisissez l'exercice et le collaborateur, vous voyez la liste exacte de ce qui va être créé, et vous validez. Rien n'est créé sans votre accord.",
      "Les échéances sont classées en trois groupes : « À traiter » (dans les 30 jours), « Plus tard dans l'année », et « Déjà passées » pour un éventuel rattrapage. Seul le premier groupe est retenu par défaut.",
      "Chaque tâche s'ouvre 30 jours avant sa date légale et porte l'échéance comme date de fin. Exemple : l'acompte IGS du 15 août apparaît le 16 juillet.",
      "Une échéance déjà transformée en tâche n'est jamais reproposée, même si vous relancez la génération plusieurs fois.",
      "Les dates d'échéance annuelles (Patente au 28 février, DSF au 15 mars, DARP et DBEF au 30 juin) sont désormais déclarées au même endroit que les échéances trimestrielles, et non plus dispersées.",
      "Le précompte sur loyer n'est généré qu'en paiement trimestriel : aucune date légale n'étant documentée pour le versement annuel, l'application préfère ne rien proposer plutôt qu'avancer une échéance incertaine.",
    ],
  },
  {
    version: "1.8.0",
    date: "2026-08-07",
    title: "Votre chiffre d'affaires ne compte plus les impôts de vos clients",
    changes: [
      "Les rapports financiers distinguent désormais deux montants : le chiffre d'affaires du cabinet, c'est-à-dire vos seuls honoraires, et les débours — les impôts (IGS, Patente, TDL, PSL…) que vous refacturez après les avoir réglés pour le compte du client.",
      "Jusqu'ici, tout était additionné. Sur les factures déjà émises, l'écart est d'un facteur cinq : 2 194 739 F CFA facturés, dont 1 752 739 d'impôts et seulement 442 000 d'honoraires. Les rapports « Chiffre d'affaires » et « Bilan financier » édités avant aujourd'hui portaient donc un montant très surestimé.",
      "Le rapport d'évolution mensuelle sépare lui aussi les trois colonnes : honoraires, débours, total facturé.",
      "Ce que le client doit ne change pas : il reste redevable du total, impôts compris. Le suivi des créances et le taux de recouvrement sont donc inchangés.",
      "La ventilation est calculée automatiquement à partir des lignes de chaque facture et de chaque devis, et se met à jour dès qu'une ligne est ajoutée, modifiée ou retirée.",
    ],
  },
  {
    version: "1.7.0",
    date: "2026-08-07",
    title: "Vos pièces sont protégées, et tout ce qui change est désormais tracé",
    changes: [
      "Paramètres → Journal : nouvel onglet qui consigne chaque création, modification et suppression sur vos données — avec le détail des champs touchés, leur valeur avant et après. Filtrable par donnée, par type d'opération et par date. Le journal est en lecture seule : il ne peut être ni corrigé ni effacé depuis l'application. Il démarre au 7 août 2026 et ne contient rien d'antérieur.",
      "Une facture qui a été émise ne peut plus être supprimée : elle s'annule, ce qui en conserve la trace. Jusqu'ici, seule une facture à la fois envoyée ET intégralement payée était protégée — une facture partiellement réglée pouvait disparaître, et ses paiements avec elle.",
      "Un règlement encaissé ne s'efface plus avec la facture qui l'a motivé.",
      "Supprimer définitivement un client n'emporte plus ses devis, propositions, pièces administratives, obligations fiscales et employés. La suppression est refusée tant qu'un de ces éléments subsiste ; la corbeille reste la voie normale.",
      "Gestion documentaire réparée : les pièces déposées dans le dossier d'un client restaient consultables une heure, puis le bouton « Voir » ouvrait un lien mort. Le document est maintenant accessible sans limite de temps.",
      "Remplacer le fichier d'un document supprime l'ancien au lieu de le laisser traîner, inaccessible, dans l'espace de stockage.",
    ],
  },
  {
    version: "1.6.0",
    date: "2026-08-06",
    title: "La configuration du cabinet suit désormais tous vos appareils",
    changes: [
      "Paramètres → Cabinet : l'identité du cabinet (téléphone, NIU, siège, signataire, signature, cachet, coordonnées de paiement) est enregistrée dans la base et non plus dans le navigateur. Vous la saisissez une fois, elle s'applique partout — ordinateur, téléphone, autre navigateur.",
      "Jusqu'ici, chaque navigateur gardait sa propre copie : une facture émise depuis le téléphone pouvait porter un pied de page différent de la même facture émise depuis l'ordinateur, et toute correction devait être ressaisie sur chaque appareil.",
      "Votre configuration existante est reprise automatiquement au premier chargement, signature et cachet compris. Rien n'est à ressaisir.",
      "Coordonnées du cabinet actualisées : téléphone (237) 694 310 554 / 676 277 662 / 656 752 475, e-mail prismagestionsarl@gmail.com, numéros de paiement 694 31 05 54 / 676 27 76 62 / 656 75 24 75.",
      "Si l'enregistrement échoue — connexion coupée, session expirée — un message le signale désormais au lieu d'afficher une confirmation trompeuse.",
    ],
  },
  {
    version: "1.5.1",
    date: "2026-08-05",
    title: "Un seul et même document pour la facture, le devis et le reçu",
    changes: [
      "La facture reprend la présentation exacte de l'application locale : colonne « Quantité », montants de ligne sans unité, espacements aérés, et plus de bandeau récapitulatif au-dessus du tableau. Le PDF téléchargé depuis le web est désormais identique à celui généré localement.",
      "Devis : le PDF n'est plus agrandi et ne comporte plus de seconde page vide. Le document est mis en page à la même largeur que celui de l'application locale.",
      "Reçu : à l'impression, le titre « REÇU DE PAIEMENT » restait sombre sur le bandeau bleu, au point d'être illisible, et le bandeau débordait à droite. Les deux sont corrigés, quelle que soit la façon d'imprimer.",
      "Situation clients → onglet Factures : l'aperçu affiche désormais la facture complète — en-tête du cabinet, numéro, destinataire, détail des prestations, sous-totaux Impôts et Honoraires, informations de paiement, cachet et signature — au lieu du résumé simplifié qui s'affichait jusqu'ici.",
      "Situation clients → onglet Factures : les deux boutons d'aperçu qui coexistaient sur chaque ligne sont fusionnés en un seul.",
      "Paiements et Situation clients → onglet Paiements : « Voir le reçu » ouvre directement le reçu officiel ; le bouton « Aperçu fidèle », qui faisait doublon, disparaît.",
      "Devis : la ligne « Contact » n'apparaît plus que si un contact principal est renseigné, comme sur la facture — le nom du client ne s'y répète plus inutilement.",
    ],
  },
  {
    version: "1.5.0",
    date: "2026-07-16",
    title: "Application plus rapide sur mobile",
    changes: [
      "Premier chargement deux fois plus léger : les modules de génération PDF et de graphiques ne sont plus téléchargés qu'au moment où ils servent (aperçu/téléchargement PDF, rapports, graphique de situation clients).",
      "Page Facturation : chaque onglet (Devis, Factures, Propositions, Paiements, Situation clients) se charge à la demande — l'ouverture de la page est quasi instantanée.",
      "La police de caractères ne bloque plus l'affichage initial et une police de secours propre s'affiche si le réseau est lent.",
      "Clients sur mobile : la liste défile désormais naturellement avec la page (plus de double zone de défilement ni de bas de liste masqué).",
      "Divers correctifs d'affichage mobile : fenêtres de dialogue ajustées à la hauteur réelle de l'écran, disparition du bref affichage « bureau » au chargement des pages.",
    ],
  },
  {
    version: "1.4.0",
    date: "2026-07-16",
    title: "Nouvelle page Outils : calculateur IGS",
    changes: [
      "Nouvelle entrée « Outils » dans le menu (avant « Clients ») : reprise de l'outil pratique du site vitrine PRISMA GESTION, limitée à la partie IGS.",
      "Calculateur d'Impôt Général Synthétique : saisie du chiffre d'affaires annuel, option membre CGA (réduction de 50 %), affichage de la classe, de la fourchette, de l'IGS, de la TDL et du total à payer.",
      "Présentation détaillée du régime IGS : fondement juridique, contribuables concernés, barèmes officiel et réduit CGA, déclaration, paiement trimestriel et sanctions.",
    ],
  },
  {
    version: "1.3.2",
    date: "2026-07-06",
    title: "Fiche client enrichie et montants PDF corrigés",
    changes: [
      "Fiche client (PDF) : les montants s'affichent désormais correctement (« 10 000 000 F CFA » au lieu de « 10/000/000 F CFA »). Le correctif s'applique à tous les PDF : factures, reçus et rapports.",
      "Fiche client (PDF) : nouvelle section « Situation fiscale calculée » (chiffre d'affaires, IGS et sa classe, Patente, TDL, Solde IR/IS, Licence, PSL, Bail, TPF et total des obligations).",
      "Fiche client (PDF) : la situation immobilière affiche le loyer annuel et les impôts calculés du bien (PSL, Bail, TPF).",
      "Fiche client (PDF) : nouveau tableau « Agences / Établissements » avec localisation, statut immobilier, chiffre d'affaires et impôts immobiliers calculés par bien.",
      "Fiche client (PDF) : les sections sans données ne sont plus imprimées et les titres ne débordent plus en bas de page.",
    ],
  },
  {
    version: "1.3.1",
    date: "2026-07-06",
    title: "Import complet des sauvegardes de l'application locale",
    changes: [
      "Paramètres → Application : l'import d'une sauvegarde locale transfère désormais aussi les clients de la corbeille (restaurables depuis la page Clients) ainsi que leurs devis et courriers.",
      "Import : les factures et devis déjà présents mais sans détail de prestations (import antérieur incomplet) sont automatiquement complétés avec leurs lignes détaillées — plus seulement les totaux.",
      "Import : deux documents portant le même numéro dans la sauvegarde (collision de numérotation de l'application locale) sont tous deux importés, le second sous un numéro suffixé, au lieu que l'un soit perdu.",
      "Le récapitulatif avant import signale les données sans équivalent web (situation fiscale de la page Gestion locale, configuration du cabinet).",
    ],
  },
  {
    version: "1.3.0",
    date: "2026-07-05",
    title: "Gestion documentaire, navigation mobile et échanges de données",
    changes: [
      "Gestion → onglet Dossier : checklist documentaire adaptée au profil fiscal du client (attestations, Patente, IGS annuel ou trimestriel, impôts immobiliers, documents juridiques), avec statuts Fourni/Manquant/Expiré, barre de progression, téléversement, consultation et téléchargement des pièces.",
      "Gestion → onglet Dossier : journal des interactions avec le client (horodaté) et récapitulatif des informations clés du dossier.",
      "Sur mobile : barre de navigation en bas d'écran (Accueil, Clients, Gestion, Missions + menu « Plus ») et affichage en cartes des tableaux de la Facturation.",
      "Clients : nom commercial pour les entreprises, gestion des agences (établissements secondaires avec leur propre situation immobilière) et champ « Nom du contact principal ».",
      "Clients : import/export « PRISMA-CLIENTS » avec l'application vanilla — fiches clients et historique complet (factures, devis, reçus, propositions, courriers), rapprochement automatique par NIU puis par nom.",
      "Paramètres → Application : sauvegarde compatible téléchargeable et import d'un fichier de sauvegarde ou d'export vanilla, avec rapport détaillé.",
      "Facturation : prestations « Obtention ACF » et « Obtention ATTIM » classées en impôts, avec boutons d'ajout rapide dans les devis et factures.",
      "Import/export CSV, JSON et TXT pour les collaborateurs, les missions, le planning et le courrier.",
    ],
  },
  {
    version: "1.2.0",
    date: "2026-06-04",
    title: "Création de mission opérationnelle",
    changes: [
      "Le bouton « Nouvelle mission » crée désormais réellement une mission (titre, client, collaborateur, dates).",
      "Le formulaire charge les clients et collaborateurs réels et enregistre la mission ; le tableau de bord et le planning sont mis à jour automatiquement.",
    ],
  },
  {
    version: "1.1.0",
    date: "2026-06-04",
    title: "Documentation détaillée de tous les modules",
    changes: [
      "Enrichissement de chaque rubrique avec le fonctionnement détaillé, fidèle à l'application.",
      "Onglet Fiscal de la Gestion entièrement documenté (ACF, immatriculation, impôts directs, IGS, obligations annuelles, enregistrement automatique).",
      "Détail de la Facturation (devis, factures, propositions, paiements, situation clients) et du Courrier (modèles, publipostage, placeholders, historique).",
      "Ajout des règles de calcul fiscal et des conventions de numérotation des documents.",
    ],
  },
  {
    version: "1.0.0",
    date: "2026-06-04",
    title: "Lancement du module d'Aide",
    changes: [
      "Ajout du module Aide accessible depuis le menu latéral.",
      "Documentation complète du fonctionnement de chaque module de l'application.",
      "Mise en place d'une recherche dans l'aide et d'un journal des nouveautés.",
    ],
  },
];

/**
 * Rubriques d'aide. Chaque rubrique décrit un module de l'application.
 * L'ordre suit le parcours naturel de l'utilisateur.
 */
export const aideSections: AideSection[] = [
  {
    id: "demarrage",
    title: "Premiers pas",
    icon: "Rocket",
    description: "Comprendre l'organisation générale de PRISMA GESTION.",
    articles: [
      {
        question: "À quoi sert PRISMA GESTION ?",
        answer:
          "PRISMA GESTION est l'outil de gestion du cabinet : il centralise les clients, leurs obligations fiscales, la facturation, le courrier, les missions et le planning des collaborateurs. L'objectif est de disposer d'une vue unique et fiable sur l'ensemble de l'activité du cabinet.",
      },
      {
        question: "Comment se connecter ?",
        answer:
          "L'accès se fait via la page de connexion avec votre adresse e-mail et votre mot de passe. Toutes les pages sont protégées : sans session active, vous êtes automatiquement redirigé vers l'écran de connexion. Pour vous déconnecter, utilisez le bouton situé en bas du menu latéral.",
      },
      {
        question: "Comment naviguer dans l'application ?",
        answer:
          "Le menu latéral gauche donne accès à tous les modules : Dashboard, Clients, Gestion, Mission, Planning, Facturation, Courrier, Rapports, Paramètres et Aide. Le menu peut être réduit sur ordinateur pour gagner de la place. Sur mobile, une barre de navigation fixe en bas d'écran donne un accès direct à l'Accueil, aux Clients, à la Gestion et aux Missions ; le bouton « Plus » ouvre le menu complet (filtré selon votre rôle) avec la déconnexion.",
      },
      {
        question: "Qu'est-ce que l'exercice comptable et le mode lecture seule ?",
        answer:
          "Plusieurs modules (Gestion, Missions…) affichent un sélecteur d'exercice (année). Lorsqu'un exercice a été clôturé depuis les Paramètres, ses données passent en lecture seule : une bannière vous le signale et la saisie est bloquée pour préserver l'historique. Sélectionnez l'exercice en cours pour reprendre la saisie.",
      },
      {
        question: "Certains menus n'apparaissent pas, pourquoi ?",
        answer:
          "L'affichage dépend de votre rôle. Les modules sensibles (Collaborateurs, Facturation, Paramètres) sont réservés aux administrateurs. Si une rubrique vous manque, contactez l'administrateur du cabinet pour vérifier vos droits.",
      },
    ],
  },
  {
    id: "dashboard",
    title: "Tableau de bord",
    icon: "LayoutDashboard",
    route: "/",
    description: "Vue d'ensemble : indicateurs clés, alertes fiscales et tâches.",
    articles: [
      {
        question: "Que montre le tableau de bord ?",
        answer:
          "Il s'organise en trois blocs : un en-tête (avec création rapide de tâche et génération des échéances fiscales), des statistiques rapides (cartes chiffrées) et un accordéon d'alertes fiscales repliable. C'est le point de départ recommandé chaque matin.",
      },
      {
        question: "Comment générer les tâches d'échéances fiscales ?",
        answer:
          "Le bouton « Échéances fiscales », en haut du tableau de bord, confronte chaque client actif au calendrier fiscal et propose de créer les tâches correspondantes.\n\nCe qui est pris en compte : l'IGS et le précompte sur loyer (quatre acomptes trimestriels aux 15 février, mai, août et novembre — ou un versement unique au 15 juin si le client est en paiement annuel pour l'IGS), la Patente au 28 février, la DSF au 15 mars, la DARP et la DBEF au 30 juin. L'assujettissement découle du régime fiscal, du type de client et de sa situation immobilière, exactement comme dans l'onglet fiscal.\n\nVous choisissez l'exercice et le collaborateur à qui affecter les tâches, puis vous voyez la liste précise de ce qui va être créé, répartie en trois groupes : « À traiter » (échéance dans les 30 jours), « Plus tard dans l'année », et « Déjà passées » pour un rattrapage. Seul le premier groupe est coché par défaut. Rien n'est créé tant que vous n'avez pas validé.\n\nChaque tâche s'ouvre 30 jours avant la date légale et se termine à l'échéance. Relancer la génération ne crée jamais de doublon : une échéance déjà transformée en tâche n'est plus proposée.\n\nÀ noter : le précompte sur loyer en paiement annuel n'est pas généré, aucune date légale de référence n'étant documentée pour ce cas.",
      },
      {
        question: "Que contiennent les statistiques rapides ?",
        answer:
          "Des cartes chiffrées et cliquables : obligations non régularisées (DARP non déposées, IGS impayés, situation non conforme), clients en gestion, DSF non déposées, patentes impayées, ainsi que l'activité (clients gérés, missions/tâches en cours). Un badge « À régulariser » apparaît dès qu'un compteur est positif ; cliquer sur une carte ouvre le détail.",
      },
      {
        question: "Quelles alertes fiscales sont suivies ?",
        answer:
          "L'accordéon regroupe : IGS non payé, Attestations de Conformité Fiscale (ACF) qui expirent, Patentes non payées, Impôts immobiliers (Bail, PSL, Taxe Foncière), DSF non déposées et DBEF non déposées (personnes morales). Chaque alerte ouvre la liste des clients concernés, avec un bouton « Gérer » qui mène directement à leur onglet fiscal dans le module Gestion.",
      },
      {
        question: "Les données sont-elles à jour ?",
        answer:
          "Le tableau de bord se rafraîchit automatiquement (environ toutes les 2 minutes) et réagit aux changements en temps réel. L'heure de dernière actualisation est affichée en haut ; cliquer dessus force un rafraîchissement immédiat.",
      },
      {
        question: "Comment créer une tâche rapidement ?",
        answer:
          "Le bouton « Nouvelle tâche » dans l'en-tête ouvre un formulaire (client, collaborateur, description). Les tâches créées se retrouvent ensuite dans le module Mission et dans le Planning.",
      },
    ],
  },
  {
    id: "outils",
    title: "Outils",
    icon: "Calculator",
    route: "/outils",
    description: "Calculateur d'Impôt Général Synthétique (IGS) et présentation du régime.",
    articles: [
      {
        question: "À quoi sert la page Outils ?",
        answer:
          "Elle reprend l'outil pratique du site vitrine PRISMA GESTION, limité à la partie IGS : un calculateur d'Impôt Général Synthétique et une présentation détaillée du régime (fondement juridique, contribuables concernés, barème officiel, déclaration, paiement et sanctions).",
      },
      {
        question: "Comment utiliser le calculateur IGS ?",
        answer:
          "Saisissez le chiffre d'affaires annuel hors taxes, cochez éventuellement « Membre d'un centre de gestion agréé (CGA) » (réduction de 50 % de l'IGS), puis cliquez sur « Calculer l'IGS ». Le résultat affiche la classe (1 à 10), la fourchette de chiffre d'affaires, le montant de l'IGS, la TDL (calculée sur l'IGS principal, avant réduction CGA) et le total à payer. Au-delà de 50 000 000 F CFA, le régime de l'IGS ne s'applique plus et un message vous renvoie vers le régime du réel.",
      },
      {
        question: "D'où viennent les barèmes affichés ?",
        answer:
          "Le calculateur et les tableaux de la page utilisent le même barème officiel (article C 40 de la loi n° 2024/020) que les calculs fiscaux des fiches clients : c'est la même source de vérité dans toute l'application.",
      },
    ],
  },
  {
    id: "clients",
    title: "Clients",
    icon: "Users",
    route: "/clients",
    description: "Création, suivi et calcul fiscal automatique des clients.",
    articles: [
      {
        question: "Comment est organisée la page Clients ?",
        answer:
          "Elle présente un en-tête (« Ajouter un client », « Corbeille »), une barre de filtres et la liste des clients (tableau sur ordinateur, cartes sur mobile). Chaque ligne affiche le type, le nom/raison sociale, le NIU, le centre des impôts, la ville et des badges fiscaux et immobiliers calculés automatiquement.",
      },
      {
        question: "Comment ajouter ou modifier un client ?",
        answer:
          "Via « Ajouter un client » (ou l'action « Modifier » d'une ligne). Le formulaire est organisé en sections : type (physique/morale), identité, informations professionnelles, situation fiscale, adresse et contact. Le nom commercial peut être renseigné pour les deux types de clients ; pour une personne morale s'ajoutent le capital social et les actionnaires. Les informations professionnelles comprennent aussi le nom du contact principal et la liste des agences : le siège est créé automatiquement à partir de l'adresse, et chaque établissement secondaire porte sa propre situation immobilière (loyer ou valeur du bien) prise en compte dans les calculs de PSL, Bail et Taxe Foncière. Le type ne peut plus être changé après la création.",
      },
      {
        question: "Quelles informations fiscales saisir, et que calcule l'application ?",
        answer:
          "Vous renseignez le NIU, le centre de rattachement, le régime fiscal (IGS, Réel, Non Professionnel, OBNL), le chiffre d'affaires, l'adhésion à un CGA et l'éventuelle licence de boissons. À partir de ces données, l'application calcule et affiche en temps réel l'IGS (avec sa classe), la Patente, la TDL, le Solde IR/IS, la Licence, le PSL, le Bail et la Taxe Foncière, ainsi que le total des obligations.",
      },
      {
        question: "Quelle différence entre personne physique et personne morale ?",
        answer:
          "La personne physique se saisit avec nom/prénoms, sexe et état civil ; la personne morale avec raison sociale, forme juridique, dirigeant, capital et actionnaires. Le type influence aussi la fiscalité : le solde d'impôt s'intitule « Solde IS » pour une personne morale et « Solde IR » pour une personne physique. Côté déclarations annuelles, la DARP ne concerne que les personnes physiques et la DBEF que les personnes morales.",
      },
      {
        question: "Comment filtrer ou rechercher un client ?",
        answer:
          "La barre de filtres permet de rechercher par nom et de filtrer par type, régime fiscal, centre des impôts et statut (actif/inactif). Une case « Afficher les clients archivés » permet d'inclure les fiches archivées.",
      },
      {
        question: "Peut-on importer ou exporter des clients ?",
        answer:
          "Oui. L'import accepte les fichiers CSV, JSON ou texte (un modèle est téléchargeable, avec validation ligne par ligne et aperçu avant import), ainsi que les fichiers « PRISMA-CLIENTS » exportés depuis l'application vanilla : ceux-ci sont détectés automatiquement, les clients sont rapprochés par NIU (puis par nom) pour éviter les doublons, et tout l'historique (factures, devis, reçus, propositions, courriers) est importé. En cas de problème, un rapport d'erreurs détaillé et copiable s'affiche. L'export est disponible en CSV, Excel ou JSON, dans un fichier daté, avec deux formats supplémentaires : « Export PRISMA (fiches clients) » et « Export PRISMA + historique », réimportables dans l'application vanilla.",
      },
      {
        question: "Comment fonctionnent l'archivage et la corbeille ?",
        answer:
          "Plutôt que de supprimer, vous pouvez « Archiver » un client : il est conservé mais retiré des listes actives. La « Corbeille » liste les clients archivés et permet de les restaurer ou de les supprimer définitivement (avec confirmation).",
      },
    ],
  },
  {
    id: "gestion",
    title: "Gestion",
    icon: "FolderOpen",
    route: "/gestion",
    description: "Dossier du client en gestion : fiscal, comptable, contrats, clôture, documents.",
    articles: [
      {
        question: "À quoi sert le module Gestion ?",
        answer:
          "Il centralise le suivi du dossier d'un client pris en gestion par le cabinet. Seuls les clients dont la gestion est externalisée y apparaissent. Vous choisissez un exercice (année) puis un client ; sa sélection est mémorisée pour vos prochaines visites.",
      },
      {
        question: "Quels sont les onglets du dossier ?",
        answer:
          "Cinq onglets : Fiscal (obligations fiscales, ouvert par défaut), Comptable, Contrats (contrats et prestations), Clôture (clôture d'exercice / montage DSF) et Dossier (gestion documentaire, interactions et informations clés).",
      },
      {
        question: "Onglet Dossier — checklist documentaire",
        answer:
          "La checklist liste les pièces attendues au dossier, générée automatiquement selon le profil du client : attestations d'immatriculation et de conformité fiscale (toujours), avis/reçu/quittance de Patente (régime Réel), avis et justificatifs de paiement IGS — annuels ou par trimestre T1 à T4 selon le mode de paiement (régime IGS) —, Taxe foncière (propriétaire), contrat de bail et Précompte sur loyer (locataire), puis les documents juridiques (RCCM, statuts, plan de localisation pour les SARL/SA) ou la carte d'identité (personne physique). Chaque pièce porte un statut (Fourni, Manquant, Expiré) que vous mettez à jour via un sélecteur, et une barre de progression indique le nombre de documents fournis.",
      },
      {
        question: "Onglet Dossier — téléverser, consulter et télécharger une pièce",
        answer:
          "Pour chaque document de la checklist, le bouton « Parcourir » permet de choisir un fichier puis « Uploader » l'enregistre (le statut passe automatiquement à « Fourni »). Une fois la pièce enregistrée, deux boutons apparaissent : l'œil ouvre le document dans un nouvel onglet pour le consulter, et la flèche verte le télécharge sur votre appareil sous son nom de checklist. Les deux attestations — immatriculation et conformité fiscale — se rangent indifféremment d'ici ou depuis l'onglet Fiscal : c'est le même document, et il n'en existe qu'un exemplaire.",
      },
      {
        question: "Onglet Dossier — interactions et historique",
        answer:
          "L'onglet « Interactions » tient un journal horodaté des échanges avec le client : saisissez une description puis « Ajouter » ; les interactions s'affichent de la plus récente à la plus ancienne sur une frise chronologique. L'onglet « Historique » récapitule la date de création de la fiche, le statut du client et ses informations clés (NIU, centre de rattachement, secteur d'activité, régime fiscal, type, gestion externalisée).",
      },
      {
        question: "Onglet Fiscal — comment s'organise-t-il ?",
        answer:
          "De haut en bas : sélecteur d'année fiscale, alerte de modifications non enregistrées, Attestation de Conformité Fiscale, Attestation d'Immatriculation, Impôts directs, Obligations annuelles, puis le bouton d'enregistrement. Les modifications sont sauvegardées automatiquement environ 3 secondes après votre dernière action ; un enregistrement manuel reste possible.",
      },
      {
        question: "Onglet Fiscal — Attestation de Conformité Fiscale (ACF)",
        answer:
          "Vous saisissez la date de création ; la date de fin de validité est calculée automatiquement (90 jours). Le champ change de couleur selon l'échéance (rouge si expirée, orange si elle expire sous 4 jours, vert sinon) et un message invite au renouvellement si besoin. Sous les dates, « Ajouter la pièce » enregistre l'attestation scannée ; une fois en place, elle se consulte, se télécharge et se remplace. Trois interrupteurs pilotent la remontée d'alertes : « Situation fiscale conforme », « Afficher dans les alertes d'expiration » et « Masquer du tableau de bord ».",
      },
      {
        question: "Onglet Fiscal — Attestation d'Immatriculation",
        answer:
          "Sa validité est de 30 jours : à partir de la date de délivrance, la date d'expiration est calculée automatiquement. Un badge indique le statut (« Expirée » ou nombre de jours restants), avec un code couleur (rouge si expirée, orange à 7 jours ou moins, vert au-delà). Comme pour l'ACF, l'attestation scannée s'ajoute sous les dates, puis se consulte, se télécharge et se remplace.",
      },
      {
        question: "Onglet Fiscal — Impôts directs et calcul de l'IGS",
        answer:
          "La section liste l'IGS (toujours affiché), la Patente, le Bail Commercial, le Précompte sur Loyer (PSL) et la Taxe Foncière (TPF) ; hormis l'IGS, un impôt n'apparaît que si le client y est assujetti. Pour l'IGS, vous saisissez le chiffre d'affaires et l'adhésion CGA : le montant est calculé selon un barème par classes, réduit de 50 % pour les adhérents CGA, et passe « Hors barème » au-delà de 50 000 000 F CFA. Un échéancier trimestriel (T1 à T4) enregistre le montant et la date de chaque paiement ; l'acompte théorique par trimestre vaut 25 % du montant annuel, et l'application suit le total payé et le solde restant.",
      },
      {
        question: "Onglet Fiscal — Obligations annuelles (DSF, DARP, DBEF)",
        answer:
          "On y suit la DSF (toujours présente), la DARP (personnes physiques uniquement) et la DBEF (personnes morales uniquement). Pour chacune : assujetti ou non, déposé ou non avec date de dépôt, observations et pièces jointes (justificatifs rangés par client et par année). Un bouton « Actions groupées » permet de tout marquer assujetti / non assujetti / traité en une fois.",
      },
      {
        question: "Comment sont calculés les principaux impôts ?",
        answer:
          "Les règles sont centralisées : la Patente vaut 0,283 % du CA (plancher 141 500, plafond 4 500 000 F CFA) ; le Solde IR/IS vaut 0,1 % du CA au-delà de 15 M F CFA ; le Bail est à 5 % pour les clients OBNL/Non Professionnels (10 % sinon), qui sont par ailleurs exonérés de PSL. Les échéances trimestrielles de l'IGS sont fixées au 15 février, 15 mai, 15 août et 15 novembre.",
      },
    ],
  },
  {
    id: "facturation",
    title: "Facturation",
    icon: "Receipt",
    route: "/facturation",
    description: "Devis, factures, propositions, paiements et situation clients.",
    articles: [
      {
        question: "Comment est organisé le module Facturation ?",
        answer:
          "Il comporte cinq onglets : Devis, Factures, Propositions (de paiement), Paiements et Situation clients. L'accès est réservé aux administrateurs. Sur mobile, les tableaux s'affichent sous forme de cartes adaptées à l'écran.",
      },
      {
        question: "Comment créer un devis ?",
        answer:
          "Onglet Devis → « Nouveau devis » : vous choisissez le client, les dates (la validité est proposée à +30 jours), l'objet et les lignes de prestations (chaque ligne est de type « impôt » ou « honoraire »). Des boutons rapides injectent automatiquement l'IGS, la Patente, le PSL, la TDL selon le régime du client, l'obtention d'ACF et d'ATTIM (classées en impôts, via « + ACF » et « + ATTIM »), ainsi que des honoraires prédéfinis. Un devis peut ensuite être converti en facture.",
      },
      {
        question: "Comment créer une facture ?",
        answer:
          "Onglet Factures → « Nouvelle facture » : client, date de facturation, date d'échéance, statut, mode de paiement et lignes de prestations (mêmes boutons rapides que les devis). La liste est filtrable par numéro/client, statut du document (brouillon, envoyée, annulée) et statut de paiement (non payée, partiellement payée, payée, en retard). Les montants sont ventilés entre impôts et honoraires.",
      },
      {
        question: "À quoi servent les propositions de paiement ?",
        answer:
          "Une proposition ventile un impôt annuel sur une période : chaque ligne indique une base annuelle et la fraction exigible (par exemple un IGS annuel réparti par trimestre). Elle peut être rattachée à un devis ou une facture, et suit les statuts brouillon, envoyée, acceptée.",
      },
      {
        question: "Comment enregistrer un paiement et générer un reçu ?",
        answer:
          "Onglet Paiements → « Nouveau paiement » : client, facture concernée (ou crédit/avance sans facture), date, montant, mode (espèces, virement, Orange Money, MTN Money) et type (total ou partiel, avec ventilation par prestation). Un reçu est généré automatiquement, avec le montant en chiffres et en toutes lettres, imprimable et exportable en PDF.",
      },
      {
        question: "Que montre l'onglet Situation clients ?",
        answer:
          "Une vue consolidée par client (dettes et règlements), avec un graphique et un état des échéances fiscales. Depuis le détail d'un client, vous pouvez appliquer un crédit (avance) à une facture impayée ou déclencher un rappel.",
      },
      {
        question: "Comment sont numérotés les documents ?",
        answer:
          "Chaque type suit un format dédié : Facture « N° NNNN/AAAA/MM », Devis « DEVIS-NNNN/AAAA/MM », Proposition « PROP-NNNN/AAAA/MM » et Reçu « RECU-NNNN/AAAA ». La numérotation est attribuée automatiquement.",
      },
      {
        question: "Pourquoi un document conserve-t-il les anciennes infos d'un client ?",
        answer:
          "C'est volontaire : à l'émission, chaque document fige une copie des informations du client (snapshot). Un document déjà émis n'est donc jamais altéré par une modification ultérieure de la fiche client, ce qui garantit sa valeur juridique. L'impression et l'export PDF utilisent la signature, le cachet et les coordonnées définis dans les Paramètres.",
      },
    ],
  },
  {
    id: "courrier",
    title: "Courrier",
    icon: "Mail",
    route: "/courrier",
    description: "Rédaction de courriers à partir de modèles, en individuel ou en masse.",
    articles: [
      {
        question: "Comment est organisé le module Courrier ?",
        answer:
          "Deux onglets : Rédaction (sélection du modèle, des clients et envoi) et Historique (archive des courriers générés avec leurs statuts).",
      },
      {
        question: "Comment rédiger un courrier ?",
        answer:
          "Dans l'onglet Rédaction : choisissez le mode (individuel ou en masse), sélectionnez le ou les clients, puis un modèle. Une vingtaine de modèles sont répartis par catégories (fiscal/DGI, relances, client, administratif). Vous pouvez ajouter un message personnalisé, choisir le mode d'envoi (remise en main propre, courrier postal, email, fax), prévisualiser, puis « Générer & Enregistrer ».",
      },
      {
        question: "Comment fonctionne l'envoi en masse (publipostage) ?",
        answer:
          "En mode « masse », vous appliquez des critères (type, régime fiscal, secteur, centre de rattachement) pour cibler automatiquement un ensemble de clients. La génération produit alors un courrier par client sélectionné, chacun avec son propre numéro et ses données substituées.",
      },
      {
        question: "Comment les informations du client sont-elles insérées ?",
        answer:
          "Les modèles contiennent des champs dynamiques remplacés automatiquement à la génération : {CLIENT_NOM}, {CLIENT_NIU}, {CLIENT_VILLE}, {CLIENT_QUARTIER}, {CLIENT_CONTACT} et {CIVILITE} (toujours « Madame » ou « Monsieur »). Certains modèles (transmission de devis, rappel des délais, proposition d'avance…) injectent en plus les chiffres fiscaux réels du client, comme la classe et le montant d'IGS ou la Patente.",
      },
      {
        question: "Où retrouver les courriers déjà générés ?",
        answer:
          "Dans l'onglet Historique : chaque courrier porte un numéro au format « CRR-NNNN/AAAA/MM » et un statut (brouillon, envoyé, accusé de réception, classé). Vous pouvez le consulter, l'imprimer, faire évoluer son statut ou le supprimer. Des boutons « Importer » et « Exporter » (CSV, JSON, TXT) permettent aussi d'échanger l'historique des courriers.",
      },
    ],
  },
  {
    id: "missions",
    title: "Missions",
    icon: "Briefcase",
    route: "/missions",
    description: "Suivi des missions et tâches confiées au cabinet.",
    articles: [
      {
        question: "À quoi sert le module Mission ?",
        answer:
          "Il liste les missions et tâches du cabinet sous forme de cartes (paginées), chacune rattachée à un client et à un collaborateur, avec ses dates et son statut. Comme les autres modules, il suit l'exercice comptable sélectionné.",
      },
      {
        question: "Comment créer une mission ?",
        answer:
          "Cliquez sur « Nouvelle mission » en haut du module : renseignez le titre, choisissez éventuellement un client, assignez un collaborateur (parmi les collaborateurs actifs) et fixez les dates de début et de fin. À l'enregistrement, la mission apparaît dans la liste, alimente le planning et remonte dans le tableau de bord ; son statut initial (en attente ou en cours) est déduit de la date de début.",
      },
      {
        question: "Comment suivre l'avancement d'une mission ?",
        answer:
          "Chaque mission affiche un statut coloré : planifiée, en attente, en cours, en retard ou terminée. Depuis la carte, un menu « Statut » permet de la faire évoluer. Les missions terminées depuis plus de 30 jours sont masquées des listes courantes pour rester lisible.",
      },
      {
        question: "Pourquoi le menu « Statut » ne propose-t-il pas « en retard » ?",
        answer:
          "Parce que « en retard » et « planifiée » ne se décident pas : ils se déduisent des dates. Une mission est en retard dès le lendemain de sa date de fin tant qu'elle n'est pas terminée, et planifiée tant que sa date de début n'est pas atteinte. Vous ne choisissez donc que trois statuts — en attente, en cours, terminée — et l'affichage se charge du reste, en tenant compte du jour où vous le consultez.",
      },
      {
        question: "Comment filtrer les missions ?",
        answer:
          "Une recherche libre (par titre, client ou collaborateur) et un filtre par statut sont disponibles. Les missions sont triées par priorité d'état (en cours, en attente, en retard, puis terminées).",
      },
      {
        question: "Peut-on importer ou exporter les missions ?",
        answer:
          "Oui. Des boutons « Importer » et « Exporter » sont disponibles en haut du module : l'export produit un fichier CSV, JSON ou TXT ; l'import accepte les mêmes formats, avec un modèle téléchargeable, un aperçu de validation avant enregistrement et un résumé du résultat. Les références sont résolues automatiquement (collaborateur par nom ou email, client par nom ou raison sociale).",
      },
      {
        question: "Quels documents peut-on rattacher à une mission ?",
        answer:
          "Chaque carte propose de générer un « Ordre de mission » et de téléverser un « Rapport de mission ». La suppression d'une mission est irréversible et supprime ses documents associés (une confirmation est demandée).",
      },
      {
        question: "L'affichage change-t-il sur téléphone ?",
        answer:
          "Oui. Sur téléphone, chaque mission occupe une fiche pleine largeur : le titre, le client et les dates s'affichent en clair, et les quatre actions (Ordre de mission, Rapport de mission, Statut, Supprimer) se rangent sur une ligne dédiée sous la mission, à une taille confortable pour le doigt. Sur ordinateur, la présentation en deux colonnes est conservée. Il en va de même pour la liste des tâches du tableau de bord, qui passe du tableau à des fiches.",
      },
      {
        question: "Quel lien avec le Planning et le Dashboard ?",
        answer:
          "Les tâches et missions alimentent le Planning des collaborateurs et remontent dans les indicateurs et alertes du tableau de bord.",
      },
    ],
  },
  {
    id: "planning",
    title: "Planning",
    icon: "Calendar",
    route: "/planning",
    description: "Vue calendrier des échéances et de la charge de l'équipe.",
    articles: [
      {
        question: "Comment lire le planning ?",
        answer:
          "La page combine un calendrier (à gauche) et la liste des événements du jour sélectionné (à droite). Les journées comportant des événements sont signalées par un point sous la date ; cliquez sur un jour pour afficher ses événements.",
      },
      {
        question: "Que contient un événement ?",
        answer:
          "Les événements proviennent des missions/tâches : ils affichent le titre, le client, le collaborateur, l'heure et un type (Mission ou Réunion). C'est une vue de consultation pour visualiser la charge et anticiper les échéances.",
      },
      {
        question: "Comment filtrer par collaborateur ou exporter ?",
        answer:
          "Un filtre permet de n'afficher que les événements d'un collaborateur (ou de tous). Les boutons « Importer » et « Exporter » au-dessus de la liste permettent d'échanger les événements aux formats CSV, JSON ou TXT (avec modèle téléchargeable et aperçu de validation à l'import).",
      },
    ],
  },
  {
    id: "collaborateurs",
    title: "Collaborateurs",
    icon: "UserCog",
    route: "/collaborateurs",
    description: "Gestion du personnel et des accès (réservé aux administrateurs).",
    articles: [
      {
        question: "Qui peut gérer les collaborateurs ?",
        answer:
          "Ce module est réservé aux administrateurs. Il liste le personnel (tableau sur ordinateur, cartes sur mobile) avec nom, poste, email, date d'entrée, statut et nombre de tâches en cours. Une recherche et des filtres (statut, poste) sont disponibles.",
      },
      {
        question: "Comment créer ou modifier un collaborateur ?",
        answer:
          "Via « Nouveau collaborateur » ou l'action « Modifier ». Le formulaire couvre les informations personnelles (nom, prénom, email, téléphone, date de naissance), professionnelles (rôle, niveau d'étude, date d'entrée), l'adresse et les permissions d'accès. Une fiche détaillée est accessible pour chaque collaborateur.",
      },
      {
        question: "Quels rôles existent et comment agissent-ils ?",
        answer:
          "Les rôles incluent notamment expert-comptable, comptable, gestionnaire, fiscaliste et assistant, ainsi qu'administrateur. Le rôle détermine les modules visibles et les actions autorisées : par exemple, seuls les administrateurs accèdent à la Facturation, aux Collaborateurs et aux Paramètres.",
      },
      {
        question: "Que compte exactement le « nombre de tâches en cours » ?",
        answer:
          "Les tâches commencées et non terminées de ce collaborateur, en retard comprises — une tâche en retard reste à faire. Les tâches encore planifiées, dont la date de début n'est pas atteinte, ne sont pas comptées. Ce nombre est recalculé à chaque affichage : il ne peut plus rester figé sur une valeur périmée, et il ne se modifie pas à la main.",
      },
      {
        question: "Comment gérer le statut d'un collaborateur ?",
        answer:
          "Depuis le menu d'actions, vous pouvez activer/désactiver un collaborateur, consulter son profil, le modifier ou le supprimer (action irréversible, avec confirmation).",
      },
      {
        question: "Peut-on importer ou exporter les collaborateurs ?",
        answer:
          "Oui. Les boutons « Importer » et « Exporter » en haut du module permettent d'échanger la liste aux formats CSV, JSON ou TXT, avec modèle d'import téléchargeable, aperçu de validation avant enregistrement et résumé du résultat.",
      },
    ],
  },
  {
    id: "rapports",
    title: "Rapports",
    icon: "FileText",
    route: "/rapports",
    description: "Génération de rapports d'analyse au format PDF.",
    articles: [
      {
        question: "Quels rapports puis-je générer ?",
        answer:
          "Le module propose une vingtaine de rapports répartis en familles : financiers (chiffre d'affaires, facturation, créances, état des devis, des propositions et des reçus), clients (portefeuille, nouveaux clients, activité, personnes morales/physiques, par centre d'impôt, assujettis IGS/Patente, régime du réel), fiscaux (obligations, retards), RH/paie (masse salariale, effectifs) et opérationnels (suivi des tâches, performance des collaborateurs).",
      },
      {
        question: "Comment trouver et générer un rapport ?",
        answer:
          "Utilisez la recherche (sur le titre et la description) et le filtre par type pour cibler le rapport voulu, puis cliquez sur « Générer ». Le document est produit au format PDF et téléchargé automatiquement ; un message vous informe du succès ou d'une éventuelle erreur.",
      },
    ],
  },
  {
    id: "parametres",
    title: "Paramètres",
    icon: "Settings",
    route: "/parametres",
    description: "Configuration du cabinet, des documents et des comptes.",
    articles: [
      {
        question: "Quels réglages trouve-t-on dans les Paramètres ?",
        answer:
          "Les Paramètres sont organisés en onglets : Profil, Cabinet (impressions), Clôture annuelle, Journal, Application, Sécurité, Notifications, et Utilisateurs (réservé aux administrateurs). La page n'est accessible qu'aux administrateurs.",
      },
      {
        question: "Onglet Journal — que puis-je y retrouver ?",
        answer:
          "Le journal consigne chaque création, modification et suppression portant sur les données du cabinet : clients, factures, paiements, devis, propositions, courriers, tâches, obligations fiscales, documents, personnel. Pour une modification, il indique précisément quels champs ont changé, avec leur valeur avant et après ; pour une création ou une suppression, il conserve la ligne concernée.\n\nTrois filtres permettent de s'y retrouver : la donnée (Clients, Factures…), le type d'opération (Création, Modification, Suppression) et une date de départ. Chaque ligne se déplie pour afficher le détail.\n\nDeux points à connaître. Le journal est en lecture seule : il ne peut être ni corrigé ni effacé depuis l'application, ce qui est précisément ce qui lui donne sa valeur de preuve en cas de litige ou de contrôle. Et il démarre au 7 août 2026 : il ne contient rien d'antérieur à sa mise en service.\n\nLorsque la colonne « auteur » indique « hors session applicative », l'écriture n'a pas été faite depuis la console mais directement en base — par une intervention technique, par exemple.",
      },
      {
        question: "Onglet Cabinet — que configure-t-on pour les documents ?",
        answer:
          "C'est l'onglet clé pour les impressions : identité du cabinet (nom, slogan, siège, téléphone, NIU), signataire (nom, fonction), images de signature et de cachet (téléversées), mention de pied de page, et coordonnées de paiement par défaut. Ces éléments alimentent automatiquement tous les documents imprimés (factures, devis, reçus, courriers).",
      },
      {
        question: "Onglet Clôture annuelle — à quoi sert-il ?",
        answer:
          "Il permet d'arrêter un exercice comptable. La clôture a deux effets.\n\nD'abord un verrouillage réel : les factures, paiements, devis, propositions, courriers et obligations fiscales de l'exercice clos ne peuvent plus être modifiés, supprimés, ni créés. Le verrou est posé dans la base et s'applique quelle que soit la manière dont la donnée est touchée. Les tâches et le planning restent libres — ce ne sont pas des pièces comptables.\n\nEnsuite un effet d'affichage : les éléments de l'exercice cessent de s'afficher par défaut, seul l'exercice en cours restant visible. Ils demeurent consultables via le sélecteur « Exercice » présent sur chaque page.\n\nUn « point de clôture » détaillé est imprimé au moment de la clôture, et peut être réimprimé depuis l'historique.\n\nPour intervenir sur un exercice clos — un client qui règle tardivement une facture, une écriture à corriger — rouvrez-le, faites la correction, puis reclôturez. La clôture et la réouverture sont toutes deux enregistrées dans le journal des modifications.\n\nDepuis le 7 août 2026, la clôture est enregistrée dans la base et non plus dans le navigateur : elle vaut pour tous vos appareils et survit au vidage du cache.",
      },
      {
        question: "Onglets Profil, Application, Sécurité et Notifications",
        answer:
          "Profil : vos informations personnelles. Application : préférences d'interface et de comportement (mode sombre, sauvegarde automatique, fréquence de rafraîchissement). Sécurité : changement de mot de passe (l'authentification à deux facteurs est prévue). Notifications : choix des canaux (email, application) et des types d'événements notifiés (factures, paiements, clients, rappels).",
      },
      {
        question: "Onglet Application — transfert de données et sauvegarde compatible",
        answer:
          "La section « Transfert de données » de l'onglet Application permet : de créer une sauvegarde compatible (fichier JSON daté contenant tous les clients et leur historique, la date de la dernière sauvegarde est rappelée) ; d'exporter les données au format « PRISMA-CLIENTS » réimportable dans l'application vanilla ; et d'importer un fichier de sauvegarde ou d'export vanilla. L'import transfère les clients (y compris ceux de la corbeille locale, restaurables ensuite depuis la page Clients) et l'historique complet : factures avec le détail de chaque prestation, devis et prestations, reçus/paiements, propositions et courriers. Si une facture ou un devis existe déjà mais sans son détail (import antérieur incomplet), les lignes de prestations sont complétées automatiquement. Après l'import, un rapport détaille le nombre de clients, factures, devis, reçus, propositions et courriers importés, ignorés ou complétés.",
      },
      {
        question: "Onglet Utilisateurs — gestion des comptes",
        answer:
          "Réservé aux administrateurs, il permet de créer des comptes utilisateurs, de leur attribuer un rôle (admin, comptable, gestionnaire, expert-comptable, fiscaliste, assistant) et de les modifier ou supprimer. Le rôle conditionne l'accès aux différents modules.",
      },
    ],
  },
  {
    id: "astuces",
    title: "Astuces & bonnes pratiques",
    icon: "Lightbulb",
    description: "Conseils pour tirer le meilleur parti de l'application.",
    articles: [
      {
        question: "Comment garder des données fiables ?",
        answer:
          "Renseignez soigneusement les fiches clients (type, NIU, régime, chiffre d'affaires, CGA) : tous les calculs fiscaux et les documents en dépendent. Consultez régulièrement les alertes du tableau de bord pour ne manquer aucune échéance.",
      },
      {
        question: "Mes saisies dans l'onglet Fiscal sont-elles enregistrées ?",
        answer:
          "Oui : l'onglet Fiscal de la Gestion enregistre automatiquement vos modifications quelques secondes après votre dernière action, et une alerte signale toute modification non encore enregistrée. Vous pouvez aussi enregistrer manuellement via le bouton dédié en bas de l'onglet.",
      },
      {
        question: "Les montants s'affichent-ils toujours de la même façon ?",
        answer:
          "Oui, les montants sont systématiquement arrondis et formatés en francs CFA (par exemple « 1 234 567 F CFA ») pour une lecture homogène dans toute l'application.",
      },
      {
        question: "Où trouver les nouveautés de l'application ?",
        answer:
          "L'onglet « Nouveautés » de cette page d'aide récapitule, version par version, les changements majeurs apportés à l'application. Pensez à le consulter après chaque mise à jour.",
      },
    ],
  },
];
