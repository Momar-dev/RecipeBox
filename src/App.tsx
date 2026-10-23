import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Recipe, 
  RecipeFilterState, 
  ViewMode, 
  ToastMessage 
} from './types';
import { LanguageProvider, useLanguage } from './i18n/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { 
  recipeService, 
  filterAndSortRecipes 
} from './services/recipeService';

import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ToastContainer } from './components/Toast';
import { ConfirmationModal } from './components/ConfirmationModal';
import { StageInfoModal } from './components/StageInfoModal';
import { AuthModal } from './components/AuthModal';

import { HomePage } from './pages/HomePage';
import { RecipeDetailPage } from './pages/RecipeDetailPage';
import { RecipeFormPage } from './pages/RecipeFormPage';
import { FavoritesPage } from './pages/FavoritesPage';

import { RotateCcw, AlertTriangle, ChefHat } from 'lucide-react';

const DEFAULT_FILTERS: RecipeFilterState = {
  searchQuery: '',
  category: 'all',
  difficulty: 'all',
  maxTotalTime: null,
  sortBy: 'newest',
  onlyFavorites: false,
};

function RecipeBoxMain() {
  const { t, language } = useLanguage();
  const { user, token, isAuthenticated } = useAuth();

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [viewMode, setViewMode] = useState<ViewMode>('home');
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
  const [filters, setFilters] = useState<RecipeFilterState>(DEFAULT_FILTERS);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isStageInfoOpen, setIsStageInfoOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  const [confirmModalConfig, setConfirmModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel: string;
    isDestructive?: boolean;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    confirmLabel: '',
    isDestructive: false,
    onConfirm: () => {},
  });

  const addToast = useCallback((message: string, type: ToastMessage['type'] = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 4000);
  }, []);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [fetchedRecipes, fetchedFavIds] = await Promise.all([
        recipeService.getRecipes(token),
        recipeService.fetchFavoriteIds(token),
      ]);
      setRecipes(fetchedRecipes);
      setFavorites(fetchedFavIds);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Impossible de charger les recettes. Veuillez vérifier la connexion au serveur.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#recipe/')) {
        const id = hash.replace('#recipe/', '');
        setSelectedRecipeId(id);
        setViewMode('detail');
      } else if (hash === '#favorites') {
        setViewMode('favorites');
      } else if (hash === '#create') {
        setViewMode('create');
      } else if (hash === '#home' || !hash) {
        setViewMode('home');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (view: ViewMode, recipeId?: string) => {
    if (view === 'create' && !isAuthenticated) {
      setAuthModalMode('login');
      setIsAuthModalOpen(true);
      addToast(t.authPromptCreate, 'info');
      return;
    }

    setViewMode(view);
    if (view === 'detail' && recipeId) {
      setSelectedRecipeId(recipeId);
      window.location.hash = `#recipe/${recipeId}`;
    } else if (view === 'edit' && recipeId) {
      setSelectedRecipeId(recipeId);
    } else if (view === 'favorites') {
      window.location.hash = '#favorites';
    } else if (view === 'create') {
      setSelectedRecipeId(null);
      window.location.hash = '#create';
    } else {
      window.location.hash = '#home';
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleFavorite = async (recipeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const isCurrentlyFav = favorites.includes(recipeId);
    try {
      if (isCurrentlyFav) {

        setFavorites((prev) => prev.filter((id) => id !== recipeId));
        await recipeService.removeFavorite(recipeId, token);
        addToast(t.toastRemovedFav, 'info');
      } else {

        setFavorites((prev) => [...prev, recipeId]);
        await recipeService.addFavorite(recipeId, token);
        addToast(t.toastAddedFav, 'info');
      }
    } catch (err: any) {

      setFavorites((prev) =>
        isCurrentlyFav ? [...prev, recipeId] : prev.filter((id) => id !== recipeId)
      );
      console.error('Erreur lors du toggle favori:', err);
      addToast(err?.message || 'Erreur lors de la mise à jour des favoris.', 'error');
    }
  };

  const handleUpdateFilters = (updates: Partial<RecipeFilterState>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
  };

  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  const filteredRecipes = useMemo(() => {
    return filterAndSortRecipes(recipes, filters, favorites, language);
  }, [recipes, filters, favorites, language]);

  const featuredRecipes = useMemo(() => {
    return recipes.filter((r) => r.isFeatured).slice(0, 3);
  }, [recipes]);

  const favoriteRecipesList = useMemo(() => {
    return recipes.filter((r) => favorites.includes(r.id));
  }, [recipes, favorites]);

  const selectedRecipe = useMemo(() => {
    if (!selectedRecipeId) return null;
    return recipes.find((r) => r.id === selectedRecipeId) || null;
  }, [recipes, selectedRecipeId]);

  const handleSaveRecipe = async (
    data: Omit<Recipe, 'id' | 'createdAt'>,
    existingId?: string
  ) => {
    if (!isAuthenticated || !token) {
      setAuthModalMode('login');
      setIsAuthModalOpen(true);
      addToast(t.authPromptCreate, 'warning');
      return;
    }

    try {
      if (existingId) {
        const updated = await recipeService.updateRecipe(existingId, data, token);
        setRecipes((prev) =>
          prev.map((r) => (r.id === existingId ? updated : r))
        );
        addToast(t.toastRecipeUpdated, 'success');
        navigateTo('detail', updated.id);
      } else {
        const created = await recipeService.createRecipe(data, token);
        setRecipes((prev) => [created, ...prev]);
        addToast(t.toastRecipeCreated, 'success');
        navigateTo('detail', created.id);
      }
    } catch (err: any) {
      console.error(err);
      addToast(err?.message || 'Erreur lors de la sauvegarde de la recette.', 'error');
    }
  };

  const handleRequestDelete = (recipeId: string) => {
    if (!isAuthenticated || !token) {
      addToast('Authentification requise pour supprimer une recette.', 'error');
      return;
    }

    setConfirmModalConfig({
      isOpen: true,
      title: t.confirmDeleteTitle,
      message: t.confirmDeleteMessage,
      confirmLabel: t.confirmDeleteBtn,
      isDestructive: true,
      onConfirm: async () => {
        try {
          await recipeService.deleteRecipe(recipeId, token);
          setRecipes((prev) => prev.filter((r) => r.id !== recipeId));
          setFavorites((prev) => prev.filter((id) => id !== recipeId));

          await recipeService.removeFavorite(recipeId, token).catch(() => {});
          setConfirmModalConfig((prev) => ({ ...prev, isOpen: false }));
          addToast(t.toastRecipeDeleted, 'success');
          navigateTo('home');
        } catch (err: any) {
          console.error(err);
          addToast(err?.message || 'Erreur lors de la suppression.', 'error');
        }
      },
    });
  };

  const handleRequestResetData = () => {
    setConfirmModalConfig({
      isOpen: true,
      title: t.confirmResetDataTitle,
      message: t.confirmResetDataMessage,
      confirmLabel: t.confirmResetDataBtn,
      isDestructive: false,
      onConfirm: async () => {
        try {
          const resetList = await recipeService.resetToDefaultData(token);
          setRecipes(resetList);
          const freshFavs = await recipeService.fetchFavoriteIds(token);
          setFavorites(freshFavs);
          setConfirmModalConfig((prev) => ({ ...prev, isOpen: false }));
          addToast(t.toastDataReset, 'success');
          navigateTo('home');
        } catch (err: any) {
          console.error(err);
          addToast(err?.message || 'Erreur lors de l’actualisation.', 'error');
        }
      },
    });
  };

  const handleShareRecipe = () => {
    try {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(window.location.href);
        addToast(t.toastLinkCopied, 'success');
      } else {
        addToast(t.toastLinkCopied, 'info');
      }
    } catch {
      addToast(t.toastLinkCopied, 'info');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 selection:bg-amber-100 selection:text-amber-900">

      <Navbar
        currentView={viewMode}
        onNavigate={(view) => navigateTo(view)}
        favoritesCount={favorites.length}
        onOpenStageInfo={() => setIsStageInfoOpen(true)}
        onOpenAuthModal={() => {
          setAuthModalMode('login');
          setIsAuthModalOpen(true);
        }}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">

        {loading ? (

          <div className="py-20 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-600 flex items-center justify-center mx-auto animate-pulse">
              <ChefHat className="w-8 h-8" />
            </div>
            <p className="text-stone-500 font-medium text-sm animate-pulse">
              Chargement de votre carnet culinaire...
            </p>
          </div>
        ) : error ? (

          <div className="bg-white rounded-3xl p-12 text-center border border-rose-200 max-w-lg mx-auto shadow-sm my-12">
            <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-stone-900 mb-2">Une erreur est survenue</h2>
            <p className="text-sm text-stone-600 mb-6">{error}</p>
            <button
              onClick={loadData}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-stone-900 text-white text-sm font-semibold hover:bg-stone-800 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Réessayer</span>
            </button>
          </div>
        ) : (

          <>
            {viewMode === 'home' && (
              <HomePage
                recipes={recipes}
                featuredRecipes={featuredRecipes}
                filteredRecipes={filteredRecipes}
                filters={filters}
                favorites={favorites}
                onSelectRecipe={(id) => navigateTo('detail', id)}
                onToggleFavorite={handleToggleFavorite}
                onUpdateFilters={handleUpdateFilters}
                onResetFilters={handleResetFilters}
                onOpenCreate={() => navigateTo('create')}
              />
            )}

            {viewMode === 'detail' && selectedRecipe && (
              <RecipeDetailPage
                recipe={selectedRecipe}
                isFavorite={favorites.includes(selectedRecipe.id)}
                onBack={() => navigateTo('home')}
                onEdit={(id) => navigateTo('edit', id)}
                onRequestDelete={handleRequestDelete}
                onToggleFavorite={handleToggleFavorite}
                onShare={handleShareRecipe}
              />
            )}

            {viewMode === 'favorites' && (
              <FavoritesPage
                favoriteRecipes={favoriteRecipesList}
                favorites={favorites}
                onSelectRecipe={(id) => navigateTo('detail', id)}
                onToggleFavorite={handleToggleFavorite}
                onExplore={() => navigateTo('home')}
              />
            )}

            {(viewMode === 'create' || viewMode === 'edit') && (
              <RecipeFormPage
                initialRecipe={viewMode === 'edit' ? selectedRecipe : null}
                onSave={handleSaveRecipe}
                onCancel={() => {
                  if (viewMode === 'edit' && selectedRecipe) {
                    navigateTo('detail', selectedRecipe.id);
                  } else {
                    navigateTo('home');
                  }
                }}
              />
            )}
          </>
        )}

      </main>

      <Footer
        onNavigate={(view) => navigateTo(view)}
        onRequestResetData={handleRequestResetData}
        onOpenStageInfo={() => setIsStageInfoOpen(true)}
      />

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      <ConfirmationModal
        isOpen={confirmModalConfig.isOpen}
        title={confirmModalConfig.title}
        message={confirmModalConfig.message}
        confirmLabel={confirmModalConfig.confirmLabel}
        isDestructive={confirmModalConfig.isDestructive}
        onConfirm={confirmModalConfig.onConfirm}
        onCancel={() => setConfirmModalConfig((prev) => ({ ...prev, isOpen: false }))}
      />

      <StageInfoModal
        isOpen={isStageInfoOpen}
        onClose={() => setIsStageInfoOpen(false)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        initialMode={authModalMode}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {
          addToast(t.authSuccessLogin, 'success');
          loadData();
        }}
      />

    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <RecipeBoxMain />
      </AuthProvider>
    </LanguageProvider>
  );
}
