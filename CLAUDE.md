# CLAUDE.md

Guide destiné à Claude Code (claude.ai/code) pour travailler dans ce dépôt.

## Nature du dépôt

Dépôt **unique** de PRISMA GESTION (cabinet d'expertise comptable, Yaoundé,
Cameroun). Il porte deux applications dans un seul build Vite :

1. **Le site vitrine public** — présentation, blog de veille fiscale,
   calculateurs, espace d'administration du site. Code dans `src/`.
2. **La console de gestion du cabinet** — clients, obligations fiscales,
   facturation, courrier, missions, planning, rapports. Code dans
   `src/modules/gestion/`, monté sous `/admin/gestion`.

Les deux applications vivaient auparavant dans deux dépôts séparés
(`Prismagestion_website` et `prisma-taskmaster-planner`). La fusion est
complète : le second dépôt est archivé, ce dépôt fait seul référence.

## Commandes

```bash
npm run dev          # Serveur de développement sur le port 8080
npm run build        # Build de production dans dist/
npm run lint         # ESLint
npm test             # Vitest (une passe)
npm run test:watch   # Vitest en continu
npx vitest run src/modules/gestion/lib/spec/__tests__/fiscal.test.ts   # un seul fichier
```

Gestionnaire de paquets : **npm exclusivement** (`packageManager` est épinglé
dans `package.json`, Node ≥ 22). Ne jamais introduire de `bun.lock` ni de
`yarn.lock`.

Tests : **vitest** en environnement `jsdom`. Les 13 fichiers de test vivent
tous dans `src/modules/gestion/` — le site vitrine n'a pas encore de tests.

## Alias de chemins

Trois fichiers doivent rester en phase : `vite.config.ts`, `vitest.config.ts`
et `tsconfig.json`.

| Alias | Cible |
|---|---|
| `@/` | `src/` (site vitrine, application hôte) |
| `@gestion/` | `src/modules/gestion/` (console de gestion) |

**L'ordre de déclaration compte** : `@gestion` doit précéder `@`, sinon
`@gestion/x` est résolu comme `@` suivi de `gestion/x`.

Règle de dépendance : le module de gestion n'importe de l'hôte que deux
choses, toutes deux par réexport explicite —
`@gestion/integrations/supabase/client.ts` (le client Supabase, voir plus bas)
et 38 des 55 composants de `@gestion/components/ui/` (voir « Composants
shadcn/ui »). L'hôte, lui, n'importe du module que `GestionModule.tsx`.

## Architecture

**Stack** : Vite 6 + React 18 + TypeScript + Tailwind CSS + shadcn/ui +
Supabase + React Query.

### Routes du site vitrine (`src/App.tsx`)

| Route | Page | Accès |
|---|---|---|
| `/` | `Index.tsx` | public |
| `/blog`, `/blog/:slug` | `Blog.tsx`, `BlogPost.tsx` | public |
| `/outils`, `/outils/calculateur-*` | `Outils.tsx`, calculateurs | public |
| `/expertise/ia-et-genie-logiciel` | `ExpertiseDigitale.tsx` | public |
| `/auth` | `components/auth/AuthPage.tsx` | connexion |
| `/admin/*` | `Admin.tsx` | `ProtectedRoute requireAdmin` |
| `/admin/gestion/*` | `modules/gestion/GestionModule.tsx` | `ProtectedRoute requireAdmin` |

### Routes de la console (`src/modules/gestion/GestionModule.tsx`)

Toutes préfixées par `/admin/gestion`. Utiliser `gestionPath()` de
`@gestion/routes` pour construire un lien interne à la console — ne jamais
écrire un chemin absolu en dur.

