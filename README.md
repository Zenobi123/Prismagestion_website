# PRISMA GESTION

Dépôt unique du cabinet PRISMA GESTION (Yaoundé, Cameroun). Il porte deux
applications dans un seul build Vite :

| | Emplacement | Accès |
|---|---|---|
| **Site vitrine** — présentation, blog de veille fiscale, calculateurs, espace d'administration | `src/` | public |
| **Console de gestion** — clients, obligations fiscales, facturation, courrier, missions, planning, rapports | `src/modules/gestion/` | `/admin/gestion`, réservé aux administrateurs |

La console provenait d'un second dépôt (`prisma-taskmaster-planner`),
désormais archivé. Le détail de la fusion et les écarts de migrations
subsistants sont consignés dans [`docs/FUSION.md`](docs/FUSION.md).

**En production :** https://prismagestion.site — hébergement Vercel,
déploiement automatique depuis la branche `main`.
Marche à suivre complète : [`docs/DEPLOIEMENT.md`](docs/DEPLOIEMENT.md).

> **Dépôt privé.** `facturation/` contient des exports de données clients
> réelles (noms, NIU, téléphones, numéros CNPS). Ne pas repasser le dépôt en
> public sans avoir purgé ces fichiers de l'historique.

## La console de gestion

Modules, tous préfixés par `/admin/gestion` :

| Route | Module | Description |
|---|---|---|
| `/` | Tableau de bord | KPIs, alertes fiscales (IGS, ACF, Patente, impôts immobiliers, DSF, DBEF), création rapide de tâches |
| `/clients` | Clients | CRUD clients (personnes physiques/morales), calcul fiscal automatique, agences, import/export (CSV, JSON, TXT, PRISMA-CLIENTS), archivage et corbeille |
| `/gestion` | Gestion | Dossier du client : onglets Fiscal (ACF, immatriculation, impôts directs, obligations annuelles), Comptable, Contrats, Clôture et Dossier (checklist documentaire, interactions, historique) |
| `/facturation` | Facturation | Devis, factures, propositions de paiement, paiements avec reçus, situation clients |
| `/courrier` | Courrier | Rédaction à partir d'une vingtaine de modèles, publipostage, historique avec statuts |
| `/missions` | Missions | Suivi des missions, ordres et rapports de mission, import/export |
| `/planning` | Planning | Vue calendrier des échéances par collaborateur |
| `/collaborateurs` | Collaborateurs | Gestion du personnel et des accès |
| `/rapports` | Rapports | Rapports PDF (financiers, clients, fiscaux, RH, opérationnels) |
| `/parametres` | Paramètres | Cabinet (signature, cachet, signataire), clôture annuelle, transfert de données, utilisateurs |
| `/aide` | Aide | Documentation intégrée et journal des nouveautés |

L'interface est entièrement responsive : sur mobile, une barre de navigation
en bas d'écran remplace le menu latéral et les tableaux s'affichent en cartes.

Le dossier `facturation/` conserve le prototype HTML/localStorage dont la
console est issue. Il n'est pas buildé et sert de référence historique.

## Backend Supabase

Les deux applications s'appuient sur **le même projet Supabase**
(`xkwqgxqmwxxpzrsurchk`, région eu-central-1) et donc sur la même base de
production — toute modification de schéma est croisée :

- **Base de données partagée** : articles de blog, messages de contact,
  demandes de devis, rendez-vous, services, contenus des sections, fichiers
  médias. Les messages envoyés par les visiteurs arrivent réellement dans
  l'espace admin, quel que soit l'appareil.
- **Sécurité (RLS)** : lecture publique du contenu du site ; les messages,
  devis et rendez-vous peuvent être déposés par tous mais ne sont lisibles,
  modifiables et supprimables que par l'administrateur (rôle `admin` dans la
  table `user_roles`, vérifié par la fonction `has_role`).
- **Temps réel** : les tables du site sont dans la publication
  `supabase_realtime` — l'espace admin et les pages publiques se mettent à
  jour automatiquement.
