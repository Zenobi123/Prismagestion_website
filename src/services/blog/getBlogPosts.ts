
import { supabase } from "@/integrations/supabase/client";
import { BlogPost, BlogPostStatus } from "@/types/blog";

export const DEFAULT_BLOG_POSTS: BlogPost[] = [

  {
    id: -1,
    title: "L'Environnement Fiscal Camerounais : Cadre Juridique et Institutionnel",
    excerpt: "Découvrez les sources du droit fiscal, l'organisation de la DGI et les obligations des contribuables au Cameroun.",
    content: `
      <h2>1. Les sources du droit fiscal camerounais</h2>
      <p>Le système fiscal camerounais repose sur un ensemble hiérarchisé de normes juridiques. Au sommet, la Constitution du 18 janvier 1996 pose le principe fondamental de consentement à l'impôt : « Le Parlement vote les lois et consent l'impôt ». Aucune autorité administrative ne peut imposer un prélèvement sans base légale expresse.</p>
      <p>Le Code Général des Impôts (CGI) constitue le corpus central. Il est actualisé chaque année par la Loi de Finances. La Loi sur la Fiscalité Locale régit les impôts collectés au profit des collectivités territoriales décentralisées. Enfin, les conventions fiscales internationales (comme celles avec la France ou la CEMAC) priment le droit interne.</p>

      <h2>2. Organisation de l'administration fiscale (DGI)</h2>
      <p>La Direction Générale des Impôts est la structure centrale chargée de l'assiette, du contrôle et du recouvrement. Ses structures opérationnelles sont classées selon la taille des contribuables :</p>
      <ul>
        <li><strong>DGE (Direction des Grandes Entreprises) :</strong> CA ≥ 3 milliards FCFA</li>
        <li><strong>CIME (Centre des Impôts des Moyennes Entreprises) :</strong> 50 M ≤ CA &lt; 3 milliards FCFA</li>
        <li><strong>CDI (Centre Divisionnaire des Impôts) :</strong> CA &lt; 50 millions ou régime IGS</li>
      </ul>

      <h2>3. Obligations générales du contribuable</h2>
      <p>Tout contribuable doit :</p>
      <ul>
        <li>S'immatriculer pour obtenir un Numéro d'Identifiant Unique (NIU).</li>
        <li>Souscrire des déclarations périodiques (DSF, DAS, etc.).</li>
        <li>Payer ses impôts dans les délais légaux (sous peine de pénalités de retard).</li>
        <li>Conserver ses documents comptables pendant un délai minimal de 10 ans.</li>
      </ul>

      <h2>Conclusion</h2>
      <p>La maîtrise de la hiérarchie des normes et de l'organisation fiscale est essentielle pour tout professionnel. C'est le socle qui garantit la conformité et la protection du contribuable.</p>
    `,
    author: "Nathan OBIANG TIME",
    publishDate: "2026-04-12",
    status: "Publié",
    image: "/placeholder.svg",
    slug: "environnement-fiscal-camerounais-cadre-juridique",
    tags: ["Fiscalité", "Droit", "Cameroun"],
    seoTitle: "L'Environnement Fiscal Camerounais : Cadre Juridique",
    seoDescription: "Analyse du cadre juridique et institutionnel de l'environnement fiscal au Cameroun."
  },
  {
    id: -2,
    title: "La Réforme Fiscale de 2026 : Les Nouveaux Régimes d'Imposition",
    excerpt: "Comprendre la suppression du RSI et l'adoption de l'Impôt Général Synthétique (IGS) face au régime du réel.",
    content: `
      <h2>1. Présentation générale — La réforme LF 2026</h2>
      <p>La Loi de Finances 2026 a profondément réformé le paysage des régimes d'imposition au Cameroun. L'ancien Régime Simplifié d'Imposition (RSI) est supprimé. Désormais, le système ne comprend plus que deux régimes : l'Impôt Général Synthétique (IGS) et le régime du réel.</p>

      <h2>2. L'Impôt Général Synthétique libératoire (IGS)</h2>
      <p>L'IGS s'applique aux personnes physiques et morales dont le CA annuel est strictement inférieur à 50 000 000 FCFA. Il est libératoire de l'IS, TVA, patente, IRPP-BIC, etc.</p>
      <p>Il offre de nombreux avantages :</p>
      <ul>
        <li>Paiement trimestriel simplifié.</li>
        <li>Tenue d'une comptabilité simplifiée (livre de recettes et dépenses).</li>
        <li>Réduction de 50 % pour les adhérents d'un Centre de Gestion Agréé (CGA).</li>
      </ul>

      <h2>3. Le régime du réel</h2>
      <p>Le régime du réel s'applique obligatoirement à toutes les entreprises dont le chiffre d'affaires est ≥ 50 millions FCFA, avec une option volontaire possible pour les autres. Il implique :</p>
      <ul>
        <li>Tenue d'une comptabilité complète OHADA.</li>
        <li>Déclarations mensuelles (TVA, acomptes IS, IRPP sur salaires).</li>
        <li>Dépôt annuel de la Déclaration Statistique et Fiscale (DSF).</li>
      </ul>

      <h2>4. Règles de passage entre régimes</h2>
      <p>Le passage de l'IGS au réel est automatique si le CA dépasse 50 millions FCFA. Le passage inverse (Réel vers IGS) est possible si le CA reste inférieur à 50 millions pendant deux exercices consécutifs, sur demande expresse.</p>
    `,
    author: "Nathan OBIANG TIME",
    publishDate: "2026-04-13",
    status: "Publié",
    image: "/placeholder.svg",
    slug: "reforme-fiscale-2026-regimes-imposition",
    tags: ["Fiscalité", "Réforme", "Cameroun", "IGS"],
    seoTitle: "Réforme Fiscale 2026 : Régimes d'Imposition au Cameroun",
    seoDescription: "Explication de la réforme LF 2026 sur les régimes d'imposition, avec un focus sur l'IGS et le régime du réel."
  },
  {
    id: -3,
    title: "Panorama des Impôts et Taxes au Cameroun (2026)",
    excerpt: "Tour d'horizon des principaux impôts (IS, IRPP, TVA) et des incitations fiscales de la Loi de Finances 2026.",
    content: `
      <h2>1. L'Impôt sur les Sociétés (IS)</h2>
      <p>L'IS frappe les bénéfices réalisés par les personnes morales. Le taux principal est de 30 % du bénéfice fiscal imposable, auquel s'ajoutent les Centimes Additionnels Communaux (10 % de l'IS), portant le taux effectif global à 33 %.</p>
      <p>Il existe un minimum de perception de 2,2 % du CA HT, acquitté mensuellement sous forme d'acomptes.</p>

      <h2>2. L'Impôt sur le Revenu des Personnes Physiques (IRPP)</h2>
      <p>L'IRPP s'applique selon un barème progressif (de 10 % à 35 %) aux différents revenus (salaires, BIC, BNC, revenus fonciers). Des taxes annexes comme la contribution au Crédit Foncier et la redevance audiovisuelle viennent s'ajouter.</p>

      <h2>3. La Taxe sur la Valeur Ajoutée (TVA)</h2>
      <p>Le taux général de la TVA est de 19,25 % TTC. La LF 2026 introduit un taux réduit à 10 % pour la construction et la vente de logements sociaux. Les exportations sont taxées à 0 %, avec droit à déduction.</p>

      <h2>4. Fiscalité du Numérique (Innovation LF 2026)</h2>
      <p>L'article 23 bis du CGI instaure un dispositif de taxation des activités de l'économie numérique basé sur la notion de Présence Économique Significative (PES). Les entreprises étrangères ciblant le marché camerounais ou exploitant des plateformes de commerce électronique sont soumises à une taxe de 3 % sur les revenus générés au Cameroun.</p>

      <h2>5. Incitations fiscales de la LF 2026</h2>
      <p>La LF 2026 propose d'importantes mesures incitatives :</p>
      <ul>
        <li>Déduction majorée à 150 % des salaires bruts pour l'emploi de jeunes (&lt; 35 ans) en CDI.</li>
        <li>Réduction de 50 % de l'IGS pour les travailleurs indépendants handicapés.</li>
        <li>Taux réduit de TVA à 10 % pour le logement social.</li>
      </ul>
    `,
    author: "Nathan OBIANG TIME",
    publishDate: "2026-04-14",
    status: "Publié",
    image: "/placeholder.svg",
    slug: "panorama-impots-taxes-cameroun-2026",
    tags: ["Fiscalité", "Taxes", "Cameroun"],
    seoTitle: "Panorama des Impôts et Taxes au Cameroun (2026)",
    seoDescription: "Synthèse des principaux impôts (IS, IRPP, TVA) et nouvelles taxes du numérique au Cameroun pour 2026."
  },

  {
    id: -10,
    title: "Veille impots.cm : commande publique, déclaration des particuliers et publications fiscales",
    excerpt: "Synthèse priorisée des actualités visibles sur impots.cm, avec liens officiels et documents utiles pour les contribuables.",
    content: `
      <h2>Veille impots.cm — point au 16 juin 2026</h2>
      <p>
        Cette veille regroupe les sujets fiscaux à suivre en priorité sur le portail officiel de la Direction
        Générale des Impôts du Cameroun. Elle met l'accent sur les nouveautés et rappels opérationnels utiles
        aux entreprises, particuliers, cabinets comptables, directions financières et responsables administratifs.
      </p>

      <h3>1. Nouvelle plateforme d'enregistrement de la commande publique</h3>
      <p>
        La DGI met en avant l'<strong>Enregistrement de la commande publique</strong> comme nouveau service numérique.
        Ce sujet concerne directement les entreprises titulaires de marchés publics, les prestataires de l'État,
        les administrations contractantes et les équipes chargées du suivi fiscal des marchés, bons de commande
        et lettres-commandes.
      </p>
      <ul>
        <li><strong>Angle d'article recommandé :</strong> ce que la digitalisation de l'enregistrement change pour les marchés publics.</li>
        <li><strong>Points à traiter :</strong> accès à la plateforme, pièces à préparer, traçabilité, preuves d'enregistrement et risques en cas d'omission.</li>
        <li><strong>Liens d'appui :</strong> <a href="https://www.impots.cm/fr" target="_blank" rel="noopener noreferrer">page d'accueil impots.cm</a> et <a href="https://registrations.dgi.cm" target="_blank" rel="noopener noreferrer">plateforme Commande publique</a>.</li>
      </ul>

      <h3>2. Rappel : déclaration annuelle des revenus des particuliers</h3>
      <p>
        L'accès rapide <strong>Déclaration des particuliers</strong> est visible parmi les e-services de la DGI. Un article
        dédié doit rappeler que la conformité fiscale ne concerne pas uniquement les entreprises : les particuliers
        doivent vérifier leurs obligations déclaratives, notamment lorsqu'ils disposent de revenus salariaux,
        fonciers, mobiliers, professionnels ou d'activités indépendantes.
      </p>
      <ul>
        <li><strong>Angle d'article recommandé :</strong> qui doit déclarer, quels revenus déclarer et comment utiliser le service en ligne.</li>
        <li><strong>Points à traiter :</strong> NIU, télédéclaration, justificatifs, cohérence des revenus et conséquences d'une omission.</li>
        <li><strong>Lien d'appui :</strong> <a href="https://teledeclaration-dgi.cm" target="_blank" rel="noopener noreferrer">service de télédéclaration DGI</a>.</li>
      </ul>

      <h3>3. DSF en ligne : guide de transmission et paiement des soldes d'impôts</h3>
      <p>
        Le guide de soumission de la DSF en ligne reste un document de référence pour les contribuables concernés.
        Il mérite un article pratique détaillant les prérequis, le dépôt des fichiers, le téléversement des annexes
        et les modes de paiement.
      </p>
      <ul>
        <li><a href="https://www.impots.cm/fr/actualites/guide-de-soumission-de-la-dsf-en-ligne" target="_blank" rel="noopener noreferrer">Guide de soumission de la DSF en ligne</a></li>
        <li><a href="https://impots.cm/sites/default/files/documents/GUIDE%20DE%20TRANSMISSION%20E%CC%81LECTRONIQUE%20DES%20DSF.pdf" target="_blank" rel="noopener noreferrer">Document PDF officiel DSF</a></li>
      </ul>

      <h3>4. Circulaire LF 2026 : analyse pratique pour les entreprises</h3>
      <p>
        La circulaire d'application de la Loi de finances 2026 doit être traitée comme un contenu d'analyse : mesures
        nouvelles, obligations déclaratives, impacts sectoriels et points de vigilance pour les contribuables.
      </p>
      <ul>
        <li><a href="https://www.impots.cm/fr/actualites/circulaire-lf-2026" target="_blank" rel="noopener noreferrer">Circulaire LF 2026</a></li>
      </ul>

      <h3>5. Contribution des patentes : établissements privés d'enseignement et de santé</h3>
      <p>
        La lettre circulaire relative au régime de la contribution des patentes applicable aux établissements laïcs
        d'enseignement et de santé appelle un article sectoriel à destination des écoles privées, cliniques,
        centres de santé et gestionnaires d'établissements concernés.
      </p>
      <ul>
        <li><a href="https://www.impots.cm/fr" target="_blank" rel="noopener noreferrer">Actualité mise en avant sur impots.cm</a></li>
      </ul>

      <h3>6. Liste des contribuables inactifs : vérifier et régulariser sa situation</h3>
      <p>
        La publication de la liste des contribuables inactifs doit être accompagnée d'un article d'alerte conformité :
        conséquences possibles, vérification de la situation fiscale et démarches de régularisation auprès du centre
        des impôts compétent.
      </p>
      <ul>
        <li><a href="https://www.impots.cm/fr/actualites/liste-des-contribuables-inactifs" target="_blank" rel="noopener noreferrer">Liste des contribuables inactifs</a></li>
      </ul>

      <h3>7. Charte du contribuable au 1er janvier 2026 : droits en cas de contrôle fiscal</h3>
      <p>
        La Charte du contribuable est un support pédagogique essentiel pour expliquer les droits, garanties,
        obligations et voies de recours du contribuable, notamment pendant un contrôle fiscal.
      </p>
      <ul>
        <li><a href="https://www.impots.cm/fr/actualites/charte-du-controbuable-au-1er-janvier-2026" target="_blank" rel="noopener noreferrer">Charte du contribuable au 1er janvier 2026</a></li>
        <li><a href="https://impots.cm/sites/default/files/documents/CHARTE%20DU%20CONTRIBUABLE%20MAJ%20au%2001%20janvier%202026.pdf" target="_blank" rel="noopener noreferrer">Document PDF officiel de la Charte</a></li>
      </ul>

      <h3>8. Taxe foncière : rappel de l'échéance du 30 juin</h3>
      <p>
        La taxe sur la propriété foncière doit faire l'objet d'un article de rappel avant l'échéance de fin juin :
        contribuables concernés, base d'imposition, taux, paiement spontané et sanctions en cas de retard.
      </p>
      <ul>
        <li><a href="https://www.impots.cm/fr/taxe-fonciere" target="_blank" rel="noopener noreferrer">Taxe foncière</a></li>
        <li><a href="https://www.impots.cm/fr/calendrier-fiscal" target="_blank" rel="noopener noreferrer">Calendrier fiscal</a></li>
      </ul>

      <h3>Priorité de publication recommandée</h3>
      <ol>
        <li>Nouvelle plateforme d'enregistrement de la commande publique.</li>
        <li>Déclaration annuelle des revenus des particuliers.</li>
        <li>Taxe foncière : rappel avant le 30 juin.</li>
        <li>DSF en ligne : guide de transmission et paiement.</li>
        <li>Charte du contribuable, contribuables inactifs, circulaire LF 2026 et patentes sectorielles.</li>
      </ol>
    `,
    author: "PRISMA GESTION",
    publishDate: "2026-06-16",
    status: "Publié",
    image: "/blog-images/veille-impots.jpg",
    slug: "veille-impots-cm-commande-publique-declaration-particuliers",
    tags: ["Veille réglementaire", "Fiscalité", "Commande publique", "IRPP"],
    seoTitle: "Veille impots.cm : commande publique et déclaration des particuliers",
    seoDescription: "Suivez les nouveautés impots.cm : commande publique, déclaration annuelle des particuliers, DSF, taxe foncière et documents fiscaux officiels."
  },
  {
    id: -11,
    title: "Veille cnps.cm : dernières actualités sociales",
    excerpt: "Retrouvez le dernier élément publié sur cnps.cm : communiqué, document ou news officielle.",
    content: `
      <h2>Dernières parutions de cnps.cm</h2>
      <p>
        Cette veille centralise l'accès aux contenus récents diffusés par la CNPS.
      </p>
      <div class="bg-gray-50">
        <h3>Accès rapide</h3>
        <ul>
          <li><a href="https://www.cnps.cm/" target="_blank" rel="noopener noreferrer">Page d'accueil cnps.cm</a></li>
          <li><a href="https://www.cnps.cm/actualites/" target="_blank" rel="noopener noreferrer">Rubrique actualités</a></li>
          <li><a href="https://www.cnps.cm/documentation/" target="_blank" rel="noopener noreferrer">Rubrique documentation</a></li>
        </ul>
      </div>
      <p>
        Vérifiez ces sections pour consulter la publication la plus récente.
      </p>
    `,
    author: "PRISMA GESTION",
    publishDate: "2026-04-10",
    status: "Publié",
    image: "/blog-images/veille-cnps.jpg",
    slug: "veille-cnps-cm-dernieres-actualites",
    tags: ["Veille réglementaire", "Social"],
    seoTitle: "Veille cnps.cm : dernières actualités sociales",
    seoDescription: "Accédez rapidement aux dernières actualités et documents publiés sur cnps.cm."
  },
  {
    id: -12,
    title: "Veille legecam.cm : nouveaux documents et annonces",
    excerpt: "Un point d'accès direct vers la dernière publication visible sur legecam.cm.",
    content: `
      <h2>Dernières parutions de legecam.cm</h2>
      <p>
        Utilisez cette page pour accéder en un clic aux nouveautés publiées par EGECAM.
      </p>
      <div class="bg-gray-50">
        <h3>Accès rapide</h3>
        <ul>
          <li><a href="https://legecam.cm/" target="_blank" rel="noopener noreferrer">Page d'accueil legecam.cm</a></li>
          <li><a href="https://legecam.cm/category/actualites/" target="_blank" rel="noopener noreferrer">Rubrique actualités</a></li>
          <li><a href="https://legecam.cm/category/documents/" target="_blank" rel="noopener noreferrer">Rubrique documents</a></li>
        </ul>
      </div>
      <p>
        Consultez ces sections pour repérer le dernier contenu publié.
      </p>
    `,
    author: "PRISMA GESTION",
    publishDate: "2026-04-10",
    status: "Publié",
    image: "/blog-images/veille-legecam.jpg",
    slug: "veille-legecam-cm-documents-annonces",
    tags: ["Veille", "Institutionnel"],
    seoTitle: "Veille legecam.cm : nouveaux documents et annonces",
    seoDescription: "Suivi des dernières publications de legecam.cm (documents, actualités, annonces)."
  },
  {
    id: -13,
    title: "Veille DGICAM Facebook : dernière publication",
    excerpt: "Suivez la dernière publication postée sur la page Facebook officielle DGICAM.",
    content: `
      <h2>Dernières parutions Facebook DGICAM</h2>
      <p>
        Cette veille pointe vers la page officielle DGICAM pour consulter le dernier post publié.
      </p>
      <div class="bg-gray-50">
        <h3>Lien direct</h3>
        <ul>
          <li><a href="https://www.facebook.com/DGICAM" target="_blank" rel="noopener noreferrer">Page Facebook DGICAM</a></li>
        </ul>
      </div>
      <p>
        Le premier post affiché en haut du fil correspond généralement à la publication la plus récente.
      </p>
    `,
    author: "PRISMA GESTION",
    publishDate: "2026-04-10",
    status: "Publié",
    image: "/blog-images/veille-dgicam.jpg",
    slug: "veille-facebook-dgicam-derniere-publication",
    tags: ["Veille", "Réseaux sociaux"],
    seoTitle: "Veille DGICAM Facebook : dernière publication",
    seoDescription: "Accès rapide à la dernière publication de la page Facebook DGICAM."
  },
  {
    id: -1,
    title: "Les avantages de la comptabilité en ligne",
    excerpt: "Pourquoi passer à la comptabilité informatisée en 2025.",
    content: `

<h2>La révolution numérique de la comptabilité en 2025 : Pourquoi et comment passer à la comptabilité en ligne</h2>

<p>À l'ère de la digitalisation, la gestion financière et comptable des entreprises, et particulièrement des TPE et PME, connaît une transformation sans précédent. En 2025, la transition vers la comptabilité en ligne n'est plus une simple option d'optimisation, mais une véritable nécessité stratégique et réglementaire. L'écosystème financier se numérise à une vitesse grand V, porté par l'évolution des normes, telles que la généralisation imminente de la facturation électronique, et par les innovations technologiques majeures, notamment l'intelligence artificielle (IA) et l'automatisation des processus.</p>

<p>Dans ce contexte en perpétuelle mutation, les entreprises qui font le choix de la comptabilité en ligne se dotent d'un avantage concurrentiel significatif. Elles s'affranchissent des contraintes administratives chronophages, sécurisent leurs données et gagnent en agilité. Cet article détaillé, élaboré avec l'expertise de Prisma Gestion, vous plonge au cœur des enjeux de la comptabilité dématérialisée et met en lumière les innombrables bénéfices qu'elle offre aux dirigeants d'entreprise, directeurs financiers et experts-comptables.</p>

<h3>1. Un gain de temps considérable grâce à l'automatisation</h3>

<p>Le temps est la ressource la plus précieuse d'un chef d'entreprise. Historiquement, la tenue comptable impliquait des heures interminables de saisie manuelle de données, de tri de factures papier et de rapprochements bancaires fastidieux. La comptabilité en ligne, grâce aux avancées de l'automatisation, vient bouleverser ce paradigme.</p>

<p>Les logiciels de comptabilité modernes s'appuient sur des technologies avancées comme la reconnaissance optique de caractères (OCR). Cette technologie permet de numériser une facture (via un simple scan ou une photo) et d'en extraire instantanément et automatiquement les informations clés (fournisseur, montants HT et TTC, taux de TVA, date, etc.). L'écriture comptable est alors pré-générée sans intervention humaine directe, éliminant ainsi les tâches rébarbatives.</p>

<p>De plus, grâce aux protocoles de synchronisation bancaire sécurisés (comme l'Open Banking et les directives DSP2), les flux financiers remontent directement de vos comptes bancaires vers le logiciel comptable. Le lettrage et le rapprochement bancaire deviennent quasiment automatiques, le système associant de manière intelligente les transactions bancaires aux factures d'achat et de vente correspondantes.</p>

<p>Ce gain de temps opérationnel est estimé à plusieurs dizaines d'heures par mois pour une PME moyenne. Ce temps dégagé permet aux dirigeants et aux équipes comptables de se recentrer sur leur cœur de métier : l'analyse stratégique, le développement commercial et la création de valeur ajoutée.</p>

<h3>2. Accessibilité, flexibilité et collaboration renforcée</h3>

<p>L'un des avantages fondamentaux des solutions de comptabilité en mode SaaS (Software as a Service) est leur accessibilité universelle. Contrairement aux logiciels traditionnels installés localement sur un poste de travail physique, la comptabilité en ligne est hébergée sur des serveurs distants sécurisés (le Cloud). Vos données sont ainsi accessibles 24 heures sur 24 et 7 jours sur 7, depuis n'importe quel ordinateur, tablette ou smartphone disposant d'une connexion internet.</p>

<p>Cette flexibilité répond parfaitement aux nouveaux modes de travail, tels que le télétravail et la mobilité accrue des dirigeants. Vous pouvez suivre l'état de votre trésorerie, valider une facture ou émettre un devis pendant un déplacement professionnel ou depuis votre domicile, avec la même facilité qu'au bureau.</p>

<p>Par ailleurs, cette centralisation des données dans le Cloud transforme radicalement la relation avec votre cabinet d'expertise comptable. Fini les échanges de classeurs physiques, les envois de clés USB ou les envois groupés de justificatifs en fin de mois. Le chef d'entreprise et l'expert-comptable accèdent simultanément et en temps réel à la même plateforme. La collaboration devient fluide, instantanée et transparente. L'expert-comptable n'est plus seulement un producteur de bilans en fin d'exercice, mais devient un véritable partenaire stratégique, capable de fournir des conseils proactifs tout au long de l'année grâce à une vision à jour de la santé financière de l'entreprise.</p>

<h3>3. Pilotage en temps réel de la performance financière</h3>

<p>Dans un environnement économique instable, piloter son entreprise en se basant uniquement sur des bilans comptables arrêtés plusieurs mois après la fin de l'exercice est devenu obsolète. La comptabilité en ligne offre l'immense avantage de la gestion en temps réel.</p>

<p>Les solutions modernes intègrent des tableaux de bord dynamiques et personnalisables (KPI). En un coup d'œil, le dirigeant a accès à des indicateurs clés de performance (Chiffre d'affaires, marges, créances clients, dettes fournisseurs, solde de trésorerie). Ces données étant actualisées en permanence grâce à la synchronisation bancaire et à la saisie au fil de l'eau, elles offrent une lisibilité parfaite de la situation financière instantanée de l'entreprise.</p>

<p>Cette visibilité accrue permet une prise de décision rapide et éclairée. Si la trésorerie se tend, des alertes peuvent être configurées, permettant d'anticiper d'éventuels besoins de financement à court terme ou d'intensifier les relances clients. En parlant de relances clients, de nombreux logiciels permettent également d'automatiser le processus de suivi des impayés, réduisant ainsi le délai de paiement moyen (DSO) et préservant la liquidité de l'entreprise.</p>

<h3>4. Sécurité des données, conformité et pérennité</h3>

<p>La sécurité des données est souvent une préoccupation majeure pour les entreprises qui hésitent à franchir le pas du Cloud. Pourtant, les solutions de comptabilité en ligne professionnelles offrent un niveau de sécurité souvent bien supérieur à celui d'une installation locale classique.</p>

<p>Les éditeurs de logiciels investissent massivement dans la sécurisation de leurs infrastructures (chiffrement des données de bout en bout, hébergement sur des serveurs hautement sécurisés, redondance des infrastructures, protection contre les cyberattaques de type ransomware). De plus, les sauvegardes sont effectuées de manière automatique, quotidienne, et géolocalisées sur différents sites distants. Ainsi, en cas de sinistre physique (incendie, dégât des eaux, vol d'ordinateur) ou de panne matérielle dans vos locaux, l'intégrité et la disponibilité de vos données comptables sont totalement garanties.</p>

<p>Outre la sécurité technique, la comptabilité en ligne garantit également la conformité légale et fiscale. Les normes comptables et la réglementation évoluent constamment. En utilisant une solution en mode SaaS, l'entreprise bénéficie de mises à jour automatiques et transparentes. Le logiciel est toujours en adéquation avec les dernières lois de finances et obligations déclaratives.</p>

<h3>5. L'anticipation de la facturation électronique obligatoire</h3>

<p>En France et dans de nombreux autres pays (dont progressivement certains pays africains), la législation se durcit concernant la traçabilité des transactions interentreprises (B2B). La facturation électronique (e-invoicing) devient la norme incontournable.</p>

<p>La mise en place de la facturation électronique obligatoire vise à lutter contre la fraude à la TVA, réduire les coûts administratifs et optimiser la compétitivité des entreprises. Cette réforme impose aux entreprises non seulement d'émettre des factures sous un format structuré spécifique, mais aussi de pouvoir les recevoir et de transmettre des données de transaction et de paiement à l'administration fiscale (e-reporting).</p>

<p>Adopter un logiciel de comptabilité en ligne dès aujourd'hui, c'est anticiper cette révolution. Les éditeurs intègrent nativement les fonctionnalités permettant d'émettre et de traiter des factures conformes aux nouveaux standards dématérialisés. Les entreprises déjà équipées vivront cette transition majeure de manière fluide et sans heurts, contrairement à celles qui maintiennent des processus manuels obsolètes et qui se retrouveront acculées par les échéances réglementaires.</p>

<h3>6. Une réduction des coûts opérationnels</h3>

<p>Bien que l'adoption d'un logiciel de comptabilité en ligne implique un abonnement mensuel ou annuel, l'analyse du retour sur investissement (ROI) démontre très rapidement que cette solution est génératrice d'économies substantielles.</p>

<p>D'une part, elle permet de réduire de manière drastique les coûts directs liés à la gestion papier (impression, frais postaux, archivage physique, fournitures de bureau). L'archivage numérique à valeur probante remplace l'amoncellement d'archives chronophages à gérer.</p>

<p>D'autre part, la diminution significative du temps consacré aux tâches administratives et comptables permet de redéployer les ressources humaines vers des missions à plus forte valeur ajoutée commerciale. Moins d'erreurs de saisie signifie également moins de temps passé à corriger, réduisant ainsi les coûts cachés de la non-qualité administrative.</p>

<h3>Conclusion : Un levier de croissance indispensable</h3>

<p>En conclusion, la comptabilité en ligne n'est plus une simple alternative technologique, mais un véritable socle de gestion pour les entreprises performantes en 2025. Elle transcende la simple fonction d'enregistrement des flux financiers pour devenir un puissant outil d'aide à la décision stratégique.</p>

<p>Gain de temps monumental grâce à l'automatisation, accessibilité totale favorisant la mobilité, collaboration optimisée avec l'expert-comptable, pilotage de la trésorerie en temps réel, sécurité maximale des données et conformité avec les réglementations à venir (facturation électronique) ; les avantages sont multiples et indiscutables.</p>

<p>Chez Prisma Gestion, nous accompagnons les TPE et PME dans leur transformation digitale. Nous avons la conviction que digitaliser sa gestion financière est la première étape vers une croissance maîtrisée et pérenne. Ne subissez plus votre comptabilité, faites-en un levier de compétitivité !</p>

    `,
    author: "Nathan OBIANG TIME",
    publishDate: "2026-04-11",
    status: "Publié",
    image: "/lovable-uploads/85999c6b-953e-4905-b204-fec3dfc4e72f.png",
    slug: "avantages-comptabilite-en-ligne",
    tags: ["Comptabilité"],
    seoTitle: "Les avantages de la comptabilité en ligne en 2025",
    seoDescription: "Découvrez pourquoi passer à la comptabilité informatisée en 2025 peut transformer votre entreprise.",
  },
  {
    id: -2,
    title: "Les nouvelles normes fiscales et comptables pour 2025",
    excerpt: "Lois des finances 2025, ce que vous devez savoir.",
    content: `

<h2>Les nouvelles normes fiscales et comptables pour 2025 : Décryptage des lois de finances</h2>

<p>L'année 2025 marque une étape décisive dans l'évolution du paysage fiscal et comptable au Cameroun. Portée par la nécessité d'optimiser les recettes de l'État, de soutenir la production locale et de moderniser le système déclaratif, la Loi de Finances de la République du Cameroun pour l'exercice 2025 introduit des réformes substantielles. Celles-ci impactent de manière significative l'ensemble des acteurs économiques, des très petites entreprises (TPE) aux grandes sociétés, en passant par les professionnels libéraux et les particuliers.</p>

<p>Face à cette complexité normative croissante, il est impératif pour les dirigeants d'entreprise, les directeurs financiers et les experts-comptables de s'approprier ces nouvelles dispositions. Une maîtrise approfondie de ces règles est la garantie de la conformité légale, mais aussi une opportunité d'optimisation fiscale stratégique. Cet article détaillé vous propose un décryptage exhaustif des mesures phares des nouvelles normes fiscales et comptables pour 2025, en s'appuyant sur les dispositions de la Direction Générale des Impôts (DGI) et des Douanes Camerounaises.</p>

<h3>1. Le renforcement de la politique d'import-substitution</h3>

<p>La volonté gouvernementale de promouvoir la production locale et de réduire la dépendance aux importations (la politique d'import-substitution) s'intensifie en 2025. Cette orientation macro-économique se traduit par d'importants aménagements au niveau de la législation douanière et fiscale.</p>

<p>La Loi de Finances 2025 prévoit des mesures d'accompagnement spécifiques pour les secteurs jugés stratégiques. Par exemple, des dispositions visent à soutenir le secteur de l'élevage. Selon l'article cinquième de la loi de finances, les "compléments alimentaires pour animaux" (vitamines, acides aminés essentiels et sels minéraux non produits localement) destinés au renforcement de la croissance animale, bénéficient d'un abattement exceptionnel de 50% sur leur valeur imposable à l'importation. Cette mesure vise directement à réduire les coûts de production pour les éleveurs locaux et à stimuler l'agro-industrie nationale.</p>

<p>En parallèle de ces incitations, la fiscalité sur l'importation de certains biens de consommation finale pourrait être révisée à la hausse, afin de favoriser la consommation de produits manufacturés localement. Il est donc crucial pour les entreprises importatrices de réévaluer leur chaîne d'approvisionnement (supply chain) à la lumière de cette nouvelle donne tarifaire (Tarif Extérieur Commun - TEC).</p>

<h3>2. La promotion de l'économie verte et de la transition énergétique</h3>

<p>L'urgence climatique et la nécessité de développer des sources d'énergie durables se reflètent dans le dispositif fiscal de 2025. L'État encourage activement les investissements en faveur de l'énergie verte et de la protection de l'environnement.</p>

<p>Des incitations fiscales (exonérations de droits de douane, réductions d'impôt sur les sociétés pour les investissements éco-responsables) sont mises en place pour faciliter l'acquisition d'équipements de production d'énergies renouvelables (panneaux solaires, éoliennes, équipements hydroélectriques). De même, les entreprises adoptant des technologies propres ou investissant dans le traitement et le recyclage des déchets bénéficient d'un cadre fiscal allégé.</p>

<p>Ces mesures visent non seulement à accompagner la transition écologique du tissu économique, mais constituent également de véritables niches d'optimisation fiscale pour les entreprises qui décident d'intégrer des critères environnementaux, sociaux et de gouvernance (ESG) au cœur de leur stratégie d'investissement.</p>

<h3>3. Modernisation et digitalisation des procédures fiscales</h3>

<p>La transformation numérique de l'administration fiscale camerounaise franchit un nouveau cap en 2025. L'objectif avoué est la sécurisation des recettes publiques, la réduction de la fraude fiscale et la simplification des démarches administratives pour les contribuables de bonne foi.</p>

<p>La dématérialisation devient la norme absolue. L'obligation de souscrire les déclarations fiscales et d'effectuer les paiements en ligne via les plateformes officielles de la DGI s'étend à un panel toujours plus large de contribuables, y compris pour les structures de taille plus modeste. La généralisation des téléprocédures permet un suivi rigoureux et instantané des obligations fiscales, minimisant le risque d'erreurs et de pénalités pour retard de déclaration.</p>

<p>De plus, l'administration fiscale renforce ses capacités de croisement de données. Grâce à l'interconnexion des systèmes d'information (Douanes, Trésor, Impôts, CNPS), les contrôles fiscaux s'automatisent. Les discordances entre le chiffre d'affaires déclaré aux impôts et les flux financiers réels ou douaniers sont détectées plus rapidement. Cette "fiscalité de la donnée" impose aux entreprises une rigueur comptable absolue et rend l'usage d'un système d'information de gestion (ERP) ou d'un logiciel de comptabilité en ligne particulièrement indispensable.</p>

<h3>4. L'Impôt sur les Sociétés (IS) et obligations de reporting</h3>

<p>Le taux et la base d'imposition de l'Impôt sur les Sociétés (IS) font l'objet d'un suivi minutieux dans la Loi de Finances. Si le taux nominal tend à rester stable pour garantir une certaine prévisibilité économique, les règles de détermination du bénéfice imposable (l'assiette) se précisent.</p>

<p>Les conditions de déductibilité des charges sont encadrées de manière plus stricte. L'administration exige des pièces justificatives conformes (et souvent dématérialisées) pour toute charge d'exploitation déduite. Les dispositions relatives aux prix de transfert pour les groupes multinationaux sont également renforcées, avec des obligations documentaires accrues visant à prévenir l'évasion fiscale via le transfert de bénéfices vers des juridictions à fiscalité privilégiée.</p>

<p>Par ailleurs, des régimes spécifiques continuent de s'appliquer pour encourager certains secteurs (zones économiques spéciales, jeunes entreprises innovantes). La compréhension fine de ces dispositifs dérogatoires est essentielle pour une stratégie fiscale performante.</p>

<h3>5. TVA, Droits d'Accises et fiscalité de la consommation</h3>

<p>La Taxe sur la Valeur Ajoutée (TVA), principale source de revenus de l'État, fait l'objet d'aménagements pour élargir son champ d'application, particulièrement en ce qui concerne l'économie numérique. La taxation des services numériques fournis depuis l'étranger à des consommateurs camerounais (téléchargements, abonnements en ligne, services cloud) est encadrée pour garantir une équité concurrentielle entre acteurs locaux et internationaux.</p>

<p>La réglementation concernant les logiciels importés, par exemple, a été clarifiée. Selon les dispositions modifiant la loi de finances de 2018, les logiciels importés spontanément déclarés relèvent de la 2ème catégorie du TEC à 10%, tandis que ceux constatés a posteriori restent soumis à un taux de 20% (3ème catégorie). Cette mesure illustre la volonté de l'administration douanière d'encourager la transparence et la déclaration préalable.</p>

<p>Quant aux Droits d'Accises (DA), leur périmètre peut évoluer. Ces taxes, qui frappent spécifiquement certains produits de grande consommation (boissons, tabacs, véhicules, produits cosmétiques), servent d'outil d'orientation des politiques de santé publique et de protection de l'environnement, tout en assurant d'importantes rentrées fiscales. L'évolution de la grille tarifaire des droits d'accises (pouvant aller jusqu'à 25% ad valorem) nécessite une veille réglementaire constante pour les industriels concernés.</p>

<h3>Conclusion : L'importance de l'accompagnement professionnel</h3>

<p>L'année 2025 confirme la tendance à une fiscalité de plus en plus technique, mondialisée et numérisée. Les réformes introduites par la Loi de Finances visent à doter le Cameroun des moyens de ses ambitions de développement, tout en exigeant des entreprises une transparence et une conformité totales.</p>

<p>La complexité de l'Impôt Général Synthétique (IGS), la gestion fine de la TVA, la politique d'import-substitution ou encore les incitations en faveur de l'économie verte requièrent une expertise pointue. Naviguer en solitaire dans ce dédale réglementaire expose l'entreprise à des risques financiers majeurs (redressements fiscaux, pénalités de retard) et à des opportunités manquées.</p>

<p>C'est pourquoi l'accompagnement par des professionnels agréés, tels que les experts de Prisma Gestion, n'a jamais été aussi stratégique. Notre rôle est d'interpréter ces nouvelles dispositions, de réaliser un diagnostic fiscal de votre entité, et de mettre en œuvre des stratégies sur-mesure pour sécuriser votre activité, optimiser vos flux de trésorerie et garantir votre parfaite conformité face à la Loi de Finances 2025.</p>

    `,
    author: "Nathan OBIANG TIME",
    publishDate: "2026-04-11",
    status: "Publié",
    image: "/lovable-uploads/4d9dc424-4eb4-4aca-aba9-e462d333f67c.png",
    slug: "nouvelles-normes-fiscales-2025",
    tags: ["Fiscalité"],
    seoTitle: "Nouvelles normes fiscales et comptables 2025",
    seoDescription: "Tout ce que vous devez savoir sur la loi de finances 2025 et les nouvelles obligations fiscales.",
  },
  {
    id: -3,
    title: "Impôt Général Synthétique (IGS)",
    excerpt: "IGS, ce qui change.",
    content: `

<h2>Maîtriser le nouvel Impôt Général Synthétique (IGS) au Cameroun : Enjeux et Fonctionnement</h2>

<p>L'architecture fiscale camerounaise connaît une réforme majeure avec l'institution de l'Impôt Général Synthétique (IGS). Cette réforme ambitieuse, issue de la loi portant fiscalité locale promulguée le 23 mars 2024 et dont la mise en application et la sensibilisation se sont fortement intensifiées en 2025, marque un tournant décisif dans l'encadrement fiscal des petites structures commerciales. L'IGS vise à simplifier radicalement les obligations déclaratives des petits opérateurs économiques, à élargir l'assiette fiscale et à accroître significativement les ressources des Collectivités Territoriales Décentralisées (CTD).</p>

<p>Cette véritable révolution fiscale suscite de nombreuses interrogations au sein du tissu économique local. Qui est concerné ? Comment se calcule cet impôt ? Quelles sont les échéances à respecter ? Cet article de fond, conçu par Prisma Gestion, se propose de démystifier l'Impôt Général Synthétique, d'en analyser les enjeux profonds et de guider les entreprises dans son appropriation afin de garantir une transition sereine et conforme aux nouvelles directives de la Direction Générale des Impôts (DGI).</p>

<h3>1. Genèse et Philosophie de la Réforme : Pourquoi l'IGS ?</h3>

<p>Avant l'avènement de l'IGS, les petites entreprises camerounaises naviguaient entre deux régimes principaux : l'impôt libératoire (pour les très petites activités) et le régime simplifié d'imposition (pour les structures intermédiaires). Cette binarité s'accompagnait souvent d'une multiplicité de taxes annexes (patente, licences, taxes communales diverses), générant une charge administrative lourde, complexe à déchiffrer pour un contribuable non averti, et favorisant parfois, involontairement, le secteur informel.</p>

<p>L'introduction de l'Impôt Général Synthétique répond à une philosophie de simplification drastique et d'efficacité de recouvrement. Le concept de "synthétique" implique le regroupement, en un seul et unique prélèvement libératoire, de plusieurs impositions directes et taxes locales préalablement existantes. Il se substitue intégralement à l'impôt libératoire et au régime simplifié d'imposition.</p>

<p>L'objectif avoué du gouvernement est double : d'une part, faciliter la conformité fiscale des opérateurs économiques en leur offrant une visibilité claire sur leurs charges ; d'autre part, optimiser la collecte de l'impôt au profit direct de la décentralisation. Les prévisions gouvernementales tablent en effet sur une collecte supplémentaire de 50 milliards de FCFA annuellement, intégralement reversés aux communes et régions pour financer le développement local.</p>

<h3>2. Le Champ d'Application : Qui est assujetti à l'IGS ?</h3>

<p>L'un des aspects fondamentaux de l'IGS est la définition claire de son champ d'application. L'assujettissement repose principalement sur le critère du chiffre d'affaires.</p>

<p>Sont concernés de plein droit par l'Impôt Général Synthétique, les entreprises individuelles et les personnes morales (sociétés) réalisant un chiffre d'affaires annuel (hors taxes) inférieur ou égal à 50 millions de FCFA. Ce seuil constitue la ligne de démarcation essentielle entre le régime de l'IGS et le régime du bénéfice réel (au-delà de 50 millions).</p>

<p>Cet impôt touche donc la grande majorité du tissu économique camerounais, souvent qualifié de TPE (Très Petites Entreprises) : commerçants de détail, artisans, prestataires de services locaux, transporteurs, professions libérales de petite envergure. L'administration fiscale et les ministères de tutelle (Finances et Décentralisation) mènent d'ailleurs de vastes campagnes de sensibilisation ("cliniques fiscales et douanières", descentes sur le terrain) pour accompagner ces usagers, historiquement éloignés des arcanes comptables complexes, vers la maîtrise de ce nouveau dispositif.</p>

<h3>3. Modalités de calcul et Barème : Comment est déterminé l'IGS ?</h3>

<p>La grande force de l'IGS réside dans la clarté de son mode de calcul. Contrairement à l'Impôt sur le Revenu des Personnes Physiques (IRPP) ou à l'Impôt sur les Sociétés (IS) qui requièrent la détermination d'un bénéfice net (déduction des charges sur le chiffre d'affaires, nécessitant une comptabilité rigoureuse), l'IGS repose sur le chiffre d'affaires brut réalisé ou estimé.</p>

<p>Le calcul s'effectue généralement selon un barème progressif (défini à l'article C40 de la loi). Les contribuables sont classés par catégories en fonction de leur secteur d'activité (commerce général, artisanat, prestations de services, etc.) et de tranches de chiffre d'affaires déclarées. Un montant forfaitaire et annuel est ainsi déterminé pour chaque tranche.</p>

<p>Ce système déclaratif basé sur le chiffre d'affaires responsabilise le contribuable tout en allégeant son fardeau comptable. Il n'est plus obligatoire de présenter des bilans complexes et certifiés pour s'acquitter de ses obligations fiscales (bien qu'une comptabilité de trésorerie minimale reste indispensable pour justifier le niveau d'activité déclaré). Le prélèvement unique simplifie considérablement la gestion financière du chef de la petite entreprise.</p>

<h3>4. Déclarations, Paiements et les Centres de Fiscalité Locale</h3>

<p>La mise en œuvre opérationnelle de l'IGS s'accompagne d'une réorganisation administrative visant la proximité. La création des Centres de Fiscalité Locale et des Particuliers (CFLP) est une pierre angulaire de cette réforme.</p>

<p>Ces nouveaux centres deviennent les interlocuteurs privilégiés exclusifs des contribuables relevant de l'IGS. Leur mission est double : gérer le recouvrement de l'impôt et offrir une assistance technique de proximité aux usagers. L'objectif est de rapprocher l'administration de l'administré dans un esprit de "service public".</p>

<p>Les obligations déclaratives doivent être scrupuleusement respectées. Le paiement de l'IGS est généralement fractionné (trimestriellement ou mensuellement selon les spécifications), ce qui permet de lisser la charge fiscale sur l'année de trésorerie de l'entreprise. Bien que l'impôt soit pensé pour les petites structures, l'administration fiscale camerounaise accélère la digitalisation : la télédéclaration et le télépaiement (via Mobile Money ou virements bancaires) sont fortement encouragés et tendent à devenir la norme, garantissant traçabilité et sécurité des fonds collectés.</p>

<h3>5. Les Enjeux et les Risques pour les Entreprises</h3>

<p>Si la simplicité est l'atout majeur de l'IGS, son application n'est pas exempte d'enjeux et de risques qu'il convient de ne pas sous-estimer.</p>

<p>Le principal défi réside dans l'exactitude de la déclaration du chiffre d'affaires. Une sous-déclaration délibérée ou par négligence expose l'entreprise à des contrôles fiscaux inopinés. Les agents des CFLP disposent de moyens d'investigation pour évaluer le "train de vie" commercial de l'entreprise (volume de stocks, affluence, localisation) et procéder à des redressements si une minoration du chiffre d'affaires est constatée.</p>

<p>De plus, le contribuable assujetti à l'IGS doit veiller à ne pas dépasser le seuil fatidique de 50 millions de FCFA de chiffre d'affaires. En cas de franchissement de ce cap en cours d'année, l'entreprise bascule de facto vers le régime du bénéfice réel dès l'exercice suivant, entraînant des obligations comptables (bilan, liasse fiscale, TVA) d'un niveau d'exigence sans commune mesure.</p>

<p>Enfin, un enjeu majeur est la compréhension de ce que couvre exactement l'IGS. S'il remplace de nombreux impôts, certaines taxes spécifiques (par exemple les droits d'accises, les taxes foncières ou les prélèvements sociaux) peuvent demeurer exigibles en fonction de l'activité. Une méconnaissance du périmètre libératoire de l'IGS peut conduire à des litiges.</p>

<h3>Conclusion : Une transition à préparer sereinement</h3>

<p>L'Impôt Général Synthétique (IGS) s'impose comme une réforme pragmatique et structurante pour le développement économique du Cameroun. Il rationalise le paysage fiscal des TPE, soutient la décentralisation et combat l'économie souterraine par l'incitation à la formalisation.</p>

<p>Cependant, "simplification" ne rime pas avec "absence de règles". La bonne maîtrise de ce nouvel environnement fiscal est essentielle. Les chefs d'entreprise doivent s'informer précisément sur leur catégorie, tenir un registre de leurs recettes de manière rigoureuse, et respecter scrupuleusement les calendriers de paiement auprès des CFLP.</p>

<p>Pour s'assurer d'une parfaite conformité et éviter tout risque de pénalités, il est vivement conseillé de solliciter l'accompagnement de cabinets de conseil ou d'experts-comptables. Les équipes de Prisma Gestion se tiennent à la disposition des TPE et PME pour auditer leur situation, les orienter vers la bonne catégorie d'IGS et les assister dans toutes leurs démarches déclaratives. Adopter l'IGS en connaissance de cause, c'est investir dans la tranquillité de sa gestion quotidienne.</p>

    `,
    author: "Nathan OBIANG TIME",
    publishDate: "2026-04-11",
    status: "Publié",
    image: "/lovable-uploads/a9b4950e-4e9a-4b2d-89ed-55266f59fd49.png",
    slug: "impot-general-synthetique-igs",
    tags: ["Fiscalité"],
    seoTitle: "Impôt Général Synthétique (IGS) : Ce qui change",
    seoDescription: "Découvrez l'Impôt Général Synthétique (IGS), comment il fonctionne et ce qui change pour les entreprises.",
  }
];

