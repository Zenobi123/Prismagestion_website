# Audit complet & stratégie commerciale offensive — PRISMA GESTION

> **Périmètre** : les deux actifs numériques du cabinet
> 1. **Site vitrine** — `Prisma-Gestion_website` (acquisition / génération de demande)
> 2. **Application métier** — `prisma-taskmaster-planner` (production / rétention / base clients)
>
> **Objectif** : mettre en place une **stratégie commerciale offensive** — c.-à-d. passer d'une présence en ligne *passive* (on attend qu'on nous contacte) à une **machine d'acquisition et de conversion** mesurée, agressive et industrialisée.
>
> _Date : juillet 2026 — Marché : Yaoundé / Cameroun — Cible : TPE/PME, professions libérales, entrepreneurs._

---

## 1. Résumé exécutif

PRISMA GESTION dispose d'une **base technique solide et rare pour un cabinet camerounais** : un site vitrine moderne (React/Supabase), un blog fiscal alimenté (~10 articles de fond), une batterie de calculateurs d'impôts (IGS, TVA, IRCM, IRPP, Succession, Bail), un chatbot, un back-office complet (facturation, clients, missions) et un espace admin temps réel.

**Mais aucun de ces atouts n'est aujourd'hui exploité commercialement.** Le site est une *plaquette en ligne*, pas un *outil de vente*. Les diagnostics ci-dessous montrent que l'entreprise **ne mesure rien, ne capte aucun lead sur ses meilleurs contenus, n'affiche ni offre ni prix ni preuve sociale, et n'a aucune présence sociale reliée**.

### Les 5 verrous qui bloquent la croissance (par ordre d'impact)

| # | Verrou | Preuve dans le code | Conséquence business |
|---|--------|--------------------|----------------------|
| 1 | **Pilotage à l'aveugle** — aucune analytics réelle | `AnalyticsService.initialize()` appelé **sans `trackingId`** → retour immédiat (`src/pages/Index.tsx`) ; le tableau de bord admin affiche des **chiffres inventés** (`mockData` dans `AnalyticsMetrics.tsx`, `ConversionTab.tsx`, `TrafficTab.tsx`) | Impossible de savoir d'où viennent les visiteurs, quelles pages convertissent, quel canal recruter. On ne peut pas être « offensif » sans radar. |
| 2 | **Aimants à leads qui ne captent rien** — les calculateurs d'impôts (le contenu le plus consulté) ne demandent **aucun email** | Aucune capture email dans `src/components/calculateur/` (grep vide) | Le trafic le plus qualifié (un entrepreneur qui calcule son IGS = prospect chaud) repart sans laisser de trace. Fuite du principal gisement de prospects. |
| 3 | **Tunnel de conversion faible** — pas d'offre packagée, pas de prix, pas de preuve sociale, CTA génériques | Sections `Hero`, `About`, `Services` : slogans génériques (« Découvrir nos services »), aucun tarif, aucun témoignage, aucun chiffre-clé | Le visiteur ne sait ni ce que ça coûte, ni pourquoi choisir PRISMA plutôt qu'un concurrent. Conversion faible par défaut. |
| 4 | **Zéro présence sociale reliée** — un seul lien WhatsApp | `Footer.tsx` / `ContactInfo.tsx` : uniquement `wa.me`. Pas de Facebook, LinkedIn, Instagram | Le cabinet surveille pourtant la DGI sur Facebook (article `veille-facebook-dgicam`) mais n'a aucun canal social propre pour diffuser et recruter. |
| 5 | **Base clients dormante** — l'app métier contient tout le CRM mais ne sert jamais à vendre | `prisma-taskmaster-planner` : 100 % des routes derrière `PrivateRoute` ; aucune logique d'upsell/relance commerciale | Le plus gros actif commercial (les clients existants et leur historique fiscal) n'alimente aucune action de vente additionnelle. |

### La thèse offensive en une phrase

> **Instrumenter → Capter → Convertir → Exploiter la base → Industrialiser le contenu.**
> Transformer les calculateurs et le blog en usine à leads, afficher des offres et des preuves qui *ferment* la vente, et brancher la base clients de l'app sur des campagnes d'upsell — le tout piloté par des données réelles.

---

## 2. Cartographie des deux actifs

### 2.1 Site vitrine — `Prisma-Gestion_website`
**Rôle stratégique : ACQUISITION.** C'est le haut du tunnel.

