export type Language = 'fr' | 'en';

export type Category = 
  | 'all'
  | 'starter'
  | 'main'
  | 'dessert'
  | 'breakfast'
  | 'vegetarian'
  | 'baking';

export type Difficulty = 'easy' | 'medium' | 'hard';

export type SortOption = 
  | 'newest'
  | 'prepTimeAsc'
  | 'totalTimeAsc'
  | 'difficultyAsc'
  | 'titleAsc';

export interface Ingredient {
  id: string;
  name: string;
  nameEn?: string;
  quantity: number | null;
  unit: string;
  unitEn?: string;
}

export interface RecipeStep {
  id: string;
  stepNumber: number;
  instruction: string;
  instructionEn?: string;
  tip?: string;
  tipEn?: string;
}

export interface Recipe {
  id: string;
  title: string;
  titleEn?: string;
  description: string;
  descriptionEn?: string;
  category: Exclude<Category, 'all'>;
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: Difficulty;
  imageUrl: string;
  isFeatured?: boolean;
  isCustom?: boolean;
  isPublic?: boolean;
  authorId?: string | null;
  author?: {
    id: string;
    name: string | null;
    email: string;
  } | null;
  ingredients: Ingredient[];
  steps: RecipeStep[];
  tags: string[];
  tagsEn?: string[];
  createdAt: string;
  updatedAt?: string;
  chefNote?: string;
  chefNoteEn?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  createdAt?: string;
}

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface RecipeFilterState {
  searchQuery: string;
  category: Category;
  difficulty: Difficulty | 'all';
  maxTotalTime: number | null;
  sortBy: SortOption;
  onlyFavorites: boolean;
}

export type ViewMode = 'home' | 'detail' | 'create' | 'edit' | 'favorites';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  message: string;
}
