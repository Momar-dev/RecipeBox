import { cloudinary, isCloudinaryConfigured, configureCloudinary } from '../lib/cloudinary';
import { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';

export interface UploadResult {
  secure_url: string;
  public_id: string;
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
}

export class UploadService {

  isConfigured(): boolean {
    return isCloudinaryConfigured();
  }

  async uploadRecipeImage(
    buffer: Buffer,
    options: { folder?: string; publicId?: string } = {}
  ): Promise<UploadResult> {
    if (!this.isConfigured()) {
      throw new Error('CLOUDINARY_NOT_CONFIGURED');
    }

    configureCloudinary();

    const folder = options.folder || 'recipe-box/recipes';

    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          public_id: options.publicId,
          resource_type: 'image',
          allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
          transformation: [

            { quality: 'auto:good' },
            { fetch_format: 'auto' },
          ],
        },
        (error?: UploadApiErrorResponse, result?: UploadApiResponse) => {
          if (error || !result) {
            console.error('[UploadService] Erreur upload_stream Cloudinary:', error?.message);
            return reject(new Error(error?.message || 'Erreur lors du téléversement vers Cloudinary.'));
          }

          resolve({
            secure_url: result.secure_url,
            public_id: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format,
            bytes: result.bytes,
          });
        }
      );

      stream.end(buffer);
    });
  }

  async deleteImage(publicId: string): Promise<boolean> {
    if (!this.isConfigured()) return false;
    try {
      configureCloudinary();
      const res = await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
      return res.result === 'ok';
    } catch (err) {
      console.error('[UploadService] Erreur suppression Cloudinary:', err);
      return false;
    }
  }
}

export const uploadService = new UploadService();
