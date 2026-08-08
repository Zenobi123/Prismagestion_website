# Remédiation structurelle de la console — état au 07/08/2026 (soir)

Ce document sert de point de reprise. Il résume ce qui a été fait, ce qui a été
délibérément écarté, les pièges rencontrés, et ce qui reste.

Il fait suite à un audit structurel de `src/modules/gestion/` portant sur quatre
plans : comptable, commercial, administratif, archives.

---

## 1. Le diagnostic d'origine

La console est un **outil fiscal camerounais solide** posé sur un **socle de
données qui n'était pas celui d'un cabinet comptable**. Défaut racine : la base
enregistrait des états courants, jamais des faits datés et attribués.

Cinq manques structurants avaient été identifiés :

| Manque | État |
|---|---|
| Aucune piste d'audit | **corrigé** |
| Aucune immuabilité des pièces, cascades destructrices | **corrigé** |
| Clôture d'exercice en `localStorage`, sans effet réel | **corrigé** |
| Chiffre d'affaires incluant les impôts refacturés | **corrigé** |
| Calendrier fiscal ne produisant aucune tâche | **corrigé** |

---

## 2. Ce qui a été livré (6 commits, tous en production)

| Commit | Objet | État |
|---|---|---|
| `bef1c9b` | Protection des pièces de facturation + réparation de la GED | en production |
| `5881060` | Piste d'audit (journal des modifications) | en production |
| `f3e8560` | Séparation débours / honoraires | en production |
| `dd6ca8e` | Générateur de tâches depuis le calendrier fiscal | en production |
| `950f489` | Clôture d'exercice côté serveur, verrouillante | en production |
| `8ac1719` | Statut de tâche dérivé, vue de charge, retrait du code mort | en production |

### 2.1 Protection des pièces et GED (`bef1c9b`)

- `documents_administratifs.fichier_url` → **`fichier_path`**. Le code
  persistait l'URL de `createSignedUrl()`, valable 3600 s : tout document
  déposé devenait inaccessible au bout d'une heure. L'URL se génère désormais
  à la lecture (`getDocumentUrl()`), sur le modèle déjà correct de
  `fiscalAttachmentService`.
- Une facture hors brouillon ne se supprime plus, elle s'annule. Règle portée
  par le trigger `factures_interdire_suppression_piece` **et** doublée côté
  applicatif dans `factureDeleteService.ts` pour le message d'erreur.
- `paiements.facture_id` passé en `RESTRICT` : un règlement encaissé ne
  disparaît plus avec sa facture.
- Six liens vers `clients` passés en `RESTRICT` (`devis`, `propositions`,
  `documents_administratifs`, `fiscal_obligations`,
  `procedures_administratives`, `employes`). `permanentDeleteClient()` échoue
  désormais tant qu'un élément subsiste — c'est voulu, la corbeille reste la
  voie normale.
- Trois contraintes FK dupliquées supprimées (`fk_tasks_client`,
  `fk_tasks_collaborateur`, `users_collaborateur_id_fkey`).

### 2.2 Piste d'audit (`5881060`)

- Table **`audit_log`**, alimentée par le trigger `journaliser_modification()`
  sur **21 tables**. En lecture seule : aucune policy d'écriture n'existe.
- Sur `UPDATE`, seul le **différentiel** est conservé (colonnes réellement
  modifiées), `updated_at`/`updated_by` exclus. Un `UPDATE` sans changement de
  fond ne produit aucune ligne.
- `created_by` / `updated_by` sur les 10 tables principales. Leur intérêt en
  mono-utilisateur n'est pas d'identifier une personne mais de distinguer une
  écriture applicative d'une intervention directe en base : `auth.uid()` y est
  alors `NULL`.
