import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/authService';
import { validateRegister, validateLogin } from '../validators/authValidator';

export class AuthController {

  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validation = validateRegister(req.body);
      if (!validation.isValid || !validation.data) {
        res.status(400).json({
          status: 'error',
          message: 'Données d\'inscription invalides.',
          errors: validation.errors,
        });
        return;
      }

      const result = await authService.register(validation.data);

      res.status(201).json({
        status: 'success',
        message: 'Compte créé avec succès.',
        data: {
          token: result.token,
          user: result.user,
        },
      });
    } catch (error) {
      const err = error as NodeJS.ErrnoException;
      if (err.code === 'EMAIL_TAKEN') {
        res.status(409).json({
          status: 'error',
          message: err.message,
        });
        return;
      }
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validation = validateLogin(req.body);
      if (!validation.isValid || !validation.data) {
        res.status(400).json({
          status: 'error',
          message: 'Données de connexion invalides.',
          errors: validation.errors,
        });
        return;
      }

      const result = await authService.login(validation.data);

      res.status(200).json({
        status: 'success',
        message: 'Connexion réussie.',
        data: {
          token: result.token,
          user: result.user,
        },
      });
    } catch (error) {
      const err = error as NodeJS.ErrnoException;
      if (err.code === 'INVALID_CREDENTIALS') {
        res.status(401).json({
          status: 'error',
          message: 'Adresse e-mail ou mot de passe incorrect.',
        });
        return;
      }
      next(error);
    }
  }

  async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          status: 'error',
          message: 'Authentification requise.',
        });
        return;
      }

      const user = await authService.getMe(req.user.id);

      if (!user) {
        res.status(404).json({
          status: 'error',
          message: 'Utilisateur introuvable.',
        });
        return;
      }

      res.status(200).json({
        status: 'success',
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
