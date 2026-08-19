# Audit de sécurité approfondi — 18 août 2026

Périmètre : site vitrine, console de gestion, base Supabase `xkwqgxqmwxxpzrsurchk`
(RLS, politiques, fonctions), trois fonctions edge, stockage, dépendances,
en-têtes HTTP, secrets et historique git.

Méthode : lecture du code, inspection de la base de production, et **vérification
par simulation de rôle** (`set local role` + `request.jwt.claims`, en transaction
annulée) pour distinguer le risque théorique du risque réel.

---

## État des correctifs

**Constats 1, 2 et 3 corrigés le 18/08/2026** — migration
`20260818205432_unifier_roles_et_verrouiller_pieces_fiscales.sql`, appliquée en
production, et bascule du code dans le même lot. Vérifié après application :

| Vérification | Avant | Après |
|---|---|---|
| `update users set role='admin'` sur sa propre ligne | 1 ligne modifiée | `permission denied for table users` |
| `update users set email=…` sur sa propre ligne | 1 ligne modifiée | 1 ligne modifiée (inchangé) |
| Lecture de `fiscal_attachments` par un compte non-admin | autorisée | refusée (`private.has_role`) |

**Constat 6 corrigé le 18/08/2026.** **Constat 5 retiré : il était faux** — voir
le détail, la CSP complète existait déjà.

**Constat 9 partiellement corrigé le 18/08/2026** — l'application sait désormais
inscrire et exiger un second facteur (voir le détail du constat). Restent deux
réglages du tableau de bord Supabase, hors de portée du dépôt.

**Constat 11 corrigé le 18/08/2026** — relevé pendant le déploiement des
fonctions edge, il ne figurait pas dans la première passe.

Les constats 4 à 10 restent ouverts.

---

## Résumé

La fondation est saine : RLS active sur les 37 tables publiques, et un compte
authentifié quelconque ne voit **aucune** donnée métier. Aucun secret dans le
dépôt ni dans l'historique.

Le problème structurel est ailleurs : **l'application porte deux systèmes
d'autorisation concurrents**, et le second est auto-modifiable. Trois constats
en découlent. Aucun n'est exploitable en l'état — parce qu'il n'existe
aujourd'hui qu'un seul compte, déjà administrateur. Tous le deviennent **au
moment où un deuxième collaborateur reçoit un accès**.

| # | Gravité | Constat | État |
|---|---|---|---|
| 1 | Élevée | Auto-promotion `users.role` → admin | **Corrigé** |
| 2 | Élevée | Deux systèmes d'autorisation concurrents | **Corrigé** |
| 3 | Élevée | Bucket `fiscal_attachments` en lecture pour tout compte | **Corrigé** |
| 4 | Moyenne | `collaborateurs` : auto-écriture des permissions | Non (`user_id` nuls) |
| 5 | Moyenne | ~~CSP réduite à `frame-ancestors`~~ — **constat erroné** | **Retiré** |
| 6 | Moyenne | `send-email` appelable sans en-tête `Origin` | **Corrigé** |
| 7 | Moyenne | 14 vulnérabilités « high » en dépendances de production | Oui |
| 8 | Faible | Données clients réelles versionnées | Latent |
| 9 | Faible | Mots de passe compromis et MFA désactivés | **Partiel** |
| 10 | Faible | Repli `localStorage` silencieux | Latent |
| 11 | Faible | `verify_jwt` désactivé sur deux fonctions edge | **Corrigé** |

---

## 1. [Élevée] ~~Auto-promotion sur `public.users.role`~~ — **corrigé le 18/08/2026**

Les deux politiques UPDATE de `public.users` (« Users can update their own data »
et « Users can update their own profile ») s'écrivent `USING (auth.uid() = id)`
**sans `WITH CHECK` et sans restriction de colonne**. PostgreSQL réutilise alors
l'expression `USING` comme contrôle d'écriture : l'utilisateur peut réécrire
n'importe quelle colonne de sa propre ligne — **`role` comprise**.

Vérification (transaction annulée) :

```sql
set local role authenticated;
set local request.jwt.claims = '{"sub":"4e301340-…","role":"authenticated"}';
update public.users set role = 'admin' where id = '4e301340-…';
-- → 1 ligne modifiée
```

Ce que cela ouvre : `apply-credit` et `send-payment-reminders` autorisent
**sur cette colonne** (`ALLOWED_ROLES = admin, comptable, expert-comptable`),
puis opèrent avec la **clé service_role**, qui contourne toute RLS.

