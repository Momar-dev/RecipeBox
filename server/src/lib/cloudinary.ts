import { v2 as cloudinary } from 'cloudinary';

/**
 * Initialisation et configuration du SDK Cloudinary.
 * Les variables sont lues depuis process.env sans jamais être exposées publiquement.
 */
export function isCloudinaryConfigured(): boolean {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
  return Boolean(
    CLOUDINARY_CLOUD_NAME &&
    CLOUDINARY_API_KEY &&
    CLOUDINARY_API_SECRET &&
    !CLOUDINARY_CLOUD_NAME.includes('votre_') &&
    !CLOUDINARY_API_KEY.includes('votre_') &&
    !CLOUDINARY_API_SECRET.includes('votre_')
  );
}

export function configureCloudinary(): boolean {
  if (!isCloudinaryConfigured()) {
    return false;
  }

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });

  return true;
}

// Initialise la configuration si les variables sont présentes
configureCloudinary();

export { cloudinary };
