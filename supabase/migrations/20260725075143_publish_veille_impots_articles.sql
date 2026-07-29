-- Publication des cinq articles de la veille impots.cm du 16 juin 2026
-- restés dans articles/veille-impots-cm sans jamais être mis en ligne.
--
-- Les trois autres fichiers du dossier (DSF en ligne, circulaire LF 2026,
-- taxe foncière) ne sont pas repris : leurs sujets sont déjà traités par
-- l'article « Veille impots.cm » du 1er juillet 2026, et le rappel taxe
-- foncière annonce une échéance au 30 juin désormais dépassée.
--
-- La date de publication retenue est celle de la veille d'origine
-- (16/06/2026) et non la date de mise en ligne, pour ne pas présenter
-- ces contenus comme une actualité plus fraîche qu'ils ne le sont.

insert into public.blog_posts
  (title, excerpt, content, author, publish_date, status, image, slug, tags, seo_title, seo_description)
values (
  'Nouvelle plateforme d''enregistrement de la commande publique : ce que les entreprises doivent savoir',
  'La DGI met en avant une plateforme dédiée à l''enregistrement de la commande publique. Ce que les entreprises attributaires de marchés publics doivent préparer et conserver.',
  $art$
      <h2>Un nouveau service numérique de la DGI</h2>
      <p>La Direction Générale des Impôts du Cameroun poursuit la digitalisation des démarches fiscales avec la mise en avant d'une plateforme dédiée à l'enregistrement de la commande publique. Cette évolution intéresse particulièrement les entreprises qui travaillent avec l'État, les collectivités territoriales, les établissements publics et les administrations contractantes.</p>
      <h2>Quelles opérations sont concernées</h2>
      <p>L'enregistrement de la commande publique concerne les actes liés aux marchés publics, lettres-commandes, bons de commande et autres engagements contractuels relevant de la dépense publique. Pour les entreprises attributaires, cette formalité n'est pas un simple détail administratif : elle conditionne la régularité fiscale de l'opération et peut être demandée dans le cadre du suivi d'exécution, du paiement ou du contrôle.</p>
      <div class="bg-gray-50">
        <h3>Liens et documents d'appui</h3>
        <ul>
          <li><a href="https://www.impots.cm/fr" target="_blank" rel="noopener noreferrer">Page officielle DGI</a></li>
          <li><a href="https://registrations.dgi.cm" target="_blank" rel="noopener noreferrer">Plateforme Commande publique</a></li>
        </ul>
      </div>
      <p>La plateforme numérique vise à simplifier et sécuriser cette procédure. Elle permet de centraliser les informations, d'améliorer la traçabilité et de réduire les déplacements physiques. Les entreprises doivent toutefois préparer soigneusement leurs dossiers avant toute saisie : identification fiscale, références du marché ou de la commande, pièces contractuelles, informations sur l'administration contractante et justificatifs nécessaires.</p>
      <h2>La digitalisation ne dispense pas de la conformité</h2>
      <p>Cette digitalisation ne supprime pas l'exigence de conformité. Au contraire, elle rend les opérations plus traçables. Une erreur dans les informations saisies, une omission ou un défaut d'enregistrement peut entraîner des retards dans le traitement du dossier, des difficultés de paiement ou des observations lors d'un contrôle fiscal.</p>
      <h2>Mettre en place une procédure interne</h2>
      <p>Les entreprises concernées doivent donc mettre en place une procédure interne claire. Avant tout enregistrement, il est recommandé de vérifier la cohérence entre le contrat, les informations fiscales de l'entreprise, le montant de la commande et les pièces justificatives. Après l'opération, les preuves d'enregistrement et de paiement doivent être conservées dans le dossier fiscal et comptable du marché.</p>
      <p>Pour les directions administratives et financières, cette nouvelle plateforme constitue aussi une opportunité : elle permet de mieux organiser les dossiers de marchés publics, de suivre les formalités en temps réel et de limiter les risques de perte de documents. Les cabinets comptables et conseils fiscaux peuvent accompagner leurs clients dans la préparation, la vérification et l'archivage des dossiers.</p>
      <h2>Le réflexe à adopter</h2>
      <p>En pratique, toute entreprise engagée dans la commande publique devrait intégrer ce nouveau réflexe : consulter la plateforme dédiée, préparer les pièces avant la saisie, contrôler les informations transmises et conserver les preuves. La conformité fiscale devient ainsi un élément de bonne gestion du marché public, au même titre que le respect des délais, des clauses contractuelles et des obligations comptables.</p>
      <h2>Recommandation PRISMA GESTION</h2>
      <p>PRISMA GESTION recommande aux entreprises titulaires ou candidates à des marchés publics de créer une checklist d'enregistrement de la commande publique et de désigner un responsable interne du suivi fiscal des marchés. Cette organisation réduit les retards, sécurise les paiements et renforce la crédibilité de l'entreprise auprès des administrations.</p>
    $art$,
  'PRISMA GESTION', '2026-06-16', 'Publié', '/blog-images/veille-impots.jpg', 'commande-publique-enregistrement-plateforme-dgi',
  array['Veille réglementaire', 'Fiscalité', 'Marchés publics']::text[], 'Nouvelle plateforme d''enregistrement de la commande publique : ce que les entreprises doivent savoir', 'Enregistrement de la commande publique au Cameroun : opérations concernées, pièces à préparer et procédure interne à mettre en place.'
)
on conflict (slug) do update set
  title = excluded.title, excerpt = excluded.excerpt, content = excluded.content,
  author = excluded.author, publish_date = excluded.publish_date, status = excluded.status,
  image = excluded.image, tags = excluded.tags,
  seo_title = excluded.seo_title, seo_description = excluded.seo_description;