| Élément | État | Valeur commerciale |
|---|---|---|
| Pages | Accueil (Hero/About/Services/Blog/Contact), Blog + article, Outils, Calculateur d'impôts | ✅ Bonne couverture |
| Blog | ~10 articles de fond (fiscalité CMR, réforme 2026, IGS, veilles impôts.cm/CNPS/DGICAM) | ✅ **Actif rare** — SEO local |
| Calculateurs | IGS, TVA, IRCM, IRPP, Succession, Bail, Abattage | ✅ **Aimant à leads premium** (mais non exploité) |
| Chatbot | Réponses prédéfinies (services, contact, devis) | ⚠️ Numéro **factice** `+237 6XX XXX XXX` en dur (`useChatbot.ts`) |
| Formulaires | Contact, Devis, Rendez-vous → Supabase + email Resend | ✅ Fonctionnels ; ⚠️ notification email inactive sans `RESEND_API_KEY` |
| Espace admin | Gestion contenus/messages/devis/RDV, temps réel | ✅ Solide ; ❌ onglet Analytics = **données fictives** |
| SEO technique | Meta/OG/Twitter/JSON-LD OK, `react-helmet` | ✅ Bon ; ❌ **pas de `sitemap.xml`**, robots.txt minimal |

### 2.2 Application métier — `prisma-taskmaster-planner`
**Rôle stratégique : PRODUCTION, RÉTENTION & DONNÉES.** C'est le bas du tunnel et le réservoir de valeur.

| Module | Rôle commercial |
|---|---|
| Clients (CRUD, calcul fiscal, agences, import/export) | **CRM de fait** — segmentation, historique, potentiel d'upsell |
| Facturation (devis, factures, propositions, reçus) | Cycle de vente aval — mesure du CA réel par client/service |
| Gestion / Missions / Planning | **Capacité de production** — combien de clients de plus peut-on absorber |
| Courrier (20+ modèles, publipostage) | **Canal de relance** déjà outillé (relances, convocations) |
| Rapports | Pilotage — mais orienté fiscal, pas commercial |

> **Insight clé** : l'app est un **actif commercial déguisé en outil comptable**. Elle sait qui sont les clients, ce qu'ils paient, quelles obligations approchent — exactement la matière d'une stratégie d'upsell et de relance. Elle est aussi **productisable** : vendue en marque blanche à d'autres cabinets camerounais, c'est une nouvelle ligne de revenus récurrents.

---

## 3. Audit du site vitrine (acquisition)

### 3.1 Forces à capitaliser
- **Contenu fiscal local de qualité** : le blog et les veilles (impôts.cm, CNPS, LEGECAM, DGICAM) répondent à des recherches réelles d'entrepreneurs camerounais. C'est un socle SEO que peu de concurrents ont.
- **Calculateurs d'impôts** : outil à forte intention. Quelqu'un qui calcule son IGS ou sa TVA a un besoin *immédiat*. C'est le meilleur aimant à leads du site.
- **Stack moderne & temps réel** : Supabase + admin temps réel = capacité à réagir vite aux demandes entrantes.
- **SEO de base bien posé** : structured data Organization, OG/Twitter cards, canonical.

### 3.2 Failles critiques (bloquent la stratégie offensive)

**F1 — Pilotage à l'aveugle (CRITIQUE).**
`AnalyticsService.initialize()` est invoqué sans identifiant : la fonction sort immédiatement (`if (!trackingId) return`). Aucun Google Analytics / Plausible / Meta Pixel n'est donc chargé. Pire, le tableau de bord admin *simule* des chiffres (`visitors: 1247`, `conversion: 12.5 %`…) qui donnent une **fausse impression de mesure**. → *On ne peut pas mener une campagne offensive sans savoir ce qui marche.*

