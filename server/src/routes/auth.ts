import { Router } from 'express';
import { authController } from '../controllers/authController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.post('/register', (req, res, next) => authController.register(req, res, next));

router.post('/login', (req, res, next) => authController.login(req, res, next));

router.get('/me', authMiddleware, (req, res, next) => authController.getMe(req, res, next));

export default router;