- `clients.updated_at` ajoutée — elle n'existait pas, alors que c'est la table
  la plus écrite (`fiscal_data` y est réenregistré en entier à chaque
  sauvegarde d'obligations).
- Consultation : **Paramètres → Journal**.

### 2.3 Débours / honoraires (`f3e8560`)

- `factures` et `devis` reçoivent `montant_impots` et `montant_honoraires`,
  recalculés par trigger depuis les lignes.
- **Deux notions à ne jamais confondre** :
  - ce que le client **doit** → `montant` (impôts compris, base du
    recouvrement, inchangé) ;
  - ce que le cabinet a **produit** → `montant_honoraires` (le vrai CA).
- Ampleur du défaut corrigé : sur les 8 factures existantes, 2 194 739 F CFA
  facturés dont **1 752 739 d'impôts** et **442 000 d'honoraires**. Les
  rapports affichaient un CA cinq fois trop élevé.
- 5 tests dans `utils/reports/__tests__/reportDataService.test.ts`.

### 2.4 Générateur de tâches fiscales (`dd6ca8e`)

- Bouton **« Échéances fiscales »** sur le tableau de bord. Déclenchement
  manuel (choix retenu contre une tâche planifiée), anticipation **30 jours**.
- Logique **pure** dans `lib/spec/generationTaches.ts` (la date du jour est un
  paramètre) — 19 tests.
- Idempotence portée par la base : `tasks.reference_obligation`
  (`IGS-2026-T3`, `DSF-2026`) + index unique **partiel** sur
  `(client_id, reference_obligation)`. Partiel, pour que les tâches saisies à
  la main, sans référence, ne se gênent pas entre elles.
- `ECHEANCES_ANNUELLES` ajoutées à `fiscal-constants.ts` (Patente 28 février,
  DSF 15 mars, DARP et DBEF 30 juin) : elles ne vivaient qu'en commentaire.

### 2.5 Clôture serveur (`950f489`)

- Table **`exercices`**. Une année absente est ouverte ; seules les clôtures
  sont enregistrées — même sémantique que l'ancien `localStorage`.
- Trigger `verrouiller_exercice_clos` sur `factures`, `paiements`, `devis`,
  `propositions`, `courriers`, `fiscal_obligations` : plus aucune écriture
  possible sur un exercice clos, **création comprise**. Le trigger contrôle les
  deux bornes d'un `UPDATE` (on ne sort pas une pièce d'un exercice clos).
- Les lignes de document n'ont pas de trigger propre : les modifier déclenche
  `recalculer_ventilation_*`, qui met à jour le parent verrouillé. Protection
  indirecte, volontaire.
- Les **tâches ne sont pas verrouillées** : ce ne sont pas des pièces
  comptables.
- `useClotures()` passe à React Query ; **`closeYear` et `reopenYear` sont
  asynchrones** — les attendre, sinon un échec d'écriture passe pour une
  réussite.

### 2.6 Statut dérivé, vue de charge, code mort (`8ac1719`)

**`getTasks()` ne lit plus que.** Elle réécrivait les statuts et
resynchronisait `collaborateurs.tachesencours` à chaque appel ; avec un
`refetchInterval` de 60 s sur trois écrans partageant la clé `["tasks"]`, la
console réécrivait la base en boucle. Les `refetchInterval` sur `tasks` et
`collaborateurs` sont retirés — les mutations invalident déjà les clés, et
`TaskForm`/`MissionCard` invalident désormais aussi `["collaborateurs"]`, que
la charge dérivée rend sensible aux écritures sur les tâches.

**Le bug `en_retard` est réglé en cessant de l'écrire.** « En retard » et
« planifiée » ne sont pas des états de la tâche : ce sont des relations entre
ses dates et le jour courant. Les persister obligeait à un balayage
quotidien — précisément le balayage greffé dans la lecture. La contrainte
`tasks_status_check` est **inchangée** : c'est le type TypeScript qui mentait
sur la colonne, et ce mensonge rendait le bug invisible au compilateur.

