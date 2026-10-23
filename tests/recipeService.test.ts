import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { calculateScaledQuantity, filterAndSortRecipes } from '../src/services/recipeService.ts';
import { INITIAL_RECIPES } from '../src/data/mockRecipes.ts';
import { RecipeFilterState } from '../src/types/index.ts';

describe('Recipe Box - Pure Business Logic Unit Tests', () => {
  test('calculateScaledQuantity correctly calculates scaled ingredients', () => {

    assert.strictEqual(calculateScaledQuantity(400, 4, 2), 200);

    assert.strictEqual(calculateScaledQuantity(350, 4, 6), 525);

    assert.strictEqual(calculateScaledQuantity(null, 4, 6), null);

    assert.strictEqual(calculateScaledQuantity(100, 0, 4), null);
    assert.strictEqual(calculateScaledQuantity(100, 4, 0), null);
  });

  test('filterAndSortRecipes filters by search query matching ingredient or title', () => {
    const defaultFilters: RecipeFilterState = {
      searchQuery: 'poulet',
      category: 'all',
      difficulty: 'all',
      maxTotalTime: null,
      sortBy: 'newest',
      onlyFavorites: false,
    };

    const results = filterAndSortRecipes(INITIAL_RECIPES, defaultFilters, [], 'fr');
    assert.ok(results.length >= 2, 'Should find at least Chicken Yassa and Caesar salad');
    assert.ok(results.some(r => r.id === 'rec-1'));
  });

  test('filterAndSortRecipes filters by category properly', () => {
    const dessertFilters: RecipeFilterState = {
      searchQuery: '',
      category: 'dessert',
      difficulty: 'all',
      maxTotalTime: null,
      sortBy: 'newest',
      onlyFavorites: false,
    };

    const results = filterAndSortRecipes(INITIAL_RECIPES, dessertFilters, [], 'fr');
    assert.ok(results.every(r => r.category === 'dessert'));
    assert.ok(results.length >= 2, 'Should find tarte tatin and moelleux');
  });

  test('filterAndSortRecipes sorts by shortest total time', () => {
    const sortFilters: RecipeFilterState = {
      searchQuery: '',
      category: 'all',
      difficulty: 'all',
      maxTotalTime: null,
      sortBy: 'totalTimeAsc',
      onlyFavorites: false,
    };

    const results = filterAndSortRecipes(INITIAL_RECIPES, sortFilters, [], 'fr');
    const totalTimes = results.map(r => r.prepTime + r.cookTime);
    for (let i = 0; i < totalTimes.length - 1; i++) {
      assert.ok(totalTimes[i] <= totalTimes[i + 1], 'Results should be in non-decreasing total time');
    }
  });

  test('filterAndSortRecipes filters only favorites', () => {
    const favFilters: RecipeFilterState = {
      searchQuery: '',
      category: 'all',
      difficulty: 'all',
      maxTotalTime: null,
      sortBy: 'newest',
      onlyFavorites: true,
    };

    const results = filterAndSortRecipes(INITIAL_RECIPES, favFilters, ['rec-1', 'rec-3'], 'fr');
    assert.strictEqual(results.length, 2);
    assert.ok(results.some(r => r.id === 'rec-1'));
    assert.ok(results.some(r => r.id === 'rec-3'));
  });
});
