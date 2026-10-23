import { Router } from 'express';
import { favoriteController } from '../controllers/favoriteController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.use(authMiddleware);

router.get('/', (req, res, next) => favoriteController.getAll(req, res, next));

router.get('/ids', (req, res, next) => favoriteController.getIds(req, res, next));

router.post('/:recipeId', (req, res, next) => favoriteController.add(req, res, next));

router.delete('/:recipeId', (req, res, next) => favoriteController.remove(req, res, next));

export default router;
