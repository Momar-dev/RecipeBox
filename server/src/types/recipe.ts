import { Category, Difficulty, Prisma } from '@prisma/client';

export type RecipeWithRelations = Prisma.RecipeGetPayload<{
  include: {
    ingredients: true;
    steps: true;
    tags: {
      include: {
        tag: true;
      };
    };
    author: {
      select: {
        id: true;
        name: true;
        email: true;
      };
    };
  };
}>;

export interface TransformedRecipe {
  id: string;
  title: string;
  titleEn?: string;
  description: string;
  descriptionEn?: string;
  category: Category;
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: Difficulty;
  imageUrl: string;
  isFeatured: boolean;
  isCustom: boolean;
  isPublic: boolean;
  chefNote?: string;
  chefNoteEn?: string;
  createdAt: string;
  updatedAt: string;
  authorId: string | null;
  author: {
    id: string;
    name: string | null;
    email: string;
  } | null;
  ingredients: {
    id: string;
    name: string;
    nameEn?: string;
    quantity: number | null;
    unit: string;
    unitEn?: string;
    order: number;
  }[];
  steps: {
    id: string;
    stepNumber: number;
    instruction: string;
    instructionEn?: string;
    tip?: string;
    tipEn?: string;
  }[];
  tags: string[];
  tagsEn: string[];
}

export function transformRecipe(recipe: RecipeWithRelations): TransformedRecipe {
  const sortedIngredients = [...recipe.ingredients].sort((a, b) => a.order - b.order);
  const sortedSteps = [...recipe.steps].sort((a, b) => a.stepNumber - b.stepNumber);

  return {
    id: recipe.id,
    title: recipe.titleFr,
    titleEn: recipe.titleEn || undefined,
    description: recipe.descriptionFr,
    descriptionEn: recipe.descriptionEn || undefined,
    category: recipe.category,
    prepTime: recipe.prepTime,
    cookTime: recipe.cookTime,
    servings: recipe.servings,
    difficulty: recipe.difficulty,
    imageUrl: recipe.imageUrl,
    isFeatured: recipe.isFeatured,
    isCustom: recipe.isCustom,
    isPublic: recipe.isPublic,
    chefNote: recipe.chefNoteFr || undefined,
    chefNoteEn: recipe.chefNoteEn || undefined,
    createdAt: recipe.createdAt.toISOString(),
    updatedAt: recipe.updatedAt.toISOString(),
    authorId: recipe.authorId,
    author: recipe.author,
    ingredients: sortedIngredients.map((ing) => ({
      id: ing.id,
      name: ing.nameFr,
      nameEn: ing.nameEn || undefined,
      quantity: ing.quantity,
      unit: ing.unitFr,
      unitEn: ing.unitEn || undefined,
      order: ing.order,
    })),
    steps: sortedSteps.map((step) => ({
      id: step.id,
      stepNumber: step.stepNumber,
      instruction: step.instructionFr,
      instructionEn: step.instructionEn || undefined,
      tip: step.tipFr || undefined,
      tipEn: step.tipEn || undefined,
    })),
    tags: recipe.tags.map((rt) => rt.tag.nameFr),
    tagsEn: recipe.tags
      .map((rt) => rt.tag.nameEn || rt.tag.nameFr)
      .filter((t): t is string => Boolean(t)),
  };
}
