-- Visuels d'articles et contenu des veilles.
--
-- 1. Trois articles pointaient vers /placeholder.svg alors que leur visuel
--    existait dans public/blog-images : ils sont rattachés à leur image.
-- 2. Les visuels hébergés sous /lovable-uploads ont été convertis en JPEG
--    et déplacés sous /blog-images avec des noms explicites.
-- 3. Trois veilles n'avaient qu'un contenu d'amorce (moins de 400 caractères
--    de texte) : elles reçoivent un contenu éditorial complet.

-- 1 & 2 — Visuels des articles
update public.blog_posts set image = '/blog-images/environnement-fiscal-cameroun.jpg' where slug = 'environnement-fiscal-camerounais-cadre-juridique';
update public.blog_posts set image = '/blog-images/reforme-fiscale-2026.jpg' where slug = 'reforme-fiscale-2026-regimes-imposition';
update public.blog_posts set image = '/blog-images/panorama-impots-cameroun.jpg' where slug = 'panorama-impots-taxes-cameroun-2026';
update public.blog_posts set image = '/blog-images/comptabilite-en-ligne.jpg' where slug = 'avantages-comptabilite-en-ligne';
update public.blog_posts set image = '/blog-images/normes-fiscales-2025.jpg' where slug = 'nouvelles-normes-fiscales-2025';
update public.blog_posts set image = '/blog-images/impot-general-synthetique.jpg' where slug = 'impot-general-synthetique-igs';

-- Table de correspondance titre -> visuel
update public.blog_image_mappings set image_path = '/blog-images/impot-general-synthetique.jpg' where title_pattern = 'Impôt Général Synthétique';
update public.blog_image_mappings set image_path = '/blog-images/normes-fiscales-2025.jpg' where title_pattern = 'Les nouvelles normes fiscales et comptables pour 2025';

