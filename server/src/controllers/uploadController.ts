import { Request, Response, NextFunction } from 'express';
import { validateImageBuffer } from '../validators/imageValidator';
import { uploadService } from '../services/uploadService';

export class UploadController {

  async uploadRecipeImage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const file = req.file;

      if (!file) {
        res.status(400).json({
          status: 'error',
          message: 'Aucun fichier image fourni. Utilisez le champ "image" (multipart/form-data).',
        });
        return;
      }

      const validation = validateImageBuffer(file.buffer, file.mimetype);
      if (!validation.isValid) {
        res.status(400).json({
          status: 'error',
          message: validation.error || 'Fichier image invalide.',
        });
        return;
      }

      if (!uploadService.isConfigured()) {
        res.status(503).json({
          status: 'error',
          code: 'CLOUDINARY_NOT_CONFIGURED',
          message: 'Le service Cloudinary n\'est pas encore configuré. Renseignez CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY et CLOUDINARY_API_SECRET dans le fichier .env du serveur.',
        });
        return;
      }

      const result = await uploadService.uploadRecipeImage(file.buffer, {
        folder: 'recipe-box/recipes',
      });

      res.status(201).json({
        status: 'success',
        message: 'Image téléversée avec succès sur Cloudinary.',
        data: {
          secure_url: result.secure_url,
          public_id: result.public_id,
          format: result.format,
          bytes: result.bytes,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const uploadController = new UploadController();
