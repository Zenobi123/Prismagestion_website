import { defineConfig, loadEnv, type HtmlTagDescriptor, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// Domaine canonique du site.
//
// Les robots des réseaux sociaux (Facebook, LinkedIn, WhatsApp) et des moteurs
// de recherche lisent `index.html` tel qu'il est servi, sans exécuter React :
// les URLs absolues qu'il contient — og:image, og:url, canonical, JSON-LD —
// doivent désigner un domaine qui résout, faute de quoi l'aperçu de partage
// reste vide. Les sources portent donc le domaine réellement servi, et non un
// domaine espéré : l'ancien `prismagestion.site` a été perdu, et le site vit
// sur son adresse Vercel jusqu'à l'achat du prochain nom de domaine.
//
// `VITE_SITE_URL` prend alors le relais sans retoucher les sources : définie
// dans Vercel, elle remplace le domaine par défaut partout où il apparaît —
// `index.html`, `sitemap.xml`, `robots.txt` — et dans `src/config/site.ts`,
// qui applique la même règle aux balises rendues par React (SEOHead).
// Les deux constantes doivent rester alignées.
const DEFAULT_SITE_URL = "https://prismagestionsite.vercel.app";

// Fichiers de `public/` copiés tels quels par Vite : ils portent eux aussi le
// domaine et doivent rester cohérents avec l'URL canonique du HTML.
const STATIC_FILES_WITH_DOMAIN = ["sitemap.xml", "robots.txt"];

const siteUrlPlugin = (env: Record<string, string>): Plugin => {
  const siteUrl = (env.VITE_SITE_URL || DEFAULT_SITE_URL).replace(/\/+$/, "");
  let outDir = "dist";

  return {
    name: "site-url",
    configResolved(config) {
      outDir = path.isAbsolute(config.build.outDir)
        ? config.build.outDir
        : path.resolve(config.root, config.build.outDir);
    },
    transformIndexHtml: {
      // Avant cspPlugin : les hashes sha256 doivent porter sur le JSON-LD
      // définitif, domaine substitué compris.
      order: "pre",
      handler: (html) => html.replaceAll(DEFAULT_SITE_URL, siteUrl),
    },
    // publicDir est copié après le bundle : la réécriture vient donc en dernier.
    async closeBundle() {
      if (siteUrl === DEFAULT_SITE_URL) return;
      for (const nom of STATIC_FILES_WITH_DOMAIN) {
        const fichier = path.join(outDir, nom);
        try {
          const contenu = await readFile(fichier, "utf8");
          await writeFile(fichier, contenu.replaceAll(DEFAULT_SITE_URL, siteUrl));
        } catch {
          // Fichier absent du build : rien à réécrire.
        }
      }
    },
  };
};

// Injecte la Content-Security-Policy en meta au moment du build uniquement
// (le serveur de dev Vite utilise des scripts inline incompatibles avec une
// CSP stricte). Les scripts inline restants dans le HTML final (JSON-LD,
// enregistrement du service worker…) sont autorisés par hash sha256 plutôt
// que par 'unsafe-inline'. frame-ancestors ne peut pas être défini en meta :
// il est fourni par les en-têtes HTTP (public/_headers, vercel.json).
// Origines de mesure d'audience, ajoutées à la CSP uniquement lorsque la
// variable correspondante est définie au build : tant qu'aucune analytique
// n'est configurée, la politique reste au plus strict.
const analyticsCspOrigins = (env: Record<string, string>) => {
  const script: string[] = [];
  const connect: string[] = [];
  if (env.VITE_PLAUSIBLE_DOMAIN) {
    script.push("https://plausible.io");
    connect.push("https://plausible.io");
  }
  if (env.VITE_GA_ID) {
    script.push("https://www.googletagmanager.com");
    connect.push(
      "https://www.googletagmanager.com",
      "https://*.google-analytics.com",
      "https://*.analytics.google.com",
    );
  }
  return { script, connect };
};

// Origine du projet Supabase, épinglée dès qu'elle est connue au build.
// `https://*.supabase.co` laisserait une éventuelle XSS exfiltrer vers
// n'importe quel projet Supabase, à commencer par celui de l'attaquant : le
// générique n'est conservé qu'en repli, faute de mieux.
const supabaseCspOrigins = (env: Record<string, string>) => {
  const generique = ["https://*.supabase.co", "wss://*.supabase.co"];
  if (!env.VITE_SUPABASE_URL) return generique;
  try {
    const { host } = new URL(env.VITE_SUPABASE_URL);
    return [`https://${host}`, `wss://${host}`];
  } catch {
    return generique;
  }
};

const cspPlugin = (env: Record<string, string>): Plugin => ({
  name: "inject-csp",
  apply: "build",
  transformIndexHtml: {
    order: "post",
    handler(html): HtmlTagDescriptor[] {
      const inlineScriptHashes = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)]
        .map(([, body]) => `'sha256-${createHash("sha256").update(body).digest("base64")}'`);
      const analytics = analyticsCspOrigins(env);
      const csp = [
        "default-src 'self'",
        `script-src 'self' ${[...analytics.script, ...inlineScriptHashes].join(" ")}`.trim(),
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' data: https://fonts.gstatic.com",
        "img-src 'self' data: blob: https:",
        `connect-src 'self' ${supabaseCspOrigins(env).join(" ")} ${analytics.connect.join(" ")}`.trim(),
        "worker-src 'self'",
        "object-src 'none'",
        "frame-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "upgrade-insecure-requests",
      ].join("; ");
      return [
        {
          tag: "meta",
          attrs: { "http-equiv": "Content-Security-Policy", content: csp },
          injectTo: "head-prepend",
        },
      ];
    },
  },
});

