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

## 5. Reste à faire, hors périmètre de cette fusion

- Éventuellement dédupliquer les deux copies de shadcn/ui
  (`src/components/ui/`, 53 fichiers, et `src/modules/gestion/components/ui/`,
  55 fichiers). Coexistence volontaire à ce jour : elle garde le module
  autonome.
- Écrire des tests pour le site vitrine : les 13 fichiers de test existants
  couvrent tous la console, aucun ne couvre l'hôte.