- **Stockage** : bucket public `media` pour les images (upload réservé à
  l'admin).
- **Fonctions edge** (`supabase/functions/`) :
  - `send-email` — notifie le propriétaire à chaque contact/devis/rendez-vous
    via Resend. Sans secret `RESEND_API_KEY` configuré, elle répond sans
    erreur et les demandes restent visibles dans l'espace admin. Pour activer
    l'envoi : `supabase secrets set RESEND_API_KEY=... NOTIFY_EMAIL=...` (ou
    via le dashboard Supabase → Edge Functions → Secrets).
  - `apply-credit` — application d'un avoir sur la situation d'un client.
  - `send-payment-reminders` — relances de paiement.

Le schéma est versionné dans `supabase/migrations/`, dossier unique et
chronologique. Son état a été réconcilié avec la base lors de la fusion ;
**les écarts subsistants sont documentés dans
[`docs/FUSION.md`](docs/FUSION.md) — à lire avant tout `supabase db push`.**

### Espace admin

Connexion via `/auth` avec le compte administrateur du projet Supabase
(le compte `admin@prisma.com` existant a le rôle `admin`). Pour donner le
rôle admin à un autre compte, insérez une ligne dans `public.user_roles` :

```sql
insert into public.user_roles (user_id, role)
select id, 'admin' from auth.users where email = 'votre@email.com'
on conflict (user_id) do update set role = 'admin';
```

### Mode secours sans backend

Si les variables `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY` sont
absentes au build, le site bascule automatiquement sur un backend local
(`src/lib/localBackend/`) qui reproduit l'API de `supabase-js` dans le
localStorage du navigateur — pratique pour développer hors ligne. Dans ce
mode, un compte admin local `obiangtimenathan@gmail.com` / `admin123` est créé
et les données restent propres à chaque navigateur.

## Développer en local

Le projet a été démarré sur Lovable puis sorti de la plateforme : le dépôt
GitHub fait désormais seule référence. Prérequis : Node.js & npm
([installation avec nvm](https://github.com/nvm-sh/nvm#installing-and-updating)).

```sh
git clone https://github.com/Zenobi123/Prismagestion_website.git
cd Prismagestion_website

npm install            # installe les dépendances ET active les hooks Git
cp .env.example .env   # renseigner les variables Supabase (facultatif :
                       # sans elles, le backend local prend le relais)

npm run dev            # serveur de développement sur http://localhost:8080
```

Les hooks Git sont versionnés dans `.githooks/` et activés par `npm install`
(via le script `prepare`). Le hook `pre-commit` refuse les secrets, le hook
`pre-push` lance les tests et la vérification des types — Vercel ne faisant
ni l'un ni l'autre. Vérification : `git config core.hooksPath` doit répondre
`.githooks`.

Autres commandes :

```sh
npm run build          # build de production dans dist/
npm run preview        # servir le build de production en local
npm run lint           # ESLint
npm test               # Vitest (une passe)
npm run test:watch     # Vitest en continu
```

**npm exclusivement** (épinglé par `packageManager`, Node ≥ 22) : ne pas
introduire de `bun.lock` ni de `yarn.lock`.

### Alias de chemins

`@/` pointe vers `src/` (site vitrine) et `@gestion/` vers
`src/modules/gestion/` (console). Les trois fichiers `vite.config.ts`,
`vitest.config.ts` et `tsconfig.json` doivent rester en phase, et `@gestion`
doit y être déclaré **avant** `@` — sinon `@gestion/x` serait résolu comme
`@` suivi de `gestion/x`.

Les conventions détaillées — règles de calcul fiscal, numérotation des
documents, instantané `client_data`, formatage monétaire, points
d'intégration à ne pas casser — sont dans [CLAUDE.md](CLAUDE.md). Le module
Aide de la console (`/admin/gestion/aide`) documente l'usage de chaque écran.

## Technologies

- Vite 6
- TypeScript
- React 18
- shadcn-ui
- Tailwind CSS
- Supabase
- React Query
- Vitest (jsdom)

## Déploiement

Toute fusion dans `main` déclenche un déploiement en production sur Vercel.
La configuration d'hébergement (réécriture SPA, en-têtes de sécurité, cache)
est dans `vercel.json`.

La procédure complète — projet Vercel, variables d'environnement, DNS du
domaine `prismagestion.site` et vérifications après mise en ligne — est
documentée dans [`docs/DEPLOIEMENT.md`](docs/DEPLOIEMENT.md).
