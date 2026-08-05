
import { CONTACT } from '@/config/social';

export interface PageMetadata {
  title: string;
  description: string;
  keywords?: string[];
  ogImage?: string;
  ogType?: string;
  canonicalUrl?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  structuredData?: object;
}

export class MetadataService {
  private static readonly DEFAULT_METADATA: PageMetadata = {
    title: "PRISMA GESTION | Cabinet de services professionnels",
    description: "PRISMA GESTION - Cabinet de services en comptabilité, finance, fiscalité, ressources humaines, génie logiciel et intelligence artificielle basé à Yaoundé, Cameroun.",
    keywords: ["expertise comptable", "fiscalité", "conseil financier", "PRISMA", "Yaoundé", "Cameroun"],
    ogImage: "/og-image.jpg",
    ogType: "website"
  };

  static createPageMetadata(metadata: Partial<PageMetadata>): PageMetadata {
    return {
      ...this.DEFAULT_METADATA,
      ...metadata,
      canonicalUrl: metadata.canonicalUrl || `${window.location.origin}${window.location.pathname}`
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- forme d'article variable (source blog)
  static generateBlogMetadata(post: any): PageMetadata {
    return this.createPageMetadata({
      title: `${post.seoTitle || post.title} | PRISMA GESTION`,
      description: post.seoDescription || post.excerpt || `Article de ${post.author} sur ${post.title}`,
      keywords: [...this.DEFAULT_METADATA.keywords!, ...post.tags],
      ogImage: post.image,
      ogType: "article",
      author: post.author,
      publishedTime: post.publishDate,
      canonicalUrl: `${window.location.origin}/blog/${post.slug}`,
      structuredData: {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": post.title,
        "description": post.excerpt,
        "image": post.image,
        "author": {
          "@type": "Person",
          "name": post.author
        },
        "publisher": {
          "@type": "Organization",
          "name": "PRISMA GESTION",
          "logo": {
            "@type": "ImageObject",
            "url": "/logo-prisma.png"
          }
        },
        "datePublished": post.publishDate,
        "dateModified": post.publishDate
      }
    });
  }

  static generateOrganizationStructuredData(): object {
    return {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "PRISMA GESTION",
      "description": this.DEFAULT_METADATA.description,
      "url": window.location.origin,
      "logo": `${window.location.origin}/logo-prisma.png`,
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Yaoundé",
        "addressCountry": "CM"
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "customer service",
        "email": CONTACT.email,
        "telephone": [CONTACT.phone, CONTACT.phoneSecondary]
      },
      "sameAs": []
    };
  }
}
