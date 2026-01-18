import { useState, useEffect } from 'react';
import { getOptimizedImageUrl } from '../../utils/cloudinaryTransform';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  aspectRatio?: string; // z.B. "16/9" oder "1/1"
  priority?: boolean; // Für above-the-fold Bilder
}

/**
 * Optimierte Bild-Komponente mit:
 * - Progressive Loading (Blur → Sharp)
 * - Layout Shift Prevention (aspect-ratio)
 * - Lazy Loading
 * - Cloudinary Optimierung
 */
export default function OptimizedImage({
  src,
  alt,
  className = '',
  width,
  height,
  aspectRatio,
  priority = false,
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Für Base64-Bilder (alte Quizze) keine Optimierung
  const isCloudinary = src.includes('cloudinary.com');

  // Berechne aspect-ratio falls width/height gegeben
  const calculatedAspectRatio = aspectRatio || (width && height ? `${width}/${height}` : undefined);

  // URLs für Progressive Loading
  const placeholderUrl = isCloudinary
    ? getOptimizedImageUrl(src, 20, 20) // Tiny blur placeholder
    : src;

  const fullUrl = isCloudinary
    ? getOptimizedImageUrl(src, width || 1024, height || 1024)
    : src;

  // Preload für priority images
  useEffect(() => {
    if (!priority || !isCloudinary) return;
    
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = fullUrl;
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, [fullUrl, priority, isCloudinary]);

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    overflow: 'hidden',
    ...(calculatedAspectRatio && { aspectRatio: calculatedAspectRatio }),
  };

  const imageStyle: React.CSSProperties = {
    transition: 'opacity 0.3s ease-in-out, filter 0.3s ease-in-out',
    opacity: isLoaded ? 1 : 0,
    filter: isLoaded ? 'blur(0)' : 'blur(10px)',
  };

  const placeholderStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    opacity: isLoaded ? 0 : 1,
    filter: 'blur(10px)',
    transform: 'scale(1.1)', // Verhindert weiße Ränder beim Blur
    transition: 'opacity 0.3s ease-in-out',
  };

  if (hasError) {
    return (
      <div
        className={`bg-gray-200 dark:bg-gray-700 flex items-center justify-center ${className}`}
        style={containerStyle}
      >
        <span className="text-gray-500 dark:text-gray-400 text-sm">
          Bild nicht verfügbar
        </span>
      </div>
    );
  }

  return (
    <div className={className} style={containerStyle}>
      {/* Tiny Placeholder für Progressive Loading */}
      {isCloudinary && !isLoaded && (
        <img
          src={placeholderUrl}
          alt=""
          aria-hidden="true"
          style={placeholderStyle}
          className="w-full h-full object-contain"
        />
      )}

      {/* Skeleton Loading während Bild lädt */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 animate-pulse" />
      )}

      {/* Haupt-Bild */}
      <img
        src={fullUrl}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        style={imageStyle}
        className="w-full h-full object-contain"
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
      />
    </div>
  );
}
