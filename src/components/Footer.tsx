import React from 'react';
import { ChefHat, RefreshCw, Heart, BookOpen, Compass, PlusCircle } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { ViewMode } from '../types';

interface FooterProps {
  onNavigate: (view: ViewMode) => void;
  onRequestResetData: () => void;
  onOpenStageInfo: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigate,
  onRequestResetData,
  onOpenStageInfo,
}) => {
  const { t } = useLanguage();

  return (
    <footer className="bg-stone-900 text-stone-300 mt-20 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">

          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white shadow-md shadow-amber-600/20">
                <ChefHat className="w-5 h-5" />
              </div>
              <span className="font-serif text-2xl font-bold tracking-tight text-white">
                {t.appName}
              </span>
            </div>
            <p className="text-sm text-stone-400 max-w-md leading-relaxed">
              {t.footerDesc}
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-800/90 border border-stone-700/60 text-xs text-amber-400 font-medium">
              <ChefHat className="w-3.5 h-3.5 text-amber-400" />
              <span>{t.footerTechStack}</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-4">
              {t.footerQuickLinks}
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="hover:text-amber-400 transition-colors text-left cursor-pointer flex items-center gap-2.5"
                >
                  <Compass className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>{t.navDiscover}</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('favorites')}
                  className="hover:text-amber-400 transition-colors text-left cursor-pointer flex items-center gap-2.5"
                >
                  <Heart className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{t.navFavorites}</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('create')}
                  className="hover:text-amber-400 transition-colors text-left cursor-pointer flex items-center gap-2.5"
                >
                  <PlusCircle className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>{t.navCreate}</span>
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenStageInfo}
                  className="hover:text-amber-400 transition-colors text-left cursor-pointer flex items-center gap-2.5"
                >
                  <BookOpen className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>{t.stageInfoTitle}</span>
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-4">
              Mon Carnet
            </h4>
            <p className="text-xs text-stone-400 mb-4 leading-relaxed">
              Vos recettes personnalisées sont conservées dans votre carnet. Vous pouvez rétablir la sélection initiale de référence à tout moment.
            </p>
            <button
              onClick={onRequestResetData}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-stone-800 hover:bg-stone-750 text-stone-200 border border-stone-700 hover:border-amber-500/50 transition-all cursor-pointer shadow-xs active:scale-95"
            >
              <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
              <span>{t.footerResetDemo}</span>
            </button>
          </div>

        </div>

        <div className="mt-12 pt-8 border-t border-stone-800/80 flex items-center justify-between text-xs text-stone-500">
          <p>{t.footerCopyright}</p>
        </div>
      </div>
    </footer>
  );
};
