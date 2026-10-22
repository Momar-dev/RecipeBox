import { Router } from 'express';
import { favoriteController } from '../controllers/favoriteController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Toutes les routes favoris exigent une authentification JWT
router.use(authMiddleware);

// Lister les recettes favorites complètes
router.get('/', (req, res, next) => favoriteController.getAll(req, res, next));

// Lister uniquement les IDs des favoris (léger, utile pour sync rapide)
router.get('/ids', (req, res, next) => favoriteController.getIds(req, res, next));

// Ajouter un favori
router.post('/:recipeId', (req, res, next) => favoriteController.add(req, res, next));

// Retirer un favori
router.delete('/:recipeId', (req, res, next) => favoriteController.remove(req, res, next));

export default router;
