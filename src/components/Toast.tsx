import React from 'react';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  visible: boolean;
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'success', visible }) => {
  if (!visible) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
    error: <AlertCircle className="w-5 h-5 text-rose-600" />,
    info: <Info className="w-5 h-5 text-blue-600" />
  };

  const bgStyles = {
    success: 'bg-white border-emerald-200 text-neutral-800 shadow-xl',
    error: 'bg-white border-rose-200 text-neutral-800 shadow-xl',
    info: 'bg-white border-blue-200 text-neutral-800 shadow-xl'
  };

  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 transform translate-y-0">
      <div className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border ${bgStyles[type]} text-sm font-medium tracking-wide shadow-elevated animate-in fade-in slide-in-from-top-4`}>
        {icons[type]}
        <span>{message}</span>
      </div>
    </div>
  );
};
