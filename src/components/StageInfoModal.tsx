import React from 'react';
import { X, ChefHat, Scale, CheckCircle2, Heart, BookOpen, UtensilsCrossed } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

interface StageInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StageInfoModal: React.FC<StageInfoModalProps> = ({ isOpen, onClose }) => {
  const { language, t } = useLanguage();

  if (!isOpen) return null;

  const isFr = language === 'fr';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200/90 max-h-[90vh] overflow-hidden flex flex-col"
        role="dialog"
        aria-modal="true"
      >

        <div className="flex items-start justify-between gap-4 pb-5 border-b border-stone-100 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-white flex items-center justify-center shadow-md shadow-amber-600/25">
              <ChefHat className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200/60 mb-1">
                <ChefHat className="w-3 h-3 text-amber-600" />
                <span>{t.appName}</span>
              </div>
              <h2 className="font-serif text-2xl font-bold text-stone-900">
                {t.aboutModalTitle}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-6 space-y-6 overflow-y-auto modal-scrollbar flex-1 pr-1">
          <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
            {t.aboutModalIntro}
          </p>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-stone-50/80 border border-stone-200/80 hover:border-amber-200 transition-colors">
              <div className="flex items-center gap-2.5 font-semibold text-stone-900 text-sm mb-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                  <Scale className="w-4 h-4" />
                </div>
                <span>{isFr ? 'Portions Intelligentes' : 'Dynamic Portion Scaling'}</span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                {isFr 
                  ? 'Ajustez en un clic le nombre de convives : tous les dosages d’ingrédients se recalculent instantanément avec une précision au gramme près.'
                  : 'Adjust guest count in one tap: all ingredient quantities instantly recalculate with gram-level precision.'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50/80 border border-stone-200/80 hover:border-amber-200 transition-colors">
              <div className="flex items-center gap-2.5 font-semibold text-stone-900 text-sm mb-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <span>{isFr ? 'Cadence & Checklist Interactive' : 'Step-by-Step Cooking Checklist'}</span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                {isFr 
                  ? 'Suivez vos étapes et cochez vos ingrédients pesés pour garder une parfaite fluidité sans jamais perdre le fil en cuisine.'
                  : 'Track your cooking pace: check prepared ingredients and completed steps to cook smoothly without losing rhythm.'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50/80 border border-stone-200/80 hover:border-amber-200 transition-colors">
              <div className="flex items-center gap-2.5 font-semibold text-stone-900 text-sm mb-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                  <BookOpen className="w-4 h-4" />
                </div>
                <span>{isFr ? 'Carnet de Recettes Dédié' : 'Personal Recipe Journal'}</span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                {isFr 
                  ? 'Enrichissez votre carnet avec vos propres secrets culinaires, photos locales, astuces du chef et temps de cuisson précis.'
                  : 'Enrich your culinary repertoire with family favorites, custom photos, chef tips, and exact preparation times.'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50/80 border border-stone-200/80 hover:border-amber-200 transition-colors">
              <div className="flex items-center gap-2.5 font-semibold text-stone-900 text-sm mb-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                  <Heart className="w-4 h-4" />
                </div>
                <span>{isFr ? 'Favoris & Filtrage Précis' : 'Favorites & Smart Filters'}</span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                {isFr 
                  ? 'Mémorisez vos coups de cœur et filtrez vos envies par durée, catégorie, difficulté ou recherche textuelle rapide.'
                  : 'Bookmark your favorite creations and search instantly by preparation time, culinary category, or key ingredient.'}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/70 flex items-center gap-3">
            <UtensilsCrossed className="w-5 h-5 text-amber-700 shrink-0" />
            <p className="text-xs text-amber-900 leading-relaxed">
              {isFr
                ? '« La cuisine est un art qui unit les personnes autour de saveurs authentiques. Prenez plaisir à chaque étape. »'
                : '“Cooking is an art that unites people around authentic flavors. Enjoy every single moment in the kitchen.”'}
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-stone-100 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl font-semibold text-sm bg-stone-900 text-white hover:bg-stone-800 transition-all shadow-md cursor-pointer active:scale-95"
          >
            {isFr ? 'Découvrir les recettes' : 'Explore recipes'}
          </button>
        </div>
      </div>
    </div>
  );
};
