# Mise en ligne du site sur prismagestion.site

Guide de publication du site PRISMA GESTION sur le domaine
**prismagestion.site**, hébergé par **Vercel** et déployé automatiquement
depuis GitHub.

Le site est une application React à page unique (Vite + React Router). Trois
points de ce guide sont indispensables : la règle de réécriture (§ 0), les
variables d'environnement (§ 2) et les enregistrements DNS (§ 4).

---

## 0. Ce qui est déjà fait dans le dépôt

Aucune action de votre part sur ces points, ils sont dans le code :

| Élément | Fichier | Rôle |
|---|---|---|
| Réécriture SPA | `vercel.json` | **Indispensable.** Sans elle, `prismagestion.site/blog` et `/outils` renvoient une erreur 404 : ces routes n'existent pas sur le disque, elles sont construites par React Router dans le navigateur. La règle sert `index.html` pour toute URL inconnue. Les vrais fichiers (`/sitemap.xml`, `/robots.txt`, `/assets/*`) restent servis normalement : Vercel consulte le disque avant d'appliquer les réécritures. |
| En-têtes de sécurité | `vercel.json` | HSTS, anti-clickjacking, `nosniff`, politique de permissions. |
| Cache des assets | `vercel.json` | `/assets/*` en cache un an (les noms sont hashés au build) ; `sw.js` toujours revalidé, pour que la PWA se mette à jour immédiatement. |
| Domaine canonique | `index.html`, `public/sitemap.xml`, `public/robots.txt` | `prismagestion.site` déjà déclaré partout (canonical, Open Graph, sitemap). |
| Images de partage | `index.html`, `src/config/site.ts` | URLs absolues : Facebook, LinkedIn et WhatsApp refusent les images relatives. |
| Content-Security-Policy | `vite.config.ts` | Injectée au build, scripts inline autorisés par empreinte SHA-256. |

## 1. Choisir le projet Vercel

Le compte `zenobi123s-projects` contient trois projets :

| Projet | Dépôt GitHub relié | État |
|---|---|---|
| `prisma-gestion_website` | `Zenobi123/Prisma-Gestion_Website` | **À utiliser.** Déjà relié au bon dépôt. |
| `prisma-gestion-website` | — | Doublon créé le même jour, jamais réutilisé. À supprimer. |
| `prisma-scab` | `Zenobi123/Prisma_scab` | Autre application. **Ne pas y toucher.** |

Dans `prisma-gestion_website`, le dernier déploiement date d'avril 2026 et
porte sur une version obsolète du code : la connexion Git ne redéploie plus.
Sur **vercel.com → prisma-gestion_website → Settings → Git**, vérifier que le
dépôt `Zenobi123/Prisma-Gestion_website` est bien connecté sur la branche de
production `main` ; sinon, cliquer sur *Connect Git Repository* et le
resélectionner.

## 2. Variables d'environnement (à faire avant le premier déploiement)

Le fichier `.env` est actuellement versionné dans le dépôt : le build
fonctionne donc même sans configuration côté Vercel. **C'est un défaut à
corriger** (voir § 6). La bonne pratique est de déclarer les variables dans
Vercel : *Settings → Environment Variables*, portée **Production** *et*
**Preview**.

| Variable | Valeur | Conséquence si absente |
|---|---|---|
| `VITE_SUPABASE_URL` | URL du projet Supabase | Le site bascule sur le backend local (`localStorage`) : les messages de contact, devis et rendez-vous **ne vous parviennent pas** et restent dans le navigateur du visiteur. |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Clé publique Supabase | Idem. |
| `VITE_SUPABASE_PROJECT_ID` | Identifiant du projet | Idem. |
| `VITE_PLAUSIBLE_DOMAIN` | `prismagestion.site` | **À renseigner au lancement** (voir encadré). Mesure d'audience sans cookies. |
| `VITE_GA_ID` | `G-XXXXXXXXXX` | Alternative Google Analytics 4. Inutile si Plausible est activé. |

> **Ne lancez pas le site sans mesure d'audience.**
> C'est le premier verrou identifié par l'[audit commercial](../AUDIT_STRATEGIE_COMMERCIALE.md) :
> « pilotage à l'aveugle ». Le code est prêt — `AnalyticsService.initialize()`
> lit ces variables au build — mais aucune n'est définie aujourd'hui : le site
> partirait en production sans savoir d'où viennent les visiteurs ni quelles
> pages convertissent. Le jour de la mise en ligne est le bon moment : les
> données manquées ne se rattrapent pas.
>
> **Plausible est recommandé** plutôt que GA4 : sans cookies (donc sans
> bandeau de consentement à gérer), plus léger, et son domaine de mesure est
> précisément celui qu'on met en service.
>
> La Content-Security-Policy s'adapte automatiquement : `vite.config.ts`
> n'ouvre `plausible.io` ou `googletagmanager.com` que si la variable
> correspondante est définie au build. Sans configuration, la politique reste
> au plus strict — rien à modifier à la main.

