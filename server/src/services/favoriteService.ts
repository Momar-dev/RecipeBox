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

  async add(userId: string, recipeId: string): Promise<{ added: boolean; alreadyExists: boolean }> {

    const recipe = await prisma.recipe.findUnique({ where: { id: recipeId } });
    if (!recipe) {
      return { added: false, alreadyExists: false };
    }

    if (!recipe.isPublic && recipe.authorId !== userId) {
      return { added: false, alreadyExists: false };
    }

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

  async isFavorite(userId: string, recipeId: string): Promise<boolean> {
    const fav = await prisma.favorite.findUnique({
      where: { userId_recipeId: { userId, recipeId } },
    });
    return fav !== null;
  }

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
