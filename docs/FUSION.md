# Fusion des dépôts — état et écarts subsistants

Fusion du dépôt `prisma-taskmaster-planner` dans `Prismagestion_website`,
réalisée le **1er août 2026**. Ce dépôt est désormais l'unique source.

Ce document existe pour une raison précise : **l'historique des migrations
Supabase ne décrit pas fidèlement la base de production**. Le lire avant tout
`supabase db push`, `supabase db reset` ou `supabase migration up`.

---

## 1. Ce qui a été fusionné

### Code applicatif — déjà intégré avant cette opération

Les 686 fichiers du taskplanner vivent dans `src/modules/gestion/`, montés
sous `/admin/gestion` (voir `CLAUDE.md` § Points d'intégration).

Contrôle de complétude effectué fichier par fichier, alias et fins de ligne
neutralisés :

| | Fichiers |
|---|---|
| Identiques à la source (modulo `@/` → `@gestion/`) | 635 |
| Divergents | 47 |
| **Total comparé** | **682** |

Les 47 divergents ont été relus un par un. **Aucun ne constitue un retard** :
ce sont des adaptations au montage en module invité, plus des correctifs faits
côté site et absents de la source. Les principaux :

- `hooks/facturation/paiementActions/usePaiementUpdate.ts` — la mise à jour
  d'un paiement échouait **systématiquement** dans le taskplanner : le type
  `Paiement` porte des champs d'affichage (facture résolue, client, type,
  prestations réglées) qui ne sont pas des colonnes ; envoyés à PostgREST, ils
  faisaient rejeter la requête entière. Corrigé par `versColonnesPaiement()`.
- `services/taskService.ts` — même classe de bug à l'insertion : les relations
  `clients` et `collaborateurs` chargées par jointure étaient renvoyées telles
  quelles lors de la création d'une tâche.
- `components/parametres/ProfileSettings.tsx` — affichait un profil fictif
  (« Jean Dupont », téléphone français) et son bouton d'enregistrement
  n'écrivait rien. Lit et écrit désormais la table `profiles`.
- `services/devisService.ts` — `Record<string, unknown>` remplacé par
  `TablesUpdate<'devis'>`.
- `hooks/useAuthorization.ts`, `components/layout/MobileBottomNav.tsx`,
  `components/dashboard/Sidebar.tsx` — chemins repris via `gestionPath()`,
  redirection vers `/auth`.

