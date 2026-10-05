import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Konfirmasi',
  cancelText = 'Batal',
  isDestructive = true,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div 
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className={`p-3 rounded-xl ${isDestructive ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'}`}>
              <AlertTriangle className="w-6 h-6" />
            </div>
            <button
              onClick={onCancel}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-4">
            <h3 className="text-lg font-bold text-slate-900">{title}</h3>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {message}
            </p>
          </div>
        </div>

        <div className="bg-slate-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 focus:outline-hidden focus:ring-2 focus:ring-slate-300 transition-colors cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-medium text-white rounded-xl shadow-xs transition-colors cursor-pointer ${
              isDestructive
                ? 'bg-rose-600 hover:bg-rose-700 focus:ring-2 focus:ring-rose-500'
                : 'bg-emerald-600 hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