// Fonction utilitaire pour obtenir l'image par défaut basée sur le titre
const getDefaultImageForTitle = (title: string): string => {
  if (title.includes("Impôt Général Synthétique") || title.includes("IGS")) {
    return "/lovable-uploads/a9b4950e-4e9a-4b2d-89ed-55266f59fd49.png";
  } else if (title.includes("Les nouvelles normes fiscales")) {
    return "/lovable-uploads/4d9dc424-4eb4-4aca-aba9-e462d333f67c.png";
  } else if (title.includes("Les avantages de la comptabilité")) {
    return "/lovable-uploads/85999c6b-953e-4905-b204-fec3dfc4e72f.png";
  } else if (title.toLowerCase().includes("veille") && title.toLowerCase().includes("impot")) {
    return "/blog-images/veille-impots.jpg";
  } else if (title.toLowerCase().includes("veille") && title.toLowerCase().includes("cnps")) {
    return "/blog-images/veille-cnps.jpg";
  } else if (title.toLowerCase().includes("veille") && title.toLowerCase().includes("legecam")) {
    return "/blog-images/veille-legecam.jpg";
  } else if (title.toLowerCase().includes("veille") && title.toLowerCase().includes("dgicam")) {
    return "/blog-images/veille-dgicam.jpg";
  }
  return "/placeholder.svg";
};