| Route | Page | Objet |
|---|---|---|
| `/admin/gestion` | `Index.tsx` | Tableau de bord (KPIs, alertes fiscales, tâches) |
| `/admin/gestion/clients` | `Clients.tsx` | CRUD clients, calcul fiscal, agences, import/export, corbeille |
| `/admin/gestion/gestion` | `Gestion.tsx` | Dossier client : onglets Fiscal, Comptable, Contrats, Clôture, Dossier |
| `/admin/gestion/facturation` | `Facturation.tsx` | Devis, factures, propositions, paiements, reçus, situation clients |
| `/admin/gestion/courrier` | `Courrier.tsx` | Rédaction sur modèles, publipostage, historique |
| `/admin/gestion/missions` | `Missions.tsx` | Missions, ordres et rapports de mission |
| `/admin/gestion/planning` | `Planning.tsx` | Calendrier par collaborateur |
| `/admin/gestion/collaborateurs` | `Collaborateurs.tsx` | Personnel et accès |
| `/admin/gestion/rapports` | `Rapports.tsx` | Rapports PDF (financiers, clients, fiscaux, RH) |
| `/admin/gestion/parametres` | `Parametres.tsx` | Cabinet, clôture annuelle, transfert de données, utilisateurs |
| `/admin/gestion/aide` | `Aide.tsx` | Aide intégrée et journal des nouveautés |

Il n'y a **pas** de route `/login` ni de `PrivateRoute` dans la console :
l'accès est filtré en amont par le `ProtectedRoute requireAdmin` de l'hôte,
et l'écran de connexion unique est `/auth`.

### Points d'intégration à ne pas casser

Ces quatre décisions règlent des problèmes réels ; les défaire réintroduit
des bugs déjà corrigés.

1. **Client Supabase unique.**
   `@gestion/integrations/supabase/client.ts` ne crée pas de client : il
   réexporte celui de l'hôte en le retypant. Deux `createClient` sur le même
   domaine créeraient deux instances GoTrue qui se disputent la clé de
   session dans `localStorage` — se connecter au site déconnecterait la
   console.

2. **`QueryClient` dédié à la console.**
   L'hôte monte le sien avec des réglages par défaut ; la console a besoin
   des siens (`staleTime` 5 min, `gcTime` 30 min, pas de refetch au retour
   de focus), sinon des agrégats fiscaux coûteux sont recalculés en boucle.
   Les deux caches ne se recouvrent pas : le site ne lit aucune table métier.

3. **Pas de `BrowserRouter` dans le module.** L'hôte en fournit un ; deux
   routeurs imbriqués cassent la navigation.

4. **Thème de la console par portée CSS.**
   Les deux applications nommaient leur accent `primary` : violet `#2E1A47`
   pour le site (variable CSS), vert sauge `#84A98C` pour la console (config
   Tailwind). Une seule config Tailwind subsistant, `gestion-theme.css`
   rétablit le vert **à l'intérieur de `.gestion-theme`** seulement. Ne pas
   réécrire les classes `bg-primary` du module.

### Répertoires clés

Site vitrine (`src/`) :

- `src/components/` — sections de la page d'accueil, blog, contact, devis,
  chatbot, calculateurs, `admin/`, `auth/`, `ui/` (shadcn).
- `src/services/` — accès aux données du site (blog, SEO, métadonnées).
- `src/lib/localBackend/` — backend de secours en `localStorage` reproduisant
  l'API de `supabase-js` (voir « Mode secours » du README).
- `src/integrations/supabase/client.ts` — client réel **ou** backend local
  selon la présence des variables d'environnement.
- `src/config/` — `site.ts`, `social.ts`.

Console (`src/modules/gestion/`) :

