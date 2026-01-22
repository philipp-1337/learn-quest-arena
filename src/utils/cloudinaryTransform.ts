import { cld } from '@config/cloudinaryConfig';
import { fill, fit } from '@cloudinary/url-gen/actions/resize';
import { autoGravity } from '@cloudinary/url-gen/qualifiers/gravity';
import { format } from '@cloudinary/url-gen/actions/delivery';
import { quality } from '@cloudinary/url-gen/actions/delivery';
import { auto as autoFormat } from '@cloudinary/url-gen/qualifiers/format';
import { auto as autoQuality } from '@cloudinary/url-gen/qualifiers/quality';

/**
 * Extrahiert die Public ID aus einer Cloudinary URL
 * @param url - Vollständige Cloudinary URL
 * @returns Public ID oder null
 */
export function extractPublicId(url: string): string | null {
  try {
    // Beispiel URL: https://res.cloudinary.com/demo/image/upload/v1234567890/folder/image.jpg
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

/**
 * Generiert eine optimierte Cloudinary URL für Quiz-Bilder
 * - Maximale Größe: 1024x1024px (behält Seitenverhältnis)
 * - Automatische Format-Optimierung (WebP für moderne Browser)
 * - Automatische Qualität (balance zwischen Dateigröße & Qualität)
 * 
 * @param imageUrl - Original Cloudinary URL
 * @param maxWidth - Maximale Breite (Standard: 1024)
 * @param maxHeight - Maximale Höhe (Standard: 1024)
 * @returns Optimierte URL oder Original bei Fehler
 */
export function getOptimizedImageUrl(
  imageUrl: string,
  maxWidth: number = 1024,
  maxHeight: number = 1024
): string {
  try {
    // Wenn es keine Cloudinary URL ist, gib Original zurück (z.B. Base64 für alte Quizze)
    if (!imageUrl.includes('cloudinary.com')) {
      return imageUrl;
    }

    const publicId = extractPublicId(imageUrl);
    if (!publicId) {
      return imageUrl;
    }

    // Erstelle optimiertes Bild mit Cloudinary URL Generator
    const optimizedImage = cld
      .image(publicId)
      .resize(fit().width(maxWidth).height(maxHeight)) // Max-Größe, behält Seitenverhältnis
      .delivery(format(autoFormat())) // Automatisches Format (WebP für moderne Browser)
      .delivery(quality(autoQuality())); // Automatische Qualität

    return optimizedImage.toURL();
  } catch (error) {
    console.error('Error optimizing image:', error);
    return imageUrl; // Fallback auf Original
  }
}

/**
 * Generiert eine optimierte Cloudinary URL mit fester Größe (cropped)
 * Nützlich für Thumbnails oder quadratische Bilder
 * 
 * @param imageUrl - Original Cloudinary URL
 * @param width - Ziel-Breite
 * @param height - Ziel-Höhe
 * @returns Optimierte URL oder Original bei Fehler
 */
export function getCroppedImageUrl(
  imageUrl: string,
  width: number,
  height: number
): string {
  try {
    if (!imageUrl.includes('cloudinary.com')) {
      return imageUrl;
    }

    const publicId = extractPublicId(imageUrl);
    if (!publicId) {
      return imageUrl;
    }

    const croppedImage = cld
      .image(publicId)
      .resize(fill().width(width).height(height).gravity(autoGravity())) // Cropped mit Smart-Fokus
      .delivery(format(autoFormat()))
      .delivery(quality(autoQuality()));

    return croppedImage.toURL();
  } catch (error) {
    console.error('Error cropping image:', error);
    return imageUrl;
  }
}

/**
 * Generiert eine Thumbnail-URL (klein & quadratisch)
 * @param imageUrl - Original Cloudinary URL
 * @param size - Thumbnail-Größe (Standard: 150px)
 */
export function getThumbnailUrl(imageUrl: string, size: number = 150): string {
  return getCroppedImageUrl(imageUrl, size, size);
}
