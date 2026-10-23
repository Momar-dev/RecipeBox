import React, { useState } from 'react';
import { Recipe } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { calculateScaledQuantity } from '../services/recipeService';
import { 
  ArrowLeft, 
  Heart, 
  Edit3, 
  Trash2, 
  Share2, 
  Printer, 
  Clock, 
  Users, 
  Check, 
  ChefHat, 
  Plus, 
  Minus, 
  RotateCcw,
  Utensils,
  Lightbulb
} from 'lucide-react';

interface RecipeDetailPageProps {
  recipe: Recipe;
  isFavorite: boolean;
  onBack: () => void;
  onEdit: (recipeId: string) => void;
  onRequestDelete: (recipeId: string) => void;
  onToggleFavorite: (recipeId: string, e: React.MouseEvent) => void;
  onShare: () => void;
}

export const RecipeDetailPage: React.FC<RecipeDetailPageProps> = ({
  recipe,
  isFavorite,
  onBack,
  onEdit,
  onRequestDelete,
  onToggleFavorite,
  onShare,
}) => {
  const { 
    t, 
    getCategoryLabel, 
    getDifficultyLabel, 
    getRecipeTitle, 
    getRecipeDescription,
    getRecipeChefNote,
    getIngredientName,
    getIngredientUnit,
    getStepInstruction,
    getStepTip
  } = useLanguage();
  const { user } = useAuth();

  const isAuthor = Boolean(user && recipe.authorId && user.id === recipe.authorId);

  const [currentServings, setCurrentServings] = useState<number>(recipe.servings);
  const [checkedIngredients, setCheckedIngredients] = useState<Record<string, boolean>>({});
  const [checkedSteps, setCheckedSteps] = useState<Record<string, boolean>>({});

  const title = getRecipeTitle(recipe);
  const description = getRecipeDescription(recipe);
  const chefNote = getRecipeChefNote(recipe);
  const totalTime = recipe.prepTime + recipe.cookTime;

  const difficultyColors = {
    easy: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    medium: 'bg-amber-50 text-amber-800 border-amber-300',
    hard: 'bg-rose-50 text-rose-800 border-rose-300',
  };

  const handleToggleIngredient = (id: string) => {
    setCheckedIngredients((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleToggleStep = (id: string) => {
    setCheckedSteps((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const checkedIngredientsCount = Object.values(checkedIngredients).filter(Boolean).length;
  const totalIngredientsCount = recipe.ingredients.length;
  const ingredientsPercentage = Math.round((checkedIngredientsCount / (totalIngredientsCount || 1)) * 100);

  const checkedStepsCount = Object.values(checkedSteps).filter(Boolean).length;
  const totalStepsCount = recipe.steps.length;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20 print-page">

      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 no-print">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-stone-700 bg-white hover:bg-stone-100 border border-stone-200/90 shadow-xs text-sm font-semibold transition-all cursor-pointer active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 text-stone-500" />
          <span>{t.backToCatalog}</span>
        </button>

        <div className="flex items-center gap-2 flex-wrap">

          <button
            onClick={onShare}
            className="p-2.5 rounded-xl bg-white hover:bg-stone-100 border border-stone-200/90 text-stone-700 transition-all shadow-xs cursor-pointer active:scale-95"
            title={t.shareRecipe}
            aria-label={t.shareRecipe}
          >
            <Share2 className="w-4 h-4" />
          </button>

          <button
            onClick={handlePrint}
            className="p-2.5 rounded-xl bg-white hover:bg-stone-100 border border-stone-200/90 text-stone-700 transition-all shadow-xs cursor-pointer active:scale-95"
            title={t.printRecipe}
            aria-label={t.printRecipe}
          >
            <Printer className="w-4 h-4" />
          </button>

          <button
            onClick={(e) => onToggleFavorite(recipe.id, e)}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-sm font-semibold transition-all shadow-xs cursor-pointer active:scale-95 ${
              isFavorite
                ? 'bg-rose-50 border-rose-300 text-rose-600 shadow-rose-500/10'
                : 'bg-white border-stone-200/90 text-stone-700 hover:text-rose-600'
            }`}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current text-rose-600' : ''}`} />
            <span className="hidden sm:inline">
              {isFavorite ? t.removeFromFav : t.addToFav}
            </span>
          </button>

          {isAuthor && (
            <button
              onClick={() => onEdit(recipe.id)}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-sm font-semibold transition-all cursor-pointer active:scale-95"
            >
              <Edit3 className="w-4 h-4 text-amber-700" />
              <span className="hidden sm:inline">{t.editRecipe}</span>
            </button>
          )}

          {isAuthor && (
            <button
              onClick={() => onRequestDelete(recipe.id)}
              className="p-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 transition-all cursor-pointer active:scale-95"
              title={t.deleteRecipe}
              aria-label={t.deleteRecipe}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-3xl overflow-hidden border border-stone-200/90 shadow-xl">
        <div className="relative aspect-16/9 sm:aspect-21/9 max-h-[460px] overflow-hidden bg-stone-100">
          <img
            src={recipe.imageUrl || 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=1400&q=80'}
            alt={title}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=1400&q=80';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />

          <div className="absolute top-4 left-4 flex flex-wrap gap-2">
            <span className="px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/95 text-stone-900 shadow-md backdrop-blur-md">
              {getCategoryLabel(recipe.category)}
            </span>
            {recipe.isCustom && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-600/95 backdrop-blur-xs text-white shadow-md">
                <ChefHat className="w-3.5 h-3.5" />
                <span>{t.customRecipeBadge}</span>
              </span>
            )}
            {recipe.isPublic === false && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-600/95 backdrop-blur-xs text-white shadow-md">
                <span>{t.recipePrivateBadge}</span>
              </span>
            )}
          </div>

          <div className="absolute bottom-6 left-6 right-6 text-white">
            <h1 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white drop-shadow-md mb-2">
              {title}
            </h1>
            <p className="text-sm sm:text-base text-stone-200 line-clamp-2 max-w-3xl drop-shadow-xs mb-1">
              {description}
            </p>
            {recipe.author && (
              <p className="text-xs text-amber-200 font-semibold drop-shadow-xs">
                {t.recipeAuthorBy} Chef {recipe.author.name || recipe.author.email.split('@')[0]}
              </p>
            )}
          </div>
        </div>

        <div className="p-5 sm:p-6 bg-stone-50/80 border-t border-stone-200 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white border border-stone-200 text-amber-600 shadow-xs">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                {t.prepTime}
              </p>
              <p className="text-base font-bold text-stone-900">
                {recipe.prepTime} {t.min}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white border border-stone-200 text-amber-600 shadow-xs">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                {t.cookTime}
              </p>
              <p className="text-base font-bold text-stone-900">
                {recipe.cookTime} {t.min}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white border border-stone-200 text-amber-600 shadow-xs">
              <ChefHat className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                {t.totalTime}
              </p>
              <p className="text-base font-bold text-stone-900">
                {totalTime} {t.min}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white border border-stone-200 text-amber-600 shadow-xs">
              <ChefHat className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                {t.filterDifficulty}
              </p>
              <span className={`inline-block px-2.5 py-0.5 rounded-md text-xs font-bold border ${difficultyColors[recipe.difficulty]}`}>
                {getDifficultyLabel(recipe.difficulty)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200/80 flex items-start gap-3 text-amber-900 text-xs sm:text-sm shadow-2xs">
        <Lightbulb className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="font-semibold">{t.demoNotice} :</strong> {t.demoNoticeText}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        <div className="lg:col-span-5 bg-white p-6 sm:p-7 rounded-3xl border border-stone-200/90 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-stone-100">
            <div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900">
                {t.ingredients}
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                {t.ingredientsProgress(checkedIngredientsCount, totalIngredientsCount)}
              </p>
            </div>

            <div className="flex items-center gap-1.5 bg-stone-100 p-1.5 rounded-2xl border border-stone-200 shadow-2xs">
              <button
                type="button"
                onClick={() => setCurrentServings((s) => Math.max(1, s - 1))}
                className="w-8 h-8 rounded-xl bg-white hover:bg-stone-200 text-stone-800 flex items-center justify-center font-bold text-xs shadow-xs transition-colors cursor-pointer active:scale-95"
                title="Diminuer les portions"
                aria-label="Diminuer les portions"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>

              <span className="px-2 text-xs font-bold text-stone-900 min-w-[55px] text-center">
                {currentServings} {t.servings.toLowerCase()}
              </span>

              <button
                type="button"
                onClick={() => setCurrentServings((s) => s + 1)}
                className="w-8 h-8 rounded-xl bg-white hover:bg-stone-200 text-stone-800 flex items-center justify-center font-bold text-xs shadow-xs transition-colors cursor-pointer active:scale-95"
                title="Augmenter les portions"
                aria-label="Augmenter les portions"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>

              {currentServings !== recipe.servings && (
                <button
                  type="button"
                  onClick={() => setCurrentServings(recipe.servings)}
                  className="w-8 h-8 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-800 flex items-center justify-center transition-colors cursor-pointer ml-1 active:scale-95"
                  title={t.resetServings}
                  aria-label={t.resetServings}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-amber-500 to-amber-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${ingredientsPercentage}%` }}
            />
          </div>

          <ul className="space-y-2.5">
            {recipe.ingredients.map((ingredient) => {
              const isChecked = Boolean(checkedIngredients[ingredient.id]);
              const scaledQty = calculateScaledQuantity(ingredient.quantity, recipe.servings, currentServings);
              const ingName = getIngredientName(ingredient);
              const ingUnit = getIngredientUnit(ingredient);

              return (
                <li
                  key={ingredient.id}
                  onClick={() => handleToggleIngredient(ingredient.id)}
                  className={`flex items-start gap-3 p-3.5 rounded-2xl transition-all cursor-pointer border ${
                    isChecked
                      ? 'bg-stone-50 border-stone-200/60 text-stone-400 line-through'
                      : 'bg-stone-50/60 hover:bg-amber-50/50 border-stone-200/90 text-stone-800 hover:border-amber-200'
                  }`}
                >
                  <div
                    className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center transition-colors shrink-0 ${
                      isChecked
                        ? 'bg-amber-600 border-amber-600 text-white'
                        : 'bg-white border-stone-300'
                    }`}
                  >
                    {isChecked && <Check className="w-3.5 h-3.5" />}
                  </div>

                  <div className="flex-1 flex items-baseline justify-between gap-2 text-sm">
                    <span className="font-medium">{ingName}</span>
                    {(scaledQty !== null || ingUnit) && (
                      <span className={`font-semibold shrink-0 ${isChecked ? 'text-stone-400' : 'text-amber-800'}`}>
                        {scaledQty !== null ? scaledQty : ''} {ingUnit}
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="p-3.5 rounded-2xl bg-stone-50 text-xs text-stone-500 leading-relaxed border border-stone-200/70">
            {t.nutritionNotice}
          </div>
        </div>

        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-stone-200/90 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900">
                {t.steps}
              </h2>
              <span className="text-xs font-semibold text-stone-500">
                {t.stepsProgress(checkedStepsCount, totalStepsCount)}
              </span>
            </div>

            <ol className="space-y-5">
              {recipe.steps.map((step, idx) => {
                const isStepDone = Boolean(checkedSteps[step.id]);
                const instruction = getStepInstruction(step);
                const tip = getStepTip(step);

                return (
                  <li
                    key={step.id}
                    className={`p-4 sm:p-5 rounded-2xl transition-all border ${
                      isStepDone
                        ? 'bg-emerald-50/40 border-emerald-200/70'
                        : 'bg-stone-50/50 border-stone-200/90 hover:border-amber-200'
                    }`}
                  >
                    <div className="flex items-start gap-4">

                      <button
                        type="button"
                        onClick={() => handleToggleStep(step.id)}
                        className={`w-9 h-9 rounded-xl font-bold text-sm flex items-center justify-center shrink-0 transition-colors cursor-pointer active:scale-95 ${
                          isStepDone
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-stone-900 text-white hover:bg-stone-800'
                        }`}
                        title="Marquer comme terminée"
                        aria-label={`Étape ${idx + 1}`}
                      >
                        {isStepDone ? <Check className="w-4 h-4" /> : idx + 1}
                      </button>

                      <div className="flex-1 space-y-2.5">
                        <p className={`text-sm sm:text-base leading-relaxed ${
                          isStepDone ? 'text-stone-500' : 'text-stone-800'
                        }`}>
                          {instruction}
                        </p>

                        {tip && (
                          <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/70 text-xs text-amber-900 flex items-start gap-2.5 shadow-2xs">
                            <ChefHat className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                            <span><strong>{t.tipLabel} :</strong> {tip}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>

          {chefNote && (
            <div className="p-6 rounded-3xl bg-linear-to-br from-amber-50 to-orange-50/60 border border-amber-200/80 shadow-xs">
              <div className="flex items-center gap-2.5 text-amber-900 font-bold text-sm mb-2">
                <ChefHat className="w-5 h-5 text-amber-700" />
                <span>{t.chefTip}</span>
              </div>
              <p className="text-sm text-stone-700 italic leading-relaxed">
                « {chefNote} »
              </p>
            </div>
          )}

          {recipe.tags && recipe.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="text-xs font-semibold text-stone-400">
                {t.tags} :
              </span>
              {recipe.tags.map((tag, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-full text-xs font-medium bg-stone-100 text-stone-600 border border-stone-200/70"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
