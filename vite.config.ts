import { defineConfig, type HtmlTagDescriptor, type Plugin } from "vite";
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
const cspPlugin = (): Plugin => ({
  name: "inject-csp",
  apply: "build",
  transformIndexHtml: {
    order: "post",
    handler(html): HtmlTagDescriptor[] {
      const inlineScriptHashes = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)]
        .map(([, body]) => `'sha256-${createHash("sha256").update(body).digest("base64")}'`);
      const csp = [
        "default-src 'self'",
        `script-src 'self' ${inlineScriptHashes.join(" ")}`.trim(),
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' data: https://fonts.gstatic.com",
        "img-src 'self' data: blob: https:",
        "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
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
export default defineConfig(({ mode }) => ({
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
    cspPlugin()
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