Pourquoi ce n'est pas exploitable aujourd'hui : `public.users` ne contient que
deux lignes — l'administrateur réel, et une ligne orpheline sans compte
d'authentification. Aucune politique INSERT n'existe sur la table, donc une
inscription ne crée pas de ligne exploitable. La fenêtre s'ouvre au premier
collaborateur à qui l'on crée une ligne `users`.

**Correctif** — ajouter un `WITH CHECK` et empêcher la réécriture de `role` :

```sql
drop policy "Users can update their own data" on public.users;
drop policy "Users can update their own profile" on public.users;

create policy users_update_self on public.users
  for update to authenticated
  using  (auth.uid() = id)
  with check (auth.uid() = id and role = (select role from public.users where id = auth.uid()));
```

Et supprimer la ligne orpheline `4e301340-…`.

## 2. [Élevée] ~~Deux systèmes d'autorisation concurrents~~ — **corrigé le 18/08/2026**

| Source de vérité | Qui l'utilise | Solidité |
|---|---|---|
| `public.user_roles` via `private.has_role()` | Site vitrine (`useUserRole`, `ProtectedRoute`), **toutes les politiques RLS** | Solide |
| `public.users.role` | Console (`useAuthorization`, `Sidebar`, `MobileBottomNav`, `useCollaborateurs`) et les 2 fonctions edge | Auto-modifiable |

`private.has_role` est correctement durcie : `SECURITY DEFINER`, `search_path=''`,
lecture de `user_roles`. Et `user_roles` est verrouillée — l'auto-attribution est
refusée par la RLS (vérifié : `new row violates row-level security policy`).

C'est donc le second circuit qu'il faut supprimer, pas renforcer. Faire pointer
la console et les deux fonctions edge sur `private.has_role()`, puis retirer
`users.role`.

## 3. [Élevée] ~~Bucket `fiscal_attachments` lisible par tout compte~~ — **corrigé le 18/08/2026**

```
"Anyone can view fiscal attachments"  SELECT  {authenticated}
  USING (bucket_id = 'fiscal_attachments')
```

Aucun filtre : n'importe quel utilisateur connecté lirait **toutes** les pièces
fiscales de **tous** les clients. Le bucket n'a par ailleurs ni `file_size_limit`
ni `allowed_mime_types` côté serveur — la validation n'existe que dans le
navigateur, donc contournable.

Le bucket est vide (0 objet) : rien n'est exposé aujourd'hui. Mais l'écran qui
l'alimente (pièces jointes des déclarations DSF/DARP/DBEF) est en production.

À aligner sur le bucket `documents`, correctement restreint aux administrateurs :

```sql
drop policy "Anyone can view fiscal attachments" on storage.objects;
create policy fiscal_attachments_select on storage.objects
  for select to authenticated
  using (bucket_id = 'fiscal_attachments'
         and private.has_role((select auth.uid()), 'admin'));
```
(même traitement pour INSERT/UPDATE/DELETE, et poser les plafonds serveur sur le bucket)

## 4. [Moyenne] `collaborateurs` : 15 politiques, dont une boucle d'auto-attribution

« Enable update for users on their own collaborateur profile » (`user_id = auth.uid()`)
autorise la réécriture de toute la ligne, **`permissions` comprise**. Or
« Enable insert for admins » fait dépendre le droit d'insertion de ce même champ :

```sql
permissions @> '[{"module":"collaborateurs","niveau":"administration"}]'
```

Un collaborateur pourrait donc s'octroyer le niveau administration puis créer
des collaborateurs. Non exploitable aujourd'hui : les 4 lignes ont `user_id = null`.

Les 15 politiques se recouvrent très largement (trois politiques SELECT
identiques, quatre INSERT, …), héritage de migrations successives. Un ménage
réduirait la surface autant que le risque de s'y perdre.

## 5. ~~[Moyenne] CSP réduite à une seule directive~~ — **constat erroné, retiré le 18/08/2026**

**Ce constat était faux, et l'erreur est de méthode : je n'avais regardé que
`vercel.json`.** La CSP complète existe, elle est simplement ailleurs.

`vite.config.ts` porte un `cspPlugin` qui injecte au build une balise
`<meta http-equiv="Content-Security-Policy">` :

```
default-src 'self'; script-src 'self' 'sha256-…' 'sha256-…';
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
font-src 'self' data: https://fonts.gstatic.com; img-src 'self' data: blob: https:;
connect-src 'self' https://<projet>.supabase.co wss://<projet>.supabase.co;
worker-src 'self'; object-src 'none'; frame-src 'none'; base-uri 'self';
form-action 'self'; upgrade-insecure-requests
```

