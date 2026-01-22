import { CLOUDINARY_UPLOAD_PRESET, getUploadUrl } from '@config/cloudinaryConfig';
import { toast } from 'sonner';
import { CustomToast } from '@features/shared/CustomToast';

export interface CloudinaryUploadResult {
  url: string;
  publicId: string;
  format: string;
  resourceType: 'image' | 'video' | 'raw' | 'auto';
  width?: number;
  height?: number;
  bytes: number;
}

export interface UploadOptions {
  resourceType?: 'image' | 'video' | 'raw' | 'auto';
  folder?: string;
  tags?: string[];
  onProgress?: (progress: number) => void;
}

/**
 * Lädt eine Datei zu Cloudinary hoch
 * @param file - Die hochzuladende Datei (Bild, Audio, etc.)
 * @param options - Upload-Optionen (resourceType, folder, tags, onProgress)
 * @returns Promise mit der Cloudinary URL und weiteren Infos
 */
export async function uploadToCloudinary(
  file: File,
  options: UploadOptions = {}
): Promise<CloudinaryUploadResult> {
  const {
    resourceType = 'auto',
    folder = 'quiz-assets',
    tags = ['quiz'],
    onProgress,
  } = options;

  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', folder);
    
    if (tags.length > 0) {
      formData.append('tags', tags.join(','));
    }

    // Optional: resource_type setzen (image, video, raw, auto)
    const uploadUrl = getUploadUrl().replace('/upload', `/${resourceType}/upload`);

    const xhr = new XMLHttpRequest();

    return new Promise((resolve, reject) => {
      // Progress Tracking
      if (onProgress) {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const percentComplete = (e.loaded / e.total) * 100;
            onProgress(percentComplete);
          }
        });
      }

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          resolve({
            url: response.secure_url,
            publicId: response.public_id,
            format: response.format,
            resourceType: response.resource_type,
            width: response.width,
            height: response.height,
            bytes: response.bytes,
          });
        } else {
          reject(new Error(`Upload fehlgeschlagen: ${xhr.status}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Netzwerkfehler beim Upload'));
      });

      xhr.open('POST', uploadUrl);
      xhr.send(formData);
    });
  } catch (error) {
    console.error('Cloudinary Upload Error:', error);
    throw error;
  }
}

/**
 * Validiert eine Bild-Datei vor dem Upload
 * @param file - Die zu validierende Datei
 * @param maxSizeMB - Maximale Dateigröße in MB (Standard: 10 MB)
 * @returns true wenn valid, sonst Error-Message
 */
export function validateImageFile(
  file: File,
  maxSizeMB: number = 10
): { valid: boolean; error?: string } {
  const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
  
  if (!validImageTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Ungültiger Dateityp. Erlaubt sind: JPEG, PNG, GIF, WebP, SVG`,
    };
  }

  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `Datei zu groß! Max. ${maxSizeMB} MB. Deine Datei: ${(file.size / 1024 / 1024).toFixed(1)} MB`,
    };
  }

  return { valid: true };
}

/**
 * Validiert eine Audio-Datei vor dem Upload
 * @param file - Die zu validierende Datei
 * @param maxSizeMB - Maximale Dateigröße in MB (Standard: 10 MB)
 * @returns true wenn valid, sonst Error-Message
 */
export function validateAudioFile(
  file: File,
  maxSizeMB: number = 10
): { valid: boolean; error?: string } {
  const validAudioTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/webm'];
  
  if (!validAudioTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Ungültiger Dateityp. Erlaubt sind: MP3, WAV, OGG, WebM`,
    };
  }

  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `Datei zu groß! Max. ${maxSizeMB} MB. Deine Datei: ${(file.size / 1024 / 1024).toFixed(1)} MB`,
    };
  }

  return { valid: true };
}

/**
 * Upload-Helper mit Toast-Benachrichtigungen
 */
export async function uploadWithToast(
  file: File,
  options: UploadOptions = {}
): Promise<CloudinaryUploadResult | null> {
  const loadingToast = toast.loading(
    `${file.type.startsWith('audio') ? 'Audio' : 'Bild'} wird hochgeladen...`
  );

  try {
    // Validierung
    const validation = file.type.startsWith('audio')
      ? validateAudioFile(file)
      : validateImageFile(file);

    if (!validation.valid) {
      toast.dismiss(loadingToast);
      toast.custom(() => (
        <CustomToast message={validation.error!} type="error" />
      ));
      return null;
    }

    // Upload
    const result = await uploadToCloudinary(file, {
      ...options,
      onProgress: (progress) => {
        console.log(`Upload progress: ${progress.toFixed(0)}%`);
      },
    });

    toast.dismiss(loadingToast);
    toast.custom(() => (
      <CustomToast
        message={`${file.type.startsWith('audio') ? 'Audio' : 'Bild'} erfolgreich hochgeladen!`}
        type="success"
      />
    ));

    return result;
  } catch (error) {
    console.error('Upload error:', error);
    toast.dismiss(loadingToast);
    toast.custom(() => (
      <CustomToast
        message="Fehler beim Hochladen. Bitte versuche es erneut."
        type="error"
      />
    ));
    return null;
  }
}