insert into public.blog_posts
  (title, excerpt, content, author, publish_date, status, image, slug, tags, seo_title, seo_description)
values (
  'Déclaration annuelle des revenus des particuliers : rappel des obligations et démarches à effectuer',
  'Salaires, loyers, revenus financiers ou activité indépendante : rappel des obligations déclaratives des particuliers et des justificatifs à réunir.',
  $art$
      <h2>Pourquoi cette déclaration existe</h2>
      <p>La déclaration annuelle des revenus des particuliers est une obligation fiscale importante. Elle permet à l'administration fiscale de disposer d'une vision complète des revenus perçus par le contribuable au cours de l'année et de vérifier la cohérence de sa situation fiscale.</p>
      <h2>Une obligation qui ne vise pas que les entreprises</h2>
      <p>Contrairement à une idée répandue, cette déclaration ne concerne pas uniquement les entreprises. Les particuliers peuvent être tenus de déclarer leurs revenus lorsqu'ils perçoivent des salaires, pensions, revenus fonciers, revenus de capitaux mobiliers, bénéfices professionnels, revenus d'activités indépendantes ou plusieurs catégories de revenus à la fois.</p>
      <div class="bg-gray-50">
        <h3>Liens et documents d'appui</h3>
        <ul>
          <li><a href="https://teledeclaration-dgi.cm" target="_blank" rel="noopener noreferrer">Service de télédéclaration DGI</a></li>
          <li><a href="https://www.impots.cm/fr" target="_blank" rel="noopener noreferrer">Page officielle DGI</a></li>
        </ul>
      </div>
      <p>La retenue à la source opérée sur certains revenus ne dispense pas toujours le contribuable de vérifier ses obligations déclaratives. Un salarié qui dispose également de loyers, d'une activité indépendante ou de revenus financiers doit s'assurer que l'ensemble de sa situation est correctement déclaré. Cette vérification est d'autant plus importante lorsque le contribuable sollicite une Attestation de Conformité Fiscale, un financement bancaire, un visa, un dossier administratif ou une participation à un appel d'offres.</p>
      <h2>Les prérequis et les justificatifs</h2>
      <p>La première étape consiste à disposer d'un Numéro d'Identifiant Unique à jour et d'un accès au service de télédéclaration. Le contribuable doit ensuite réunir les justificatifs utiles : bulletins de paie, attestations de retenue, contrats de bail, relevés de revenus, informations bancaires, documents professionnels et tout élément permettant d'expliquer l'origine des revenus déclarés.</p>
      <p>L'objectif n'est pas seulement de remplir un formulaire. Il s'agit de présenter une situation cohérente, documentée et conforme. Une omission, une erreur de catégorie ou une incohérence entre les revenus déclarés et les documents disponibles peut entraîner des demandes de clarification ou des difficultés ultérieures.</p>
      <h2>Avant, pendant et après la déclaration</h2>
      <p>Les particuliers doivent donc adopter une démarche proactive. Avant la déclaration, il faut recenser toutes les sources de revenus. Pendant la déclaration, il faut vérifier l'exactitude des informations saisies. Après la déclaration, il faut conserver l'accusé, les justificatifs et les éventuelles preuves de paiement.</p>
      <p>Cette obligation est aussi une opportunité de mieux organiser sa situation fiscale personnelle. Une déclaration correctement préparée facilite les démarches administratives, réduit les risques de contentieux et contribue à une meilleure visibilité financière.</p>
      <h2>Recommandation PRISMA GESTION</h2>
      <p>PRISMA GESTION recommande aux particuliers disposant de revenus multiples de réaliser un mini-audit fiscal personnel avant toute déclaration annuelle. Cette revue permet d'identifier les revenus oubliés, les justificatifs manquants et les incohérences à corriger avant transmission.</p>
    $art$,
  'PRISMA GESTION', '2026-06-16', 'Publié', '/blog-images/veille-impots.jpg', 'declaration-annuelle-revenus-particuliers',
  array['Veille réglementaire', 'Fiscalité', 'Particuliers']::text[], 'Déclaration annuelle des revenus des particuliers : rappel des obligations et démarches à effectuer', 'Déclaration annuelle des revenus des particuliers au Cameroun : qui déclare, quels revenus, quels justificatifs et sur quelle plateforme.'
)
on conflict (slug) do update set
  title = excluded.title, excerpt = excluded.excerpt, content = excluded.content,
  author = excluded.author, publish_date = excluded.publish_date, status = excluded.status,
  image = excluded.image, tags = excluded.tags,
  seo_title = excluded.seo_title, seo_description = excluded.seo_description;

