import { Recipe, RecipeFilterState, Language } from '../types';
import { API_BASE } from './apiConfig';

const STORAGE_FAVORITES_KEY = 'recipebox_favorites_v1';

export interface UploadImageResponse {
  secure_url: string;
  public_id: string;
  format?: string;
  bytes?: number;
}

class RecipeService {

  public async getRecipes(token?: string | null): Promise<Recipe[]> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}/api/recipes?limit=100`, { headers });

    if (!res.ok) {
      const errJson = await res.json().catch(() => null);
      throw new Error(errJson?.message || `Erreur serveur (${res.status}) lors du chargement des recettes.`);
    }

    const json = await res.json();
    return json.data as Recipe[];
  }

  public async getRecipeById(id: string, token?: string | null): Promise<Recipe | null> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}/api/recipes/${encodeURIComponent(id)}`, { headers });

    if (res.status === 404) {
      return null;
    }

    if (!res.ok) {
      const errJson = await res.json().catch(() => null);
      throw new Error(errJson?.message || `Erreur lors de la récupération de la recette (${res.status}).`);
    }

    const json = await res.json();
    return json.data as Recipe;
  }

  public async createRecipe(
    data: Omit<Recipe, 'id' | 'createdAt'>,
    token?: string | null
  ): Promise<Recipe> {
    if (!token) {
      throw new Error('Authentification requise pour créer une recette.');
    }

    const payload = {
      title: data.title,
      titleEn: data.titleEn,
      description: data.description,
      descriptionEn: data.descriptionEn,
      category: data.category,
      prepTime: data.prepTime,
      cookTime: data.cookTime,
      servings: data.servings,
      difficulty: data.difficulty,
      imageUrl: data.imageUrl,
      isFeatured: Boolean(data.isFeatured),
      isCustom: true,
      isPublic: data.isPublic !== undefined ? Boolean(data.isPublic) : true,
      chefNote: data.chefNote,
      chefNoteEn: data.chefNoteEn,
      ingredients: data.ingredients.map((ing, idx) => ({
        name: ing.name,
        nameEn: ing.nameEn,
        quantity: ing.quantity,
        unit: ing.unit,
        unitEn: ing.unitEn,
        order: idx + 1,
      })),
      steps: data.steps.map((st, idx) => ({
        stepNumber: st.stepNumber || idx + 1,
        instruction: st.instruction,
        instructionEn: st.instructionEn,
        tip: st.tip,
        tipEn: st.tipEn,
      })),
      tags: data.tags || [],
    };

    const res = await fetch(`${API_BASE}/api/recipes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const json = await res.json().catch(() => null);

    if (!res.ok || json?.status !== 'success') {
      const msg = json?.errors?.join(' ') || json?.message || 'Erreur lors de la création de la recette.';
      throw new Error(msg);
    }

    return json.data as Recipe;
  }

  public async updateRecipe(
    id: string,
    data: Partial<Recipe>,
    token?: string | null
  ): Promise<Recipe> {
    if (!token) {
      throw new Error('Authentification requise pour modifier une recette.');
    }

    const payload: any = {};
    if (data.title !== undefined) payload.title = data.title;
    if (data.titleEn !== undefined) payload.titleEn = data.titleEn;
    if (data.description !== undefined) payload.description = data.description;
    if (data.descriptionEn !== undefined) payload.descriptionEn = data.descriptionEn;
    if (data.category !== undefined) payload.category = data.category;
    if (data.prepTime !== undefined) payload.prepTime = data.prepTime;
    if (data.cookTime !== undefined) payload.cookTime = data.cookTime;
    if (data.servings !== undefined) payload.servings = data.servings;
    if (data.difficulty !== undefined) payload.difficulty = data.difficulty;
    if (data.imageUrl !== undefined) payload.imageUrl = data.imageUrl;
    if (data.isFeatured !== undefined) payload.isFeatured = data.isFeatured;
    if (data.isPublic !== undefined) payload.isPublic = data.isPublic;
    if (data.chefNote !== undefined) payload.chefNote = data.chefNote;
    if (data.chefNoteEn !== undefined) payload.chefNoteEn = data.chefNoteEn;

    if (data.ingredients) {
      payload.ingredients = data.ingredients.map((ing, idx) => ({
        name: ing.name,
        nameEn: ing.nameEn,
        quantity: ing.quantity,
        unit: ing.unit,
        unitEn: ing.unitEn,
        order: idx + 1,
      }));
    }

    if (data.steps) {
      payload.steps = data.steps.map((st, idx) => ({
        stepNumber: st.stepNumber || idx + 1,
        instruction: st.instruction,
        instructionEn: st.instructionEn,
        tip: st.tip,
        tipEn: st.tipEn,
      }));
    }

    if (data.tags) {
      payload.tags = data.tags;
    }

    const res = await fetch(`${API_BASE}/api/recipes/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const json = await res.json().catch(() => null);

    if (!res.ok || json?.status !== 'success') {
      const msg = json?.errors?.join(' ') || json?.message || 'Erreur lors de la modification de la recette.';
      throw new Error(msg);
    }

    return json.data as Recipe;
  }

  public async deleteRecipe(id: string, token?: string | null): Promise<boolean> {
    if (!token) {
      throw new Error('Authentification requise pour supprimer une recette.');
    }

    const res = await fetch(`${API_BASE}/api/recipes/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const json = await res.json().catch(() => null);

    if (!res.ok || json?.status !== 'success') {
      throw new Error(json?.message || 'Erreur lors de la suppression de la recette.');
    }

    return true;
  }

  public async uploadRecipeImage(file: File, token: string): Promise<UploadImageResponse> {
    const formData = new FormData();
    formData.append('image', file);

    const res = await fetch(`${API_BASE}/api/uploads/recipe-image`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const json = await res.json().catch(() => null);

    if (!res.ok || json?.status !== 'success') {
      if (res.status === 503 || json?.code === 'CLOUDINARY_NOT_CONFIGURED') {
        const err = new Error('CLOUDINARY_NOT_CONFIGURED');
        (err as any).code = 'CLOUDINARY_NOT_CONFIGURED';
        throw err;
      }
      throw new Error(json?.message || 'Erreur lors du téléversement de la photo.');
    }

    return json.data as UploadImageResponse;
  }

  public async resetToDefaultData(token?: string | null): Promise<Recipe[]> {
    return this.getRecipes(token);
  }

  public async fetchFavoriteIds(token?: string | null): Promise<string[]> {
    if (!token) {
      return this.getLocalFavorites();
    }

    try {
      const res = await fetch(`${API_BASE}/api/favorites/ids`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        return this.getLocalFavorites();
      }

      const json = await res.json();
      return json.data as string[];
    } catch {
      return this.getLocalFavorites();
    }
  }

  public async addFavorite(recipeId: string, token?: string | null): Promise<void> {
    if (!token) {
      const favs = this.getLocalFavorites();
      if (!favs.includes(recipeId)) {
        this.saveLocalFavorites([...favs, recipeId]);
      }
      return;
    }

    const res = await fetch(`${API_BASE}/api/favorites/${encodeURIComponent(recipeId)}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      const json = await res.json().catch(() => null);
      throw new Error(json?.message || "Erreur lors de l'ajout aux favoris.");
    }
  }

  public async removeFavorite(recipeId: string, token?: string | null): Promise<void> {
    if (!token) {
      const favs = this.getLocalFavorites().filter((id) => id !== recipeId);
      this.saveLocalFavorites(favs);
      return;
    }

    const res = await fetch(`${API_BASE}/api/favorites/${encodeURIComponent(recipeId)}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok && res.status !== 404) {
      const json = await res.json().catch(() => null);
      throw new Error(json?.message || 'Erreur lors du retrait des favoris.');
    }
  }

  private getLocalFavorites(): string[] {
    try {
      const stored = localStorage.getItem(STORAGE_FAVORITES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private saveLocalFavorites(favorites: string[]): void {
    try {
      localStorage.setItem(STORAGE_FAVORITES_KEY, JSON.stringify(favorites));
    } catch (e) {
      console.warn('Impossible de persister les favoris dans le stockage local', e);
    }
  }

  public getFavorites(): string[] {
    return this.getLocalFavorites();
  }
}

export const recipeService = new RecipeService();

export function filterAndSortRecipes(
  recipes: Recipe[],
  filters: RecipeFilterState,
  favorites: string[],
  language: Language
): Recipe[] {
  return recipes.filter((recipe) => {

    if (filters.searchQuery.trim()) {
      const query = filters.searchQuery.toLowerCase().trim();
      const titleMatch = 
        recipe.title.toLowerCase().includes(query) ||
        (recipe.titleEn && recipe.titleEn.toLowerCase().includes(query));

      const descMatch =
        recipe.description.toLowerCase().includes(query) ||
        (recipe.descriptionEn && recipe.descriptionEn.toLowerCase().includes(query));

      const ingredientMatch = recipe.ingredients.some((ing) => 
        ing.name.toLowerCase().includes(query) ||
        (ing.nameEn && ing.nameEn.toLowerCase().includes(query))
      );

      const tagMatch = 
        recipe.tags.some(t => t.toLowerCase().includes(query)) ||
        (recipe.tagsEn && recipe.tagsEn.some(t => t.toLowerCase().includes(query)));

      if (!titleMatch && !descMatch && !ingredientMatch && !tagMatch) {
        return false;
      }
    }

    if (filters.category !== 'all' && recipe.category !== filters.category) {
      return false;
    }

    if (filters.difficulty !== 'all' && recipe.difficulty !== filters.difficulty) {
      return false;
    }

    if (filters.maxTotalTime !== null) {
      const totalTime = recipe.prepTime + recipe.cookTime;
      if (filters.maxTotalTime === 30 && totalTime > 30) return false;
      if (filters.maxTotalTime === 60 && totalTime > 60) return false;
      if (filters.maxTotalTime === 61 && totalTime <= 60) return false;
    }

    if (filters.onlyFavorites && !favorites.includes(recipe.id)) {
      return false;
    }

    return true;
  }).sort((a, b) => {
    switch (filters.sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'prepTimeAsc':
        return a.prepTime - b.prepTime;
      case 'totalTimeAsc':
        return (a.prepTime + a.cookTime) - (b.prepTime + b.cookTime);
      case 'difficultyAsc': {
        const order = { easy: 1, medium: 2, hard: 3 };
        return order[a.difficulty] - order[b.difficulty];
      }
      case 'titleAsc': {
        const titleA = language === 'en' && a.titleEn ? a.titleEn : a.title;
        const titleB = language === 'en' && b.titleEn ? b.titleEn : b.title;
        return titleA.localeCompare(titleB, language);
      }
      default:
        return 0;
    }
  });
}

export function calculateScaledQuantity(
  baseQuantity: number | null,
  baseServings: number,
  targetServings: number
): number | null {
  if (baseQuantity === null || baseServings <= 0 || targetServings <= 0) {
    return null;
  }
  const scaled = (baseQuantity / baseServings) * targetServings;
  return Math.round(scaled * 10) / 10;
}
