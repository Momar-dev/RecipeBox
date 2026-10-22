import { Request, Response, NextFunction } from 'express';
import { recipeService } from '../services/recipeService';
import {
  validateRecipeCreate,
  validateRecipeUpdate,
  parseCategory,
  parseDifficulty,
} from '../validators/recipeValidator';

export class RecipeController {
  /**
   * GET /api/recipes
   * Récupère les recettes publiques (+ les recettes privées de l'utilisateur connecté).
   */
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { search, category, difficulty, isFeatured, page, limit } = req.query;

      const result = await recipeService.findAll({
        search: typeof search === 'string' ? search : undefined,
        category: parseCategory(category),
        difficulty: parseDifficulty(difficulty),
        isFeatured: isFeatured === 'true' ? true : isFeatured === 'false' ? false : undefined,
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
        userId: req.user?.id,
      });

      res.status(200).json({
        status: 'success',
        data: result.recipes,
        meta: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/recipes/:id
   * Récupère une recette par son ID.
   * Si la recette est privée, l'accès est réservé à son auteur.
   */
  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const recipe = await recipeService.findById(id);

      if (!recipe) {
        res.status(404).json({
          status: 'error',
          message: `Recette introuvable avec l'identifiant "${id}".`,
        });
        return;
      }

      // Contrôle de visibilité pour les recettes privées
      if (!recipe.isPublic && (!req.user || recipe.authorId !== req.user.id)) {
        res.status(403).json({
          status: 'error',
          message: 'Accès refusé : cette recette est privée.',
        });
        return;
      }

      res.status(200).json({
        status: 'success',
        data: recipe,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/recipes
   * Protégé par JWT. Associe automatiquement l'auteur depuis req.user.id.
   */
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          status: 'error',
          message: 'Authentification requise pour créer une recette.',
        });
        return;
      }

      const validation = validateRecipeCreate(req.body);
      if (!validation.isValid || !validation.data) {
        res.status(400).json({
          status: 'error',
          message: 'Données de recette invalides.',
          errors: validation.errors,
        });
        return;
      }

      // L'authorId provient exclusivement du jeton JWT authentifié (jamais du body)
      const created = await recipeService.create({
        ...validation.data,
        authorId: req.user.id,
      });

      res.status(201).json({
        status: 'success',
        message: 'Recette créée avec succès.',
        data: created,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/recipes/:id
   * Protégé par JWT. Seul l'auteur peut modifier sa propre recette.
   */
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          status: 'error',
          message: 'Authentification requise pour modifier une recette.',
        });
        return;
      }

      const { id } = req.params;
      const existing = await recipeService.findById(id);

      if (!existing) {
        res.status(404).json({
          status: 'error',
          message: `Impossible de modifier : recette introuvable avec l'identifiant "${id}".`,
        });
        return;
      }

      // Vérification stricte de propriété
      if (existing.authorId !== req.user.id) {
        res.status(403).json({
          status: 'error',
          message: 'Vous n\'êtes pas autorisé à modifier cette recette.',
        });
        return;
      }

      const validation = validateRecipeUpdate(req.body);
      if (!validation.isValid || !validation.data) {
        res.status(400).json({
          status: 'error',
          message: 'Données de mise à jour invalides.',
          errors: validation.errors,
        });
        return;
      }

      const updated = await recipeService.update(id, validation.data);

      res.status(200).json({
        status: 'success',
        message: 'Recette mise à jour avec succès.',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/recipes/:id
   * Protégé par JWT. Seul l'auteur peut supprimer sa propre recette.
   */
  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          status: 'error',
          message: 'Authentification requise pour supprimer une recette.',
        });
        return;
      }

      const { id } = req.params;
      const existing = await recipeService.findById(id);

      if (!existing) {
        res.status(404).json({
          status: 'error',
          message: `Impossible de supprimer : recette introuvable avec l'identifiant "${id}".`,
        });
        return;
      }

      // Vérification stricte de propriété
      if (existing.authorId !== req.user.id) {
        res.status(403).json({
          status: 'error',
          message: 'Vous n\'êtes pas autorisé à supprimer cette recette.',
        });
        return;
      }

      await recipeService.delete(id);

      res.status(200).json({
        status: 'success',
        message: `La recette "${id}" a été supprimée avec succès.`,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const recipeController = new RecipeController();
