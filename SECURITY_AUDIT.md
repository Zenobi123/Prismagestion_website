# Audit sécurité – Prisma Gestion Website

_Date de l'audit : 10 avril 2026_

## Renforcements appliqués le 16 juillet 2026

- **Fonction edge `send-email` durcie** (constat 1/5) : CORS restreint à une
  liste d'origines autorisées (`ALLOWED_ORIGINS`, défaut : domaines de
  production + prévisualisations Lovable + localhost), rejet serveur des
  origines inconnues, validation stricte des entrées (type, champs requis,
  longueurs maximales, format email), taille de requête plafonnée (20 Ko),
  limitation de débit par IP (5 req/min, best effort) et neutralisation des
  sauts de ligne dans les sujets d'email.
- **Logs PII supprimés** (constat 2) : plus d'email utilisateur ni de payload
  de message dans la console (AuthContext, formulaires de contact) ; en
  production, tous les `console.log/info/debug/warn` sont retirés du bundle
  par la configuration esbuild de Vite (`console.error` conservé).
- **CSP réellement appliquée** (constat 3) : une Content-Security-Policy est
  injectée en `<meta>` au build (voir `vite.config.ts`), sans
  `unsafe-inline` pour les scripts (les scripts inline restants sont
  autorisés par hash sha256). Le script `cdn.gpteng.co` requis par Lovable
  est explicitement contraint à cette seule origine.
- **En-têtes HTTP de durcissement** (constat 3) : `public/_headers`
  (Netlify/Cloudflare Pages) et `vercel.json` fournissent
  X-Frame-Options, X-Content-Type-Options, Referrer-Policy,
  Permissions-Policy, HSTS, `frame-ancestors 'none'` et COOP.
- **Bornes de longueur côté base** (constat 5, partiel) : migration
  `website_harden_input_constraints` ajoutant des contraintes CHECK sur les
  tables `contact_messages`, `quote_requests` et `appointments` (les inserts
  anonymes ne peuvent plus injecter de payloads volumineux) ; validation
  client alignée sur ces limites.

Restent à traiter : captcha anti-spam (Turnstile/hCaptcha), rate limiting
persistant côté plateforme, gouvernance des rôles admin (constat 6) et le
retrait des pseudo-contrôles de sécurité côté client (constat 4).

## Méthodologie rapide
- Revue statique du code front-end React/Vite.
- Revue des migrations et fonctions Supabase (RLS, rôles, edge functions).
- Vérification des surfaces d’attaque les plus probables : authentification, autorisation, XSS, exposition de données, hardening HTTP.

## Résumé exécutif
Le projet présente une **base plutôt saine** (RLS activé, contrôle de rôles côté base, usage de DOMPurify) mais contient plusieurs **risques importants** :

1. **Fonction edge potentiellement exploitable avec privilèges service role** (CORS permissif + absence de contrôle explicite).
2. **Exposition de données personnelles via logs console côté client** (PII).
3. **Scripts tiers non contraints et politique CSP déclarée mais non appliquée au runtime HTTP**.
4. **Mesures “sécurité” côté client qui donnent un faux sentiment de protection** (rate limit/CSRF/session block en localStorage/sessionStorage).

## Détails des constats

### 1) [Élevé] Edge Function avec clé service-role et CORS `*`
**Constat**
- La fonction `create_blog_posts_table` utilise `SUPABASE_SERVICE_ROLE_KEY` et accepte toutes les origines (`Access-Control-Allow-Origin: *`) sans vérification explicite de l’appelant.

**Impact**
- Si la fonction est déployée et invocable publiquement, un attaquant peut tenter d’abuser d’un endpoint exécuté avec des privilèges élevés.
- Même si Supabase impose des protections côté plateforme, le code actuel ne montre pas de garde applicative (JWT/role check explicite).

**Recommandations**
- Restreindre CORS aux domaines de production.
- Vérifier un JWT utilisateur + rôle admin côté fonction avant toute action privilégiée.
- Éviter d’exposer des actions DDL en endpoint public; privilégier les migrations hors runtime.

### 2) [Élevé] Journalisation de données sensibles/PII dans la console
**Constat**
- Les formulaires et récupérations de messages affichent des objets complets (emails, téléphone, message) via `console.log`.