- `lib/spec/` — **logique métier canonique** : `fiscal.ts` (tous les calculs
  d'impôts), `fiscal-constants.ts` (barèmes IGS, taux Patente, tranches TDL),
  `courrierStatut.ts`, `facturePrestations.ts` (ACF/ATTIM sont classés en
  taxes, pas en honoraires), `aideContent.ts` (contenu de l'aide + journal —
  incrémenter `APP_VERSION`/`LAST_UPDATED` et ajouter une entrée à chaque
  fonctionnalité notable), `pdfExport.ts`, `usePrint.ts`, `cabinetConfig.ts`.
- `config/fiscalConstants.ts` — constantes dupliquées utilisées par quelques
  composants anciens ; **préférer `lib/spec/fiscal-constants.ts`**.
- `services/` — accès aux données Supabase, un fichier par domaine.
- `integrations/supabase/extraTables.ts` — types écrits à la main pour les
  tables absentes de `types.ts` généré.
- `hooks/fiscal/` — état des obligations fiscales et flux d'enregistrement.
- `components/layout/MobileBottomNav.tsx` — barre de navigation basse sur
  mobile ; ajoute la classe `has-bottom-nav` sur `body` pour réserver la place.
- `utils/vanillaTransfer/` + `services/vanillaTransferService.ts` — échange
  PRISMA-CLIENTS bidirectionnel avec l'ancienne application vanilla
  (rapprochement par NIU puis par nom).
- `routes.ts` — `gestionPath()`, préfixage des chemins de la console.

Prototype historique (`facturation/`) : ancienne application HTML/localStorage
dont la console React est issue. Conservée pour référence, **non buildée**.
Contient des exports de données clients réelles — voir « Confidentialité ».

## Modèle de données

Tout document transactionnel (facture, devis, proposition, reçu, courrier)
stocke un instantané `client_data` au moment de l'émission — **ne jamais
relire le client vivant pour le rendu d'un document**.

Numérotation :

| Document | Format |
|---|---|
| Facture | `N° NNNN/YYYY/MM` |
| Devis | `DEVIS-NNNN/YYYY/MM` |
| Reçu | `RECU-NNNN/YYYY` |
| Courrier | `CRR-NNNN/YYYY/MM` |

Dates saisies manuellement : toujours
`new Date(val + 'T12:00:00').toISOString()` pour éviter le décalage de jour
en UTC.

**Colonnes contre champs d'affichage.** Les types applicatifs (`Paiement`,
`Task`…) sont plus riches que les tables : ils portent des relations chargées
par jointure et des libellés résolus. Envoyés tels quels à PostgREST, ils font
rejeter la requête entière. Avant tout `insert`/`update`, filtrer sur les
colonnes réelles — voir `versColonnesPaiement()` dans
`hooks/facturation/paiementActions/usePaiementUpdate.ts` et le tri des
relations dans `services/taskService.ts`.

## Règles de calcul fiscal

Source de vérité : `src/modules/gestion/lib/spec/fiscal.ts`.

- **IGS** — barème à 10 classes (CA < 50 M F CFA). Les adhérents CGA
  bénéficient de 50 % de réduction ; la TDL se calcule sur le principal IGS
  **avant** réduction.
- **Patente** — 0,283 % du CA, plancher 141 500, plafond 4 500 000 F CFA.
- **Solde IR/IS** — 0,1 % du CA lorsque CA ≥ 15 M F CFA. Libellé « Solde IS »
  pour les personnes morales.
- **TDL** — barème fondé sur le montant du principal IGS.
- **PSL / Bail / TF** — impôts immobiliers ; les OBNL et NonPro sont exonérés
  de PSL et paient le Bail à 5 % au lieu de 10 %.
- **Licence boissons** — 2 × IGS (régime IGS) ou 2 × Patente (régime Réel).
- **Pénalités** — 10 % par mois de retard sur les acomptes trimestriels IGS
  (T1 = 15 jan., T2 = 15 mars, T3 = 15 juil., T4 = 15 oct.).

## Impression et PDF

Utiliser `usePrint(ref)` de `@gestion/lib/spec/usePrint.ts` plutôt que
`window.open`. Le hook remplace temporairement `document.body.innerHTML`,
appelle `window.print()`, puis restaure.

Export PDF : `html2canvas(el, { scale: 2, useCORS: true })` → découpage en
pages A4 → jsPDF. Les noms de fichiers passent par `sanitizePdfSegment()`
(retire `N° `, les barres obliques et les caractères non alphanumériques ;
les lettres accentuées sont conservées).

## Formatage monétaire

Toujours `Math.round(montant || 0).toLocaleString('fr-FR') + ' F CFA'`.
Ne jamais afficher un flottant brut.

## Conventions d'interface

- Accent du site : `#2E1A47` (violet). Accent de la console : `#84A98C`
  (vert sauge), appliqué via `.gestion-theme` uniquement.