async function seedDefaultBlogPosts(existingSlugs: string[]) {
  for (const post of DEFAULT_BLOG_POSTS) {
    if (!existingSlugs.includes(post.slug)) {
      await supabase.from("blog_posts").insert([{
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        author: post.author,
        publish_date: post.publishDate,
        status: post.status,
        image: post.image,
        slug: post.slug,
        tags: post.tags,
        seo_title: post.seoTitle,
        seo_description: post.seoDescription
      }]);
    }
  }
}

async function ensureDefaultBlogPostsSeeded(): Promise<void> {
  const { data: slugRows, error } = await supabase
    .from("blog_posts")
    .select("slug");

  if (error) {
    console.error("Impossible de vérifier les articles par défaut:", error);
    return;
  }

  const existingSlugs = (slugRows || [])
    .map((row) => row.slug)
    .filter((slug): slug is string => typeof slug === "string");

  await seedDefaultBlogPosts(existingSlugs);
}

export const getBlogPosts = async (): Promise<BlogPost[]> => {
  try {
    await ensureDefaultBlogPostsSeeded();
    console.log("Récupération des articles depuis Supabase...");
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .order('id', { ascending: false });

    if (error) {
      if ((error as { code?: string }).code === 'SUPABASE_DISABLED') {
        return DEFAULT_BLOG_POSTS;
      }
      console.error('Erreur lors de la récupération des articles:', error);
      return [];
    }

    if (!data || data.length === 0) {
      console.log("Aucun article trouvé. Vérifiez la table blog_posts dans Supabase.");
      return [];
    }

    console.log("Données récupérées de Supabase:", data);

    const posts = data.map(post => {
      // Utiliser directement la fonction utilitaire sans appel asynchrone
      const defaultImage = getDefaultImageForTitle(post.title);
      const defaultPost = DEFAULT_BLOG_POSTS.find(p => p.slug === post.slug);
      
      return {
        id: post.id,
        title: post.title,
        excerpt: post.excerpt || defaultPost?.excerpt || "",
        content: post.content || defaultPost?.content || "",
        author: post.author || defaultPost?.author || "",
        publishDate: post.publish_date || defaultPost?.publishDate || new Date().toISOString().split('T')[0],
        status: post.status as BlogPostStatus || defaultPost?.status || "Brouillon",
        image: post.image || defaultImage || defaultPost?.image,
        slug: post.slug || "",
        tags: Array.isArray(post.tags) ? post.tags : defaultPost?.tags || [],
        seoTitle: post.seo_title || defaultPost?.seoTitle || "",
        seoDescription: post.seo_description || defaultPost?.seoDescription || "",
      };
    });

    console.log("Récupération réussie, nombre d'articles:", posts.length);
    return posts;
  } catch (error) {
    console.error('Erreur lors de la récupération des articles:', error);
    return [];
  }
};