Ces trois variables `VITE_SUPABASE_*` sont **publiques par conception** : elles
finissent dans le JavaScript envoyé au navigateur. La clé Supabase concernée
est la clé *publishable*, protégée côté serveur par les politiques RLS. Ne
jamais y placer la clé `service_role`.

Les secrets d'envoi d'e-mail (`RESEND_API_KEY`, `NOTIFY_EMAIL`) se configurent
côté Supabase, jamais ici :

```sh
supabase secrets set RESEND_API_KEY=... NOTIFY_EMAIL=...
```

### Notifications e-mail : liste d'origines autorisées

La fonction edge `send-email` rejette (403) toute requête venant d'une origine
non autorisée. Sa liste par défaut, dans
`supabase/functions/send-email/index.ts`, contient déjà
`https://prismagestion.site` et `https://www.prismagestion.site` : **rien à
faire pour le domaine final.** Deux réserves cependant :

- **Le secret Supabase `ALLOWED_ORIGINS` écrase entièrement cette liste.**
  S'il a été renseigné à l'époque Lovable, le domaine sera refusé. À vérifier
  dans *Supabase → Edge Functions → Secrets* : soit le supprimer pour revenir
  aux valeurs par défaut du code, soit y inclure les deux URLs ci-dessus.
- **Les domaines `*.vercel.app` n'y sont pas** — voir l'avertissement du § 5.

La liste tolère encore `*.lovable.app` et `*.lovableproject.com`, hérités de la
plateforme. Sans danger réel, mais à retirer du code une fois le site en
service.

## 3. Déclarer le domaine dans Vercel

**vercel.com → prisma-gestion_website → Settings → Domains → Add Domain**

1. Saisir `prismagestion.site`, valider.
2. Vercel propose d'ajouter aussi `www.prismagestion.site` : accepter. La
   configuration recommandée est **`prismagestion.site` en domaine principal**
   et **`www` redirigé** vers lui — le site déclare déjà
   `https://prismagestion.site/` comme URL canonique dans `index.html` et
   `sitemap.xml`. Une redirection évite que Google indexe deux fois le même
   contenu.
3. Vercel affiche alors les enregistrements DNS exacts à créer. **Ce sont ces
   valeurs-là qui font foi**, pas celles du § 4 : Vercel les adapte à votre
   projet et à sa région.

## 4. Configurer le DNS — le domaine est chez Lovable

⚠️ **Point particulier de ce dossier.** `prismagestion.site` a été acheté le
1er mai 2026 auprès de **Lovable Labs Incorporated** (facture
`3F29ED09-0017`, 1 USD pour 1 an). Ce n'est pas un registraire classique :

- le registraire ICANN qui parraine le domaine est **Name.com**, mandaté par
  Lovable ;
- par défaut, **c'est Lovable qui gère le DNS**, avec ses propres serveurs de
  noms et un enregistrement `A` créé automatiquement vers l'IP de Lovable.

Autrement dit, tant que rien n'est changé, le domaine continue de pointer vers
Lovable. Il faut donc reprendre la main sur le DNS depuis le tableau de bord
Lovable — votre compte reste nécessaire pour cela, même si vous ne développez
plus sur la plateforme.

Le chemin est le même pour les deux méthodes :
**Workspace settings → Workspace domains → *Configure* en face de
`prismagestion.site`.** Il faut être *admin* ou *owner* du workspace.

### Méthode A — déléguer le DNS à Vercel (recommandée)

La plus propre : Lovable ne garde que l'enregistrement du domaine, Vercel gère
tout le reste. Aucune valeur à maintenir en double.

1. Dans Vercel, section *Domains* du projet, choisir la configuration par
   **serveurs de noms (nameservers)**. Vercel affiche deux hôtes de la forme
   `nsX.vercel-dns.com` — les recopier exactement, ne pas les deviner.
2. Dans Lovable, écran *Configure* du domaine → section **Nameservers** →
   *Edit* → saisir les deux serveurs de Vercel → enregistrer.
