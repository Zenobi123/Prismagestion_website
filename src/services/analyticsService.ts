
export interface AnalyticsEvent {
  event: string;
  category: string;
  action: string;
  label?: string;
  value?: number;
}

export class AnalyticsService {
  private static isInitialized = false;
  private static gaId: string | undefined;

  /**
   * Initialise le suivi analytique.
   *
   * L'identifiant de mesure est lu, par ordre de priorité :
   *   1. l'argument `trackingId` explicite ;
   *   2. la variable d'environnement `VITE_GA_ID` (Google Analytics 4).
   *
   * Si aucun identifiant n'est configuré, la fonction ne fait rien : le site
   * reste fonctionnel, simplement sans mesure. Pour activer le suivi, définir
   * `VITE_GA_ID=G-XXXXXXXXXX` dans l'environnement de build.
   *
   * Alternative respectueuse de la vie privée : définir `VITE_PLAUSIBLE_DOMAIN`
   * (ex. `prismagestion.com`) pour charger Plausible au lieu de GA4.
   */
  static initialize(trackingId?: string): void {
    if (this.isInitialized || typeof document === 'undefined') return;

    const gaId = trackingId || (import.meta.env.VITE_GA_ID as string | undefined);
    const plausibleDomain = import.meta.env.VITE_PLAUSIBLE_DOMAIN as string | undefined;

    // Plausible (privacy-friendly, sans cookies) — chargé si configuré.
    if (plausibleDomain) {
      const p = document.createElement('script');
      p.defer = true;
      p.setAttribute('data-domain', plausibleDomain);
      p.src = 'https://plausible.io/js/script.js';
      document.head.appendChild(p);
    }

    if (!gaId) {
      // Aucun identifiant : on marque tout de même l'init pour éviter les
      // tentatives répétées, mais aucune balise n'est chargée.
      this.isInitialized = Boolean(plausibleDomain);
      return;
    }

    // Google Analytics 4
    this.gaId = gaId;
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
    document.head.appendChild(script);

    const script2 = document.createElement('script');
    script2.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${gaId}', {
        page_title: document.title,
        page_location: window.location.href
      });
    `;
    document.head.appendChild(script2);

    this.isInitialized = true;
  }

  /** Indique si une balise analytique est effectivement active. */
  static get active(): boolean {
    return this.isInitialized;
  }

  static trackEvent(event: AnalyticsEvent): void {
    if (!this.isInitialized || typeof window === 'undefined') return;

    // @ts-expect-error gtag est injecté globalement par le script GA4
    if (window.gtag) {
      // @ts-expect-error gtag est injecté globalement par le script GA4
      window.gtag('event', event.action, {
        event_category: event.category,
        event_label: event.label,
        value: event.value
      });
    }
  }

  static trackPageView(path: string, title?: string): void {
    if (!this.isInitialized || typeof window === 'undefined') return;

    if (!this.gaId) return;
    // @ts-expect-error gtag est injecté globalement par le script GA4
    if (window.gtag) {
      // @ts-expect-error gtag est injecté globalement par le script GA4
      window.gtag('config', this.gaId, {
        page_path: path,
        page_title: title || document.title
      });
    }
  }

  static trackConversion(conversionId: string, value?: number): void {
    this.trackEvent({
      event: 'conversion',
      category: 'engagement',
      action: 'conversion',
      label: conversionId,
      value
    });
  }
}