**Impact**
- Exposition PII dans les logs navigateur (poste utilisateur partagé, extensions, captures, support tiers).

**Recommandations**
- Supprimer les logs de payload en production.
- Garder uniquement des logs minimaux, non sensibles (ID corrélé, statut).
- Centraliser un logger avec redaction systématique.

### 3) [Moyen] CSP de sécurité définie dans le code mais non appliquée comme en-tête HTTP
**Constat**
- Une `Content-Security-Policy` est définie dans un objet TypeScript, mais non injectée comme en-tête HTTP côté serveur/CDN.
- Le HTML charge un script externe `https://cdn.gpteng.co/gptengineer.js`.

**Impact**
- Sans CSP effective au niveau HTTP, la surface XSS/supply-chain reste plus large.
- Dépendance à un script externe exécutable en production.

**Recommandations**
- Définir CSP/HSTS/XFO/etc. au niveau reverse proxy/CDN (Cloudflare, Nginx, Vercel headers).
- Supprimer ou conditionner le script externe non essentiel en production.
- Passer à une CSP stricte sans `unsafe-inline` si possible (nonce/hash).

### 4) [Moyen] Contrôles de sécurité côté client non fiables (rate limiting/CSRF/session block)
**Constat**
- Plusieurs mécanismes “sécurité” reposent sur `localStorage`/`sessionStorage` et logique front (rate limiter, session block, CSRF token généré client).

**Impact**
- Ces contrôles sont facilement contournables par un attaquant (nouveau navigateur, clear storage, appels directs API).

**Recommandations**
- Déplacer les contrôles critiques côté serveur (Edge functions/API): rate limiting IP+token, anti-automation/captcha, contrôle d’autorisation systématique.
- Conserver la logique front uniquement comme UX/anti-abus léger.

### 5) [Moyen] Insertion ouverte sur tables de contact/devis/rendez-vous sans anti-abus fort
**Constat**
- Les politiques RLS autorisent `INSERT` pour `anon`/`authenticated` sur plusieurs tables de collecte.

**Impact**
- Risque de spam, flood, pollution de données, coûts de stockage/traitement.

**Recommandations**
- Ajouter captcha (Cloudflare Turnstile/hCaptcha/ReCAPTCHA).
- Ajouter throttling serveur et éventuellement blocage par réputation IP.
- Ajouter validation serveur stricte et détection de patterns spam.

### 6) [Faible à moyen] Gestion des rôles : migration avec promotion admin par UUID fixe
**Constat**
- Une migration promeut un `user_id` précis en admin.

**Impact**
- Risque d’erreur opérationnelle (environnements clonés), traçabilité faible, administration des rôles peu gouvernée.

**Recommandations**
- Remplacer par un script d’onboarding admin exécuté explicitement en environnement cible.
- Tenir un registre d’élévation de privilèges (audit trail).

### 7) [Positif] Points déjà bien implémentés
- RLS activée et policies d’admin présentes sur les tables sensibles.
- Usage de DOMPurify avant rendu HTML des articles.
- Contrôle d’accès aux routes admin côté UI (complémentaire, non suffisant seul).

## Plan d’action priorisé (30 jours)

### Semaine 1 (critique)
1. Durcir/sécuriser la fonction edge (auth + rôle + CORS restreint) ou la supprimer si inutile.
2. Retirer les logs PII en production.

### Semaine 2
3. Déployer des en-têtes de sécurité HTTP réels (CSP/HSTS/XFO/Referrer-Policy/Permissions-Policy).
4. Retirer ou rendre conditionnel le script tiers non essentiel.

### Semaine 3
5. Ajouter anti-spam côté serveur (captcha + rate limiting).
6. Revoir les inserts anonymes et ajouter quotas/alertes.

### Semaine 4
7. Formaliser le process de gestion des rôles admin (procédure + journalisation).
8. Ajouter un contrôle continu (SAST + dépendances + checklist release sécurité).

## Conclusion
Le socle sécurité est **correct** côté base (RLS/policies), mais la **surface applicative** doit être renforcée côté runtime (edge functions, headers HTTP, anti-abus, hygiène des logs). Le principal risque immédiat est l’**abus d’endpoint privilégié** et la **fuite involontaire de PII dans la console**.
