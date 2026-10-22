import React from 'react';
import { Category, Recipe } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { 
  Utensils, 
  Salad, 
  Beef, 
  CakeSlice, 
  Coffee, 
  Leaf, 
  Croissant 
} from 'lucide-react';

interface CategoryFilterProps {
  selectedCategory: Category;
  onSelectCategory: (category: Category) => void;
  recipes: Recipe[];
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onSelectCategory,
  recipes = [],
}) => {
  const { getCategoryLabel } = useLanguage();

  const categories: { key: Category; icon: React.ElementType }[] = [
    { key: 'all', icon: Utensils },
    { key: 'starter', icon: Salad },
    { key: 'main', icon: Beef },
    { key: 'dessert', icon: CakeSlice },
    { key: 'breakfast', icon: Coffee },
    { key: 'vegetarian', icon: Leaf },
    { key: 'baking', icon: Croissant },
  ];

  const getCount = (cat: Category): number => {
    const list = recipes || [];
    if (cat === 'all') return list.length;
    return list.filter((r) => r.category === cat).length;
  };

  return (
    <div className="w-full overflow-x-auto no-scrollbar py-1 -mx-1 px-1">
      <div className="flex items-center gap-2 min-w-max pb-1">
        {categories.map(({ key, icon: Icon }) => {
          const isSelected = selectedCategory === key;
          const count = getCount(key);

          return (
            <button
              key={key}
              onClick={() => onSelectCategory(key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs md:text-sm font-semibold transition-all duration-200 cursor-pointer active:scale-95 ${
                isSelected
                  ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-md shadow-amber-600/25 scale-[1.02]'
                  : 'bg-white text-stone-700 hover:bg-stone-100/90 border border-stone-200/90 hover:border-stone-300 shadow-2xs'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-white' : 'text-amber-600'}`} />
              <span className="whitespace-nowrap">{getCategoryLabel(key)}</span>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  isSelected ? 'bg-amber-800/60 text-amber-50' : 'bg-stone-100 text-stone-600'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
