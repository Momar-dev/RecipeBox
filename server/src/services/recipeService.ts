import { Category, Difficulty, Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { transformRecipe, TransformedRecipe } from '../types/recipe';

export interface RecipeFilters {
  search?: string;
  category?: Category;
  difficulty?: Difficulty;
  isFeatured?: boolean;
  page?: number;
  limit?: number;
  userId?: string;
}

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

export class RecipeService {

  async findAll(filters: RecipeFilters = {}): Promise<{
    recipes: TransformedRecipe[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { search, category, difficulty, isFeatured, userId } = filters;

    const page = Math.max(1, Number(filters.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(filters.limit) || 50));
    const skip = (page - 1) * limit;

    const andConditions: Prisma.RecipeWhereInput[] = [];

    if (userId) {
      andConditions.push({
        OR: [
          { isPublic: true },
          { authorId: userId },
        ],
      });
    } else {
      andConditions.push({
        isPublic: true,
      });
    }

    if (category) {
      andConditions.push({ category });
    }

    if (difficulty) {
      andConditions.push({ difficulty });
    }

    if (typeof isFeatured === 'boolean') {
      andConditions.push({ isFeatured });
    }

    if (search && search.trim()) {
      const q = search.trim();
      andConditions.push({
        OR: [
          { titleFr: { contains: q, mode: 'insensitive' } },
          { titleEn: { contains: q, mode: 'insensitive' } },
          { descriptionFr: { contains: q, mode: 'insensitive' } },
          { descriptionEn: { contains: q, mode: 'insensitive' } },
          {
            ingredients: {
              some: {
                OR: [
                  { nameFr: { contains: q, mode: 'insensitive' } },
                  { nameEn: { contains: q, mode: 'insensitive' } },
                ],
              },
            },
          },
          {
            tags: {
              some: {
                tag: {
                  OR: [
                    { nameFr: { contains: q, mode: 'insensitive' } },
                    { nameEn: { contains: q, mode: 'insensitive' } },
                  ],
                },
              },
            },
          },
        ],
      });
    }

    const where: Prisma.RecipeWhereInput = {
      AND: andConditions,
    };

    const [total, rawRecipes] = await Promise.all([
      prisma.recipe.count({ where }),
      prisma.recipe.findMany({
        where,
        include: RECIPE_INCLUDE,
        orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
      }),
    ]);

    return {
      recipes: rawRecipes.map(transformRecipe),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async findById(id: string): Promise<TransformedRecipe | null> {
    const raw = await prisma.recipe.findUnique({
      where: { id },
      include: RECIPE_INCLUDE,
    });

    if (!raw) return null;
    return transformRecipe(raw);
  }

  async create(data: {
    titleFr: string;
    titleEn?: string;
    descriptionFr: string;
    descriptionEn?: string;
    category: Category;
    prepTime: number;
    cookTime: number;
    servings: number;
    difficulty: Difficulty;
    imageUrl: string;
    isFeatured?: boolean;
    isCustom?: boolean;
    isPublic?: boolean;
    chefNoteFr?: string;
    chefNoteEn?: string;
    authorId?: string;
    ingredients: {
      nameFr: string;
      nameEn?: string;
      quantity: number | null;
      unitFr: string;
      unitEn?: string;
      order: number;
    }[];
    steps: {
      stepNumber: number;
      instructionFr: string;
      instructionEn?: string;
      tipFr?: string;
      tipEn?: string;
    }[];
    tags: string[];
  }): Promise<TransformedRecipe> {
    const { ingredients, steps, tags, ...recipeFields } = data;

    const tagRecords = await Promise.all(
      tags.map((tagName) =>
        prisma.tag.upsert({
          where: { nameFr: tagName },
          create: { nameFr: tagName },
          update: {},
        })
      )
    );

    const created = await prisma.recipe.create({
      data: {
        ...recipeFields,
        ingredients: {
          create: ingredients,
        },
        steps: {
          create: steps,
        },
        tags: {
          create: tagRecords.map((t) => ({
            tag: { connect: { id: t.id } },
          })),
        },
      },
      include: RECIPE_INCLUDE,
    });

    return transformRecipe(created);
  }

  async update(
    id: string,
    data: {
      titleFr?: string;
      titleEn?: string | null;
      descriptionFr?: string;
      descriptionEn?: string | null;
      category?: Category;
      prepTime?: number;
      cookTime?: number;
      servings?: number;
      difficulty?: Difficulty;
      imageUrl?: string;
      isFeatured?: boolean;
      isCustom?: boolean;
      isPublic?: boolean;
      chefNoteFr?: string | null;
      chefNoteEn?: string | null;
      ingredients?: {
        nameFr: string;
        nameEn?: string;
        quantity: number | null;
        unitFr: string;
        unitEn?: string;
        order: number;
      }[];
      steps?: {
        stepNumber: number;
        instructionFr: string;
        instructionEn?: string;
        tipFr?: string;
        tipEn?: string;
      }[];
      tags?: string[];
    }
  ): Promise<TransformedRecipe | null> {
    const exists = await prisma.recipe.findUnique({ where: { id } });
    if (!exists) return null;

    const { ingredients, steps, tags, ...scalarFields } = data;

    let tagRecords: { id: string }[] = [];
    if (tags !== undefined && tags.length > 0) {
      tagRecords = await Promise.all(
        tags.map((tagName) =>
          prisma.tag.upsert({
            where: { nameFr: tagName },
            create: { nameFr: tagName },
            update: {},
          })
        )
      );
    }

    const updated = await prisma.$transaction(
      async (tx) => {

        await tx.recipe.update({
          where: { id },
          data: scalarFields,
        });

        if (ingredients !== undefined) {
          await tx.ingredient.deleteMany({ where: { recipeId: id } });
          if (ingredients.length > 0) {
            await tx.ingredient.createMany({
              data: ingredients.map((ing) => ({
                ...ing,
                recipeId: id,
              })),
            });
          }
        }

        if (steps !== undefined) {
          await tx.recipeStep.deleteMany({ where: { recipeId: id } });
          if (steps.length > 0) {
            await tx.recipeStep.createMany({
              data: steps.map((st) => ({
                ...st,
                recipeId: id,
              })),
            });
          }
        }

        if (tags !== undefined) {
          await tx.recipeTag.deleteMany({ where: { recipeId: id } });
          if (tagRecords.length > 0) {
            await tx.recipeTag.createMany({
              data: tagRecords.map((t) => ({
                recipeId: id,
                tagId: t.id,
              })),
            });
          }
        }

        return tx.recipe.findUniqueOrThrow({
          where: { id },
          include: RECIPE_INCLUDE,
        });
      },
      {
        maxWait: 15000,
        timeout: 30000,
      }
    );

    return transformRecipe(updated);
  }

  async delete(id: string): Promise<boolean> {
    const exists = await prisma.recipe.findUnique({ where: { id } });
    if (!exists) return false;

    await prisma.recipe.delete({ where: { id } });
    return true;
  }
}

export const recipeService = new RecipeService();