Éléments de la source volontairement **non repris**, sans perte
fonctionnelle : `App.tsx`, `App.css`, `index.css`, `main.tsx`,
`vite-env.d.ts`, `pages/Login.tsx` (remplacés par l'hôte),
`components/LogoutButton.tsx` (plus référencé), et l'entrée `has_role` des
types générés (référencée nulle part).

### Rapatriements de cette opération

| Élément | Origine → destination |
|---|---|
| Prototype HTML historique (30 fichiers) | `facturation/` |
| Fonctions edge `apply-credit`, `send-payment-reminders` | `supabase/functions/` |
| 16 migrations | `supabase/migrations/` |
| Rapport de sécurité du 11/04/2026 | `docs/rapport-securite-2026-04-11.md` |
| `SPEC_LOVABLE.md`, `RAPPORT_COMPARATIF_FICHES_CLIENT.md` | racine |
| Hook `SessionStart` + `settings.json` | `.claude/` |
| Conventions métier | fondues dans `CLAUDE.md` |

### Écartés, et pourquoi

| Élément | Motif |
|---|---|
| `netlify.toml` | Hébergement unique sur Vercel (`vercel.json`). |
| `bun.lock`, `bun.lockb` | npm est le gestionnaire unique, épinglé dans `package.json`. |
| `@playwright/test` | Dépendance orpheline : aucune configuration ni aucun fichier `.spec` n'a jamais existé. L'installation de Chromium a été retirée du hook `SessionStart` en conséquence. |
| `index.html`, `vite.config.ts`, `vitest.config.ts`, `tailwind.config.ts`, `tsconfig*`, `.gitignore`, `supabase/config.toml`, `components.json`, `eslint.config.js`, `postcss.config.js` | Versions de l'hôte conservées (plus riches : CSP, PWA, découpage de chunks, alias `@gestion`). |
| `public/favicon.ico`, `public/og-image.png` | Identité visuelle du site conservée. |
| `.env.example` | Celui de l'hôte est un sur-ensemble. |
| `AUDIT_STRATEGIE_COMMERCIALE.md`, `docs/Audit_*.pdf` | Fichiers identiques des deux côtés. |
| `STRATEGIE_OFFRES_COMMERCIALES.md` | Version de l'hôte conservée (10 010 o contre 6 838 o). |

---

## 2. Migrations Supabase — état réel

Dossier unique : `supabase/migrations/`, **30 fichiers**. La base compte
**29 migrations enregistrées** dans `supabase_migrations.schema_migrations`.
Les deux ensembles ne coïncident pas.

Les deux dernières ont été écrites le 01/08/2026 et sont présentes des deux
côtés : `20260801171728_creer_rapports_mission_et_bucket.sql` (§ 3) et
`20260801172419_creer_bucket_documents.sql` (§ 3 bis).

### 2.1 Fichiers réalignés sur la base (10)

Ces fichiers portaient un horodatage différent de celui réellement enregistré.
Ils ont été renommés pour coïncider — **contenu inchangé**.

| Ancien nom | Nouveau nom |
|---|---|
| `20250611172210-ffe28716-…` | `20250611052203_ffe28716-…` |
| `20250613112732-39cdb05f-…` | `20250613112726_39cdb05f-…` |
| `20260328204036_5f4f5a72-…` | `20260328204035_5f4f5a72-…` |
| `20260403054344_cc00942c-…` | `20260403054343_cc00942c-…` |
| `20260610062748_c26ef4c8-…` | `20260610062747_c26ef4c8-…` |
| `20260612003409_fa40c4de-…` | `20260612003408_fa40c4de-…` |
| `20260613034910_a3c27b4b-…` | `20260613034908_a3c27b4b-…` |
| `20260701130343_4961549d-…` | `20260701130341_4961549d-…` |
| `20260723120000_newsletter_subscribers` | `20260723101855_newsletter_subscribers` |
| `20260725090000_blog_visuals_and_veille_content` | `20260725072137_blog_visuals_and_veille_content` |

Le dernier renommage corrige aussi un **ordre faux** : `blog_visuals` précède
`publish_veille_impots_articles` en base, alors que les horodatages locaux
donnaient l'inverse.

### 2.2 Appliquées en base, aucun fichier source (4)

Antérieures à la sortie de Lovable ; leur SQL est perdu. Elles resteront
absentes du dossier — **ne pas tenter de les reconstituer**, la base fait foi.

| Version | Nom enregistré |
|---|---|
| `20250604092205` | `d7fdb675-4342-4a1a-bb04-d64331c62313` |
| `20250606030214` | `13de540e-1d87-4b93-abf6-100dcf090db2` |
| `20250607074032` | `6eb2cff3-5d29-4be8-acfd-10cdcc1140dc` |
| `20250624103631` | `5432720c-ee1e-415c-a15d-690bde3b3e6b` |

**Conséquence directe :** un `supabase db reset` ne reconstruira pas une base
équivalente à la production. Ne pas s'en servir comme référence.

### 2.3 Fichiers sans entrée en base (7) — état vérifié objet par objet

Vérification faite le 01/08/2026 en lecture seule sur la production. Aucune
n'a été appliquée ici : le tableau dit ce que la base contient **réellement**.

| Fichier | État réel | Conduite à tenir |
|---|---|---|
| `20260325000000_fix-rls-policies.sql` | Obsolète. Les policies qu'il pose ont été remplacées depuis. | Ne pas rejouer. |
| ~~`20260411120000_create_comptable_user.sql`~~ | **Jamais appliquée** — le compte `comptableprisma@gmail.com` n'existe pas. **Supprimée du dépôt le 01/08/2026** (mot de passe en clair). | Voir § 4. |
| ~~`20260412000000_role_based_rls_policies.sql`~~ (516 lignes) | **Supprimée du dépôt le 01/08/2026.** Elle introduisait `public.get_user_role` et réécrivait les policies. Or cette fonction n'existe pas et aucune policy ne l'utilisait : le modèle en vigueur est `private.has_role`, employée par **78 policies**. | **Ne jamais la rejouer**, y compris en la récupérant de l'historique git — voir § 3 quater. |
| `20260521000000_harmonize_facture_prestations.sql` | Effet **en place** (43 lignes), à l'exception d'`updated_at`. | **Tranché le 01/08/2026 : la colonne n'est pas ajoutée** — voir § 3 ter. Fichier annoté. |
| `20260604051652_mission_documents.sql` | **Échouait entièrement** — voir § 3. Remplacée le 01/08/2026 par `20260801171728_creer_rapports_mission_et_bucket.sql`. | **Corrigé.** Ne pas rejouer le fichier d'origine, conservé annoté pour mémoire. |
| `20260612000000_add_fiscal_columns_to_clients.sql` | Effet **présent** : les 6 colonnes (`civilite`, `chiffreaffaires`, `iscga`, `isvendeurboissons`, `modepaiementigs`, `modepaiementpsl`) existent. Appliquée hors du système de migration. | Rien à faire. |
| `20260716190000_website_harden_input_constraints.sql` | Effet **présent** : 20 contraintes `CHECK` sur `contact_messages`, `quote_requests`, `appointments`. | Rien à faire. |

### 2.4 Resynchroniser l'historique (non fait)

Aligner `schema_migrations` sur le dossier demanderait des
`supabase migration repair --status applied <version>`. **Volontairement non
exécuté** : cela écrit dans la base de production. À décider séparément, en
excluant les migrations du § 2.3 qui ne doivent pas être marquées appliquées.

---

## 3. `rapports_mission` — diagnostic et correction (01/08/2026)

### Le symptôme

`src/modules/gestion/services/missionDocumentService.ts` écrit dans la table
`rapports_mission` (ligne 537) et la relit (ligne 577) ;
`integrations/supabase/extraTables.ts` en déclare le type. **La table n'existait
pas en production** : tout enregistrement de rapport de mission levait.

### La cause

La migration `20260604051652_mission_documents.sql` se terminait par :

```sql
CREATE POLICY IF NOT EXISTS "rapports_mission_storage_all" ON storage.objects
```

`CREATE POLICY` **n'accepte pas `IF NOT EXISTS`** en PostgreSQL. L'instruction
échouait, et comme une migration s'exécute dans une transaction, l'échec
annulait tout — y compris le `CREATE TABLE` de l'étape 2. Le fichier était donc
présent depuis le 04/06/2026 sans avoir jamais produit d'effet.

Les colonnes `courriers.task_id` et `courriers.mission_doc_type` de l'étape 1
existent bel et bien : elles ont été posées par un autre chemin, ce qui donnait
l'illusion d'une migration « à moitié appliquée ».

Second défaut, plus discret : la policy de l'étape 3 était
`FOR ALL USING (true) WITH CHECK (true)` — un accès total ouvert à tous les
rôles, `anon` compris, sur une table métier.

### La correction

Migration `20260801171728_creer_rapports_mission_et_bucket.sql`, appliquée en
production. Elle crée :

- la table `rapports_mission`, dont les 10 colonnes correspondent exactement au
  type déclaré dans `extraTables.ts` ;
- l'index `(task_id, created_at desc)`, qui est l'accès exact de
  `getRapportsMission` ;
- le trigger `set_rapports_mission_updated_at` sur `public.handle_updated_at()` ;
- le bucket privé `rapports-mission` (5 Mo), que l'upload du service attendait et
  qui n'existait pas non plus — l'upload étant en « best-effort », il échouait
  silencieusement et `file_path` restait nul ;
- des policies **alignées sur le modèle en vigueur** :
  `private.has_role(auth.uid(), 'admin')` réservé au rôle `authenticated`, pour
  la table comme pour les quatre opérations sur le bucket.

La policy permissive d'origine n'a pas été reprise. Contrôle après application :
le linter de sécurité Supabase ne signale rien sur `rapports_mission` — il
l'aurait fait avec `USING (true)`.

Le fichier d'origine est conservé, annoté d'un avertissement en tête.

---

## 3 bis. Le bucket `documents` (01/08/2026)

Même classe de défaut, découverte en corrigeant la précédente : le bucket
`documents` était appelé **cinq fois** dans le code sans exister en base.

| Fichier | Fonctionnalité |
|---|---|
| `components/gestion/tabs/GestionDossier.tsx` | téléchargement des pièces du dossier client |
| `components/gestion/tabs/hooks/useDocumentMutations.ts` | téléversement + URL signée |
| `components/parametres/ProfileSettings.tsx` | photo de profil |

La checklist documentaire du dossier client, mise en avant dans le README, ne
pouvait donc pas fonctionner. Aucune donnée orpheline à reprendre :
`documents_administratifs` était vide.

Migration `20260801172419_creer_bucket_documents.sql`. Bucket **privé** (tous
les accès passent par `createSignedUrl`), **10 Mo** — la plus large des deux
limites appliquées côté client — et une liste de **7 types MIME** correspondant
à l'union exacte des deux listes du code (PDF, Word, JPEG/JPG/PNG/WebP). La
restriction existe déjà côté client ; la répéter au niveau du bucket est une
défense en profondeur, le client pouvant être contourné. **Ajouter un type ici
si le code en accepte un nouveau**, sinon l'envoi échouera côté serveur.

Policies identiques au modèle en vigueur, avec `UPDATE` explicitement inclus :
l'envoi d'un avatar utilise `upsert: true`.

Limite connue : les policies exigent le rôle `admin`. C'est cohérent
aujourd'hui — la console entière est derrière `ProtectedRoute requireAdmin` —
mais **à revoir le jour où des collaborateurs non-admin y accéderont** : ils ne
pourraient ni déposer une pièce, ni changer leur photo de profil.

## 3 ter. `facture_prestations.updated_at` — écart fermé sans DDL

La migration `20260521000000` déclare une colonne `updated_at` qui n'existe pas
en base. Après analyse, **elle n'est pas ajoutée**, et l'écart est clos ainsi.

Quatre constats convergents :

| Constat | Détail |
|---|---|
| Le code ne modifie jamais ces lignes | 4 `delete`, 4 `insert`, 12 `select`, **zéro `update`** — les prestations sont remplacées en bloc |
| La colonne serait donc figée | `updated_at` resterait éternellement égal à `created_at` : une traçabilité trompeuse, pire qu'une absence |
| Les tables sœurs ne l'ont pas | ni `devis_prestations`, ni `prestations` — la base est cohérente, c'est le fichier qui est isolé |
| Les types ne l'attendent pas | absente de `types.ts` comme d'`extraTables.ts` |

Ajouter la colonne aurait créé une divergence avec `devis_prestations` et une
colonne morte à maintenir, pour aucun gain.

**Si le code évolue** vers une mise à jour en place des prestations, ajouter
alors la colonne **et** un trigger sur `public.handle_updated_at()` — le modèle
est dans `20260801171728`. Sans trigger, la colonne ne servirait à rien.

## 3 quater. Suppression de `role_based_rls_policies.sql` (01/08/2026)

Le fichier est retiré du dépôt. Vérifié juste avant, en production :

| Contrôle | Résultat |
|---|---|
| Fonction `get_user_role` en base | **0** — n'existe pas |
| Policies l'utilisant | **0** |
| Policies sur `private.has_role` | **78** |
| Migration enregistrée dans `schema_migrations` | **non** |

Le fichier était donc entièrement inerte : sa suppression ne change rien à la
base. Elle supprime en revanche un piège — 516 lignes prêtes à être « rejouées
pour réparer », qui auraient réécrit les policies autour d'une fonction
inexistante.

**Il reste récupérable dans l'historique git. Ne pas le faire.** Si le besoin
d'un contrôle d'accès plus fin que « admin ou rien » se présente, l'écrire à
neuf sur `private.has_role`, pas en repartant de ce fichier.

### Effet de bord traité

`docs/rapport-securite-2026-04-11.md`, rapatrié du taskplanner, **recommandait
d'exécuter cette migration à trois endroits** (§ 1, § 3 risque 2, § 5). Ces
passages sont désormais barrés et annotés, et le document porte un avertissement
en tête. Sans cela, la suppression du fichier aurait laissé une consigne
dangereuse dans un document d'apparence officielle.

Le même rapport recommandait aussi d'exécuter `create_comptable_user.sql` — le
fichier au mot de passe en clair. Ce passage est également neutralisé.

## 4. Sécurité

**Identifiants en clair — fichier supprimé le 01/08/2026.**
`20260411120000_create_comptable_user.sql` contenait une adresse e-mail, un
**mot de passe en clair** et un `INSERT` direct dans `auth.users`. Contrôles
avant suppression : le compte `comptableprisma@gmail.com` **n'existe pas** en
base, et la migration n'était pas enregistrée dans `schema_migrations` — le
fichier n'avait donc jamais rien produit.

Le hook `pre-commit` ne l'avait pas intercepté : il ne cible que les fichiers
`.env`, les clés privées et les valeurs de clé `service_role`. Un mot de passe
applicatif dans un `INSERT` SQL passe au travers. C'est une limite connue et
assumée du hook, pas un défaut à corriger dans l'urgence — le remède est de ne
pas créer de comptes par migration.

> **Le mot de passe reste dans l'historique git.** Supprimer le fichier ne
> l'efface pas des commits antérieurs. Le risque est faible — le dépôt est
> privé et ce mot de passe n'a jamais ouvert aucun compte, puisque le compte
> n'a jamais été créé. Mais **s'il est réutilisé ailleurs, le changer.** Le
> purger vraiment demanderait `git filter-repo` et une réécriture d'historique.

Pour créer le compte comptable le jour venu : dashboard Supabase (Authentication
→ Add user) ou API admin, puis attribution du rôle dans `public.user_roles`.
Seul le rôle `admin` y est défini à ce jour.

**Données personnelles.** `facturation/clients_2026-01-28.csv` et son pendant
`.json` contiennent **29 clients réels** : noms, NIU, téléphones, e-mails,
numéros CNPS, centres de rattachement. Ils sont versionnés. **Le dépôt doit
rester privé.** Un repassage en public exigerait au préalable une purge de
l'historique (`git filter-repo`), le simple retrait des fichiers ne suffisant
pas.

---

## 5. Déduplication de shadcn/ui (01/08/2026)

Les deux dossiers `src/components/ui/` (53 fichiers) et
`src/modules/gestion/components/ui/` (55) n'étaient **pas** de simples copies.
Sur les 49 fichiers comparables : 28 identiques, **21 divergents**.

### Ce qui a été dédupliqué — 38 fichiers

Leur contenu dans le module est remplacé par un réexport d'une ligne vers
`src/components/ui/`. Une seule implémentation subsiste, et **aucun des 651
imports `@gestion/components/ui/…` n'a été touché** : le chemin reste valide.

Le chunk `GestionModule` passe de **125,8 à 121,7 ko** (gzip 36,4 → 35,3).

### Ce qui reste distinct — 17 fichiers

Divergences délibérées, conservées telles quelles :

| Fichier(s) | Divergence |
|---|---|
| `select` | défilement par `ScrollArea`, `rounded-lg`, ombre au survol |
| `button`, `badge`, `toggle`, `navigation-menu` + 4 `*-variants.ts` | variants CVA extraits (react-refresh) ; le bouton du site a en plus `amber`, `purple`, `success` |
| `alert-dialog`, `calendar`, `dialog`, `tabs` | classes Tailwind différentes |
| `sonner` | toasts en haut sur mobile, pour ne pas masquer `MobileBottomNav` |
| `toggle-group` | dépend de `toggle-variants` |
| `confirm-dialog`, `file-input` | propres à la console |

### Deux améliorations remontées du module vers le site

L'analyse a montré que le module était **en avance** sur deux points. Les
unifier naïvement en faveur du site aurait été une régression ; les deux ont
donc été portées vers `src/components/ui/` avant déduplication :

1. **`chart.tsx` — sécurité.** Le module assainissait les valeurs et les noms
   de propriétés CSS avant de les écrire via `dangerouslySetInnerHTML`
   (`sanitizeCssValue`, `sanitizeCssKey`). **Le site ne le faisait pas** : une
   couleur issue de données pouvait sortir du bloc de règles. Correction déjà
   mentionnée dans `docs/rapport-securite-2026-04-11.md`, jamais reportée.
2. **`pagination.tsx` — langue.** Le module était traduit (« Précédent »,
   « Suivant », `aria-label` français), le site était resté en anglais alors
   que toute l'interface est en français.

### Précaution pour la suite

**Avant de modifier un fichier de `@gestion/components/ui/`, vérifier s'il
s'agit d'un réexport** — l'éditer n'aurait aucun effet. Pour faire diverger un
composant qui ne diverge pas encore, remplacer le réexport par une vraie
implémentation et l'inscrire au tableau ci-dessus.

---

## 6. Premiers tests du site vitrine (01/08/2026)

Aucun des 13 fichiers de test ne couvrait l'hôte. Trois modules sont désormais
couverts, **82 tests** — la suite passe de 169 à **251**.

| Fichier | Ce qui est vérifié |
|---|---|
| `src/utils/__tests__/taxCalculations.test.ts` | Calculateur d'IGS public : les 10 tranches, chaque borne des deux côtés, TDL à 10 %, sortie du barème au-delà de 49 999 999 F CFA |
| `src/utils/__tests__/fraisMarche.test.ts` | Liquidation des frais d'enregistrement : droit à 7 %, CAC assis sur le droit, timbre par page, assiette de la pénalité de retard, bascule du barème CNE au 21/07/2026, refus de chiffrer hors barème |
| `src/utils/__tests__/security.test.ts` | `hasPermission` et sa journalisation des refus, masquage de texte, force des mots de passe, caviardage récursif avant stockage, jetons CSRF |

### Choix de périmètre

Les cibles sont les **calculs exposés au public** et les **décisions de
sécurité** : une tranche décalée d'un franc affiche un montant d'impôt faux à
un visiteur, et un contrôle de rôle trop permissif ouvre l'administration.

Les services du blog, `metadataService` et `seoService` sont volontairement
laissés de côté : ils font l'objet d'un chantier en cours et des tests écrits
maintenant porteraient sur un état transitoire.

### Les tests ont été éprouvés

Un test qui passe du premier coup ne prouve rien. Cinq régressions ont été
introduites volontairement puis annulées, pour vérifier que la suite les
attrape :

| Régression simulée | Détectée par |
|---|---|
| Pénalité de retard assise aussi sur le timbre | 1 test |
| Bascule du barème CNE décalée d'un jour (`<` → `<=`) | 1 test |
| Borne d'une tranche IGS décalée d'un franc | 3 tests |
| `hasPermission` accordant l'accès admin au rôle `user` | 2 tests |
| Masquage laissant voir les chaînes courtes en clair | 1 test |

---

## 7. Tests de composants React (01/08/2026)

**Rectification.** La section précédente affirmait qu'aucun test ne couvrait
les composants : c'était faux.
`src/modules/gestion/components/printable/__tests__/PrintableDocuments.test.tsx`
en couvrait déjà cinq, par rendu statique (`renderToStaticMarkup`), sans
dépendance de test supplémentaire.

Ce qui manquait, c'était de quoi tester les composants **interactifs**.

### Outillage ajouté

`@testing-library/react`, `@testing-library/user-event` et
`@testing-library/jest-dom` en `devDependencies`. `vitest.config.ts` gagne le
plugin React — sans lui le JSX des `.tsx` testés n'est pas transformé — et un
`setupFiles` (`src/test/setup.ts`) qui charge les matchers DOM et vide le DOM
entre deux tests.

Aucune des vulnérabilités signalées par `npm audit` ne provient de ces
paquets : elles viennent de dépendances transitives préexistantes (Babel,
`brace-expansion`, `picomatch`).

### Couverture ajoutée — 21 tests

| Fichier | Ce qui est vérifié |
|---|---|
| `src/components/calculateur/__tests__/IGSCalculatorForm.test.tsx` | Chaînage saisie → conversion → calcul → remontée au parent : bouton désactivé à vide, montant de la tranche, séparateurs de milliers acceptés, saisie non numérique traitée comme zéro, recalcul après modification |
| `src/components/calculateur/__tests__/TaxResultDisplay.test.tsx` | Les deux modes d'affichage et les quatre blocs conditionnels, chacun testé dans les deux sens : TDL, total, message hors barème, libellé de la première tranche |

Le barème lui-même est couvert par `taxCalculations.test.ts` (§ 6). Ces tests
couvrent ce que ces derniers ne peuvent pas voir : **un calcul juste dont le
résultat n'arrive jamais à l'écran**.

### Éprouvés par mutation

| Régression simulée | Détectée |
|---|---|
| Bouton de calcul jamais désactivé | oui |
| `amount !== undefined` remplacé par `amount` — un montant nul disparaît | oui |
| Libellé de la première tranche appliqué à la mauvaise classe | oui |

Deux assertions ont dû être resserrées en cours de route, le composant ayant
raison contre le test : « TDL » figure aussi dans « Total à payer (IGS + TDL) »,
et le chiffre d'affaires apparaît deux fois lorsqu'il coïncide avec une borne
de tranche.

---

## 8. Contact et devis (01/08/2026)

51 tests de plus — la suite passe de 272 à **323**.

| Fichier | Ce qui est vérifié |
|---|---|
| `src/utils/contact/__tests__/validation.test.ts` | Champs requis remontés **en une passe**, formats d'e-mail et de numéro WhatsApp acceptés/refusés, et surtout l'**alignement des bornes sur les contraintes de la base** |
| `src/components/contact/__tests__/ContactForm.test.tsx` | Parcours complet : erreurs sous le bon champ, effacement à la correction, envoi, réinitialisation, verrouillage du bouton, échec réseau |
| `src/components/quote/__tests__/QuoteForm.test.tsx` | Contrat du composant contrôlé, masquage du choix de service quand il est imposé, verrouillage pendant l'envoi, `SuccessMessage` |

### Pourquoi les bornes de validation sont testées explicitement

`CONTACT_FIELD_LIMITS` double les contraintes `CHECK` posées par
`website_harden_input_constraints`. Si les deux divergent, le visiteur remplit
un formulaire que le front accepte et que la base rejette, avec une erreur
serveur incompréhensible.

Un test fige donc les six valeurs en dur. Il n'est pas redondant avec les tests
de longueur : ceux-ci lisent `CONTACT_FIELD_LIMITS` et **suivraient** une
modification sans broncher. Vérifié par mutation — porter la limite de message
à 50 000 ne fait tomber que ce test-là.

### Une découverte sur la validation d'e-mail

Le champ est `type="email"` : **le navigateur refuse lui-même** une adresse sans
arobase, et la soumission n'a pas lieu — la validation applicative n'est jamais
atteinte. Elle ne sert que pour ce que HTML5 laisse passer, `nathan@example`
étant le cas type (accepté par le navigateur, refusé par la regex qui exige un
point). Les deux barrières sont testées séparément.

### Éprouvés par mutation

| Régression simulée | Détectée |
|---|---|
| Sélecteur de service affiché même quand il est imposé | oui |
| Bouton « Annuler » jamais verrouillé pendant l'envoi | oui |
| `FormInput` n'affichant plus les messages d'erreur | oui — 5 tests, contact et devis |
| Limite de message portée de 5 000 à 50 000 | oui |

---

## 9. Reste à faire

- Étendre la couverture du site vitrine aux services blog, `metadataService` et
  `seoService`, une fois le chantier en cours stabilisé.
- Les sections de contenu de la page d'accueil et la navigation restent sans
  tests — plusieurs sont en cours de refonte.