-- 3 — Contenu éditorial des veilles
update public.blog_posts set content = $veille$
      <h2>Pourquoi suivre les publications de la CNPS</h2>
      <p>La Caisse Nationale de Prévoyance Sociale est l'organisme en charge de la protection sociale des travailleurs au Cameroun : prestations familiales, réparation des risques professionnels, pensions de vieillesse, d'invalidité et de décès. Toute entreprise qui emploie du personnel est en relation directe avec elle, à travers l'immatriculation de ses salariés, ses déclarations périodiques et le versement de ses cotisations.</p>
      <p>Les communiqués, notes et documents diffusés sur cnps.cm ont donc un effet immédiat sur la gestion sociale d'une entreprise : évolution d'une procédure de déclaration, ouverture ou fermeture d'un téléservice, campagne de régularisation, calendrier de dépôt, précision sur une pièce justificative. Une information manquée se traduit fréquemment par un retard, une pénalité ou un dossier de prestation bloqué du côté du salarié.</p>

      <h2>Ce que l'on trouve sur cnps.cm</h2>
      <ul>
        <li><strong>Communiqués officiels</strong> : annonces de portée générale adressées aux employeurs, aux assurés sociaux ou au public.</li>
        <li><strong>Actualités institutionnelles</strong> : événements, partenariats, rencontres, ouverture de nouveaux services ou de nouvelles agences.</li>
        <li><strong>Documentation</strong> : formulaires, guides, notices explicatives et supports téléchargeables utiles au montage des dossiers.</li>
        <li><strong>Informations pratiques</strong> : coordonnées des centres de prévoyance sociale et modalités de contact.</li>
      </ul>

      <div class="bg-gray-50">
        <h3>Accès rapide</h3>
        <ul>
          <li><a href="https://www.cnps.cm/" target="_blank" rel="noopener noreferrer">Page d'accueil cnps.cm</a></li>
          <li><a href="https://www.cnps.cm/actualites/" target="_blank" rel="noopener noreferrer">Rubrique actualités</a></li>
          <li><a href="https://www.cnps.cm/documentation/" target="_blank" rel="noopener noreferrer">Rubrique documentation</a></li>
        </ul>
      </div>

      <h2>Une méthode de veille en cinq étapes</h2>
      <ol>
        <li><strong>Partir de la source officielle.</strong> Une information sociale ne se reprend jamais depuis une capture d'écran ou un relais isolé. Elle se vérifie sur le site institutionnel lui-même, ou à défaut sur un support officiel identifiable.</li>
        <li><strong>Dater la consultation.</strong> Les rubriques d'actualité évoluent sans historique stable. Noter la date à laquelle la publication a été consultée, et conserver le lien direct, sécurise tout le travail éditorial qui suivra.</li>
        <li><strong>Qualifier la nature du contenu.</strong> S'agit-il d'un communiqué à portée obligatoire, d'une information pratique, d'une actualité institutionnelle ou d'un simple rappel ? Le format de restitution en dépend.</li>
        <li><strong>Mesurer l'impact pour l'employeur.</strong> La question à trancher est toujours la même : cette publication modifie-t-elle une obligation, une échéance, une procédure ou un montant à verser ?</li>
        <li><strong>Choisir le bon format.</strong> Une brève suffit pour une information neutre. Un changement de procédure ou d'échéance mérite une alerte adressée aux clients concernés.</li>
      </ol>

      <h2>Grille de qualification d'une publication</h2>
      <ol>
        <li><strong>Source</strong> : rubrique exacte du site cnps.cm.</li>
        <li><strong>Date de consultation</strong> : date à laquelle l'information a été vérifiée.</li>
        <li><strong>Nature</strong> : communiqué, procédure, actualité, document téléchargeable ou information pratique.</li>
        <li><strong>Public concerné</strong> : employeurs, salariés, travailleurs indépendants, retraités ou ayants droit.</li>
        <li><strong>Effet pratique</strong> : déclaration, cotisation, échéance, pièce justificative ou prestation.</li>
        <li><strong>Action recommandée</strong> : informer, archiver, alerter un client ou engager une régularisation.</li>
      </ol>

      <h2>Les réflexes de conformité sociale à conserver</h2>
      <p>La veille ne remplace pas la discipline déclarative. Les fondamentaux restent les mêmes : immatriculer chaque salarié dès son embauche, déclarer les rémunérations selon la périodicité applicable à l'entreprise, verser les cotisations dans les délais, et conserver les justificatifs de versement. La veille sert à détecter ce qui change autour de ces obligations, pas à les redécouvrir.</p>
      <p>Une attention particulière doit être portée aux périodes de campagne : régularisations, opérations de mise à jour des données des assurés, ou déploiement de nouveaux téléservices. Ce sont les moments où une information non captée coûte le plus cher.</p>

      <h2>Recommandation PRISMA GESTION</h2>
      <p>Nous recommandons une consultation hebdomadaire des rubriques actualités et documentation de cnps.cm, et une vérification systématique avant chaque échéance déclarative. Toute publication ayant un effet sur les obligations de l'employeur doit être archivée avec sa date de consultation, puis transformée en brève ou en alerte selon son importance.</p>
      <p>Nos équipes accompagnent les entreprises sur l'ensemble de la chaîne : immatriculation, déclarations, contrôle de cohérence entre paie et cotisations, et traitement des dossiers de prestations. En cas de doute sur la portée d'une publication, n'hésitez pas à nous solliciter.</p>
    $veille$ where slug = 'veille-cnps-cm-dernieres-actualites';
