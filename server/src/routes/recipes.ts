import { Router } from 'express';
import { recipeController } from '../controllers/recipeController';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Routes de lecture (authentification optionnelle pour accéder aux recettes privées de l'auteur)
router.get('/', optionalAuthMiddleware, (req, res, next) => recipeController.getAll(req, res, next));
router.get('/:id', optionalAuthMiddleware, (req, res, next) => recipeController.getById(req, res, next));

// Routes d'écriture (authentification obligatoire par JWT)
router.post('/', authMiddleware, (req, res, next) => recipeController.create(req, res, next));
router.put('/:id', authMiddleware, (req, res, next) => recipeController.update(req, res, next));
router.delete('/:id', authMiddleware, (req, res, next) => recipeController.delete(req, res, next));

export default router;
