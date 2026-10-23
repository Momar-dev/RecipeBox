import { Category, Difficulty } from '@prisma/client';

export interface IngredientInput {
  id?: string;
  name?: string;
  nameFr?: string;
  nameEn?: string;
  quantity?: number | null;
  unit?: string;
  unitFr?: string;
  unitEn?: string;
  order?: number;
}

export interface StepInput {
  id?: string;
  stepNumber?: number;
  instruction?: string;
  instructionFr?: string;
  instructionEn?: string;
  tip?: string;
  tipFr?: string;
  tipEn?: string;
}

export interface RecipeInput {
  title?: string;
  titleFr?: string;
  titleEn?: string;
  description?: string;
  descriptionFr?: string;
  descriptionEn?: string;
  category?: Category;
  prepTime?: number;
  cookTime?: number;
  servings?: number;
  difficulty?: Difficulty;
  imageUrl?: string;
  isFeatured?: boolean;
  isCustom?: boolean;
  isPublic?: boolean;
  chefNote?: string;
  chefNoteFr?: string;
  chefNoteEn?: string;
  ingredients?: IngredientInput[];
  steps?: StepInput[];
  tags?: string[];
  tagsEn?: string[];
}

export interface ValidationResult<T> {
  isValid: boolean;
  errors: string[];
  data?: T;
}

const CATEGORY_MAP: Record<string, Category> = {
  starter: Category.starter,
  entree: Category.starter,
  'entrée': Category.starter,
  main: Category.main,
  plat: Category.main,
  dessert: Category.dessert,
  breakfast: Category.breakfast,
  'petit-dejeuner': Category.breakfast,
  'petit-déjeuner': Category.breakfast,
  vegetarian: Category.vegetarian,
  vegetarien: Category.vegetarian,
  'végétarien': Category.vegetarian,
  baking: Category.baking,
  boulangerie: Category.baking,
  patisserie: Category.baking,
  'pâtisserie': Category.baking,
};

const DIFFICULTY_MAP: Record<string, Difficulty> = {
  easy: Difficulty.easy,
  facile: Difficulty.easy,
  medium: Difficulty.medium,
  moyen: Difficulty.medium,
  hard: Difficulty.hard,
  difficile: Difficulty.hard,
};

export function parseCategory(val: unknown): Category | undefined {
  if (typeof val !== 'string') return undefined;
  const key = val.trim().toLowerCase();
  return CATEGORY_MAP[key];
}

export function parseDifficulty(val: unknown): Difficulty | undefined {
  if (typeof val !== 'string') return undefined;
  const key = val.trim().toLowerCase();
  return DIFFICULTY_MAP[key];
}

