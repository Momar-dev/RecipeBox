import { prisma } from '../lib/prisma';
import { transformRecipe, TransformedRecipe } from '../types/recipe';

const RECIPE_INCLUDE = {
  ingredients: true,
  steps: true,
  tags: {
    include: {
      tag: true,
    },
  },
  author: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
} as const;

export class FavoriteService {
  /**
   * Récupère la liste des recettes favorites d'un utilisateur.
   * Inclut uniquement les recettes publiques OU appartenant à l'utilisateur.
   */
  async findAll(userId: string): Promise<TransformedRecipe[]> {
    const favorites = await prisma.favorite.findMany({
      where: {
        userId,
        recipe: {
          OR: [{ isPublic: true }, { authorId: userId }],
        },
      },
      include: {
        recipe: {
          include: RECIPE_INCLUDE,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return favorites.map((fav) => transformRecipe(fav.recipe));
  }

  /**
   * Ajoute une recette aux favoris d'un utilisateur.
   * Retourne false si la recette n'existe pas ou si l'accès est interdit.
   * Retourne true si l'ajout a réussi (ou si le favori existait déjà → idempotent).
   */
  async add(userId: string, recipeId: string): Promise<{ added: boolean; alreadyExists: boolean }> {
    // Vérifier l'existence et la visibilité de la recette
    const recipe = await prisma.recipe.findUnique({ where: { id: recipeId } });
    if (!recipe) {
      return { added: false, alreadyExists: false };
    }

    // Vérifier l'accès : recette publique ou appartenant à l'utilisateur
    if (!recipe.isPublic && recipe.authorId !== userId) {
      return { added: false, alreadyExists: false };
    }

    // Vérifier si le favori existe déjà (upsert pour garantir l'idempotence)
    const existing = await prisma.favorite.findUnique({
      where: { userId_recipeId: { userId, recipeId } },
    });

    if (existing) {
      return { added: true, alreadyExists: true };
    }

    await prisma.favorite.create({
      data: { userId, recipeId },
    });

    return { added: true, alreadyExists: false };
  }

  /**
   * Retire une recette des favoris d'un utilisateur.
   * Retourne true si la suppression a réussi, false si le favori n'existait pas.
   */
  async remove(userId: string, recipeId: string): Promise<boolean> {
    const existing = await prisma.favorite.findUnique({
      where: { userId_recipeId: { userId, recipeId } },
    });

    if (!existing) {
      return false;
    }

    await prisma.favorite.delete({
      where: { userId_recipeId: { userId, recipeId } },
    });

    return true;
  }

  /**
   * Vérifie si une recette est dans les favoris d'un utilisateur.
   */
  async isFavorite(userId: string, recipeId: string): Promise<boolean> {
    const fav = await prisma.favorite.findUnique({
      where: { userId_recipeId: { userId, recipeId } },
    });
    return fav !== null;
  }

  /**
   * Récupère les IDs des recettes favorites d'un utilisateur (format léger).
   */
  async getFavoriteIds(userId: string): Promise<string[]> {
    const favorites = await prisma.favorite.findMany({
      where: { userId },
      select: { recipeId: true },
      orderBy: { createdAt: 'desc' },
    });
    return favorites.map((f) => f.recipeId);
  }
}

export const favoriteService = new FavoriteService();
