import React from 'react';
import { Recipe } from '../types';
import { Clock, Users, Heart, ChefHat, ArrowRight } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

interface RecipeCardProps {
  recipe: Recipe;
  isFavorite: boolean;
  onSelect: (recipeId: string) => void;
  onToggleFavorite: (recipeId: string, e: React.MouseEvent) => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  isFavorite,
  onSelect,
  onToggleFavorite,
}) => {
  const { t, getCategoryLabel, getDifficultyLabel, getRecipeTitle, getRecipeDescription } = useLanguage();

  const title = getRecipeTitle(recipe);
  const description = getRecipeDescription(recipe);
  const totalTime = recipe.prepTime + recipe.cookTime;

  const difficultyColors = {
    easy: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
    medium: 'bg-amber-50 text-amber-800 border-amber-200/80',
    hard: 'bg-rose-50 text-rose-800 border-rose-200/80',
  };

  return (
    <article 
      onClick={() => onSelect(recipe.id)}
      className="group bg-white rounded-3xl overflow-hidden border border-stone-200/80 shadow-xs hover:shadow-xl hover:border-amber-300/80 transition-all duration-300 flex flex-col cursor-pointer transform hover:-translate-y-1.5 focus-within:ring-2 focus-within:ring-amber-500/50"
    >
      {/* Image Container */}
      <div className="relative aspect-4/3 overflow-hidden bg-stone-100">
        <img
          src={recipe.imageUrl || 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=800&q=80'}
          alt={title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-500 ease-out"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=800&q=80';
          }}
        />

        {/* Subtle shadow gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-black/25 pointer-events-none" />

        {/* Top bar on image: Category badge & Favorite button */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-auto">
          <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-white/95 text-stone-900 backdrop-blur-md shadow-xs border border-white/40">
            {getCategoryLabel(recipe.category)}
          </span>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(recipe.id, e);
            }}
            className={`p-2.5 rounded-full backdrop-blur-md transition-all duration-200 shadow-md cursor-pointer active:scale-90 ${
              isFavorite
                ? 'bg-rose-500 text-white scale-105 shadow-rose-500/30 ring-2 ring-white/80'
                : 'bg-white/90 text-stone-700 hover:bg-white hover:text-rose-500 hover:scale-105'
            }`}
            aria-label={isFavorite ? t.removeFromFav : t.addToFav}
            title={isFavorite ? t.removeFromFav : t.addToFav}
          >
            <Heart className={`w-4 h-4 transition-transform ${isFavorite ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Custom Recipe Badge if user created */}
        {recipe.isCustom && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 pointer-events-none">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-600/90 backdrop-blur-xs text-white shadow-sm border border-amber-400/30">
              <ChefHat className="w-3 h-3" />
              <span>{t.customRecipeBadge}</span>
            </span>
          </div>
        )}

        {/* Bottom bar on image: Quick metrics */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs font-semibold">
          <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>{totalTime} {t.min}</span>
          </div>

          <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
            <Users className="w-3.5 h-3.5 text-amber-400" />
            <span>{recipe.servings} {t.servings.toLowerCase()}</span>
          </div>
        </div>
      </div>

      {/* Content Container */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold border ${difficultyColors[recipe.difficulty]}`}>
              {getDifficultyLabel(recipe.difficulty)}
            </span>
            <span className="text-xs text-stone-500 font-medium">
              {recipe.ingredients.length} {t.ingredients.toLowerCase()}
            </span>
          </div>

          <h3 className="font-serif text-lg font-bold text-stone-900 group-hover:text-amber-800 transition-colors line-clamp-1 mb-2">
            {title}
          </h3>

          <p className="text-stone-600 text-xs sm:text-sm line-clamp-2 leading-relaxed mb-4">
            {description}
          </p>
        </div>

        {/* Card Footer */}
        <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-semibold text-stone-500">
          <div className="flex items-center gap-1.5 text-stone-400">
            <ChefHat className="w-3.5 h-3.5 text-amber-600" />
            <span>{recipe.steps.length} {t.steps.toLowerCase()}</span>
          </div>

          <span className="text-amber-700 font-bold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
            <span>{t.viewRecipe}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </article>
  );
};