export const getPublishedBlogPosts = async (): Promise<BlogPost[]> => {
  try {
    await ensureDefaultBlogPostsSeeded();
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('status', 'Publié')
      .order('id', { ascending: false });

    if (error) {
      if ((error as { code?: string }).code === 'SUPABASE_DISABLED') {
        return DEFAULT_BLOG_POSTS.filter(p => p.status === 'Publié');
      }
      console.error('Erreur lors de la récupération des articles publiés:', error);
      return [];
    }

    if (!data || data.length === 0) {
      console.log('Aucun article publié trouvé dans Supabase.');
      return [];
    }

    return data.map(post => {
      // Utiliser directement la fonction utilitaire sans appel asynchrone
      const defaultImage = getDefaultImageForTitle(post.title);
      const defaultPost = DEFAULT_BLOG_POSTS.find(p => p.slug === post.slug);
      
      return {
        id: post.id,
        title: post.title,
        excerpt: post.excerpt || defaultPost?.excerpt || "",
        content: post.content || defaultPost?.content || "",
        author: post.author || defaultPost?.author || "",
        publishDate: post.publish_date || defaultPost?.publishDate || new Date().toISOString().split('T')[0],
        status: post.status as BlogPostStatus || defaultPost?.status || "Brouillon",
        image: post.image || defaultImage || defaultPost?.image,
        slug: post.slug || "",
        tags: Array.isArray(post.tags) ? post.tags : defaultPost?.tags || [],
        seoTitle: post.seo_title || defaultPost?.seoTitle || "",
        seoDescription: post.seo_description || defaultPost?.seoDescription || "",
      };
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des articles publiés:', error);
    return [];
  }
};

export { getBlogPostBySlug } from './getBlogPost';
