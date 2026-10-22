import React, { useState } from 'react';
import { Recipe } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { RecipeCard } from '../components/RecipeCard';
import { Heart, Search, ArrowLeft, X, Utensils } from 'lucide-react';

interface FavoritesPageProps {
  favoriteRecipes: Recipe[];
  favorites: string[];
  onSelectRecipe: (id: string) => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onExplore: () => void;
}

export const FavoritesPage: React.FC<FavoritesPageProps> = ({
  favoriteRecipes,
  favorites,
  onSelectRecipe,
  onToggleFavorite,
  onExplore,
}) => {
  const { t } = useLanguage();
  const [search, setSearch] = useState('');

  const filteredFavorites = favoriteRecipes.filter((r) => {
    if (!search.trim()) return true;
    const query = search.toLowerCase().trim();
    return (
      r.title.toLowerCase().includes(query) ||
      (r.titleEn && r.titleEn.toLowerCase().includes(query)) ||
      r.ingredients.some((ing) => ing.name.toLowerCase().includes(query))
    );
  });

  return (
    <div className="space-y-8 pb-16">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <button
            onClick={onExplore}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-900 mb-3 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t.backToCatalog}</span>
          </button>
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-rose-50 text-rose-500 border border-rose-200/80 shadow-xs">
              <Heart className="w-7 h-7 fill-current" />
            </div>
            <div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
                {t.favTitle}
              </h1>
              <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
                {t.favSubtitle} ({favoriteRecipes.length})
              </p>
            </div>
          </div>
        </div>

        {/* Filter inside favorites if there are any */}
        {favoriteRecipes.length > 0 && (
          <div className="relative min-w-[240px] sm:min-w-[280px]">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher dans mes favoris..."
              className="w-full pl-9 pr-8 py-2.5 text-xs sm:text-sm rounded-xl bg-white border border-stone-200/90 focus:outline-hidden focus:border-amber-500 shadow-2xs transition-colors"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-0.5"
                aria-label="Effacer la recherche"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Grid or Empty State */}
      {filteredFavorites.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
          {filteredFavorites.map((recipe) => (
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
        <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 max-w-md mx-auto shadow-xs my-8">
          <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-4 shadow-2xs">
            <Heart className="w-8 h-8" />
          </div>
          <h3 className="font-serif text-xl font-bold text-stone-900 mb-2">
            {t.favEmptyTitle}
          </h3>
          <p className="text-sm text-stone-500 mb-6 leading-relaxed">
            {t.favEmptyDesc}
          </p>
          <button
            onClick={onExplore}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white text-sm font-semibold transition-all shadow-md shadow-amber-600/20 cursor-pointer active:scale-95"
          >
            {t.favExploreBtn}
          </button>
        </div>
      )}

    </div>
  );
};
