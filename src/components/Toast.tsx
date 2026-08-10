import React from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  message: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full px-4 pointer-events-none">
      {toasts.map((toast) => {
        let bgClass = 'bg-slate-800 text-white border-slate-700';
        let Icon = Info;

        if (toast.type === 'success') {
          bgClass = 'bg-emerald-900/90 text-emerald-100 border-emerald-700/60';
          Icon = CheckCircle2;
        } else if (toast.type === 'warning') {
          bgClass = 'bg-amber-900/90 text-amber-100 border-amber-700/60';
          Icon = AlertCircle;
        } else if (toast.type === 'error') {
          bgClass = 'bg-rose-900/90 text-rose-100 border-rose-700/60';
          Icon = AlertCircle;
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between p-3.5 rounded-xl border shadow-lg backdrop-blur-md transition-all duration-200 animate-slide-up ${bgClass}`}
          >
            <div className="flex items-center gap-2.5">
              <Icon className="w-5 h-5 shrink-0" />
              <p className="text-sm font-medium">{toast.message}</p>
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="p-1 hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Dismiss message"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