insert into public.blog_posts
  (title, excerpt, content, author, publish_date, status, image, slug, tags, seo_title, seo_description)
values (
  'Contribution des patentes : clarification pour les établissements privés d''enseignement et de santé',
  'Écoles privées, instituts de formation, cliniques et centres de santé : comment déterminer le régime de patente applicable et documenter sa position.',
  $art$
      <h2>Un régime à clarifier pour deux secteurs sensibles</h2>
      <p>La contribution des patentes est une obligation fiscale liée à l'exercice d'une activité professionnelle, commerciale ou assimilée. La clarification de son régime applicable aux établissements privés d'enseignement et de santé mérite une attention particulière, car ces secteurs combinent souvent mission sociale, activité économique et obligations fiscales.</p>
      <h2>Quels établissements sont concernés</h2>
      <p>Les établissements laïcs d'enseignement, les écoles privées, les instituts de formation, les cliniques, les cabinets médicaux et certains centres de santé peuvent être concernés selon la nature de leurs activités, leur organisation juridique et leur régime fiscal. La difficulté réside souvent dans la distinction entre activité d'intérêt général et activité soumise à des obligations fiscales ordinaires.</p>
      <div class="bg-gray-50">
        <h3>Liens et documents d'appui</h3>
        <ul>
          <li><a href="https://www.impots.cm/fr" target="_blank" rel="noopener noreferrer">Page officielle DGI</a></li>
        </ul>
      </div>
      <h2>L'enjeu : déterminer le bon régime</h2>
      <p>Pour les gestionnaires d'établissements, l'enjeu est de déterminer correctement le régime applicable. Une mauvaise interprétation peut conduire à une absence de déclaration, à un paiement insuffisant ou à une contestation lors d'un contrôle. À l'inverse, une application excessive peut créer une charge inutile ou mal évaluée.</p>
      <h2>Trois démarches à conduire</h2>
      <p>La première démarche consiste à vérifier l'immatriculation fiscale de l'établissement, sa forme juridique, son régime d'imposition et les activités effectivement exercées. Un établissement peut proposer des services annexes, percevoir des frais, employer du personnel, louer des locaux ou réaliser des opérations qui ont des implications fiscales spécifiques.</p>
      <p>La deuxième démarche consiste à conserver une documentation claire : autorisations administratives, statuts, documents fiscaux, contrats, comptabilité, informations sur les recettes et justificatifs de paiement. Cette documentation permet de justifier la position adoptée face à l'administration.</p>
      <p>La troisième démarche consiste à anticiper les échéances. Les établissements privés d'enseignement et de santé doivent intégrer la patente dans leur calendrier fiscal et budgétaire. Le paiement tardif ou l'omission peut entraîner des pénalités et perturber les démarches administratives.</p>
      <h2>Une occasion de renforcer la gouvernance fiscale</h2>
      <p>Cette clarification est aussi une occasion de renforcer la gouvernance fiscale de ces structures. Beaucoup d'établissements se concentrent sur leur mission pédagogique ou sanitaire, mais la conformité fiscale fait partie de leur pérennité. Une organisation fiscale claire protège l'établissement, ses dirigeants et sa réputation.</p>
      <h2>Recommandation PRISMA GESTION</h2>
      <p>PRISMA GESTION recommande aux établissements privés d'enseignement et de santé de réaliser une revue de leur situation fiscale, notamment sur la patente, l'immatriculation, les déclarations périodiques et les justificatifs disponibles. Cette revue doit être faite avant tout contrôle ou renouvellement administratif sensible.</p>
    $art$,
  'PRISMA GESTION', '2026-06-16', 'Publié', '/blog-images/veille-impots.jpg', 'contribution-patentes-enseignement-sante-prives',
  array['Veille réglementaire', 'Fiscalité', 'Patente']::text[], 'Contribution des patentes : clarification pour les établissements privés d''enseignement et de santé', 'Contribution des patentes pour les établissements privés d''enseignement et de santé au Cameroun : régime applicable, documentation et échéances.'
)
on conflict (slug) do update set
  title = excluded.title, excerpt = excluded.excerpt, content = excluded.content,
  author = excluded.author, publish_date = excluded.publish_date, status = excluded.status,
  image = excluded.image, tags = excluded.tags,
  seo_title = excluded.seo_title, seo_description = excluded.seo_description;