- **Composants shadcn/ui.** L'implémentation de référence est
  `src/components/ui/`. Dans `src/modules/gestion/components/ui/`, **38 des 55
  fichiers ne sont qu'un réexport d'une ligne** vers l'hôte : les modifier n'a
  aucun effet, il faut éditer le fichier de `src/components/ui/`.

  Les **17 autres gardent une implémentation propre**, parce que leur style ou
  leur comportement diverge volontairement entre les deux applications :

  | Fichier | Raison |
  |---|---|
  | `select` | défilement par `ScrollArea`, `rounded-lg`, ombre au survol |
  | `button`, `badge`, `toggle`, `navigation-menu` + leurs `*-variants.ts` | variants CVA extraits (react-refresh) ; le bouton du site a en plus `amber`, `purple`, `success` |
  | `alert-dialog`, `calendar`, `dialog`, `tabs` | classes Tailwind différentes |
  | `sonner` | toasts en haut sur mobile, pour ne pas masquer `MobileBottomNav` |
  | `toggle-group` | dépend de `toggle-variants` |
  | `confirm-dialog`, `file-input` | propres à la console, sans équivalent côté site |

  **Avant de toucher un composant de `@gestion/components/ui/`, regarder s'il
  s'agit d'un réexport.** Pour en faire diverger un qui n'en diverge pas
  encore, remplacer le réexport par une vraie implémentation et l'inscrire
  au tableau ci-dessus.
- Toasts : `useToast()` (shadcn) ou `sonner` — succès vert, avertissement
  ambre, erreur rouge, information bleu ; durée 3 s.
- Confirmations de suppression : `<AlertDialog>` de shadcn.
- Pages de la console encapsulées dans `<PageLayout>`.
- Détection mobile : hook `useIsMobile()`.
- Sur mobile, `MobileBottomNav` remplace la barre latérale et les tableaux
  passent en cartes (point de rupture `sm:`) — toute nouvelle liste doit
  prévoir sa variante en cartes.

## Modèles de courrier

`src/modules/gestion/utils/courrierTemplates.ts` est la **source unique**
(≈ 21 modèles en 5 catégories : fiscal, relance, client, information,
convocation). Les substituants utilisent la syntaxe `{{...}}` (`{{nom}}`,
`{{niu}}`, `{{centre}}`, `{{regime}}`, `{{secteur}}`, `{{annee}}`,
`{{montant_igs}}`, `{{montant_patente}}`, `{{civilite}}`). La civilité longue
est toujours `Madame` / `Monsieur`, jamais `Mme.` / `M.`.

Les métadonnées de *statut* de courrier (libellés, badges) sont séparées,
dans `lib/spec/courrierStatut.ts`.

## Supabase

Projet unique et partagé : `xkwqgxqmwxxpzrsurchk` (eu-central-1). Le site
vitrine et la console tapent dans la **même base de production** — toute
modification de schéma est croisée.

- **Migrations** : `supabase/migrations/`, dossier unique et chronologique.
  Son état est réconcilié avec la base ; les écarts connus et non résolus
  sont consignés dans `docs/FUSION.md`. Lire ce fichier avant tout
  `supabase db push`.
- **Fonctions edge** : `send-email` (site, notifications Resend),
  `apply-credit` et `send-payment-reminders` (console).
- **Types** : `supabase gen types typescript` régénère `types.ts` ; une fois
  régénéré, les entrées correspondantes d'`extraTables.ts` peuvent tomber.

## Confidentialité

Le dépôt contient du code métier et, dans `facturation/`, des exports de
données clients réelles (noms, NIU, téléphones, e-mails, numéros CNPS). **Le
dépôt doit rester privé.** Ne jamais le repasser en public sans avoir au
préalable purgé ces fichiers de l'historique.

Un hook `pre-commit` bloque les fichiers `.env` et les clés privées. Les clés
`VITE_*` publiables sont tolérées : elles sont publiques par conception.

## Workflow Git

Travail en solo, historique linéaire : local → `main` → production. Les
commits sur `main` sont la norme ici, et tout push sur `main` déclenche un
déploiement Vercel en production. Vérifier le build avant de pousser.
