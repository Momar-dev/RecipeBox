import React, { useState } from 'react';
import { Recipe, Category, Difficulty, Ingredient, RecipeStep } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { recipeService } from '../services/recipeService';
import { 
  ArrowLeft, 
  Upload, 
  Link as LinkIcon, 
  Plus, 
  Trash2, 
  AlertCircle, 
  Image as ImageIcon,
  CheckCircle2,
  MoveUp,
  MoveDown,
  ChefHat
} from 'lucide-react';

interface RecipeFormPageProps {
  initialRecipe?: Recipe | null;
  onSave: (recipeData: Omit<Recipe, 'id' | 'createdAt'>, existingId?: string) => Promise<void>;
  onCancel: () => void;
}

const PRESET_CULINARY_IMAGES = [
  { label: 'Plat mijoté', url: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=1000&q=80' },
  { label: 'Pâtes fraîches', url: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281691?auto=format&fit=crop&w=1000&q=80' },
  { label: 'Salade croquante', url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1000&q=80' },
  { label: 'Dessert gourmand', url: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=1000&q=80' },
];

export const RecipeFormPage: React.FC<RecipeFormPageProps> = ({
  initialRecipe,
  onSave,
  onCancel,
}) => {
  const { t, getCategoryLabel } = useLanguage();
  const isEditing = Boolean(initialRecipe);

  const [title, setTitle] = useState(initialRecipe?.title || '');
  const [titleEn, setTitleEn] = useState(initialRecipe?.titleEn || '');
  const [description, setDescription] = useState(initialRecipe?.description || '');
  const [descriptionEn, setDescriptionEn] = useState(initialRecipe?.descriptionEn || '');
  const [category, setCategory] = useState<Exclude<Category, 'all'>>(initialRecipe?.category || 'main');
  const [difficulty, setDifficulty] = useState<Difficulty>(initialRecipe?.difficulty || 'easy');
  const [prepTime, setPrepTime] = useState<number>(initialRecipe?.prepTime || 20);
  const [cookTime, setCookTime] = useState<number>(initialRecipe?.cookTime || 30);
  const [servings, setServings] = useState<number>(initialRecipe?.servings || 4);
  const [imageUrl, setImageUrl] = useState<string>(initialRecipe?.imageUrl || PRESET_CULINARY_IMAGES[0].url);
  const [chefNote, setChefNote] = useState<string>(initialRecipe?.chefNote || '');
  const [chefNoteEn, setChefNoteEn] = useState<string>(initialRecipe?.chefNoteEn || '');
  const [tagsInput, setTagsInput] = useState<string>(initialRecipe?.tags?.join(', ') || '');
  const [isPublic, setIsPublic] = useState<boolean>(initialRecipe?.isPublic !== undefined ? initialRecipe.isPublic : true);

  const { token, isAuthenticated } = useAuth();
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadNotice, setUploadNotice] = useState<{ message: string; type: 'info' | 'warning' | 'success' } | null>(null);

  const [ingredients, setIngredients] = useState<Ingredient[]>(() => {
    if (initialRecipe && initialRecipe.ingredients.length > 0) {
      return initialRecipe.ingredients;
    }
    return [
      { id: 'ing-1', name: '', quantity: 200, unit: 'g' },
      { id: 'ing-2', name: '', quantity: 2, unit: 'c. à soupe' },
    ];
  });

  const [steps, setSteps] = useState<RecipeStep[]>(() => {
    if (initialRecipe && initialRecipe.steps.length > 0) {
      return initialRecipe.steps;
    }
    return [
      { id: 'step-1', stepNumber: 1, instruction: '', tip: '' },
      { id: 'step-2', stepNumber: 2, instruction: '', tip: '' },
    ];
  });

  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageInputMode, setImageInputMode] = useState<'url' | 'upload'>('url');
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadNotice(null);

    if (file.size > 5 * 1024 * 1024) {
      setUploadNotice({ message: t.uploadFileTooLarge, type: 'warning' });
      return;
    }

    const validMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validMimes.includes(file.type.toLowerCase())) {
      setUploadNotice({ message: t.uploadFileBadFormat, type: 'warning' });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setLocalPreviewUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);

    if (isAuthenticated && token) {
      try {
        setIsUploadingImage(true);
        const res = await recipeService.uploadRecipeImage(file, token);

        setImageUrl(res.secure_url);
        setUploadNotice({ message: t.uploadSuccess, type: 'success' });
      } catch (err: any) {
        if (err?.code === 'CLOUDINARY_NOT_CONFIGURED') {
          setUploadNotice({ message: t.uploadCloudinaryNotice, type: 'info' });
        } else {
          setUploadNotice({
            message: err?.message || 'Erreur lors du téléversement vers Cloudinary.',
            type: 'warning',
          });
        }
      } finally {
        setIsUploadingImage(false);
      }
    } else {
      setUploadNotice({
        message: 'Connectez-vous pour téléverser directement sur Cloudinary.',
        type: 'info',
      });
    }
  };

  const handleAddIngredient = () => {
    setIngredients([
      ...ingredients,
      { id: `ing-${Date.now()}`, name: '', quantity: null, unit: '' },
    ]);
  };

  const handleRemoveIngredient = (id: string) => {
    if (ingredients.length <= 1) return;
    setIngredients(ingredients.filter((i) => i.id !== id));
  };

  const handleUpdateIngredient = (id: string, updates: Partial<Ingredient>) => {
    setIngredients(
      ingredients.map((i) => (i.id === id ? { ...i, ...updates } : i))
    );
  };

  const handleAddStep = () => {
    setSteps([
      ...steps,
      {
        id: `step-${Date.now()}`,
        stepNumber: steps.length + 1,
        instruction: '',
        tip: '',
      },
    ]);
  };

  const handleRemoveStep = (id: string) => {
    if (steps.length <= 1) return;
    const filtered = steps.filter((s) => s.id !== id);
    setSteps(
      filtered.map((s, idx) => ({
        ...s,
        stepNumber: idx + 1,
      }))
    );
  };

  const handleUpdateStep = (id: string, updates: Partial<RecipeStep>) => {
    setSteps(
      steps.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  };

  const handleMoveStep = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= steps.length) return;
    const reordered = [...steps];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);
    setSteps(
      reordered.map((s, idx) => ({
        ...s,
        stepNumber: idx + 1,
      }))
    );
  };

  const validateForm = (): boolean => {
    const errs: string[] = [];

    if (!title.trim() || title.trim().length < 3) {
      errs.push(t.errTitleRequired);
    }

    if (!description.trim() || description.trim().length < 10) {
      errs.push(t.errDescRequired);
    }

    if (isNaN(prepTime) || prepTime <= 0) {
      errs.push(t.errPrepTime);
    }

    if (isNaN(cookTime) || cookTime < 0) {
      errs.push(t.errCookTime);
    }

    if (isNaN(servings) || servings < 1) {
      errs.push(t.errServings);
    }

    const validIngredients = ingredients.filter((i) => i.name.trim().length > 0);
    if (validIngredients.length === 0) {
      errs.push(t.errIngredientsMin);
    }

    const validSteps = steps.filter((s) => s.instruction.trim().length > 0);
    if (validSteps.length === 0) {
      errs.push(t.errStepsMin);
    }

    setErrors(errs);
    return errs.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    try {
      setIsSubmitting(true);

      const parsedTags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      const cleanedIngredients = ingredients.filter((i) => i.name.trim().length > 0);
      const cleanedSteps = steps
        .filter((s) => s.instruction.trim().length > 0)
        .map((s, idx) => ({ ...s, stepNumber: idx + 1 }));

      const recipeData: Omit<Recipe, 'id' | 'createdAt'> = {
        title: title.trim(),
        titleEn: titleEn.trim() || undefined,
        description: description.trim(),
        descriptionEn: descriptionEn.trim() || undefined,
        category,
        difficulty,
        prepTime: Number(prepTime),
        cookTime: Number(cookTime),
        servings: Number(servings),
        imageUrl: imageUrl.trim() || PRESET_CULINARY_IMAGES[0].url,
        ingredients: cleanedIngredients,
        steps: cleanedSteps,
        tags: parsedTags,
        tagsEn: parsedTags,
        chefNote: chefNote.trim() || undefined,
        chefNoteEn: chefNoteEn.trim() || undefined,
        isCustom: true,
        isPublic,
      };

      await onSave(recipeData, initialRecipe?.id);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">

      <div>
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-stone-600 hover:text-stone-900 bg-white border border-stone-200/90 shadow-xs text-xs font-semibold mb-4 transition-all cursor-pointer active:scale-95"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{t.cancelBtn}</span>
        </button>

        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900">
          {isEditing ? t.editTitle : t.createTitle}
        </h1>
        <p className="text-sm text-stone-500 mt-1">
          {t.formSubtitle}
        </p>
      </div>

      <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/70 text-amber-900 text-xs sm:text-sm flex items-start gap-3 shadow-2xs">
        <ChefHat className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed font-medium">
          {t.localDataDisclaimer}
        </div>
      </div>

      {errors.length > 0 && (
        <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs sm:text-sm animate-in fade-in duration-150">
          <p className="font-bold flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span>{t.formErrorsHeader}</span>
          </p>
          <ul className="list-disc list-inside space-y-1 text-rose-800">
            {errors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">

        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/90 shadow-sm space-y-6">
          <h2 className="font-serif text-xl font-bold text-stone-900 border-b border-stone-100 pb-3">
            {t.formSectionGeneral}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                {t.fieldTitleFr} <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="ex: Poulet sauté aux morilles"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-hidden focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-sm transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                {t.fieldTitleEn}
              </label>
              <input
                type="text"
                value={titleEn}
                onChange={(e) => setTitleEn(e.target.value)}
                placeholder="e.g. Sautéed Chicken with Morels"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-hidden focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-sm transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                {t.fieldDescFr} <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Décrivez la texture, les saveurs et les particularités de cette recette..."
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-hidden focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-sm leading-relaxed transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                {t.fieldDescEn}
              </label>
              <textarea
                rows={3}
                value={descriptionEn}
                onChange={(e) => setDescriptionEn(e.target.value)}
                placeholder="Describe flavors, aromas, and culinary character in English..."
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-hidden focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-sm leading-relaxed transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                {t.fieldCategory} <span className="text-rose-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Exclude<Category, 'all'>)}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-hidden focus:border-amber-500 text-sm bg-white cursor-pointer"
              >
                {(['starter', 'main', 'dessert', 'breakfast', 'vegetarian', 'baking'] as const).map((cat) => (
                  <option key={cat} value={cat}>
                    {getCategoryLabel(cat)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                {t.fieldDifficulty} <span className="text-rose-500">*</span>
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-hidden focus:border-amber-500 text-sm bg-white cursor-pointer"
              >
                <option value="easy">{t.diffEasy}</option>
                <option value="medium">{t.diffMedium}</option>
                <option value="hard">{t.diffHard}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                {t.fieldServings} <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min={1}
                max={50}
                required
                value={servings}
                onChange={(e) => setServings(parseInt(e.target.value) || 1)}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-hidden focus:border-amber-500 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                {t.fieldPrepTime} <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min={1}
                required
                value={prepTime}
                onChange={(e) => setPrepTime(parseInt(e.target.value) || 0)}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-hidden focus:border-amber-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                {t.fieldCookTime} <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min={0}
                required
                value={cookTime}
                onChange={(e) => setCookTime(parseInt(e.target.value) || 0)}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-hidden focus:border-amber-500 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              {t.fieldTags}
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder={t.fieldTagsPlaceholder}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-hidden focus:border-amber-500 text-sm"
            />
          </div>

          <div className="pt-2 border-t border-stone-100">
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
              {t.recipeVisibility}
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <label className={`flex items-center gap-3 p-3 rounded-2xl border text-sm font-semibold cursor-pointer transition-all ${
                isPublic
                  ? 'border-amber-500 bg-amber-50/60 text-amber-900 shadow-2xs'
                  : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
              }`}>
                <input
                  type="radio"
                  name="recipe-visibility"
                  checked={isPublic}
                  onChange={() => setIsPublic(true)}
                  className="accent-amber-600 w-4 h-4 cursor-pointer"
                />
                <div>
                  <span className="block font-bold">{t.recipePublicLabel}</span>
                </div>
              </label>

              <label className={`flex items-center gap-3 p-3 rounded-2xl border text-sm font-semibold cursor-pointer transition-all ${
                !isPublic
                  ? 'border-amber-500 bg-amber-50/60 text-amber-900 shadow-2xs'
                  : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
              }`}>
                <input
                  type="radio"
                  name="recipe-visibility"
                  checked={!isPublic}
                  onChange={() => setIsPublic(false)}
                  className="accent-amber-600 w-4 h-4 cursor-pointer"
                />
                <div>
                  <span className="block font-bold">{t.recipePrivateLabel}</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/90 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
            <h2 className="font-serif text-xl font-bold text-stone-900">
              {t.formSectionPhoto}
            </h2>

            <div className="flex items-center gap-2 bg-stone-100 p-1 rounded-xl text-xs font-semibold self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setImageInputMode('url')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                  imageInputMode === 'url' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <LinkIcon className="w-3.5 h-3.5" />
                <span>{t.imageUrlOption}</span>
              </button>
              <button
                type="button"
                onClick={() => setImageInputMode('upload')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                  imageInputMode === 'upload' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{t.imageFileOption}</span>
              </button>
            </div>
          </div>

          {imageInputMode === 'url' ? (
            <div className="space-y-3">
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-hidden focus:border-amber-500 text-sm"
              />

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-xs text-stone-500 font-medium">Suggestions :</span>
                {PRESET_CULINARY_IMAGES.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setImageUrl(preset.url)}
                    className="text-xs text-amber-800 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 px-3 py-1 rounded-lg border border-amber-200/60 cursor-pointer transition-colors"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-stone-300 rounded-2xl p-6 text-center hover:border-amber-500 transition-colors bg-stone-50/50">
              <input
                type="file"
                id="recipe-file-input"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <label
                htmlFor="recipe-file-input"
                className="cursor-pointer flex flex-col items-center justify-center gap-2"
              >
                <div className="p-3 rounded-2xl bg-amber-100 text-amber-800">
                  <Upload className="w-6 h-6" />
                </div>
                <span className="text-sm font-semibold text-stone-800">
                  {isUploadingImage ? t.uploadingImage : 'Sélectionnez une photographie culinaire depuis votre appareil'}
                </span>
                <span className="text-xs text-stone-400">
                  Formats acceptés : JPEG, PNG, WebP (max 5 Mo)
                </span>
              </label>
            </div>
          )}

          {uploadNotice && (
            <div className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2 ${
              uploadNotice.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : uploadNotice.type === 'warning'
                ? 'bg-amber-50 text-amber-900 border border-amber-200'
                : 'bg-stone-100 text-stone-700 border border-stone-200'
            }`}>
              {uploadNotice.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              )}
              <span>{uploadNotice.message}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
              {t.imagePreview}
            </label>
            <div className="relative aspect-16/9 max-h-64 rounded-2xl overflow-hidden bg-stone-100 border border-stone-200">
              {(localPreviewUrl || imageUrl) ? (
                <>
                  <img
                    src={localPreviewUrl || imageUrl}
                    alt="Aperçu"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=800&q=80';
                    }}
                  />
                  {isUploadingImage && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center text-white gap-2">
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span className="text-xs font-semibold">{t.uploadingImage}</span>
                    </div>
                  )}
                  {imageUrl.startsWith('https://res.cloudinary.com/') && !isUploadingImage && (
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-emerald-600/90 backdrop-blur-xs text-white text-[10px] font-bold shadow-md flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Hébergée sur Cloudinary</span>
                    </div>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-stone-400 gap-2">
                  <ImageIcon className="w-8 h-8" />
                  <span className="text-xs">{t.imagePreviewPlaceholder}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/90 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
            <div>
              <h2 className="font-serif text-xl font-bold text-stone-900">
                {t.formSectionIngredients} <span className="text-rose-500">*</span>
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Dosages de référence pour {servings} {t.servings.toLowerCase()}.
              </p>
            </div>

            <button
              type="button"
              onClick={handleAddIngredient}
              className="px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer self-start sm:self-auto active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t.addIngredientBtn}</span>
            </button>
          </div>

          <div className="space-y-3">
            {ingredients.map((ing, idx) => (
              <div
                key={ing.id}
                className="flex flex-wrap sm:flex-nowrap items-center gap-2 p-2.5 rounded-2xl bg-stone-50/70 border border-stone-200"
              >
                <div className="w-7 text-center font-mono text-xs text-stone-400 font-bold shrink-0">
                  #{idx + 1}
                </div>

                <input
                  type="text"
                  placeholder={t.ingredientName + ' *'}
                  value={ing.name}
                  onChange={(e) => handleUpdateIngredient(ing.id, { name: e.target.value })}
                  className="flex-1 min-w-[160px] px-3.5 py-2 text-xs sm:text-sm rounded-xl bg-white border border-stone-200 focus:outline-hidden focus:border-amber-500"
                />

                <input
                  type="number"
                  step="any"
                  placeholder="Quantité"
                  value={ing.quantity ?? ''}
                  onChange={(e) => handleUpdateIngredient(ing.id, { quantity: e.target.value ? parseFloat(e.target.value) : null })}
                  className="w-24 px-3.5 py-2 text-xs sm:text-sm rounded-xl bg-white border border-stone-200 focus:outline-hidden focus:border-amber-500"
                />

                <input
                  type="text"
                  placeholder="Unité (g, ml...)"
                  value={ing.unit}
                  onChange={(e) => handleUpdateIngredient(ing.id, { unit: e.target.value })}
                  className="w-28 px-3.5 py-2 text-xs sm:text-sm rounded-xl bg-white border border-stone-200 focus:outline-hidden focus:border-amber-500"
                />

                <button
                  type="button"
                  onClick={() => handleRemoveIngredient(ing.id)}
                  disabled={ingredients.length <= 1}
                  className={`p-2 rounded-xl transition-colors shrink-0 ml-auto sm:ml-0 ${
                    ingredients.length <= 1
                      ? 'text-stone-300 cursor-not-allowed'
                      : 'text-stone-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer'
                  }`}
                  aria-label="Supprimer l'ingrédient"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/90 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
            <div>
              <h2 className="font-serif text-xl font-bold text-stone-900">
                {t.formSectionSteps} <span className="text-rose-500">*</span>
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Détaillez chaque action de manière chronologique.
              </p>
            </div>

            <button
              type="button"
              onClick={handleAddStep}
              className="px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer self-start sm:self-auto active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t.addStepBtn}</span>
            </button>
          </div>

          <div className="space-y-4">
            {steps.map((step, idx) => (
              <div
                key={step.id}
                className="p-4 sm:p-5 rounded-2xl bg-stone-50/70 border border-stone-200 space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-xl bg-stone-900 text-white font-bold text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-bold text-stone-700">
                      Étape {idx + 1}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">

                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMoveStep(idx, 'up')}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 disabled:opacity-30 cursor-pointer"
                      title="Monter d'une étape"
                      aria-label="Monter d'une étape"
                    >
                      <MoveUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === steps.length - 1}
                      onClick={() => handleMoveStep(idx, 'down')}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 disabled:opacity-30 cursor-pointer"
                      title="Descendre d'une étape"
                      aria-label="Descendre d'une étape"
                    >
                      <MoveDown className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveStep(step.id)}
                      disabled={steps.length <= 1}
                      className={`p-1.5 rounded-lg transition-colors ml-1 ${
                        steps.length <= 1
                          ? 'text-stone-300 cursor-not-allowed'
                          : 'text-stone-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer'
                      }`}
                      title="Supprimer cette étape"
                      aria-label="Supprimer cette étape"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <textarea
                  rows={2}
                  required
                  placeholder={t.stepInstruction + ' *'}
                  value={step.instruction}
                  onChange={(e) => handleUpdateStep(step.id, { instruction: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-white border border-stone-200 focus:outline-hidden focus:border-amber-500 leading-relaxed"
                />

                <input
                  type="text"
                  placeholder={t.stepTip}
                  value={step.tip || ''}
                  onChange={(e) => handleUpdateStep(step.id, { tip: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-amber-50/60 border border-amber-200/60 focus:outline-hidden focus:border-amber-500 text-stone-800 placeholder-amber-900/40"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/90 shadow-sm space-y-4">
          <h2 className="font-serif text-xl font-bold text-stone-900 border-b border-stone-100 pb-3 flex items-center gap-2">
            <ChefHat className="w-5 h-5 text-amber-600" />
            <span>{t.formSectionChefNote}</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                {t.fieldChefNoteFr}
              </label>
              <textarea
                rows={2}
                value={chefNote}
                onChange={(e) => setChefNote(e.target.value)}
                placeholder="ex: Privilégiez une cuisson douce pour confire les sucs..."
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-hidden focus:border-amber-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                {t.fieldChefNoteEn}
              </label>
              <textarea
                rows={2}
                value={chefNoteEn}
                onChange={(e) => setChefNoteEn(e.target.value)}
                placeholder="e.g. Cook gently over low heat to preserve delicate aromas..."
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-hidden focus:border-amber-500 text-sm"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-4 pt-4 border-t border-stone-200">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-6 py-3 rounded-2xl border border-stone-300 text-stone-700 hover:bg-stone-100 font-semibold text-sm transition-all cursor-pointer active:scale-95"
          >
            {t.cancelBtn}
          </button>

          <button
            type="submit"
            disabled={isSubmitting || isUploadingImage}
            className="px-8 py-3 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold text-sm transition-all shadow-md shadow-amber-600/30 flex items-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isSubmitting ? 'Enregistrement...' : isUploadingImage ? 'Téléversement de l’image...' : t.saveRecipeBtn}</span>
          </button>
        </div>

      </form>

    </div>
  );
};