insert into public.blog_posts
  (title, excerpt, content, author, publish_date, status, image, slug, tags, seo_title, seo_description)
values (
  'Liste des contribuables inactifs : quels risques et comment régulariser sa situation ?',
  'Figurer sur la liste des contribuables inactifs bloque l''Attestation de Conformité Fiscale et fragilise les relations bancaires et commerciales. Comment vérifier et régulariser.',
  $art$
      <h2>Ce que signifie figurer sur la liste</h2>
      <p>La publication d'une liste de contribuables inactifs est un signal important pour les entreprises et les particuliers exerçant une activité économique. Être considéré comme inactif par l'administration fiscale peut avoir des conséquences sérieuses sur la vie administrative, commerciale et financière du contribuable.</p>
      <h2>Comment devient-on inactif</h2>
      <p>Un contribuable peut être considéré comme inactif lorsque sa situation fiscale ne reflète plus une activité déclarée régulière ou lorsque certaines obligations ne sont pas remplies. Les causes peuvent varier : absence de déclarations, cessation d'activité non formalisée, changement d'adresse non signalé, défaut de paiement ou incohérence dans les informations fiscales.</p>
      <div class="bg-gray-50">
        <h3>Liens et documents d'appui</h3>
        <ul>
          <li><a href="https://www.impots.cm/fr/actualites/liste-des-contribuables-inactifs" target="_blank" rel="noopener noreferrer">Liste des contribuables inactifs</a></li>
        </ul>
      </div>
      <h2>Des conséquences administratives et commerciales</h2>
      <p>Les conséquences peuvent être importantes. Une entreprise inscrite comme inactive peut rencontrer des difficultés pour obtenir certains documents fiscaux, notamment une Attestation de Conformité Fiscale. Elle peut aussi être fragilisée dans ses relations avec les clients, fournisseurs, banques ou administrations publiques. Dans certains cas, cette situation peut compromettre la participation à un appel d'offres ou le paiement d'une prestation.</p>
      <h2>Première réaction : vérifier</h2>
      <p>La première réaction doit être la vérification. Le contribuable doit consulter la publication, contrôler son identification fiscale et rapprocher cette information avec sa situation réelle. Si l'entreprise est effectivement inactive, il faut vérifier si une cessation ou suspension d'activité doit être formalisée. Si l'entreprise est active, il faut identifier l'origine de l'anomalie.</p>
      <h2>Comment régulariser</h2>
      <p>La régularisation peut impliquer le dépôt de déclarations manquantes, le paiement d'arriérés, la mise à jour des informations administratives, la demande de réactivation ou la production de justificatifs. Il est recommandé de contacter le centre des impôts compétent et de conserver toutes les preuves de démarche.</p>
      <p>Pour les dirigeants, cette situation doit être traitée rapidement. Plus elle dure, plus elle peut créer de blocages. Une entreprise active qui reste administrativement inactive prend un risque fiscal et commercial inutile.</p>
      <h2>La prévention</h2>
      <p>La prévention repose sur une discipline simple : déclarer régulièrement, payer dans les délais, mettre à jour ses informations, conserver les preuves et vérifier périodiquement sa situation fiscale.</p>
      <h2>Recommandation PRISMA GESTION</h2>
      <p>PRISMA GESTION recommande aux entreprises de vérifier leur statut fiscal au moins une fois par trimestre et avant toute démarche sensible : demande d'ACF, réponse à un appel d'offres, dossier bancaire, renouvellement d'agrément ou signature d'un marché public.</p>
    $art$,
  'PRISMA GESTION', '2026-06-16', 'Publié', '/blog-images/veille-impots.jpg', 'liste-contribuables-inactifs-regularisation',
  array['Veille réglementaire', 'Conformité', 'Fiscalité']::text[], 'Liste des contribuables inactifs : quels risques et comment régulariser sa situation ?', 'Liste des contribuables inactifs publiée par la DGI : causes, conséquences pratiques et démarches de régularisation.'
)
on conflict (slug) do update set
  title = excluded.title, excerpt = excluded.excerpt, content = excluded.content,
  author = excluded.author, publish_date = excluded.publish_date, status = excluded.status,
  image = excluded.image, tags = excluded.tags,
  seo_title = excluded.seo_title, seo_description = excluded.seo_description;