update public.blog_posts set content = $veille$
      <h2>Pourquoi surveiller legecam.cm</h2>
      <p>La veille institutionnelle ne se limite pas aux administrations fiscales et sociales. Les organisations patronales publient elles aussi des documents, des positions et des annonces qui éclairent l'environnement dans lequel évoluent les entreprises camerounaises. Le site legecam.cm fait partie de ces sources à consulter régulièrement.</p>
      <p>L'intérêt de cette source est différent de celui d'un site administratif : elle ne crée pas d'obligation, mais elle signale les sujets qui montent, les difficultés remontées par les entreprises et les échanges en cours avec les pouvoirs publics. Pour un dirigeant, c'est un indicateur avancé : un thème qui apparaît dans le débat patronal se retrouve souvent, quelques mois plus tard, dans un texte réglementaire.</p>

      <h2>Ce que l'on trouve sur legecam.cm</h2>
      <ul>
        <li><strong>Actualités</strong> : comptes rendus d'événements, rencontres institutionnelles, prises de parole publiques.</li>
        <li><strong>Documents</strong> : notes, études, supports de travail et publications mises à disposition en téléchargement.</li>
        <li><strong>Annonces</strong> : invitations, appels à participation, sessions de formation et rendez-vous professionnels.</li>
      </ul>

      <div class="bg-gray-50">
        <h3>Accès rapide</h3>
        <ul>
          <li><a href="https://legecam.cm/" target="_blank" rel="noopener noreferrer">Page d'accueil legecam.cm</a></li>
          <li><a href="https://legecam.cm/category/actualites/" target="_blank" rel="noopener noreferrer">Rubrique actualités</a></li>
          <li><a href="https://legecam.cm/category/documents/" target="_blank" rel="noopener noreferrer">Rubrique documents</a></li>
        </ul>
      </div>

      <h2>Une méthode de veille en cinq étapes</h2>
      <ol>
        <li><strong>Balayer les trois rubriques.</strong> Actualités, documents et annonces ne se recoupent pas : un document de travail peut être mis en ligne sans faire l'objet d'une actualité, et inversement.</li>
        <li><strong>Distinguer la position de la norme.</strong> Une prise de position patronale n'est pas une règle applicable. Cette distinction doit être explicite dans toute reprise, au risque d'induire un lecteur en erreur.</li>
        <li><strong>Identifier le secteur visé.</strong> Certaines publications concernent l'ensemble des entreprises, d'autres une filière précise. Le tri en amont évite d'alerter inutilement des clients non concernés.</li>
        <li><strong>Conserver le document source.</strong> Les documents mis en ligne peuvent être retirés ou remplacés. Télécharger le fichier et noter la date de consultation garantit la traçabilité de l'analyse.</li>
        <li><strong>Croiser avec les sources officielles.</strong> Un sujet repéré ici gagne à être recoupé avec les publications de l'administration avant toute conclusion opérationnelle.</li>
      </ol>

      <h2>Grille de qualification d'une publication</h2>
      <ol>
        <li><strong>Source</strong> : rubrique exacte et intitulé de la publication.</li>
        <li><strong>Date de consultation</strong> : date à laquelle le contenu a été relevé.</li>
        <li><strong>Nature</strong> : actualité, document de travail, position, annonce ou invitation.</li>
        <li><strong>Portée</strong> : informative, sectorielle ou générale.</li>
        <li><strong>Public concerné</strong> : dirigeants, PME, grandes entreprises, filière spécifique.</li>
        <li><strong>Suite à donner</strong> : archiver, relayer, approfondir ou surveiller l'évolution du sujet.</li>
      </ol>

      <h2>Articuler cette veille avec les autres sources</h2>
      <p>Cette veille prend tout son sens en complément des suivis réglementaires. Les publications de l'administration fiscale indiquent ce qui s'applique ; celles de la Caisse Nationale de Prévoyance Sociale, ce qui s'impose en matière sociale ; les sources patronales, elles, indiquent ce qui se discute. Les trois ensemble donnent une lecture complète de l'environnement des entreprises.</p>
      <p>Concrètement, un sujet qui apparaît simultanément dans deux de ces trois canaux mérite une attention renforcée : c'est le signe qu'il quitte le champ du débat pour entrer dans celui de la mise en œuvre.</p>

      <h2>Recommandation PRISMA GESTION</h2>
      <p>Nous recommandons une consultation hebdomadaire des rubriques actualités et documents, avec archivage systématique des fichiers téléchargeables et de leur date de consultation. Chaque sujet identifié comme structurant doit être suivi dans la durée plutôt que traité comme une information isolée.</p>
      <p>Nos équipes assurent ce suivi pour le compte de leurs clients et le restituent sous forme de notes de synthèse adaptées à leur secteur d'activité.</p>
    $veille$ where slug = 'veille-legecam-cm-documents-annonces';
