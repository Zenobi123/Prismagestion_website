
import { Helmet } from 'react-helmet-async';

export interface SEOConfig {
  title: string;
  description: string;
  keywords?: string[];
  ogImage?: string;
  canonicalUrl?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
}

export class SEOService {
  private static readonly DEFAULT_SITE_NAME = 'PRISMA GESTION';
  private static readonly DEFAULT_DESCRIPTION = 'Cabinet d\'expertise comptable, fiscale et financière pour entreprises et indépendants';
  private static readonly DEFAULT_OG_IMAGE = '/og-image.jpg';

  static generatePageTitle(title: string): string {
    return title.includes(this.DEFAULT_SITE_NAME) ? title : `${title} | ${this.DEFAULT_SITE_NAME}`;
  }

  static getCanonicalUrl(path: string): string {
    const baseUrl = window.location.origin;
    return `${baseUrl}${path}`;
  }

  static generateStructuredData(config: SEOConfig): string {
    const structuredData = {
      "@context": "https://schema.org",
      "@type": config.type === 'article' ? "Article" : "WebPage",
      "name": config.title,
      "description": config.description,
      "url": config.canonicalUrl,
      "image": config.ogImage || this.DEFAULT_OG_IMAGE,
      ...(config.type === 'article' && {
        "author": {
          "@type": "Person",
          "name": config.author || "PRISMA GESTION"
        },
        "publisher": {
          "@type": "Organization",
          "name": this.DEFAULT_SITE_NAME
        },
        "datePublished": config.publishedTime,
        "dateModified": config.modifiedTime || config.publishedTime
      })
    };

    return JSON.stringify(structuredData);
  }

  static createSEOConfig(config: Partial<SEOConfig>): SEOConfig {
    return {
      title: this.generatePageTitle(config.title || this.DEFAULT_SITE_NAME),
      description: config.description || this.DEFAULT_DESCRIPTION,
      keywords: config.keywords || ['expertise comptable', 'fiscalité', 'conseil financier'],
      ogImage: config.ogImage || this.DEFAULT_OG_IMAGE,
      canonicalUrl: config.canonicalUrl || this.getCanonicalUrl('/'),
      type: config.type || 'website',
      ...config
    };
  }
}
