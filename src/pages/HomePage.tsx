import React, { useState } from 'react';
import { Recipe, RecipeFilterState, Category, Difficulty, SortOption } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { RecipeCard } from '../components/RecipeCard';
import { CategoryFilter } from '../components/CategoryFilter';
import { 
  Search, 
  SlidersHorizontal, 
  RotateCcw, 
  Clock, 
  Heart,
  X,
  PlusCircle,
  Leaf,
  CakeSlice,
  ChefHat,
  ArrowRight
} from 'lucide-react';

interface HomePageProps {
  recipes: Recipe[];
  filteredRecipes: Recipe[];
  featuredRecipes: Recipe[];
  filters: RecipeFilterState;
  favorites: string[];
  onUpdateFilters: (updates: Partial<RecipeFilterState>) => void;
  onResetFilters: () => void;
  onSelectRecipe: (id: string) => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onOpenCreate: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  recipes = [],
  filteredRecipes = [],
  featuredRecipes = [],
  filters,
  favorites = [],
  onUpdateFilters,
  onResetFilters,
  onSelectRecipe,
  onToggleFavorite,
  onOpenCreate,
}) => {
  const { t } = useLanguage();
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const hasActiveFilters = 
    Boolean(filters.searchQuery.trim()) ||
    filters.category !== 'all' ||
    filters.difficulty !== 'all' ||
    filters.maxTotalTime !== null ||
    filters.sortBy !== 'newest' ||
    filters.onlyFavorites;

  return (
    <div className="space-y-12 pb-16">
      
      {/* Hero Section with Editorial Culinary Depth */}
      <section className="relative rounded-3xl overflow-hidden bg-stone-950 text-white shadow-2xl border border-stone-800/80 perspective-1000">
        {/* Background Image with warm culinary gradient */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=1920&q=80"
            alt="Atelier culinaire gastronomique"
            className="w-full h-full object-cover opacity-30 scale-102 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-900/95 to-stone-950/70" />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-transparent" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 py-14 sm:py-20 lg:py-24 text-center">
          
          {/* Subtle Top Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs font-semibold mb-6 backdrop-blur-md shadow-xs animate-gentle-float">
            <ChefHat className="w-3.5 h-3.5 text-amber-400" />
            <span>{t.stageBadge}</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight mb-5 drop-shadow-sm">
            {t.heroTitle}
          </h1>

          <p className="text-sm sm:text-base lg:text-lg text-stone-300 max-w-2xl mx-auto mb-10 font-normal leading-relaxed">
            {t.heroSubtitle}
          </p>

          {/* Hero Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative flex items-center bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-2 border border-stone-200/90 focus-within:ring-2 focus-within:ring-amber-500/50 transition-all">
              <Search className="w-5 h-5 text-stone-400 ml-3 shrink-0" />
              <input
                type="text"
                value={filters.searchQuery}
                onChange={(e) => onUpdateFilters({ searchQuery: e.target.value })}
                placeholder={t.searchPlaceholder}
                className="w-full px-3 py-2.5 text-stone-900 text-sm sm:text-base placeholder-stone-400 focus:outline-hidden bg-transparent"
              />
              {filters.searchQuery && (
                <button
                  type="button"
                  onClick={() => onUpdateFilters({ searchQuery: '' })}
                  className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 mr-2 transition-colors cursor-pointer"
                  aria-label="Effacer la recherche"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  const catalogEl = document.getElementById('catalog-section');
                  catalogEl?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-semibold text-sm transition-all shadow-md shadow-amber-600/30 cursor-pointer shrink-0 active:scale-95"
              >
                {t.heroSearchBtn}
              </button>
            </div>

            {/* Quick Inspiration Chips (NO EMOJIS - PURE SVG ICONS) */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-5 text-xs text-stone-300">
              <span className="text-stone-400 font-medium">{t.quickFilters}</span>
              
              <button
                type="button"
                onClick={() => onUpdateFilters({ maxTotalTime: filters.maxTotalTime === 30 ? null : 30 })}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                  filters.maxTotalTime === 30
                    ? 'bg-amber-500 text-stone-950 font-bold border-amber-400 shadow-sm'
                    : 'bg-white/10 hover:bg-white/15 border-white/20 text-stone-200'
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>{t.filterUnder30}</span>
              </button>

              <button
                type="button"
                onClick={() => onUpdateFilters({ difficulty: filters.difficulty === 'easy' ? 'all' : 'easy' })}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                  filters.difficulty === 'easy'
                    ? 'bg-amber-500 text-stone-950 font-bold border-amber-400 shadow-sm'
                    : 'bg-white/10 hover:bg-white/15 border-white/20 text-stone-200'
                }`}
              >
                <ChefHat className="w-3.5 h-3.5 text-amber-400" />
                <span>{t.diffEasy}</span>
              </button>

              <button
                type="button"
                onClick={() => onUpdateFilters({ category: filters.category === 'vegetarian' ? 'all' : 'vegetarian' })}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                  filters.category === 'vegetarian'
                    ? 'bg-amber-500 text-stone-950 font-bold border-amber-400 shadow-sm'
                    : 'bg-white/10 hover:bg-white/15 border-white/20 text-stone-200'
                }`}
              >
                <Leaf className="w-3.5 h-3.5 text-emerald-400" />
                <span>{t.catVegetarian}</span>
              </button>

              <button
                type="button"
                onClick={() => onUpdateFilters({ category: filters.category === 'dessert' ? 'all' : 'dessert' })}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                  filters.category === 'dessert'
                    ? 'bg-amber-500 text-stone-950 font-bold border-amber-400 shadow-sm'
                    : 'bg-white/10 hover:bg-white/15 border-white/20 text-stone-200'
                }`}
              >
                <CakeSlice className="w-3.5 h-3.5 text-amber-400" />
                <span>{t.catDessert}</span>
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* Featured Recipes Section (Only shown when not actively filtering) */}
      {!hasActiveFilters && featuredRecipes.length > 0 && (
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-stone-200 pb-4">
            <div>
              <div className="flex items-center gap-2 text-amber-700 font-bold text-xs uppercase tracking-wider mb-1">
                <ChefHat className="w-4 h-4 text-amber-600" />
                <span>{t.chefSelection}</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
                {t.featuredSectionTitle}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-stone-500 max-w-md">
              {t.featuredSectionSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {featuredRecipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                isFavorite={favorites.includes(recipe.id)}
                onSelect={onSelectRecipe}
                onToggleFavorite={onToggleFavorite}
              />
            ))}
          </div>
        </section>
      )}

      {/* Catalog & Search Filters Section */}
      <section id="catalog-section" className="space-y-6 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
              {t.allRecipesTitle}
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              {t.allRecipesSubtitle}
            </p>
          </div>

          <button
            onClick={onOpenCreate}
            className="sm:hidden w-full py-3 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-700 text-white font-semibold text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t.navCreate}</span>
          </button>
        </div>

        {/* Category Pills Filter */}
        <CategoryFilter
          selectedCategory={filters.category}
          onSelectCategory={(category: Category) => onUpdateFilters({ category })}
          recipes={recipes}
        />

        {/* Filter Toolbar */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-stone-200/90 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            
            {/* Inline search */}
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={filters.searchQuery}
                onChange={(e) => onUpdateFilters({ searchQuery: e.target.value })}
                placeholder={t.searchPlaceholder}
                className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:outline-hidden focus:border-amber-500 transition-colors"
              />
              {filters.searchQuery && (
                <button
                  type="button"
                  onClick={() => onUpdateFilters({ searchQuery: '' })}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-0.5"
                  aria-label="Effacer la recherche"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick Sort Dropdown */}
            <div className="flex items-center gap-2">
              <label htmlFor="sort-select" className="text-xs font-semibold text-stone-600 hidden sm:block whitespace-nowrap">
                {t.sortBy} :
              </label>
              <select
                id="sort-select"
                value={filters.sortBy}
                onChange={(e) => onUpdateFilters({ sortBy: e.target.value as SortOption })}
                className="px-3 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-stone-50 border border-stone-200 text-stone-800 focus:outline-hidden focus:border-amber-500 cursor-pointer shadow-2xs"
              >
                <option value="newest">{t.sortNewest}</option>
                <option value="prepTimeAsc">{t.sortPrepTimeAsc}</option>
                <option value="totalTimeAsc">{t.sortTotalTimeAsc}</option>
                <option value="difficultyAsc">{t.sortDifficultyAsc}</option>
                <option value="titleAsc">{t.sortTitleAsc}</option>
              </select>
            </div>

            {/* Advanced Filters Toggle Button */}
            <button
              type="button"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                showAdvancedFilters || filters.difficulty !== 'all' || filters.maxTotalTime !== null
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-200'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4 text-amber-600" />
              <span>{t.filterDifficulty} & {t.filterMaxTime}</span>
            </button>

            {/* Reset Filters Button if any active */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={onResetFilters}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer"
                title={t.resetFilters}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t.resetFilters}</span>
              </button>
            )}

          </div>

          {/* Advanced Filters Drawer */}
          {showAdvancedFilters && (
            <div className="pt-4 border-t border-stone-150 grid grid-cols-1 sm:grid-cols-3 gap-4 animate-in fade-in duration-150">
              {/* Difficulty selector */}
              <div>
                <label className="block text-xs font-bold text-stone-600 mb-1.5">
                  {t.filterDifficulty}
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['all', 'easy', 'medium', 'hard'] as const).map((diff) => (
                    <button
                      key={diff}
                      type="button"
                      onClick={() => onUpdateFilters({ difficulty: diff })}
                      className={`py-2 px-1 rounded-xl text-xs font-semibold text-center transition-all cursor-pointer ${
                        filters.difficulty === diff
                          ? 'bg-stone-900 text-white shadow-xs'
                          : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                      }`}
                    >
                      {diff === 'all' ? t.catAll : diff === 'easy' ? t.diffEasy : diff === 'medium' ? t.diffMedium : t.diffHard}
                    </button>
                  ))}
                </div>
              </div>

              {/* Max Time selector */}
              <div>
                <label className="block text-xs font-bold text-stone-600 mb-1.5">
                  {t.filterMaxTime}
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { label: t.filterTimeAll, val: null },
                    { label: '< 30m', val: 30 },
                    { label: '< 60m', val: 60 },
                    { label: '> 60m', val: 61 },
                  ].map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => onUpdateFilters({ maxTotalTime: item.val })}
                      className={`py-2 px-1 rounded-xl text-xs font-semibold text-center transition-all cursor-pointer ${
                        filters.maxTotalTime === item.val
                          ? 'bg-stone-900 text-white shadow-xs'
                          : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Favorites only checkbox button */}
              <div>
                <label className="block text-xs font-bold text-stone-600 mb-1.5">
                  {t.navFavorites}
                </label>
                <button
                  type="button"
                  onClick={() => onUpdateFilters({ onlyFavorites: !filters.onlyFavorites })}
                  className={`w-full py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer border ${
                    filters.onlyFavorites
                      ? 'bg-rose-50 border-rose-300 text-rose-700 font-bold shadow-2xs'
                      : 'bg-stone-100 border-stone-200 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${filters.onlyFavorites ? 'fill-rose-500 text-rose-500' : 'text-stone-400'}`} />
                  <span>{t.filterFavoritesOnly}</span>
                </button>
              </div>
            </div>
          )}

          {/* Results count label */}
          <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500 font-medium">
            <span>{t.resultsCount(filteredRecipes.length)}</span>
            {hasActiveFilters && (
              <span className="text-amber-800 font-semibold flex items-center gap-1">
                <span>{t.filtersApplied}</span>
              </span>
            )}
          </div>
        </div>

        {/* Recipes Grid */}
        {filteredRecipes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
            {filteredRecipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                isFavorite={favorites.includes(recipe.id)}
                onSelect={onSelectRecipe}
                onToggleFavorite={onToggleFavorite}
              />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 max-w-lg mx-auto shadow-xs my-8">
            <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="font-serif text-xl font-bold text-stone-900 mb-2">
              {t.noResultsTitle}
            </h3>
            <p className="text-sm text-stone-500 mb-6 leading-relaxed">
              {t.noResultsDesc}
            </p>
            <button
              onClick={onResetFilters}
              className="px-6 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-sm font-semibold transition-all shadow-sm cursor-pointer inline-flex items-center gap-2 active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{t.resetFilters}</span>
            </button>
          </div>
        )}

      </section>

    </div>
  );
};