export function validateRecipeCreate(body: any): ValidationResult<{
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
  isFeatured: boolean;
  isCustom: boolean;
  isPublic: boolean;
  chefNoteFr?: string;
  chefNoteEn?: string;
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
}> {
  const errors: string[] = [];

  if (!body || typeof body !== 'object') {
    return { isValid: false, errors: ['Corps de la requête invalide ou manquant.'] };
  }

  const titleFr = (body.titleFr || body.title || '').trim();
  if (!titleFr) {
    errors.push('Le titre de la recette (FR) est requis.');
  } else if (titleFr.length < 3) {
    errors.push('Le titre doit contenir au moins 3 caractères.');
  }

  const titleEn = body.titleEn && typeof body.titleEn === 'string' ? body.titleEn.trim() : undefined;

  const descriptionFr = (body.descriptionFr || body.description || '').trim();
  if (!descriptionFr) {
    errors.push('La description de la recette (FR) est requise.');
  }

  const descriptionEn =
    body.descriptionEn && typeof body.descriptionEn === 'string' ? body.descriptionEn.trim() : undefined;

  const category = parseCategory(body.category);
  if (!category) {
    errors.push('Catégorie invalide. Choix valides: starter, main, dessert, breakfast, vegetarian, baking (ou entrée, plat, dessert, etc.).');
  }

  const difficulty = parseDifficulty(body.difficulty);
  if (!difficulty) {
    errors.push('Difficulté invalide. Choix valides: easy, medium, hard (ou facile, moyen, difficile).');
  }

  const prepTime = Number(body.prepTime);
  if (isNaN(prepTime) || prepTime < 0) {
    errors.push('Le temps de préparation doit être un nombre positif ou nul.');
  }

  const cookTime = Number(body.cookTime);
  if (isNaN(cookTime) || cookTime < 0) {
    errors.push('Le temps de cuisson doit être un nombre positif ou nul.');
  }

  const servings = Number(body.servings);
  if (isNaN(servings) || servings <= 0) {
    errors.push('Le nombre de portions doit être supérieur à zéro.');
  }

  const imageUrl = (body.imageUrl || '').trim();
  if (!imageUrl) {
    errors.push("L'URL de l'image est requise.");
  }

  const rawIngredients = Array.isArray(body.ingredients) ? body.ingredients : [];
  if (rawIngredients.length === 0) {
    errors.push('Au moins un ingrédient est requis.');
  }

  const ingredients: {
    nameFr: string;
    nameEn?: string;
    quantity: number | null;
    unitFr: string;
    unitEn?: string;
    order: number;
  }[] = [];

  rawIngredients.forEach((ing: any, idx: number) => {
    const nameFr = (ing.nameFr || ing.name || '').trim();
    if (!nameFr) {
      errors.push(`L'ingrédient #${idx + 1} doit avoir un nom.`);
    }

    const unitFr = (ing.unitFr || ing.unit || '').trim();
    const qty = ing.quantity === null || ing.quantity === undefined || ing.quantity === '' ? null : Number(ing.quantity);
    if (qty !== null && isNaN(qty)) {
      errors.push(`La quantité de l'ingrédient #${idx + 1} doit être un nombre valide ou vide.`);
    }

    ingredients.push({
      nameFr,
      nameEn: ing.nameEn && typeof ing.nameEn === 'string' ? ing.nameEn.trim() : undefined,
      quantity: qty,
      unitFr,
      unitEn: ing.unitEn && typeof ing.unitEn === 'string' ? ing.unitEn.trim() : undefined,
      order: typeof ing.order === 'number' ? ing.order : idx,
    });
  });

  const rawSteps = Array.isArray(body.steps) ? body.steps : [];
  if (rawSteps.length === 0) {
    errors.push('Au moins une étape de préparation est requise.');
  }

  const steps: {
    stepNumber: number;
    instructionFr: string;
    instructionEn?: string;
    tipFr?: string;
    tipEn?: string;
  }[] = [];

  rawSteps.forEach((st: any, idx: number) => {
    const instructionFr = (st.instructionFr || st.instruction || '').trim();
    if (!instructionFr) {
      errors.push(`L'étape #${idx + 1} doit comporter une instruction.`);
    }

    steps.push({
      stepNumber: typeof st.stepNumber === 'number' && st.stepNumber > 0 ? st.stepNumber : idx + 1,
      instructionFr,
      instructionEn: st.instructionEn && typeof st.instructionEn === 'string' ? st.instructionEn.trim() : undefined,
      tipFr: (st.tipFr || st.tip || '').trim() || undefined,
      tipEn: (st.tipEn || '').trim() || undefined,
    });
  });

  const rawTags = Array.isArray(body.tags) ? body.tags : [];
  const tags = rawTags
    .filter((t: any) => typeof t === 'string' && t.trim().length > 0)
    .map((t: string) => t.trim());

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  return {
    isValid: true,
    errors: [],
    data: {
      titleFr,
      titleEn,
      descriptionFr,
      descriptionEn,
      category: category!,
      prepTime,
      cookTime,
      servings,
      difficulty: difficulty!,
      imageUrl,
      isFeatured: Boolean(body.isFeatured),
      isCustom: body.isCustom !== undefined ? Boolean(body.isCustom) : true,
      isPublic: body.isPublic !== undefined ? Boolean(body.isPublic) : true,
      chefNoteFr: (body.chefNoteFr || body.chefNote || '').trim() || undefined,
      chefNoteEn: (body.chefNoteEn || '').trim() || undefined,
      ingredients,
      steps,
      tags,
    },
  };
}