insert into public.blog_posts
  (title, excerpt, content, author, publish_date, status, image, slug, tags, seo_title, seo_description)
values (
  'Charte du contribuable : droits et garanties à connaître en cas de contrôle fiscal',
  'Information, assistance, débat contradictoire, recours : les quatre garanties dont dispose tout contribuable en cas de contrôle fiscal.',
  $art$
      <h2>Un document de référence pour le contribuable</h2>
      <p>La Charte du contribuable est un document essentiel pour comprendre les droits et garanties dont dispose tout contribuable dans ses relations avec l'administration fiscale. Elle est particulièrement importante en cas de contrôle fiscal, moment souvent sensible pour les entreprises et les particuliers.</p>
      <h2>Un contrôle fiscal est une procédure encadrée</h2>
      <p>Un contrôle fiscal ne doit pas être abordé dans la panique. Il s'agit d'une procédure encadrée, avec des règles, des délais, des droits et des obligations. Le contribuable doit coopérer avec l'administration, mais il a également le droit d'être informé, de préparer sa défense, de se faire assister et d'utiliser les voies de recours prévues.</p>
      <div class="bg-gray-50">
        <h3>Liens et documents d'appui</h3>
        <ul>
          <li><a href="https://www.impots.cm/fr/actualites/charte-du-controbuable-au-1er-janvier-2026" target="_blank" rel="noopener noreferrer">Page DGI</a></li>
          <li><a href="https://impots.cm/sites/default/files/documents/CHARTE%20DU%20CONTRIBUABLE%20MAJ%20au%2001%20janvier%202026.pdf" target="_blank" rel="noopener noreferrer">PDF officiel</a></li>
        </ul>
      </div>
      <h2>Première garantie : l'information</h2>
      <p>La première garantie est l'information. Selon la nature du contrôle, le contribuable peut recevoir un avis ou une notification précisant l'objet de la procédure. Cette information lui permet de préparer les documents nécessaires : comptabilité, factures, déclarations, contrats, relevés, justificatifs de paiement et correspondances avec l'administration.</p>
      <h2>Deuxième garantie : l'assistance</h2>
      <p>La deuxième garantie est l'assistance. Le contribuable peut se faire accompagner par un conseil, un expert-comptable, un fiscaliste ou toute personne compétente. Cette assistance est importante pour répondre correctement aux demandes, éviter les contradictions et présenter une documentation structurée.</p>
      <h2>Troisième garantie : le débat contradictoire</h2>
      <p>La troisième garantie concerne le débat contradictoire. Le contribuable doit pouvoir expliquer sa position, produire des justificatifs et répondre aux observations. Une bonne préparation documentaire facilite ce dialogue et limite les risques de redressement infondé ou mal compris.</p>
      <h2>Quatrième garantie : les recours</h2>
      <p>La quatrième garantie concerne les recours. En cas de désaccord, le contribuable peut utiliser les voies prévues pour contester, demander une clarification ou présenter une réclamation. Ces démarches doivent respecter les délais et les formes exigés.</p>
      <h2>La meilleure protection reste l'organisation</h2>
      <p>Pour les entreprises, la meilleure protection reste l'organisation. Une comptabilité à jour, des déclarations cohérentes, des justificatifs classés et une procédure interne de réponse aux contrôles sont des éléments déterminants. Pour les particuliers, il est tout aussi important de conserver les preuves des revenus déclarés, paiements effectués et démarches administratives.</p>
      <h2>Recommandation PRISMA GESTION</h2>
      <p>PRISMA GESTION recommande à chaque entreprise de constituer un dossier permanent de contrôle fiscal comprenant les statuts, NIU, déclarations, DSF, preuves de paiement, contrats importants, documents sociaux et correspondances fiscales. Ce dossier doit être mis à jour régulièrement.</p>
    $art$,
  'PRISMA GESTION', '2026-06-16', 'Publié', '/blog-images/veille-impots.jpg', 'charte-contribuable-controle-fiscal',
  array['Veille réglementaire', 'Contrôle fiscal', 'Fiscalité']::text[], 'Charte du contribuable : droits et garanties à connaître en cas de contrôle fiscal', 'Charte du contribuable au 1er janvier 2026 : droits, garanties et voies de recours pendant un contrôle fiscal au Cameroun.'
)
on conflict (slug) do update set
  title = excluded.title, excerpt = excluded.excerpt, content = excluded.content,
  author = excluded.author, publish_date = excluded.publish_date, status = excluded.status,
  image = excluded.image, tags = excluded.tags,
  seo_title = excluded.seo_title, seo_description = excluded.seo_description;