import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, Category, Difficulty, Recipe } from '../types';
import { translations } from './translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (typeof translations)['fr'] | (typeof translations)['en'];
  getCategoryLabel: (category: Category) => string;
  getDifficultyLabel: (diff: Difficulty) => string;
  getRecipeTitle: (recipe: Recipe) => string;
  getRecipeDescription: (recipe: Recipe) => string;
  getRecipeChefNote: (recipe: Recipe) => string | undefined;
  getIngredientName: (ing: { name: string; nameEn?: string }) => string;
  getIngredientUnit: (ing: { unit: string; unitEn?: string }) => string;
  getStepInstruction: (step: { instruction: string; instructionEn?: string }) => string;
  getStepTip: (step: { tip?: string; tipEn?: string }) => string | undefined;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = 'recipebox_preferred_lang';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (saved === 'fr' || saved === 'en') return saved;
      // Default to French as requested in French instructions, or browser language if available
      return navigator.language.startsWith('fr') ? 'fr' : 'fr';
    } catch {
      return 'fr';
    }
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    } catch {
      // ignore in restricted env
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'fr' ? 'en' : 'fr');
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = translations[language];

  const getCategoryLabel = (category: Category): string => {
    switch (category) {
      case 'all': return t.catAll;
      case 'starter': return t.catStarter;
      case 'main': return t.catMain;
      case 'dessert': return t.catDessert;
      case 'breakfast': return t.catBreakfast;
      case 'vegetarian': return t.catVegetarian;
      case 'baking': return t.catBaking;
      default: return category;
    }
  };

  const getDifficultyLabel = (diff: Difficulty): string => {
    switch (diff) {
      case 'easy': return t.diffEasy;
      case 'medium': return t.diffMedium;
      case 'hard': return t.diffHard;
      default: return diff;
    }
  };

  const getRecipeTitle = (recipe: Recipe): string => {
    if (language === 'en' && recipe.titleEn?.trim()) {
      return recipe.titleEn;
    }
    return recipe.title;
  };

  const getRecipeDescription = (recipe: Recipe): string => {
    if (language === 'en' && recipe.descriptionEn?.trim()) {
      return recipe.descriptionEn;
    }
    return recipe.description;
  };

  const getRecipeChefNote = (recipe: Recipe): string | undefined => {
    if (language === 'en' && recipe.chefNoteEn?.trim()) {
      return recipe.chefNoteEn;
    }
    return recipe.chefNote;
  };

  const getIngredientName = (ing: { name: string; nameEn?: string }): string => {
    if (language === 'en' && ing.nameEn?.trim()) {
      return ing.nameEn;
    }
    return ing.name;
  };

  const getIngredientUnit = (ing: { unit: string; unitEn?: string }): string => {
    if (language === 'en' && ing.unitEn?.trim()) {
      return ing.unitEn;
    }
    return ing.unit;
  };

  const getStepInstruction = (step: { instruction: string; instructionEn?: string }): string => {
    if (language === 'en' && step.instructionEn?.trim()) {
      return step.instructionEn;
    }
    return step.instruction;
  };

  const getStepTip = (step: { tip?: string; tipEn?: string }): string | undefined => {
    if (language === 'en' && step.tipEn?.trim()) {
      return step.tipEn;
    }
    return step.tip;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        t,
        getCategoryLabel,
        getDifficultyLabel,
        getRecipeTitle,
        getRecipeDescription,
        getRecipeChefNote,
        getIngredientName,
        getIngredientUnit,
        getStepInstruction,
        getStepTip,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
