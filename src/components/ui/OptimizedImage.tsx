
import { useState, useEffect } from 'react';
import { ImageService, ImageConfig } from '@/services/imageService';
import { webpTwin } from '@/utils/blogImageFormats';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallback?: string;
  loading?: 'lazy' | 'eager';
  onError?: () => void;
}

export const OptimizedImage = ({
  src,
  alt,
  fallback,
  loading = 'lazy',
  onError,
  className,
  ...props
}: OptimizedImageProps) => {
  const buildConfig = (source: string): ImageConfig => {
    const config = ImageService.getOptimizedImageConfig(source, alt, { fallback, loading });
    const webp = webpTwin(config.src);
    return webp ? { ...config, src: webp } : config;
  };

  const [imageConfig, setImageConfig] = useState<ImageConfig>(() => buildConfig(src));
  // Étapes de repli déjà consommées : d'abord l'original, puis le fallback.
  const [triedOriginal, setTriedOriginal] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setImageConfig(buildConfig(src));
    setTriedOriginal(false);
    setHasError(false);
    setIsLoading(true);
    // buildConfig dérive de src/alt/fallback/loading, déjà listés.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, alt, fallback, loading]);

  const handleError = () => {
    // 1re erreur sur un WebP : on revient au fichier d'origine.
    if (!triedOriginal && imageConfig.src !== src && webpTwin(src)) {
      setTriedOriginal(true);
      setImageConfig(prev => ({ ...prev, src }));
      return;
    }
    // À partir d'ici l'échec concerne bien le fichier demandé par l'appelant :
    // on le lui signale, comme avant l'ajout du WebP.
    if (!hasError && imageConfig.fallback) {
      setHasError(true);
      setImageConfig(prev => ({ ...prev, src: prev.fallback! }));
    }
    onError?.();
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  return (
    <img
      src={imageConfig.src}
      alt={imageConfig.alt}
      loading={imageConfig.loading}
      onError={handleError}
      onLoad={handleLoad}
      className={`transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'} ${className}`}
      {...props}
    />
  );
};
