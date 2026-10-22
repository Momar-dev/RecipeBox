/**
 * Validation robuste des images (taille, extension et magic bytes).
 */

export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 Mo

export type SupportedImageFormat = 'jpeg' | 'png' | 'webp';

/**
 * Détermine le type MIME réel d'un buffer en inspectant ses "magic bytes".
 * Protège contre l'usurpation de type MIME (ex: renommer un .exe ou .html en .jpg).
 */
export function detectImageFormat(buffer: Buffer): SupportedImageFormat | null {
  if (!buffer || buffer.length < 12) {
    return null;
  }

  // JPEG : débute par FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'jpeg';
  }

  // PNG : débute par 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return 'png';
  }

  // WebP : commence par 'RIFF' (octets 0-3) et contient 'WEBP' (octets 8-11)
  const isRiff =
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46; // 'RIFF'

  const isWebp =
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50; // 'WEBP'

  if (isRiff && isWebp) {
    return 'webp';
  }

  return null;
}

export interface ImageValidationResult {
  isValid: boolean;
  format?: SupportedImageFormat;
  error?: string;
}

/**
 * Valide un fichier image téléversé.
 */
export function validateImageBuffer(buffer?: Buffer, declaredMimeType?: string): ImageValidationResult {
  if (!buffer || buffer.length === 0) {
    return {
      isValid: false,
      error: 'Le fichier image est vide ou manquant.',
    };
  }

  if (buffer.length > MAX_IMAGE_SIZE_BYTES) {
    return {
      isValid: false,
      error: 'Le fichier est trop volumineux. La taille maximale autorisée est de 5 Mo.',
    };
  }

  const detectedFormat = detectImageFormat(buffer);

  if (!detectedFormat) {
    return {
      isValid: false,
      error: "Format de fichier non pris en charge ou contenu invalide. Formats acceptés : JPEG, PNG, WebP.",
    };
  }

  // Vérifie si le MIME déclaré concorde (si fourni)
  if (declaredMimeType) {
    const normalized = declaredMimeType.toLowerCase();
    const validMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validMimes.includes(normalized)) {
      return {
        isValid: false,
        error: "Le type MIME déclaré ne correspond pas à une image supportée (JPEG, PNG, WebP).",
      };
    }
  }

  return {
    isValid: true,
    format: detectedFormat,
  };
}
