import React from 'react';
import { AlertTriangle, Trash2, HelpCircle, X } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel,
  cancelLabel,
  isDestructive = false,
  onConfirm,
  onCancel,
}) => {
  const { t } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-sm sm:max-w-md w-full p-6 sm:p-8 shadow-2xl border border-stone-100 text-center relative animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Close Button Top Right */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
          aria-label="Fermer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Central SweetAlert-style Icon Circle */}
        <div className="mx-auto mb-5 flex items-center justify-center">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-transform animate-in zoom-in duration-300 ${
            isDestructive 
              ? 'bg-rose-50 text-rose-500 border-4 border-rose-100 shadow-inner' 
              : 'bg-amber-50 text-amber-500 border-4 border-amber-100 shadow-inner'
          }`}>
            {isDestructive ? (
              <Trash2 className="w-9 h-9 stroke-[1.8]" />
            ) : (
              <AlertTriangle className="w-9 h-9 stroke-[1.8]" />
            )}
          </div>
        </div>

        {/* Modal Title */}
        <h3 id="modal-title" className="text-xl sm:text-2xl font-bold text-stone-900 font-serif mb-2.5">
          {title}
        </h3>

        {/* Modal Description / Message */}
        <p className="text-sm text-stone-500 mb-8 leading-relaxed max-w-xs mx-auto">
          {message}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="w-full sm:w-auto px-5 py-3 rounded-2xl text-sm font-semibold text-stone-600 bg-stone-100 hover:bg-stone-200 transition-all cursor-pointer active:scale-95"
          >
            {cancelLabel || t.cancelBtn}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`w-full sm:w-auto px-6 py-3 rounded-2xl text-sm font-semibold text-white transition-all cursor-pointer shadow-lg active:scale-95 ${
              isDestructive
                ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/30 ring-2 ring-rose-500/20'
                : 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/30 ring-2 ring-amber-500/20'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
