import { Request, Response, NextFunction } from 'express';
import { favoriteService } from '../services/favoriteService';

export class FavoriteController {
  /**
   * GET /api/favorites
   * Récupère les recettes favorites de l'utilisateur connecté.
   * Protégé par JWT (authMiddleware).
   */
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          status: 'error',
          message: 'Authentification requise pour accéder aux favoris.',
        });
        return;
      }

      const recipes = await favoriteService.findAll(req.user.id);

      res.status(200).json({
        status: 'success',
        data: recipes,
        meta: { total: recipes.length },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/favorites/ids
   * Récupère uniquement les IDs des favoris (format léger pour sync côté frontend).
   */
  async getIds(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          status: 'error',
          message: 'Authentification requise.',
        });
        return;
      }

      const ids = await favoriteService.getFavoriteIds(req.user.id);

      res.status(200).json({
        status: 'success',
        data: ids,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/favorites/:recipeId
   * Ajoute une recette aux favoris de l'utilisateur connecté.
   * Idempotent : si le favori existe déjà, retourne 200 sans erreur.
   */
  async add(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          status: 'error',
          message: 'Authentification requise pour gérer les favoris.',
        });
        return;
      }

      const { recipeId } = req.params;

      if (!recipeId || typeof recipeId !== 'string' || recipeId.trim().length === 0) {
        res.status(400).json({
          status: 'error',
          message: 'Identifiant de recette invalide.',
        });
        return;
      }

      const result = await favoriteService.add(req.user.id, recipeId.trim());

      if (!result.added) {
        res.status(404).json({
          status: 'error',
          message: 'Recette introuvable ou inaccessible.',
        });
        return;
      }

      if (result.alreadyExists) {
        res.status(200).json({
          status: 'success',
          message: 'Cette recette est déjà dans vos favoris.',
        });
        return;
      }

      res.status(201).json({
        status: 'success',
        message: 'Recette ajoutée aux favoris.',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/favorites/:recipeId
   * Retire une recette des favoris de l'utilisateur connecté.
   */
  async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          status: 'error',
          message: 'Authentification requise pour gérer les favoris.',
        });
        return;
      }

      const { recipeId } = req.params;

      if (!recipeId || typeof recipeId !== 'string' || recipeId.trim().length === 0) {
        res.status(400).json({
          status: 'error',
          message: 'Identifiant de recette invalide.',
        });
        return;
      }

      const removed = await favoriteService.remove(req.user.id, recipeId.trim());

      if (!removed) {
        res.status(404).json({
          status: 'error',
          message: 'Ce favori est introuvable.',
        });
        return;
      }

      res.status(200).json({
        status: 'success',
        message: 'Recette retirée des favoris.',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const favoriteController = new FavoriteController();