3. Lovable cesse alors de gérer le DNS du domaine (comportement documenté :
   « If you've switched the domain to custom nameservers, Lovable no longer
   manages its DNS »). Les enregistrements se créent désormais dans Vercel.

### Méthode B — garder le DNS chez Lovable

Si vous préférez ne pas toucher aux serveurs de noms : rester sur le DNS de
Lovable et y pointer les enregistrements vers Vercel.

Dans Lovable, écran *Configure* du domaine → section **DNS records** :

| Type | Nom / Hôte | Valeur |
|---|---|---|
| `A` | `@` (racine) | l'adresse IP affichée par Vercel — en général `76.76.21.21` |
| `CNAME` | `www` | la cible affichée par Vercel — en général `cname.vercel-dns.com` |

Deux pièges propres à cette méthode :

- **L'enregistrement `A` existant pointe vers Lovable.** Il faut le *modifier*,
  pas en ajouter un second : deux `A` sur la racine enverraient une partie du
  trafic vers Lovable. Si Lovable refuse de le supprimer, détachez d'abord le
  domaine du projet Lovable auquel il est rattaché.
- Recopiez les valeurs **affichées dans l'écran Domains de Vercel**, pas celles
  du tableau ci-dessus : Vercel fait évoluer ces adresses et attribue parfois
  une cible spécifique au projet.

### Méthode C — sortir le domaine de Lovable (à envisager, § 6)

Transférer le domaine vers un registraire indépendant (Cloudflare, Namecheap,
OVH…). C'est la seule option qui vous rend totalement autonome. Le délai de
blocage ICANN de 60 jours après l'achat est dépassé depuis le 30 juin 2026, le
transfert est donc possible. Il faut demander à Lovable le déverrouillage du
domaine et le **code d'autorisation (EPP/auth code)**, puis lancer le transfert
chez le nouveau registraire. Comptez 5 à 7 jours. Voir § 6 pour l'enjeu réel.

### Délai de propagation

Comptez **de quelques minutes à 48 h**. Vercel émet le certificat HTTPS
Let's Encrypt automatiquement dès que le DNS pointe correctement : la pastille
passe au vert dans *Settings → Domains*. Tant qu'elle est orange
(« Invalid Configuration »), c'est le DNS qui n'est pas encore vu — inutile de
toucher au code.

Pour vérifier depuis un terminal :

```sh
dig prismagestion.site +short
dig www.prismagestion.site +short
```

## 5. Vérifications après mise en ligne

À faire une fois la pastille verte :

- [ ] `https://prismagestion.site` s'ouvre en HTTPS, cadenas valide.
- [ ] `https://www.prismagestion.site` redirige vers le domaine principal.
- [ ] **Accès direct aux routes profondes** — coller directement dans la barre
      d'adresse (c'est le test de la règle de réécriture) :
      `/blog`, `/outils`, `/outils/calculateur-impots`,
      `/outils/calculateur-frais-marche`, `/expertise/ia-et-genie-logiciel`.
      Une 404 ici signifie que `vercel.json` n'a pas été pris en compte.
- [ ] `https://prismagestion.site/sitemap.xml` et `/robots.txt` s'affichent.
- [ ] Le formulaire de contact envoie un message qui **apparaît dans l'espace
      admin** (`/auth` puis `/admin`). Sinon, les variables Supabase du § 2 ne
      sont pas prises en compte.
- [ ] La **notification e-mail** du message de test arrive bien dans votre
      boîte.

> ⚠️ **Testez le formulaire depuis `prismagestion.site`, pas depuis l'adresse
> `.vercel.app`.** Les domaines `*.vercel.app` ne figurent pas dans la liste
> d'origines autorisées de la fonction `send-email` : depuis une URL de
> prévisualisation, la notification e-mail est rejetée en 403. Le message
> serait tout de même enregistré et visible dans l'espace admin — la
> notification n'est pas bloquante — mais vous concluriez à tort à une panne.
> Sur le domaine final, tout fonctionne.
- [ ] Partager le lien sur WhatsApp : le logo et le titre doivent apparaître.
      Diagnostic : [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/).