C'est une politique stricte : pas de `'unsafe-inline'` sur `script-src`, les
deux blocs JSON-LD sont autorisés par empreinte sha256 calculée au build.

Le partage est délibéré et documenté dans le code : les empreintes se calculent
au build et ne peuvent pas vivre dans un `vercel.json` statique, tandis que
`frame-ancestors` est ignoré en `<meta>` et doit venir d'un en-tête HTTP. D'où
la CSP complète en meta, et `frame-ancestors` dans `vercel.json` et
`public/_headers`.

**Un seul resserrement retenu**, appliqué le 18/08/2026 : `connect-src` visait
`https://*.supabase.co`, ce qui aurait laissé une éventuelle XSS exfiltrer vers
n'importe quel projet Supabase, à commencer par celui de l'attaquant. L'origine
est désormais épinglée à partir de `VITE_SUPABASE_URL`, le générique ne servant
que de repli lorsque la variable est absente.

`img-src … https:` reste large. C'est assumé : les images d'articles et de
services proviennent d'hôtes arbitraires (Unsplash, stockage Supabase), et
restreindre casserait le blog au premier lien collé.

## 6. ~~[Moyenne] `send-email` appelable sans en-tête `Origin`~~ — **corrigé le 18/08/2026**

```ts
if (origin && !isOriginAllowed(origin)) { … 403 }
```

