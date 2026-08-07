# Remédiation structurelle de la console — état au 07/08/2026

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

## 2. Ce qui a été livré (5 commits, tous en production)

| Commit | Objet |
|---|---|
| `bef1c9b` | Protection des pièces de facturation + réparation de la GED |
| `5881060` | Piste d'audit (journal des modifications) |
| `f3e8560` | Séparation débours / honoraires |
| `dd6ca8e` | Générateur de tâches depuis le calendrier fiscal |
| `950f489` | Clôture d'exercice côté serveur, verrouillante |

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

**Bug latent non corrigé.** La contrainte `tasks_status_check` n'autorise que
`en_attente`, `en_cours`, `termine` — **pas `en_retard`**. Or
`taskService.updateTaskStatusesBasedOnDates()` tente de l'écrire, et l'erreur
part dans un `catch` vide. Le statut « en retard » n'a donc jamais été
persisté : il n'existe qu'en mémoire, le temps de l'affichage. À traiter avec
le correctif de `getTasks()` (§ 5, administratif).

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
| Correctif `getTasks()` : sortir l'écriture de la lecture, supprimer le `refetchInterval` de 60 s, régler le bug `en_retard`, remplacer le compteur `tachesencours` par une vue | ½ j |
| Retirer le code mort : `storageService.ts` (mock), `administrationService.ts` (jamais importé), les 2 chemins de sauvegarde fiscale morts **et tronquants** | ½ j |
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

Les deux demi-journées du plan administratif (`getTasks()` et le code mort)
sont le meilleur rapport effort/bénéfice restant. Ensuite, **contrats et
facturation récurrente** est le chantier qui économisera le plus de temps au
quotidien.

---

## 6. Conventions établies pendant ce chantier

À respecter pour la suite :

1. **Une référence de fichier stocké est un chemin, jamais une URL.** L'URL se
   génère à la lecture. Trois implémentations avaient réinventé ce problème.
2. **Les règles d'intégrité vivent dans la base, pas dans l'écran.** Trois
   écrans créent des lignes de facture : une règle posée dans un composant ne
   vaut que pour ce composant.
3. **Une lecture n'écrit jamais.** `getTasks()` viole encore cette règle.
4. **Les fonctions de trigger ne sont pas appelables en RPC** : révoquer
   `EXECUTE` (PostgreSQL ne le vérifie pas au déclenchement d'un trigger).
5. **Les tests sont éprouvés par mutation** — introduire volontairement la
   régression et vérifier qu'un test tombe. Pratique déjà en vigueur dans le
   dépôt (`docs/FUSION.md` § 6).
6. **`aideContent.ts` est tenu à jour** à chaque fonctionnalité notable :
   `APP_VERSION`, `LAST_UPDATED`, entrée de changelog, et rubrique d'aide.
   Version actuelle : **1.10.0**.
