# Welcome to your Lovable project

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
mode, un compte admin local `admin@prismagestion.com` / `admin123` est créé
et les données restent propres à chaque navigateur.

## Project info

**URL**: https://lovable.dev/projects/340433e9-ca27-4bce-a3f6-02758a95abb6

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/340433e9-ca27-4bce-a3f6-02758a95abb6) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with the following technologies:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/340433e9-ca27-4bce-a3f6-02758a95abb6) and click on Share -> Publish.

## I want to use a custom domain - is that possible?

We don't support custom domains (yet). If you want to deploy your project under your own domain then we recommend using Netlify. Visit our docs for more details: [Custom domains](https://docs.lovable.dev/tips-tricks/custom-domain/)