// Sans `VITE_SUPABASE_URL` ni `VITE_SUPABASE_PUBLISHABLE_KEY`, le site bascule
// sans le moindre signal sur le backend local (`src/lib/localBackend/`), qui
// crée un administrateur par défaut avec un mot de passe en clair. C'est le
// comportement voulu hors ligne ; mis en production, ce serait une console
// « admin » sans authentification réelle, ouverte à qui connaît l'adresse.
//
// Le build échoue donc plutôt que de produire ce paquet-là (audit du
// 18/08/2026, constat 10). Deux échappatoires, toutes deux explicites :
//   - `npm run build:dev`, prévu pour une démonstration hors ligne ;
//   - `VITE_ALLOW_LOCAL_BACKEND=true`, contournement assumé en production.
const garderContreLeBackendLocalEnProduction = (mode: string, env: Record<string, string>) => {
  if (mode !== "production" || env.VITE_ALLOW_LOCAL_BACKEND) return;

  const manquantes = ["VITE_SUPABASE_URL", "VITE_SUPABASE_PUBLISHABLE_KEY"].filter(
    (nom) => !env[nom],
  );
  if (manquantes.length === 0) return;

  throw new Error(
    [
      "",
      "Build de production interrompu : " + manquantes.join(" et ") + " manque" +
        (manquantes.length > 1 ? "nt" : "") + ".",
      "",
      "Sans ces variables, le site se rabat sur le backend local (localStorage),",
      "qui crée un administrateur par défaut avec un mot de passe en clair.",
      "Déployé tel quel, il donnerait une console « admin » sans authentification.",
      "",
      "  • Déploiement réel   : définir ces variables dans l'hébergeur (Vercel).",
      "  • Démonstration      : npm run build:dev",
      "  • Contournement assumé : VITE_ALLOW_LOCAL_BACKEND=true npm run build",
      "",
    ].join("\n"),
  );
};

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Les variables VITE_* sont nécessaires dès la configuration pour ajuster
  // la CSP aux services d'analytique réellement activés.
  const env = loadEnv(mode, process.cwd(), "");

  garderContreLeBackendLocalEnProduction(mode, env);

  return {
    server: {
      host: "::",
      port: 8080,
    },
    // Retire les logs applicatifs du bundle de production (hygiène PII) ;
    // console.error est conservé pour le diagnostic d'incidents.
    esbuild:
      mode === "development"
        ? undefined
        : { pure: ["console.log", "console.info", "console.debug", "console.warn", "console.trace"] },
    plugins: [
      react(),
      mode === 'development' &&
      componentTagger(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
        manifest: {
          name: "PRISMA GESTION",
          short_name: "PRISMA",
          description: "Cabinet de services professionnels au Cameroun",
          theme_color: "#2E1A47",
          icons: [
            {
              src: 'favicon.ico',
              sizes: '64x64 32x32 24x24 16x16',
              type: 'image/x-icon'
            }
          ]
        },
        workbox: {
          skipWaiting: true,
          clientsClaim: true,
        }
      }),
      siteUrlPlugin(env),
      // Après VitePWA et siteUrlPlugin pour que les scripts injectés ou
      // réécrits par les autres plugins soient pris en compte dans les
      // hashes CSP.
      cspPlugin(env)
    ].filter(Boolean),
    build: {
      rollupOptions: {
        output: {
          // Sans découpage explicite, Vite regroupe tout le code partagé dans
          // un chunk d'entrée unique (~760 ko). Isoler les dépendances lourdes
          // et stables permet au navigateur de les mettre en cache une fois
          // pour toutes : une mise à jour du site ne réinvalide plus que le
          // code applicatif, et les téléchargements se parallélisent.
          manualChunks: {
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            'vendor-supabase': ['@supabase/supabase-js'],
            'vendor-icons': ['lucide-react'],
          },
        },
      },
    },
    resolve: {
      alias: {
        // L'ordre compte : "@gestion" doit précéder "@" pour que Vite ne
        // résolve pas "@gestion/..." comme "@" suivi de "gestion/...".
        "@gestion": path.resolve(__dirname, "./src/modules/gestion"),
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
