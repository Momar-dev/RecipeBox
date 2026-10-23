import { Router } from 'express';
import { recipeController } from '../controllers/recipeController';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.get('/', optionalAuthMiddleware, (req, res, next) => recipeController.getAll(req, res, next));
router.get('/:id', optionalAuthMiddleware, (req, res, next) => recipeController.getById(req, res, next));

router.post('/', authMiddleware, (req, res, next) => recipeController.create(req, res, next));
router.put('/:id', authMiddleware, (req, res, next) => recipeController.update(req, res, next));
router.delete('/:id', authMiddleware, (req, res, next) => recipeController.delete(req, res, next));

export default router;
