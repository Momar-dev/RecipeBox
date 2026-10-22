import React, { useState } from 'react';
import { X, Lock, Mail, User, AlertCircle, ChefHat, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialMode = 'login',
}) => {
  const { t } = useLanguage();
  const { login, register } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError(t.errTitleRequired);
      return;
    }

    if (password.length < 8) {
      setError(t.authPasswordPlaceholder);
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === 'login') {
        await login(trimmedEmail, password);
      } else {
        await register(trimmedEmail, password, name.trim() || undefined);
      }
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err?.message || t.authErrorGeneric);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-stone-200/80 overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
      >
        {/* Top Decorative Header */}
        <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 px-6 py-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
            aria-label="Fermer la boîte de dialogue"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shadow-xs">
              <ChefHat className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 id="auth-modal-title" className="text-xl font-bold font-serif">
                {t.authModalTitle}
              </h2>
              <p className="text-xs text-amber-100/90 font-medium">
                {mode === 'login' ? t.authPromptCreate : t.authSuccessRegister}
              </p>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex rounded-xl bg-black/20 p-1 mt-5">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
              }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              {t.authLoginTab}
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setError(null);
              }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                mode === 'register'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              {t.authRegisterTab}
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {mode === 'register' && (
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-stone-700">
                {t.authNameLabel}
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t.authNamePlaceholder}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-stone-700">
              {t.authEmailLabel} *
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-stone-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.authEmailPlaceholder}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-stone-700">
              {t.authPasswordLabel} *
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-stone-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t.authPasswordPlaceholder}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-1 cursor-pointer transition-colors focus:outline-hidden"
                aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 shadow-md shadow-amber-600/20 active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting
                ? mode === 'login'
                  ? t.authLoggingIn
                  : t.authRegistering
                : mode === 'login'
                ? t.authLoginBtn
                : t.authRegisterBtn}
            </button>
          </div>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login');
                setError(null);
              }}
              className="text-xs text-stone-500 hover:text-amber-800 font-semibold cursor-pointer transition-colors"
            >
              {mode === 'login' ? t.authPromptRegister : t.authPromptLogin}{' '}
              <span className="text-amber-700 underline font-bold">
                {mode === 'login' ? t.authRegisterTab : t.authLoginTab}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
