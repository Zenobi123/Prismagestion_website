# Welcome to your Lovable project

## Fonctionnement sans backend

Le site fonctionne désormais **entièrement sans backend** (Supabase a été retiré) :

- Toutes les données (articles de blog, messages de contact, demandes de devis,
  rendez-vous, services, contenus des sections, fichiers médias) sont stockées
  dans le **localStorage du navigateur** via un client local
  (`src/lib/localBackend/`) qui reproduit l'API de `supabase-js`.
- Aucune variable d'environnement n'est requise : `npm i && npm run dev` suffit.
- Les mises à jour "temps réel" entre les onglets ouverts sont assurées par
  `BroadcastChannel`.
- Les notifications par email sont désactivées (aucun serveur pour les envoyer) ;
  les demandes restent consultables dans l'espace admin.

### Espace admin

Un compte administrateur local est créé automatiquement au premier chargement :

- **Email** : `admin@prismagestion.com`
- **Mot de passe** : `admin123`

Connexion via `/auth`, puis accès à `/admin`. Vous pouvez aussi créer votre
propre compte depuis la page d'inscription (il reçoit le rôle admin).

> ⚠️ **Limites de ce mode** : sans backend, les données sont propres à chaque
> navigateur. Les modifications faites dans l'espace admin ne sont visibles que
> sur l'appareil où elles ont été faites, et l'authentification n'offre aucune
> sécurité réelle (elle ne protège que les données locales du visiteur). Les
> contenus par défaut (articles, services, textes des sections) restent servis
> à tous les visiteurs.

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
