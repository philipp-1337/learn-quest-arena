import { Cloudinary } from '@cloudinary/url-gen';

// Cloudinary Konfiguration aus Environment Variables (Vite)
// Werte werden aus .env Datei geladen (siehe .env.example)
export const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '';
export const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || '';

// Validierung der Konfiguration
if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
  console.error(
    '❌ Cloudinary Konfiguration fehlt! Bitte .env Datei erstellen (siehe .env.example)'
  );
}

// Cloudinary Instanz für Image/Media Transformationen
export const cld = new Cloudinary({
  cloud: {
    cloudName: CLOUDINARY_CLOUD_NAME,
  },
});

// Upload URL für das Hochladen von Dateien
export const getUploadUrl = () =>
  `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`;
