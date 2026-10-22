import React, { useState } from 'react';
import { ChefHat, Heart, PlusCircle, Globe, Menu, X, BookOpen, LogIn, LogOut, User as UserIcon } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { ViewMode } from '../types';

interface NavbarProps {
  currentView: ViewMode;
  onNavigate: (view: ViewMode) => void;
  favoritesCount: number;
  onOpenStageInfo: () => void;
  onOpenAuthModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  favoritesCount,
  onOpenStageInfo,
  onOpenAuthModal,
}) => {
  const { language, toggleLanguage, t } = useLanguage();
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNav = (view: ViewMode) => {
    onNavigate(view);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-stone-200/80 shadow-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleNav('home')}
              className="flex items-center gap-3 group text-left cursor-pointer focus:outline-hidden"
              aria-label="Accueil Recipe Box"
            >
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 flex items-center justify-center text-white shadow-md shadow-amber-600/25 group-hover:scale-105 group-hover:shadow-amber-600/40 transition-all duration-300">
                <ChefHat className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-2xl font-bold tracking-tight text-stone-900 group-hover:text-amber-800 transition-colors">
                  {t.appName}
                </span>
                <span className="hidden sm:block text-[11px] font-semibold text-amber-800/80 tracking-wider uppercase">
                  {t.appSubtitle}
                </span>
              </div>
            </button>

            {/* About Modal Pill */}
            <button
              onClick={onOpenStageInfo}
              className="hidden xl:inline-flex items-center gap-1.5 ml-3 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-50/80 text-amber-900 border border-amber-200/70 hover:bg-amber-100 hover:border-amber-300 transition-all cursor-pointer shadow-2xs shrink-0"
              title={t.stageTooltip}
            >
              <ChefHat className="w-3.5 h-3.5 text-amber-600" />
              <span>{t.stageInfoTitle}</span>
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <button
              onClick={() => handleNav('home')}
              className={`px-3 lg:px-4 py-2 rounded-xl text-xs lg:text-sm font-semibold transition-all duration-200 cursor-pointer shrink-0 ${
                currentView === 'home'
                  ? 'bg-stone-900 text-white shadow-sm'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/80'
              }`}
            >
              {t.navDiscover}
            </button>

            <button
              onClick={() => handleNav('favorites')}
              className={`px-3 lg:px-4 py-2 rounded-xl text-xs lg:text-sm font-semibold transition-all duration-200 cursor-pointer flex items-center gap-1.5 lg:gap-2 shrink-0 ${
                currentView === 'favorites'
                  ? 'bg-rose-50 text-rose-700 border border-rose-200 shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/80'
              }`}
              title={t.navFavorites}
            >
              <Heart className={`w-4 h-4 transition-transform duration-200 shrink-0 ${favoritesCount > 0 ? 'fill-rose-500 text-rose-500 scale-110' : 'text-stone-400'}`} />
              <span className="hidden lg:inline">{t.navFavorites}</span>
              {favoritesCount > 0 && (
                <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[11px] font-bold leading-none text-white bg-rose-500 rounded-full shadow-2xs">
                  {favoritesCount}
                </span>
              )}
            </button>

            <button
              onClick={() => handleNav('create')}
              className={`px-3 lg:px-4.5 py-2 lg:py-2.5 rounded-xl text-xs lg:text-sm font-semibold transition-all duration-200 cursor-pointer flex items-center gap-1.5 lg:gap-2 shadow-sm shrink-0 ${
                currentView === 'create'
                  ? 'bg-amber-700 text-white shadow-amber-700/25 ring-2 ring-amber-600/30'
                  : 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white shadow-amber-600/25 hover:shadow-md hover:shadow-amber-600/30 active:scale-98'
              }`}
              title={t.navCreate}
            >
              <PlusCircle className="w-4 h-4 shrink-0" />
              <span className="hidden lg:inline">{t.navCreate}</span>
            </button>

            {/* Auth Controls */}
            {isAuthenticated && user ? (
              <div className="flex items-center gap-1.5 lg:gap-2 ml-1 pl-1.5 lg:ml-2 lg:pl-2 border-l border-stone-200 shrink-0">
                <div 
                  className="flex items-center gap-1.5 lg:gap-2 px-2.5 lg:px-3 py-1.5 rounded-xl bg-amber-50/80 border border-amber-200/60 text-xs font-bold text-amber-900 shrink-0"
                  title={user.email}
                >
                  <div className="w-5 h-5 rounded-full bg-amber-700 text-white flex items-center justify-center text-[10px] shrink-0 font-bold">
                    {user.name ? user.name[0].toUpperCase() : 'C'}
                  </div>
                  <span className="max-w-[70px] lg:max-w-[120px] truncate">{user.name || user.email.split('@')[0]}</span>
                </div>
                <button
                  onClick={logout}
                  className="p-1.5 lg:p-2 rounded-xl text-stone-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
                  title={t.navLogout}
                  aria-label={t.navLogout}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="ml-1 lg:ml-2 flex items-center gap-1.5 px-3 lg:px-3.5 py-2 rounded-xl text-xs lg:text-sm font-bold text-stone-700 hover:text-amber-900 hover:bg-stone-100/80 border border-stone-200 cursor-pointer transition-all shrink-0"
              >
                <LogIn className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{t.navLogin}</span>
              </button>
            )}

            {/* Language Switcher */}
            <div className="ml-1 pl-1.5 lg:ml-2 lg:pl-2 border-l border-stone-200 shrink-0">
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 rounded-xl border border-stone-200 hover:border-stone-300 bg-stone-50 hover:bg-white text-xs font-bold text-stone-700 transition-all cursor-pointer shadow-2xs shrink-0"
                aria-label={`Changer de langue (actuel : ${language.toUpperCase()})`}
                title="Basculer Français / Anglais"
              >
                <Globe className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span className={language === 'fr' ? 'text-amber-800 font-extrabold' : 'text-stone-400'}>FR</span>
                <span className="text-stone-300">/</span>
                <span className={language === 'en' ? 'text-amber-800 font-extrabold' : 'text-stone-400'}>EN</span>
              </button>
            </div>
          </nav>

          {/* Mobile Right Controls */}
          <div className="flex md:hidden items-center gap-1.5">
            {/* Quick Favorites Shortcut on Mobile */}
            <button
              onClick={() => handleNav('favorites')}
              className={`relative p-2 rounded-xl text-stone-700 hover:bg-stone-100 cursor-pointer transition-colors ${
                currentView === 'favorites' ? 'bg-rose-50 text-rose-600' : ''
              }`}
              title={t.navFavorites}
              aria-label={t.navFavorites}
            >
              <Heart className={`w-5 h-5 ${favoritesCount > 0 ? 'fill-rose-500 text-rose-500' : 'text-stone-500'}`} />
              {favoritesCount > 0 && (
                <span className="absolute 1 top-1 right-1 inline-flex items-center justify-center min-w-[16px] h-4 px-1 text-[9px] font-bold text-white bg-rose-500 rounded-full shadow-xs">
                  {favoritesCount}
                </span>
              )}
            </button>
            {isAuthenticated ? (
              <button
                onClick={logout}
                className="p-2 rounded-xl text-stone-600 hover:bg-stone-100 cursor-pointer"
                title={t.navLogout}
              >
                <LogOut className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="p-2 rounded-xl text-amber-700 hover:bg-amber-50 cursor-pointer"
                title={t.navLogin}
              >
                <LogIn className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-stone-200 bg-stone-50 text-xs font-bold text-stone-700 cursor-pointer"
              aria-label="Basculer la langue"
            >
              <Globe className="w-3.5 h-3.5 text-amber-600" />
              <span>{language.toUpperCase()}</span>
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-stone-700 hover:bg-stone-100 cursor-pointer transition-colors"
              aria-label={mobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-stone-200/90 bg-white/98 backdrop-blur-md px-4 pt-3 pb-6 space-y-2.5 shadow-lg animate-in slide-in-from-top-2 duration-200">
          {isAuthenticated && user && (
            <div className="px-4 py-2.5 rounded-xl bg-amber-50 border border-amber-200/80 text-xs font-bold text-amber-900 flex items-center justify-between">
              <div className="flex items-center gap-2 truncate">
                <UserIcon className="w-4 h-4 text-amber-700" />
                <span className="truncate">{user.name || user.email}</span>
              </div>
              <button
                onClick={logout}
                className="text-rose-600 text-xs font-semibold cursor-pointer"
              >
                {t.navLogout}
              </button>
            </div>
          )}

          <button
            onClick={() => handleNav('home')}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
              currentView === 'home' ? 'bg-stone-900 text-white' : 'text-stone-700 hover:bg-stone-100'
            }`}
          >
            {t.navDiscover}
          </button>

          <button
            onClick={() => handleNav('favorites')}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold flex items-center justify-between transition-colors ${
              currentView === 'favorites' ? 'bg-rose-50 text-rose-700' : 'text-stone-700 hover:bg-stone-100'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Heart className={`w-4 h-4 ${favoritesCount > 0 ? 'fill-rose-500 text-rose-500' : 'text-stone-400'}`} />
              <span>{t.navFavorites}</span>
            </div>
            {favoritesCount > 0 && (
              <span className="px-2 py-0.5 text-xs font-bold text-white bg-rose-500 rounded-full">
                {favoritesCount}
              </span>
            )}
          </button>

          <button
            onClick={() => handleNav('create')}
            className="w-full text-left px-4 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-amber-600 to-amber-700 text-white flex items-center gap-2 shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t.navCreate}</span>
          </button>

          {!isAuthenticated && (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAuthModal();
              }}
              className="w-full text-left px-4 py-3 rounded-xl text-sm font-semibold border border-amber-300 bg-amber-50 text-amber-900 flex items-center gap-2"
            >
              <LogIn className="w-4 h-4 text-amber-700" />
              <span>{t.navLogin}</span>
            </button>
          )}

          <div className="pt-2 border-t border-stone-100">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenStageInfo();
              }}
              className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-semibold text-amber-900 bg-amber-50/80 border border-amber-200/60 flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4 text-amber-600" />
              <span>{t.stageInfoTitle}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