**F2 — Aimants à leads qui ne captent rien (CRITIQUE).**
Les calculateurs et les outils (« Modèles de documents », « Guide création d'entreprise ») ne demandent jamais d'email. Le visiteur le plus qualifié du site repart anonyme. → *Fuite du principal gisement de prospects.*

**F3 — Aucune offre, aucun prix, aucune preuve sociale.**
Le site décrit des *catégories* de services (Comptabilité, Fiscalité…) mais jamais une *offre* (« Pack création d'entreprise à X F CFA », « Externalisation paie à partir de Y F CFA/mois »). Pas un seul témoignage client, logo, chiffre (« +200 entreprises accompagnées »), ni étude de cas. → *Le visiteur n'a aucune raison de préférer PRISMA ni de passer à l'acte.*

**F4 — CTA génériques et tièdes.**
« Découvrir nos services », « Nous contacter » : verbes mous. Aucune urgence, aucune offre d'appel (audit gratuit, diagnostic fiscal offert). Le bouton « Prendre rendez-vous » est bien là (Hero) mais noyé.

**F5 — Zéro présence sociale reliée & numéro factice.**
Footer et contact ne pointent que vers WhatsApp. Aucune page Facebook/LinkedIn/Instagram — alors que la cible camerounaise vit sur Facebook/WhatsApp. Le chatbot affiche un numéro placeholder `+237 6XX XXX XXX`, ce qui **détruit la crédibilité** au moment précis où le prospect veut appeler.

**F6 — SEO d'acquisition incomplet.**
Pas de `sitemap.xml` (les articles et calculateurs sont moins bien indexés), robots.txt minimal, pas de balisage `LocalBusiness` (crucial pour « comptable Yaoundé »), pas de pages d'atterrissage par service/ville pour le référencement local.

**F7 — Pas de capture de la demande latente.**
Pas de newsletter, pas de lead nurturing. Un visiteur non prêt à acheter aujourd'hui est perdu à jamais (aucune table `subscribers`, seulement `contact_messages` / `quote_requests` / `appointments`).

---

## 4. Audit de l'application métier (production, rétention, données)

L'app est saine et complète côté fonctionnel. Les manques sont **commerciaux**, pas techniques :

- **A1 — La base clients ne « parle » pas au marketing.** Aucun pont entre l'app (qui sait tout des clients) et le site (qui cherche des clients). Les échéances fiscales à venir (IGS, DSF, patente) sont des **déclencheurs de vente** parfaits mais ne servent qu'à l'usage interne.
- **A2 — Pas de scoring / segmentation commerciale.** On ne distingue pas les clients à fort potentiel d'upsell (ex. client en régime simplifié qui bascule au réel, client sans mission de conseil).
- **A3 — Le module Courrier est un canal de relance sous-utilisé.** 20+ modèles existent ; aucun n'est orienté « proposition commerciale / offre saisonnière ».
- **A4 — Actif productisable ignoré.** L'app pourrait être vendue en SaaS/marque blanche à d'autres cabinets — revenus récurrents, indépendants de la capacité horaire du cabinet.

---

## 5. Diagnostic du tunnel de conversion actuel

```
   TRAFIC (blog, calculateurs, recherche Google)
        │   ❌ non mesuré (F1)
        ▼
   INTÉRÊT (lecture article, calcul d'impôt)
        │   ❌ aucune capture d'email (F2)  ── fuite massive
        ▼
   CONSIDÉRATION
        │   ❌ ni offre, ni prix, ni preuve (F3/F4)
        ▼
   ACTION (formulaire contact / devis / RDV)  ✅ fonctionne
        │   ⚠️ notification email inactive sans clé Resend
        ▼
   CLIENT (géré dans l'app)  ✅
        │   ❌ aucun upsell / relance commerciale (A1-A3)
        ▼
   FIDÉLISATION / EXPANSION  ── non exploitée
```

**Conclusion** : le tunnel fuit à *chaque* étape haute (mesure, capture, conversion) et n'exploite *aucune* étape basse (upsell, fidélisation). Une stratégie offensive doit boucher les fuites de haut en bas **dans cet ordre**.

---

## 6. Stratégie commerciale offensive — le plan en 7 axes

### Axe 1 — Instrumenter (voir avant d'attaquer) 🔴 *préalable à tout*
- Brancher une vraie analytics : **Google Analytics 4** (ou **Plausible**, plus simple/RGPD-friendly) + **Meta Pixel** pour le retargeting Facebook/Instagram.
- Corriger `AnalyticsService.initialize()` pour recevoir l'ID via variable d'env `VITE_GA_ID`, et l'appeler réellement dans `Index.tsx`.
- Remplacer le tableau de bord admin *fictif* par de **vraies métriques** : nombre de `contact_messages` / `quote_requests` / `appointments` par période (déjà en base Supabase !), taux de transformation, source du lead.
- Poser des **événements de conversion** : soumission devis, RDV pris, calcul effectué, clic WhatsApp.

### Axe 2 — La machine à leads (capter le trafic qualifié) 🔴
- **Capture d'email sur les calculateurs** : « Recevez votre estimation détaillée + les 3 optimisations possibles par email ». Un entrepreneur qui calcule son IGS = prospect chaud → on récupère son email + son secteur.
- **Lead magnets téléchargeables** : les « Modèles de documents » et le « Guide création d'entreprise » deviennent des PDF à télécharger *contre email*.
- **Newsletter fiscale mensuelle** : capitaliser sur les veilles (impôts.cm, CNPS, DGICAM) déjà produites. Créer une table `subscribers` + double opt-in. Chaque veille devient un email → PRISMA reste top-of-mind toute l'année.
- **Nurturing automatique** : séquence de 3-4 emails après capture (valeur → preuve → offre d'appel diagnostic).

### Axe 3 — Convertir agressivement (fermer la vente) 🟠
- **Packager des offres avec prix d'appel** : « Pack Création d'Entreprise », « Externalisation Comptable dès X F CFA/mois », « Mise en conformité fiscale — diagnostic offert ». Le prix (même « à partir de ») fait passer à l'acte.
- **Preuve sociale partout** : témoignages clients, nombre d'entreprises accompagnées, années d'expérience (déjà « +10 ans » dans About → en faire un bandeau de chiffres-clés), logos secteurs, mini études de cas.
- **CTA offensifs** : remplacer « Découvrir nos services » par « **Obtenez votre diagnostic fiscal gratuit** » / « **Réservez un appel de 15 min** ». Ajouter une barre WhatsApp flottante (canal roi au Cameroun).
- **Réparer les fuites de crédibilité** : vrai numéro dans le chatbot, activer `RESEND_API_KEY` pour que chaque demande déclenche une notification (réponse < 1 h = avantage concurrentiel majeur).

### Axe 4 — Dominer le SEO local (acquisition organique gratuite) 🟠
- Générer un **`sitemap.xml`** (articles + calculateurs + pages services) et enrichir `robots.txt`.
- Ajouter le balisage **`LocalBusiness`** (adresse Yaoundé, horaires, géo) pour capter « comptable Yaoundé », « expert fiscal Cameroun ».
- Créer des **pages d'atterrissage par service** (une URL propre par service au lieu d'ancres `/#services`) + par intention (« créer une SARL au Cameroun », « calcul IGS 2026 »).
- **Google Business Profile** + collecte d'avis Google (la preuve sociale n°1 en local).
- Cadence de contenu : industrialiser les veilles (déjà semi-automatisées) en **rythme hebdomadaire**.

### Axe 5 — Présence sociale & acquisition payante 🟡
- Créer/relier **Facebook, WhatsApp Business, LinkedIn** (B2B), publier les articles et calculateurs.
- **Retargeting Meta** (grâce au Pixel de l'Axe 1) sur les visiteurs des calculateurs et pages services.
- Campagnes locales ciblées (Yaoundé/Douala) sur les moments fiscaux (échéances IGS/DSF/patente) — offensif et saisonnier.

### Axe 6 — Exploiter la base clients (croissance interne, marge la plus rentable) 🟠
- **Brancher les échéances fiscales de l'app sur des relances commerciales** : chaque obligation approchant (DSF, patente, IGS) = un email/courrier proposant l'accompagnement. Le module Courrier + les modèles existent déjà.
- **Scoring d'upsell** : identifier dans l'app les clients à potentiel (bascule de régime, absence de mission conseil, croissance du CA) et déclencher une offre.
- **Programme de parrainage** : un client satisfait qui en amène un autre = acquisition à coût quasi nul.
- **Cross-sell services digitaux** (Génie logiciel / IA) auprès de la base comptable existante — différenciateur unique de PRISMA.

### Axe 7 — Industrialiser / productiser 🟢 *(moyen-long terme)*
- Offrir l'app `prisma-taskmaster-planner` en **SaaS marque blanche** à d'autres cabinets camerounais/CEMAC → revenus récurrents.
- Vendre les calculateurs/outils en **version premium** ou API aux acteurs (banques, incubateurs, CGA).

---

## 7. Plan d'action priorisé

### 🚀 Quick wins (0–2 semaines, fort impact / faible effort)
1. **Activer une vraie analytics** (GA4 ou Plausible) + Meta Pixel — *sans mesure, aucun euro de pub n'est justifiable.*
2. **Remplacer les chiffres fictifs de l'admin** par les vrais compteurs Supabase (`contact_messages`, `quote_requests`, `appointments`).
3. **Corriger le numéro factice** du chatbot + **activer `RESEND_API_KEY`** (notification instantanée des demandes).
4. **Ajouter un `sitemap.xml`** + balisage `LocalBusiness` + soumettre à Google Search Console.
5. **CTA offensifs** dans le Hero (« Diagnostic fiscal gratuit ») + **barre WhatsApp flottante**.
6. **Capture d'email sur les calculateurs** (« recevez le détail par email »).
7. **Créer/relier les pages sociales** (Facebook, WhatsApp Business, LinkedIn) et les mettre dans le footer.

### 🎯 Court terme (2–8 semaines)
8. **Bandeau de preuve sociale** (chiffres-clés + 3-5 témoignages) sur l'accueil.
9. **Packager 3 offres phares avec prix d'appel** + pages d'atterrissage dédiées.
10. **Newsletter fiscale** : table `subscribers`, formulaire, envoi mensuel des veilles.
11. **Lead magnets PDF** (guide création d'entreprise, modèles) contre email.
12. **Google Business Profile** + campagne de collecte d'avis.

### 🏗️ Moyen terme (2–6 mois)
13. **Séquences de nurturing** automatisées (email post-capture).
14. **Relances commerciales pilotées par les échéances** de l'app (Axe 6).
15. **Scoring d'upsell** + programme de parrainage.
16. **Campagnes Meta/Google** saisonnières (retargeting + local).
17. **Étude de productisation SaaS** de l'app.

---

## 8. KPIs & tableau de bord commercial à mettre en place

Remplacer les métriques fictives par un vrai **cockpit commercial** :

| Étape du tunnel | KPI | Source |
|---|---|---|
| Acquisition | Visiteurs uniques, sources, pages d'entrée | GA4/Plausible |
| Engagement | Calculs effectués, articles lus, temps sur page | Événements analytics |
| Capture | Emails collectés, taux de capture / calculateur | Table `subscribers` |
| Conversion | Devis demandés, RDV pris, taux de transformation | Supabase (`quote_requests`, `appointments`) |
| Vente | Devis → factures signées, panier moyen, délai de réponse | App facturation |
| Expansion | Taux d'upsell, CA/client, taux de parrainage | App clients + facturation |
| Rétention | Taux de rétention annuel, churn | App clients |

**Objectif offensif** : fixer une cible chiffrée par trimestre (ex. *+30 leads qualifiés/mois*, *taux de transformation devis ≥ 25 %*, *2 upsells/mois sur la base existante*) et piloter par ce tableau, pas à l'intuition.

---

## 9. Corrections techniques immédiates identifiées (référencées dans le code)

| Réf. | Fichier | Problème | Correctif |
|---|---|---|---|
| T1 | `Prisma-Gestion_website/src/services/analyticsService.ts` + `src/pages/Index.tsx` | GA jamais initialisé (`initialize()` sans ID) | Injecter `VITE_GA_ID`, charger réellement GA4/Plausible |
| T2 | `src/components/admin/analytics/AnalyticsMetrics.tsx`, `tabs/ConversionTab.tsx`, `tabs/TrafficTab.tsx` | Données 100 % fictives (`mockData`) | Brancher sur les tables Supabase réelles |
| T3 | `src/hooks/useChatbot.ts` | Numéro WhatsApp factice `+237 6XX XXX XXX` | Numéro réel + lien `wa.me` cliquable |
| T4 | `public/` | Pas de `sitemap.xml` ; `robots.txt` minimal | Générer sitemap + `Sitemap:` dans robots |
| T5 | `index.html` / `SEOHead.tsx` | Pas de balisage `LocalBusiness` | Ajouter JSON-LD LocalBusiness (adresse, géo, horaires) |
| T6 | `src/components/calculateur/*` | Aucune capture d'email | Ajouter opt-in « recevoir le détail par email » |
| T7 | `src/components/Footer.tsx` / `ContactInfo.tsx` | Pas de liens sociaux | Ajouter Facebook / LinkedIn / WhatsApp Business |
| T8 | Edge function `send-email` | Notification inactive sans `RESEND_API_KEY` | Configurer le secret pour réponse < 1 h |

---

## 10. Recommandation de démarrage

**Séquence conseillée** : commencer par l'**Axe 1 (instrumenter)** et les **quick wins 1→7**. Sans radar, une stratégie « offensive » gaspille du budget. Une fois la mesure en place (≈ 2 semaines), lancer les Axes 2 et 3 (capter + convertir) qui produisent les premiers résultats visibles, puis l'Axe 6 (base clients) qui offre la meilleure marge.

> **Je peux enchaîner immédiatement sur l'implémentation** des quick wins techniques (T1–T8) sur ces mêmes branches — dites-moi par lesquels commencer.

---
_Audit réalisé sur les branches `claude/audit-deux-sites-vj55mj` des deux dépôts. Constats étayés par les fichiers cités._