- `lib/spec/statutTache.ts` — module **pur**, la date du jour en paramètre.
  `StatutTache` (3 valeurs, ce que la base accepte) contre `StatutAffiche`
  (5 valeurs, ce que l'écran montre). 19 tests, éprouvés par mutation.
- `getTasks()` retourne `TacheAffichee` = la ligne + `statut_affiche`.
- La règle vivait en **quatre** exemplaires divergents : l'écriture,
  `RecentTasks.getStatusBadge`, le calcul `isOverdue` de la même boucle de
  rendu, et `useTaskStats` — qui comptait comme « actives » des tâches que
  `RecentTasks` affichait en rouge. Une seule définition désormais.
- Effet de bord réparé : le filtre « En retard » de `MissionFilters` ne
  trouvait jamais rien, `Missions.tsx` lisant le statut brut. `MissionCard`
  distingue maintenant `status` (affiché) et `statutEnregistre` (réécrivable).

**`collaborateurs.tachesencours` devient la vue `collaborateurs_charge`**
(migration `20260807102437`). Un compteur qu'il faut recalculer à chaque
lecture n'est pas un compteur, c'est un agrégat.

- `security_invoker = true` (PG 15.14) : sans lui la vue court-circuiterait
  les 14 policies de `collaborateurs`.
- Le prédicat SQL est la transcription exacte de `peseSurLaCharge()` — les
  deux doivent évoluer ensemble. Concordance éprouvée sur 10 cas fictifs.
- `c.*` est figé à la création : **ajouter une colonne à `collaborateurs`
  impose de recréer la vue.**
- Lectures sur la vue, écritures sur la table. `NouveauCollaborateur` (type)
  exclut `tachesencours` des écritures.

**24 fichiers de code mort retirés.** Au-delà des trois cibles annoncées, la
fermeture transitive était obligatoire : `saveService.ts` avait deux
importateurs (`useSavingState`, `useFiscalSave`) tirés par
`useObligationsFiscales.tsx`, orchestrateur que plus personne n'importe,
remplacé par `useObligationsFiscalesState` + `useUnifiedFiscalSave`. Le barrel
`hooks/fiscal/services/index.ts` n'était lui non plus importé de nulle part et
maintenait seul en vie `cacheService`, `fetchService`, `verifyService`,
`validationService` et le dossier `verification/`.

`fiscalDataPreparer` était pire que tronquant : il écrivait
`obligations: { [fiscalYear]: … }`, écrasant **toutes les autres années** du
client. Mort, donc jamais déclenché — mais à ne surtout pas ressusciter.

### 2.7 Lisibilité mobile des tâches et des missions

97 % du trafic arrive sur mobile. Mesures réelles en 375 px, CSS de production
chargé.

> **Correctif de portée, constaté après coup.** `RecentTasks` **n'est monté par
> aucun écran** : son seul importateur est `DashboardCollapsible`, lui-même
> jamais importé. Rollup l'élimine au tree-shaking — il n'apparaît dans aucun
> chunk du build. Le message du commit `f07eeeb` le décrit comme étant sur
> « l'écran d'accueil » : c'est faux. Le tableau de bord réel monte
> `QuickStats` + `DashboardAccordion` (IGS, attestations, patente, immobilier,
> DSF, DBEF) et **n'affiche aucune liste de tâches**. Le travail sur
> `MissionCard`, lui, sert bien : `Missions.tsx` → `MissionList` →
> `MissionCard` est un chemin vivant, vérifié dans le bundle de production.

| Écran | Avant | Après |
|---|---|---|
| Titre de tâche (`RecentTasks`) | 73 px, tableau à 5 colonnes | **267 px**, fiches |
| Titre de mission (`MissionCard`) | 161 px | **270 px** |
| Boutons de mission | 36 px de haut, 26–28 px de large pour deux d'entre eux | **44 × 83 px**, les quatre |

- `RecentTasks` bascule en fiches sous `sm:` via `useIsMobile()`, comme
  `CollaborateurList`. L'accent de statut (`ACCENT_STATUT`) est **partagé**
  entre les deux rendus : le tableau et les fiches ne peuvent pas diverger.
- `MissionCard` passe en colonne unique sous `sm:` — titre pleine largeur,
  badge à sa droite, quatre actions en `grid-cols-4` sur leur propre rangée.
  En colonne latérale, quatre boutons à 44 px n'auraient laissé que ~130 px
  au titre : élargir les cibles imposait de revoir la disposition.
- Les quatre boutons portent `.cible-tactile` (`min-height: 2.75rem`,
  `touch-action: manipulation`), la classe posée le 05/08/2026 et jusqu'ici
  utilisée dans seulement deux fichiers de la console.
- Non-régression bureau vérifiée en 900 px : disposition en ligne, badge
  unique, libellés longs restitués.

**Le reste du code mort est parti** : `useFiscalDataLoader`,
`useBulkFiscalUpdate`, `useObligationStatus`, `useStableStatusChange`,
`utils/dateUtils`. `hooks/fiscal/` ne contient plus que 8 fichiers, tous
atteignables depuis `ObligationsFiscales.tsx`.

---

## 3. Décisions de cadrage à ne pas rouvrir

| Décision | Raison |
|---|---|
| **Pas de TVA ni de retenues à la source** | Le cabinet n'y est pas assujetti. L'absence de HT/TVA/TTC est conforme, pas une lacune. Débloque l'unification des lignes (§ 5). |
| **Pas de rôles supplémentaires ni de RLS par portefeuille** | Nathan est et restera le seul utilisateur de la console. Un seul rôle `admin`, sur lequel reposent 78 policies. Chantier de 2–3 j écarté comme sans bénéficiaire. |
| **Verrouillage total à la clôture** | Choix assumé : corriger un exercice clos impose de le rouvrir. Contrepartie connue — voir § 4. |
| **Génération de tâches manuelle** | Bouton plutôt que tâche planifiée : l'utilisateur voit ce qui sera créé avant de valider. |
| **Précompte sur loyer annuel non généré** | Aucune date légale documentée. Préférer ne rien proposer qu'inventer une échéance. À compléter dans `ECHEANCES_ANNUELLES` si la date est connue. |

---

## 4. Points d'attention pour la suite

**Règlement tardif sur exercice clos.** Enregistrer un paiement sur une facture
d'un exercice clos échoue avec un message explicite. Il faut rouvrir, encaisser,
reclôturer. Les deux mouvements sont tracés dans `audit_log`. C'est la
contrepartie du verrouillage total.

**Une contrainte FK est un identifiant public.** PostgREST expose les jointures
sous le nom de la contrainte (`clients!fk_tasks_client`). Supprimer
`fk_tasks_client` comme doublon a cassé silencieusement `reportDataService`,
dont le `catch` de repli masquait la panne. **Avant de supprimer une
contrainte, chercher son nom dans le code.** Corrigé dans `f3e8560`.

**`apply_migration` horodate à l'heure réelle UTC**, pas selon le nom de fichier
fourni. Les dix fichiers de `supabase/migrations/` ont été renommés pour
coïncider avec `schema_migrations` — même opération qu'au § 2.1 de
`docs/FUSION.md`. Le vérifier après toute nouvelle migration.

**`npx tsc --noEmit` n'analyse aucun fichier.** Le `tsconfig.json` racine
porte `"files": []` et délègue à des `references` : sans `-p`, `tsc` compile
un projet vide et sort en succès. La commande qui vérifie réellement est
`npx tsc --noEmit -p tsconfig.app.json` — celle que lance le `pre-push`, qui
est donc correct. Trois erreurs de typage réelles sont passées inaperçues
pendant ce chantier avant de relancer avec `-p`. **Toujours utiliser `-p` en
vérification manuelle.**

**Une contrainte `CHECK` est une spécification, le type TypeScript doit la
dire.** `Task["status"]` déclarait `"en_retard"` que `tasks_status_check` a
toujours refusé : le compilateur ne pouvait pas voir le bug. Avant d'ajouter
une valeur à un type de statut, vérifier la contrainte correspondante.

**`CLAUDE.md` n'est pas commité.** Il porte à la fois la documentation des
règles posées ici (références de fichiers, immuabilité des pièces, suppression
client, non-assujettissement TVA) **et** celle d'un chantier fiscal antérieur en
cours. Les deux ne sont pas séparables sans `git add -p`.

**Chantier fiscal en cours, non commité** — à ne pas embarquer par mégarde dans
un commit : `SPEC_LOVABLE.md`, `facturation/*` (9 fichiers),
`src/components/calculateur/*` (4), `src/utils/taxCalculations.ts` et son test,
`src/modules/gestion/lib/spec/fiscal.ts`. **Sur ce dépôt, `git add -A` est
dangereux** : tout push sur `main` déploie en production. Indexer nommément.

---

## 5. Ce qui reste, par plan

Par ordre de valeur décroissante à l'intérieur de chaque plan.

### Commercial

| Chantier | Effort | Pourquoi |
|---|---|---|
| Contrats / lettres de mission + facturation récurrente | 3–4 j | Le modèle économique du cabinet (forfaits) n'est pas modélisé ; chaque facture mensuelle est ressaisie |
| Saisie des temps + taux horaire | 2–3 j | La rentabilité par dossier est incalculable. Le rapport « Analyse des Temps » ne mesure aucun temps |
| Catalogue de prestations en base | 1–2 j | Les tarifs sont codés en dur dans `facturePrestations.ts` : changer un prix exige un déploiement |
| Unifier les 4 représentations de ligne | 2 j | `facture_prestations`, `devis_prestations`, `propositions.lignes` (JSONB), table `prestations` orpheline. Débloqué par l'absence de TVA |
| Politique de relance | 1–2 j | `payment_reminders` vide, fonction edge déployée inutilisée, pas de balance âgée |
| CRM amont | 3 j | `clients.interactions` initialisé à `[]` et jamais exploité ; les `quote_requests` du site ne se déversent pas dans la console |

### Comptable

| Chantier | Effort |
|---|---|
| Note d'avoir (corriger sans supprimer — devenu plus pressant depuis `bef1c9b`) | 1–2 j |
| Numérotation atomique (3 implémentations concurrentes ; le numéro sert de clé primaire) | 1 j |
| Lettrage paiement ↔ facture + balance âgée | 2–3 j |
| Charges, fournisseurs, trésorerie (aucune table de dépense n'existe) | 4–5 j |
| Sortir le fiscal du JSONB (`fiscal_obligations` existe et contient 0 ligne) | 3–4 j |

### Administratif

| Chantier | Effort |
|---|---|
| ~~Correctif `getTasks()`~~ — **fait**, voir § 2.6 | — |
| ~~Retirer le code mort~~ — **fait**, 24 fichiers, voir § 2.6 | — |
| ~~Retirer les 5 orphelins restants de `hooks/fiscal/`~~ — **fait**, voir § 2.7 | — |
| ~~3 écrans sans variante mobile~~ — **faits** le 07/08/2026 (§ 5 bis, lot 4). Seul `ClotureReport` conserve son tableau : il vise l'impression papier | — |
| **Test instable** : `src/components/contact/__tests__/ContactForm.test.tsx` › « laisse le navigateur bloquer une adresse sans arobase » échoue par intermittence en suite complète, passe systématiquement seul. Un `pre-push` qui refuse au hasard finit par être contourné au `--no-verify` | ¼ j |
| ~~Trancher le sort des 7 composants morts du tableau de bord~~ — **supprimés** le 07/08/2026 sur décision de Nathan, avec la chaîne `useExpiringClients` + `hooks/expiring/` qu'ils maintenaient seuls en vie. Acté : le tableau de bord n'affichera ni liste de tâches, ni documents clients expirants | — |
| Balayer les cibles tactiles du reste de la console — `.cible-tactile` est désormais posée dans les missions, les attestations, le journal et la génération de tâches, mais pas ailleurs | ½ j |
| Registre de courrier : référence séquentielle (aujourd'hui un timestamp base 36), PDF archivé, insertion non « best-effort » | 1–2 j |
| Enrichir les tâches (description, priorité, type de mission, charge) | 1 j |
| Décider du module RH/paie : le compléter (IRPP, CNPS, DIPE) ou le retirer de l'interface | décision |

### Archives

| Chantier | Effort |
|---|---|
| Métadonnées documentaires (taille, MIME, empreinte, auteur) et `date_expiration` — colonne existante, jamais renseignée, alors qu'elle pilote les alertes | 1 j |
| Politique de rétention (OHADA : 10 ans) | 1–2 j |
| Export d'archive (le « point de clôture » est un PDF, pas un jeu de données) | 2 j |
| Recherche documentaire transversale | 1–2 j |
| Clarifier les trois sens d'« archiver » (`statut='archive'`, corbeille, clôture) | ½ j |

### Recommandation de reprise

Les deux demi-journées du plan administratif sont faites (§ 2.6). Le chantier
suivant, et de loin le plus rentable, est **contrats et facturation
récurrente** : c'est le modèle économique du cabinet qui n'est pas modélisé.

---

## 5 bis. Tableaux sans variante mobile — inventaire au 07/08/2026

Relevé automatique : composants vivants portant un `<table>`/`<Table>`, sans
`useIsMobile` ni bascule `sm:hidden`/`hidden sm:`. Les sous-composants
(`*TableHeader`, `*TableRow`, `*TableBody`…) sont exclus : c'est leur parent
qui porte la bascule. Les documents imprimables aussi — ils visent le papier.

**Attention à la méthode** : chercher `useIsMobile` seul donne un faux
diagnostic. `ExpiringFiscalAttestations` gère parfaitement le mobile avec
`hidden sm:block` / `sm:hidden`, sans le hook — et c'est même préférable,
puisque rien ne dépend alors de JavaScript.

**Lot 1 (Facturation, cœur) — fait le 07/08/2026.** `PaiementsList`,
`PaymentsTable` et `InvoicesTable` passent en fiches sous `sm:`. Le menu
d'actions d'un paiement est extrait dans `PaiementActionsMenu`, **partagé**
par la ligne et la carte : les deux rendus ne peuvent pas proposer des actions
différentes. `formatDatePaiement` est extrait de même — il était dupliqué
dans trois composants. `PaiementTable` et `PaiementTableHeader`, morts, sont
supprimés.

**Lot 2 (Facturation, fin) — fait le 07/08/2026.** Sur les 8 écrans prévus,
**6 étaient morts** : `AnalyseParFacture` et `DetailsTabContent` dépendaient
de `AnalyseFacturesPaiements`, jamais importé ; `ResteAFaire`,
`SituationPaiements`, `SuiviPrestations` et `SyntheseGlobale` dépendaient de
`VueActivite.tsx`, jamais importé non plus. Seuls `RapportEcheances` et
`DerivedPrestationsTab` sont vivants — tous deux passés en fiches.

**Piège de méthode, deuxième prise.** `grep "from '…/X'"` ne voit pas les
`lazy(() => import("…/X"))` : `SituationClients` avait été classé mort à tort.
Chercher le **chemin du module** (`facturation/SituationClients`), pas la
forme `from`. Et se méfier des cycles : `VueActivite` ↔ `ActiviteKPIs`
s'importent mutuellement, ce qui donne des compteurs d'importateurs non nuls
alors que la poche entière est morte.

**Lot 3 — fait le 07/08/2026.** `CourrierHistorique` (six colonnes, et des
boutons d'action de **24 px**) et le différentiel de `JournalModifications`
passent en fiches. Deux faux positifs de plus écartés : `UserManagementTable`
et `DataImportButton` géraient déjà le mobile par une variable `isMobile`,
que le motif de recherche `useIsMobile` ne voyait pas.

Les deux poches mortes de la Facturation ont été supprimées sur décision de
Nathan : `components/facturation/analyse/` (26 fichiers) et
`VueActivite.tsx` + `activite/` + `hooks/facturation/useVueActivite.ts`
(7 fichiers) — soit ~2 300 lignes.

**Lot 4 — fait le 07/08/2026, chantier mobile clos.**
`CommercialActivityTable` (grille mensuelle) et `ServiceActivityTable`
(11 colonnes dont 4 champs de saisie, ~30 px par champ en 375 px) passent en
fiches, champs à 44 px. Les deux barèmes d'`IGSInformation` s'affichent classe
par classe.

**Aucun écran vivant de la console n'impose plus de défilement horizontal sur
téléphone.** Seul `ClotureReport` conserve son tableau : il vise l'impression.

| Écran restant | Module |
|---|---|
| `ResteAFaire`, `SituationPaiements`, `SuiviPrestations`, `SyntheseGlobale` | Facturation — activité |
| `CommercialActivityTable`, `ServiceActivityTable`, `ClotureReport` | Clôture d'exercice |
| `UserManagementTable`, `JournalModifications` | Paramètres |
| `IGSInformation` | Outils |
| `DataImportButton` | Partagé (aperçu d'import) |

Déjà traités : `CollaborateurList`, `ClientList`, `ClientsList`,
`FactureTable`, `ExpiringFiscalAttestations`, `MissionCard`.

`RecentTasks` avait été traité au § 2.7 avant qu'on ne découvre qu'il était
mort ; il a été supprimé depuis. **Vérifier qu'un composant est monté avant
de le retravailler** — un `grep` de son nom d'export suffit.

---

## 6. Conventions établies pendant ce chantier

À respecter pour la suite :

1. **Une référence de fichier stocké est un chemin, jamais une URL.** L'URL se
   génère à la lecture. Trois implémentations avaient réinventé ce problème.
2. **Les règles d'intégrité vivent dans la base, pas dans l'écran.** Trois
   écrans créent des lignes de facture : une règle posée dans un composant ne
   vaut que pour ce composant.
3. **Une lecture n'écrit jamais.** Respectée depuis le § 2.6. Corollaire :
   une valeur qui se périme sans que personne n'y touche (un retard, une
   charge) se **dérive** à la lecture, elle ne se stocke pas.
4. **Les fonctions de trigger ne sont pas appelables en RPC** : révoquer
   `EXECUTE` (PostgreSQL ne le vérifie pas au déclenchement d'un trigger).
5. **Les tests sont éprouvés par mutation** — introduire volontairement la
   régression et vérifier qu'un test tombe. Pratique déjà en vigueur dans le
   dépôt (`docs/FUSION.md` § 6).
6. **`aideContent.ts` est tenu à jour** à chaque fonctionnalité notable :
   `APP_VERSION`, `LAST_UPDATED`, entrée de changelog, et rubrique d'aide.
   Version actuelle : **1.10.0**.
