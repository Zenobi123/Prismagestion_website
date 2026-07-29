# Site web PRISMA GESTION

Site public du cabinet PRISMA GESTION (Yaoundé, Cameroun) : présentation
des services, blog de veille fiscale, calculateurs et espace admin.

**En production :** https://prismagestion.site — hébergement Vercel,
déploiement automatique depuis la branche `main`.
Marche à suivre complète : [`docs/DEPLOIEMENT.md`](docs/DEPLOIEMENT.md).

## Backend Supabase

Le site s'appuie sur **Supabase** (projet partagé « prisma taskplanner »,
`xkwqgxqmwxxpzrsurchk`, région eu-central-1) :

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
- **Notifications email** : la fonction edge `send-email` notifie le
  propriétaire à chaque contact/devis/rendez-vous via Resend. Sans secret
  `RESEND_API_KEY` configuré, elle répond sans erreur et les demandes restent
  simplement visibles dans l'espace admin. Pour activer l'envoi :
  `supabase secrets set RESEND_API_KEY=... NOTIFY_EMAIL=...` (ou via le
  dashboard Supabase → Edge Functions → Secrets).

Le schéma complet est versionné dans `supabase/migrations/`.

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
git clone https://github.com/Zenobi123/Prisma-Gestion_website.git
cd Prisma-Gestion_website

npm install
cp .env.example .env   # renseigner les variables Supabase (facultatif :
                       # sans elles, le backend local prend le relais)

npm run dev            # serveur de développement sur http://localhost:8080
```

Autres commandes :

```sh
npm run build          # build de production dans dist/
npm run preview        # servir le build de production en local
npm run lint           # ESLint
```

## Technologies

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Déploiement

Toute fusion dans `main` déclenche un déploiement en production sur Vercel.
La configuration d'hébergement (réécriture SPA, en-têtes de sécurité, cache)
est dans `vercel.json`.

La procédure complète — projet Vercel, variables d'environnement, DNS du
domaine `prismagestion.site` et vérifications après mise en ligne — est
documentée dans [`docs/DEPLOIEMENT.md`](docs/DEPLOIEMENT.md).
