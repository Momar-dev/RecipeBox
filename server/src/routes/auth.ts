import { Router } from 'express';
import { authController } from '../controllers/authController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Inscription
router.post('/register', (req, res, next) => authController.register(req, res, next));

// Connexion
router.post('/login', (req, res, next) => authController.login(req, res, next));

// Profil utilisateur authentifié
router.get('/me', authMiddleware, (req, res, next) => authController.getMe(req, res, next));

export default router;