- [ ] Déclarer le site sur [Google Search Console](https://search.google.com/search-console)
      et y soumettre `https://prismagestion.site/sitemap.xml` — sans quoi le
      référencement local (« comptable Yaoundé ») ne démarrera pas.

## 6. Points restants, par ordre de priorité

0. **Sécuriser la propriété du domaine — à traiter avant mai 2027.** Le
   domaine reste enregistré via Lovable / Name.com alors que vous avez quitté
   la plateforme. Trois risques concrets :
   - **Le prix.** 1 USD pour la première année est un tarif d'appel. Le
     renouvellement d'un `.site` se facture ordinairement 25 à 35 USD/an. La
     facture du 1er mai 2027 n'aura rien à voir avec celle de 2026.
   - **La dépendance.** Le renouvellement passe par un compte Lovable actif et
     une carte valide (celle finissant par `3035`). Si ce compte est fermé ou
     la carte expirée, le domaine peut expirer — et avec lui le site, les
     adresses e-mail et le référencement acquis.
   - **Le contrôle.** Toute modification DNS future devra passer par
     l'interface Lovable.

   La parade est la **méthode C du § 4** : transférer le domaine vers un
   registraire indépendant. À faire idéalement quelques semaines *avant*
   l'échéance du 1er mai 2027, jamais dans les 15 derniers jours. En
   attendant, vérifiez dès maintenant que le **renouvellement automatique est
   actif** et notez l'échéance dans votre agenda.

1. **Sortir `.env` du dépôt.** Le fichier est versionné et public (le dépôt
   GitHub l'est). Les clés qu'il contient sont publiques par nature, donc il
   n'y a pas de fuite de secret, mais la pratique est mauvaise et un secret
   ajouté par erreur plus tard serait exposé. Marche à suivre : déclarer
   d'abord les variables dans Vercel (§ 2), vérifier qu'un déploiement de
   prévisualisation fonctionne, **puis seulement** `git rm --cached .env` et
   ajouter `.env` au `.gitignore`. Dans cet ordre — l'inverse casse le site en
   production.
2. **Supprimer le projet Vercel en doublon** `prisma-gestion-website`.
3. **Dépendance `lovable-tagger`** (`package.json`, `vite.config.ts`) :
   inactive en production, elle ne s'exécute qu'en mode développement. Elle
   peut être retirée maintenant que la plateforme n'est plus utilisée.
4. **Deux fichiers de verrouillage** coexistent (`package-lock.json` et
   `bun.lockb`). Vercel choisira Bun. En garder un seul éviterait des écarts
   entre installations locales et build de production.
5. **Le linter remonte 51 erreurs préexistantes** (`npm run lint`),
   essentiellement des `any` explicites. Sans effet sur le build, mais à
   traiter avant d'ouvrir le code à d'autres contributeurs.
6. **`public/_headers`** est un fichier au format Netlify, ignoré par Vercel.
   Sans effet — les mêmes en-têtes sont dans `vercel.json`. À supprimer si
   Netlify est définitivement écarté.

---

## 7. Ce que la mise en ligne débloque (audit commercial)

La mise en service du domaine n'est pas une fin : c'est la condition d'entrée
des cinq verrous décrits dans
[`AUDIT_STRATEGIE_COMMERCIALE.md`](../AUDIT_STRATEGIE_COMMERCIALE.md), qui
couvre les deux actifs du cabinet (ce site vitrine et l'application métier
`prisma-taskmaster-planner`).

| Verrou de l'audit | État vis-à-vis de la mise en ligne |
|---|---|
| 1 — Pilotage à l'aveugle | **Traité ici** : § 2 rend la mesure d'audience active dès le lancement. Le tableau de bord admin affiche cependant encore des données de démonstration (`mockData`) : à brancher sur les vraies mesures. |
| 2 — Aimants à leads inertes | Les calculateurs d'impôts ne demandent aucun e-mail. C'est le trafic le plus qualifié du site — un entrepreneur qui calcule son IGS est un prospect chaud. À traiter en priorité **après** la mise en ligne, une fois le § 5 validé. |
| 3 — Tunnel de conversion faible | Ni offre packagée, ni prix, ni preuve sociale. Le plan opérationnel est déjà rédigé dans [`STRATEGIE_OFFRES_COMMERCIALES.md`](../STRATEGIE_OFFRES_COMMERCIALES.md). |
| 4 — Aucune présence sociale | `src/config/social.ts` attend les URLs Facebook et LinkedIn (`facebook: ''`, `linkedin: ''`) : les liens n'apparaissent que si elles sont renseignées. Une ligne à remplir dès que les pages existent. |
| 5 — Base clients dormante | Concerne l'application métier, hors périmètre de ce guide. |

L'ordre compte : sans le § 2, aucun des chantiers suivants ne pourra être
mesuré, donc ni arbitré ni défendu.