update public.blog_posts set content = $veille$
      <h2>Une source institutionnelle qui passe par les réseaux sociaux</h2>
      <p>La veille institutionnelle ne se limite plus aux communiqués publiés sur les sites web officiels. De nombreuses organisations professionnelles utilisent également les réseaux sociaux pour relayer des informations, annoncer des événements, diffuser des prises de position ou attirer l'attention des entreprises sur un sujet d'actualité. La page Facebook officielle de la DGICAM fait partie de ces canaux à surveiller régulièrement.</p>
      <p>Pour les dirigeants, responsables administratifs, experts-comptables, fiscalistes et juristes d'entreprise, suivre cette page permet de capter rapidement les signaux utiles à la vie économique camerounaise. Une publication peut annoncer une rencontre institutionnelle, une position patronale, une alerte sectorielle, un événement, un partenariat ou une information susceptible d'intéresser les entreprises.</p>

      <div class="bg-gray-50">
        <h3>Lien direct</h3>
        <ul>
          <li><a href="https://www.facebook.com/DGICAM" target="_blank" rel="noopener noreferrer">Page Facebook officielle DGICAM</a></li>
        </ul>
      </div>

      <h2>1. Vérifier la source</h2>
      <p>La première étape d'une bonne veille consiste à vérifier la source. L'information doit provenir de la page officielle identifiée, et non d'une republication isolée ou d'une capture d'écran sortie de son contexte. Cette vérification est essentielle avant toute reprise dans une note, une alerte client ou un article de blog.</p>

      <h2>2. Qualifier la publication</h2>
      <p>Il faut ensuite déterminer s'il s'agit d'une simple annonce, d'un communiqué à portée générale, d'une information sectorielle, d'une prise de position, d'une invitation à un événement ou d'un sujet susceptible d'avoir des conséquences fiscales, sociales, économiques ou réglementaires. Cette qualification permet de choisir le bon format éditorial.</p>

      <h2>3. Analyser l'impact pour les entreprises</h2>
      <p>Une publication DGICAM peut intéresser les membres d'une organisation patronale, les PME, les grandes entreprises, les investisseurs, les prestataires, les cabinets de conseil ou les partenaires institutionnels. L'article de veille doit donc répondre à une question simple : pourquoi cette publication mérite-t-elle l'attention des entreprises ?</p>
      <p>Lorsque la publication est essentiellement informative, une brève de veille peut suffire. Lorsqu'elle soulève un enjeu économique, fiscal, social ou réglementaire, il est préférable de produire un article plus complet, avec contexte, analyse, conséquences pratiques et recommandations. Cette distinction évite de surcharger le blog tout en conservant une veille utile.</p>

      <h2>4. Tenir compte de la volatilité du support</h2>
      <p>La veille sur les réseaux sociaux impose une précaution supplémentaire : les publications peuvent être modifiées, commentées, masquées ou difficiles à retrouver dans le fil. Il est donc recommandé de conserver la date de consultation, le lien direct vers la publication lorsqu'il est disponible, une capture interne à usage documentaire et une synthèse des points clés. Cette méthode sécurise le travail éditorial.</p>

      <h2>Modèle de traitement éditorial recommandé</h2>
      <p>Pour chaque publication jugée pertinente, l'équipe éditoriale peut utiliser la grille suivante :</p>
      <ol>
        <li><strong>Source</strong> : page Facebook officielle DGICAM.</li>
        <li><strong>Date de consultation</strong> : date à laquelle la publication a été vérifiée.</li>
        <li><strong>Nature de l'information</strong> : annonce, communiqué, événement, position, alerte ou information sectorielle.</li>
        <li><strong>Public concerné</strong> : PME, grandes entreprises, fiscalistes, RH, juristes, dirigeants, investisseurs ou secteurs spécifiques.</li>
        <li><strong>Impact potentiel</strong> : fiscal, social, économique, réglementaire, commercial ou institutionnel.</li>
        <li><strong>Format conseillé</strong> : brève de veille, article d'analyse, alerte pratique ou note interne.</li>
        <li><strong>Action recommandée</strong> : suivre, relayer, analyser, contacter un conseil ou préparer une mise en conformité.</li>
      </ol>

      <h2>Une rubrique complémentaire des autres veilles</h2>
      <p>Pour PRISMA GESTION, la veille DGICAM constitue un complément aux veilles fiscales et sociales. Elle permet de suivre l'environnement des entreprises au-delà de la fiscalité stricte, en intégrant les signaux patronaux, économiques et institutionnels. Un même sujet repéré à la fois sur ce canal et dans une publication administrative mérite systématiquement un traitement approfondi.</p>

      <h2>Recommandation PRISMA GESTION</h2>
      <p>Nous recommandons de consulter la page Facebook DGICAM au moins une fois par semaine, et à chaque période d'actualité économique importante. Toute publication ayant un impact potentiel sur les entreprises doit être archivée, qualifiée, puis transformée en brève ou en article selon son importance.</p>
    $veille$ where slug = 'veille-facebook-dgicam-derniere-publication';

-- Extrait et mots-clés de l'article IGS (extrait de 19 caractères, un seul tag)
update public.blog_posts set excerpt = $igs$Seuil d'application, caractère libératoire, obligations déclaratives et abattements : ce que l'Impôt Général Synthétique change pour les entreprises et les indépendants.$igs$,
       tags = array['Fiscalité', 'IGS', 'Cameroun']::text[]
 where slug = 'impot-general-synthetique-igs';
