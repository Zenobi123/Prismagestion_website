
import { Helmet } from 'react-helmet-async';
import { SEOService, SEOConfig } from '@/services/seoService';
import { MetadataService } from '@/services/metadataService';
import { absoluteUrl } from '@/config/site';

interface SEOHeadProps {
  config: Partial<SEOConfig>;
}

export const SEOHead = ({ config }: SEOHeadProps) => {
  const seoConfig = SEOService.createSEOConfig(config);
  const structuredData = SEOService.generateStructuredData(seoConfig);
  const organizationData = MetadataService.generateOrganizationStructuredData();
  // Facebook, LinkedIn et WhatsApp rejettent les images de partage relatives.
  const ogImageUrl = absoluteUrl(seoConfig.ogImage ?? '');

  return (
    <Helmet>
      <title>{seoConfig.title}</title>
      <meta name="description" content={seoConfig.description} />
      {seoConfig.keywords && (
        <meta name="keywords" content={seoConfig.keywords.join(', ')} />
      )}
      
      {/* Open Graph */}
      <meta property="og:title" content={seoConfig.title} />
      <meta property="og:description" content={seoConfig.description} />
      <meta property="og:type" content={seoConfig.type} />
      <meta property="og:url" content={seoConfig.canonicalUrl} />
      <meta property="og:image" content={ogImageUrl} />
      <meta property="og:site_name" content="PRISMA GESTION" />
      <meta property="og:locale" content="fr_FR" />
      
      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seoConfig.title} />
      <meta name="twitter:description" content={seoConfig.description} />
      <meta name="twitter:image" content={ogImageUrl} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={seoConfig.canonicalUrl} />
      
      {/* Article specific meta tags */}
      {seoConfig.type === 'article' && seoConfig.publishedTime && (
        <meta property="article:published_time" content={seoConfig.publishedTime} />
      )}
      {seoConfig.type === 'article' && seoConfig.modifiedTime && (
        <meta property="article:modified_time" content={seoConfig.modifiedTime} />
      )}
      {seoConfig.type === 'article' && seoConfig.author && (
        <meta property="article:author" content={seoConfig.author} />
      )}
      
      {/* Robots */}
      <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
      
      {/* Language */}
      <meta httpEquiv="content-language" content="fr" />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {structuredData}
      </script>
      
      {/* Organization Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(organizationData)}
      </script>
    </Helmet>
  );
};