export function validateRecipeUpdate(body: any): ValidationResult<Partial<{
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
  isFeatured: boolean;
  isCustom: boolean;
  isPublic: boolean;
  chefNoteFr?: string;
  chefNoteEn?: string;
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
}>> {
  const errors: string[] = [];

  if (!body || typeof body !== 'object') {
    return { isValid: false, errors: ['Corps de la requête invalide.'] };
  }

  const data: any = {};

  if (body.titleFr !== undefined || body.title !== undefined) {
    const t = (body.titleFr || body.title || '').trim();
    if (!t) errors.push('Le titre ne peut être vide.');
    else data.titleFr = t;
  }

  if (body.titleEn !== undefined) {
    data.titleEn = body.titleEn && typeof body.titleEn === 'string' ? body.titleEn.trim() : null;
  }

  if (body.descriptionFr !== undefined || body.description !== undefined) {
    const d = (body.descriptionFr || body.description || '').trim();
    if (!d) errors.push('La description ne peut être vide.');
    else data.descriptionFr = d;
  }

  if (body.descriptionEn !== undefined) {
    data.descriptionEn = body.descriptionEn && typeof body.descriptionEn === 'string' ? body.descriptionEn.trim() : null;
  }

  if (body.category !== undefined) {
    const parsedCat = parseCategory(body.category);
    if (!parsedCat) {
      errors.push('Catégorie invalide. Choix: starter, main, dessert, breakfast, vegetarian, baking.');
    } else {
      data.category = parsedCat;
    }
  }

  if (body.difficulty !== undefined) {
    const parsedDiff = parseDifficulty(body.difficulty);
    if (!parsedDiff) {
      errors.push('Difficulté invalide. Choix: easy, medium, hard.');
    } else {
      data.difficulty = parsedDiff;
    }
  }

  if (body.prepTime !== undefined) {
    const p = Number(body.prepTime);
    if (isNaN(p) || p < 0) errors.push('Le temps de préparation doit être un nombre positif ou nul.');
    else data.prepTime = p;
  }

  if (body.cookTime !== undefined) {
    const c = Number(body.cookTime);
    if (isNaN(c) || c < 0) errors.push('Le temps de cuisson doit être un nombre positif ou nul.');
    else data.cookTime = c;
  }

  if (body.servings !== undefined) {
    const s = Number(body.servings);
    if (isNaN(s) || s <= 0) errors.push('Le nombre de portions doit être supérieur à zéro.');
    else data.servings = s;
  }

  if (body.imageUrl !== undefined) {
    const img = (body.imageUrl || '').trim();
    if (!img) errors.push("L'URL d'image ne peut être vide.");
    else data.imageUrl = img;
  }

  if (body.isFeatured !== undefined) data.isFeatured = Boolean(body.isFeatured);
  if (body.isCustom !== undefined) data.isCustom = Boolean(body.isCustom);
  if (body.isPublic !== undefined) data.isPublic = Boolean(body.isPublic);

  if (body.chefNoteFr !== undefined || body.chefNote !== undefined) {
    data.chefNoteFr = (body.chefNoteFr || body.chefNote || '').trim() || null;
  }

  if (body.chefNoteEn !== undefined) {
    data.chefNoteEn = (body.chefNoteEn || '').trim() || null;
  }

  if (body.ingredients !== undefined) {
    if (!Array.isArray(body.ingredients) || body.ingredients.length === 0) {
      errors.push('La liste des ingrédients ne peut être vide.');
    } else {
      data.ingredients = body.ingredients.map((ing: any, idx: number) => ({
        nameFr: (ing.nameFr || ing.name || '').trim(),
        nameEn: ing.nameEn ? ing.nameEn.trim() : undefined,
        quantity: ing.quantity === null || ing.quantity === undefined || ing.quantity === '' ? null : Number(ing.quantity),
        unitFr: (ing.unitFr || ing.unit || '').trim(),
        unitEn: ing.unitEn ? ing.unitEn.trim() : undefined,
        order: typeof ing.order === 'number' ? ing.order : idx,
      }));
    }
  }

  if (body.steps !== undefined) {
    if (!Array.isArray(body.steps) || body.steps.length === 0) {
      errors.push('La liste des étapes ne peut être vide.');
    } else {
      data.steps = body.steps.map((st: any, idx: number) => ({
        stepNumber: typeof st.stepNumber === 'number' ? st.stepNumber : idx + 1,
        instructionFr: (st.instructionFr || st.instruction || '').trim(),
        instructionEn: st.instructionEn ? st.instructionEn.trim() : undefined,
        tipFr: (st.tipFr || st.tip || '').trim() || undefined,
        tipEn: (st.tipEn || '').trim() || undefined,
      }));
    }
  }

  if (body.tags !== undefined) {
    if (!Array.isArray(body.tags)) {
      errors.push('Les tags doivent être fournis sous forme de tableau.');
    } else {
      data.tags = body.tags
        .filter((t: any) => typeof t === 'string' && t.trim().length > 0)
        .map((t: string) => t.trim());
    }
  }

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  return { isValid: true, errors: [], data };
}
