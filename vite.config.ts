import { defineConfig, loadEnv, type HtmlTagDescriptor, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { createHash } from "node:crypto";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

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
        `connect-src 'self' https://*.supabase.co wss://*.supabase.co ${analytics.connect.join(" ")}`.trim(),
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

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Les variables VITE_* sont nécessaires dès la configuration pour ajuster
  // la CSP aux services d'analytique réellement activés.
  const env = loadEnv(mode, process.cwd(), "");

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
      // Après VitePWA pour que les scripts injectés par les autres plugins
      // soient pris en compte dans les hashes CSP.
      cspPlugin(env)
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