Une requête sans `Origin` (curl, script serveur) traverse le contrôle. Le
destinataire étant figé (`NOTIFY_EMAIL`), ce n'est **pas** un relais ouvert :
l'abus se limite à noyer la boîte du cabinet et à consommer le quota Resend.
La limitation de débit (5/min/IP, en mémoire d'instance) tombe par simple
rotation d'IP.

**Corrigé** : la condition est passée de `origin && !isOriginAllowed(origin)` à
`!origin || !isOriginAllowed(origin)`. L'absence d'en-tête vaut désormais refus.
Aucun appel légitime n'en pâtit — ils viennent tous du navigateur, du site vers
`supabase.co`, donc cross-origine et toujours porteurs d'un `Origin`.

La limitation de débit, elle, **reste contournable par rotation d'IP** : la
corriger vraiment demanderait un compteur partagé entre instances, hors de
proportion avec l'enjeu tant que l'origine est exigée.

## 7. [Moyenne] 14 vulnérabilités « high » en dépendances de production

`npm audit` : 14 high, 5 moderate, 3 low. Les plus pertinentes ici —

- `react-router` / `@remix-run/router` — redirection externe et XSS via chemins non fiables (projet en 6.27.0) ;
- `dompurify` (moderate) — contournement de `FORBID_TAGS` ; c'est la brique qui assainit le contenu du blog ;
- `lodash` (`_.template`), `serialize-javascript`, `js-yaml` — injection de code, surtout dans la chaîne de build.

Le reste est transitif (workbox, rollup, babel). Commencer par `react-router` et
`dompurify`, les deux seuls qui s'exécutent dans le navigateur du visiteur.

## 8. [Faible] Données clients réelles versionnées

`facturation/clients_2026-01-28.csv` et `.json` : 29 clients avec nom, NIU,
centre de rattachement, ville, téléphone, e-mail, n° CNPS. Le dépôt est bien
**privé** (vérifié via l'API GitHub).

Ces fichiers sont dans l'historique git : un `git rm` ne les retirerait pas.
Tant qu'ils y sont, le dépôt ne peut être ni ouvert, ni forké, ni confié à un
prestataire sans réécriture d'historique préalable.

## 9. [Faible] Protections d'authentification Supabase — **partiellement corrigé le 18/08/2026**

Les advisors du projet signalent deux points, tous deux côté configuration :
protection contre les mots de passe compromis (HaveIBeenPwned) désactivée, et
trop peu de méthodes MFA activées. Pour un compte unique qui ouvre l'accès à
l'ensemble des données clients, la MFA est le meilleur rapport effort/gain de
tout ce rapport.

**Fait — côté application.** Activer le facteur au niveau du projet ne protège
rien tant que l'application ne sait ni inscrire un facteur ni réclamer le code ;
c'était le vrai manque, et il est comblé :

- onglet **Sécurité** de l'administration : activation par QR code, saisie du
  code de confirmation, désactivation ;
- `ProtectedRoute` réclame le code dès qu'un facteur vérifié existe sur le
  compte et que la session ne l'a pas encore présenté.

L'activation est **volontaire** : un compte sans facteur inscrit se connecte
comme avant. C'est le compromis retenu — il protège le compte sans risquer
d'enfermer dehors l'unique administrateur si l'inscription échoue à mi-parcours.
Un échec de lecture du niveau d'assurance ne bloque jamais l'accès, pour la même
raison.

**Reste à faire — au tableau de bord Supabase**, hors de portée du dépôt et des
outils disponibles ici (Authentication → Providers / Policies) :

1. vérifier que le facteur **TOTP** est activé pour le projet, sans quoi
   l'inscription échouera avec un message explicite ;
2. activer la **protection contre les mots de passe compromis**.

Puis inscrire réellement le compte administrateur depuis l'onglet Sécurité —
tant que ce n'est pas fait, rien ne change pour personne.

## 10. [Faible] Repli `localStorage` silencieux

Si `VITE_SUPABASE_URL` ou `VITE_SUPABASE_PUBLISHABLE_KEY` manquent au build, le
site bascule sans bruit sur `src/lib/localBackend/`, qui crée un administrateur
par défaut (mot de passe en clair) et un `user_roles` local. Inoffensif tant que
les variables sont définies — mais une variable oubliée sur un déploiement
donnerait une console « admin » sans authentification réelle. Faire échouer le
build plutôt que basculer silencieusement.

## 11. [Faible] ~~`verify_jwt` désactivé sur deux fonctions edge~~ — **corrigé le 18/08/2026**

Relevé en déployant les correctifs 1 à 3, donc absent de la première passe :
`apply-credit` et `send-payment-reminders` tournaient avec `verify_jwt: false`.
La plateforme n'examinait pas le jeton et invoquait la fonction quoi qu'il
arrive ; seul le code vérifiait ensuite l'appelant (`Authorization` →
`auth.getUser()` → rôle).

Ce n'était pas un trou — l'authentification était bel et bien appliquée — mais
une couche de défense en moins devant deux fonctions qui opèrent avec la clé
`service_role`. Un jeton expiré ou forgé atteignait le code de la fonction au
lieu d'être rejeté à la porte.

Les trois fonctions sont désormais en `verify_jwt: true`. Le réglage vit côté
plateforme et non dans le code : il est déclaré dans `supabase/config.toml`,
faute de quoi un `supabase functions deploy` le réinitialiserait sans bruit.

La crainte légitime était que la requête préliminaire CORS (`OPTIONS`), qui ne
porte pas d'en-tête `Authorization`, soit rejetée et casse les deux écrans de
la console. Elle est levée par la configuration du projet elle-même :
`send-email` tourne en `verify_jwt: true` depuis toujours et est appelée depuis
le navigateur par des visiteurs **anonymes** sur les formulaires publics.

---

## Ce qui est déjà solide

- **RLS vérifiée par simulation.** `anon` et un compte authentifié quelconque
  voient 0 ligne sur `clients`, `factures`, `documents_administratifs`,
  `collaborateurs`, `employes`, `paie`, et sur les objets de stockage.
- **`user_roles` inviolable** : l'auto-attribution d'un rôle est refusée par la RLS.
- **`private.has_role`** : `SECURITY DEFINER` avec `search_path=''`.
- **`send-email`** : liste blanche d'origines, validation stricte champ par champ,
  échappement HTML, neutralisation des sauts de ligne dans le sujet
  (anti-injection d'en-tête), plafond de taille, aucune PII dans les logs.
- **Aucun secret** dans le code suivi ni dans l'historique ; `.env` jamais commité ;
  hook `pre-commit` qui bloque `.env` et les clés `service_role`.
- **Blog assaini par DOMPurify** ; `chart.tsx` filtre ses valeurs CSS avant injection.
- **En-têtes HTTP** : HSTS, nosniff, X-Frame-Options, Referrer-Policy,
  Permissions-Policy, COOP correctement posés.

## Ordre d'attaque suggéré

1. ~~Avant de créer le moindre second compte : constats 1, 2 et 3.~~ **Fait le
   18/08/2026.** Un second compte peut désormais être créé sans rouvrir ces trois
   portes.
2. **Cette semaine** : inscrire le compte administrateur depuis l'onglet
   Sécurité et activer les deux réglages Supabase du constat 9 ; corriger
   `send-email` (6). Les constats 9 (partie applicative) et 11 sont fermés.
3. **Ce mois** : montée de `react-router` et `dompurify` (7), ménage des
   politiques `collaborateurs` (4), build bruyant (10).
4. **À décider** : purge de l'historique pour `facturation/` (8) — opération
   lourde, à faire une seule fois, au bon moment.
