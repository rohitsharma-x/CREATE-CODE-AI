import React from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export const ToastContainer = () => {
  const { toasts } = useNotifications();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';
        const isWarning = toast.type === 'warning';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-lg border backdrop-blur-md transition-all animate-fade-in ${
              isSuccess
                ? 'bg-[#111E2B]/90 border-emerald-500/30 text-emerald-300'
                : isError
                ? 'bg-[#111E2B]/90 border-rose-500/30 text-rose-300'
                : isWarning
                ? 'bg-[#111E2B]/90 border-amber-500/30 text-amber-300'
                : 'bg-[#111E2B]/90 border-[#263849] text-[#F1F5F9]'
            }`}
          >
            {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />}
            {isError && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />}
            {isWarning && <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />}
            {!isSuccess && !isError && !isWarning && <Info className="w-5 h-5 text-[#12D6C5] shrink-0 mt-0.5" />}
            <div className="text-sm font-medium flex-1">{toast.message}</div>
          </div>
        );
      })}
    </div>
  );
};

