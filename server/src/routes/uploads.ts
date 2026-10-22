import { Router } from 'express';
import { uploadController } from '../controllers/uploadController';
import { authMiddleware } from '../middleware/authMiddleware';
import { handleSingleImageUpload } from '../middleware/uploadMiddleware';

const router = Router();

// Téléversement d'une image de recette (protégé par JWT)
router.post(
  '/recipe-image',
  authMiddleware,
  handleSingleImageUpload('image'),
  (req, res, next) => uploadController.uploadRecipeImage(req, res, next)
);

export default router;
