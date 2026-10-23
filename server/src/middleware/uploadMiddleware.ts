import multer, { MulterError } from 'multer';
import { Request, Response, NextFunction } from 'express';
import { MAX_IMAGE_SIZE_BYTES } from '../validators/imageValidator';

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: MAX_IMAGE_SIZE_BYTES,
    files: 1,
  },
  fileFilter: (_req, file, cb) => {

    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedMimeTypes.includes(file.mimetype.toLowerCase())) {
      cb(null, true);
    } else {
      cb(new Error('FORMAT_NOT_ALLOWED'));
    }
  },
});

export function handleSingleImageUpload(fieldName = 'image') {
  const multerSingle = upload.single(fieldName);

  return (req: Request, res: Response, next: NextFunction): void => {
    multerSingle(req, res, (err: any) => {
      if (err) {
        if (err instanceof MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            res.status(400).json({
              status: 'error',
              message: 'Le fichier est trop volumineux. La taille maximale autorisée est de 5 Mo.',
            });
            return;
          }
          res.status(400).json({
            status: 'error',
            message: `Erreur de téléversement : ${err.message}`,
          });
          return;
        }

        if (err.message === 'FORMAT_NOT_ALLOWED') {
          res.status(400).json({
            status: 'error',
            message: 'Format d\'image non supporté. Formats acceptés : JPEG, PNG, WebP.',
          });
          return;
        }

        res.status(400).json({
          status: 'error',
          message: err.message || 'Erreur lors de la réception du fichier.',
        });
        return;
      }

      next();
    });
  };
}
