import React from 'react';
import { useToast } from '../../hooks/useToast';
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const Toast = () => {
  const { toasts, hideToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => {
        // Definir cores e ícones com base no tipo
        let bgColor = 'bg-gray-800';
        let icon = <Info className="w-5 h-5 text-white" />;

        if (toast.type === 'success') {
          bgColor = 'bg-green-500';
          icon = <CheckCircle className="w-5 h-5 text-white" />;
        } else if (toast.type === 'error') {
          bgColor = 'bg-red-500';
          icon = <AlertCircle className="w-5 h-5 text-white" />;
        } else if (toast.type === 'warning') {
          bgColor = 'bg-yellow-500';
          icon = <AlertTriangle className="w-5 h-5 text-white" />;
        } else if (toast.type === 'info') {
          bgColor = 'bg-blue-500';
          icon = <Info className="w-5 h-5 text-white" />;
        }

        return (
          <div
            key={toast.id}
            className={`${bgColor} text-white px-4 py-3 rounded-lg shadow-lg flex items-center min-w-[300px] max-w-md animate-slide-in`}
          >
            <div className="mr-3">{icon}</div>
            <div className="flex-1">{toast.message}</div>
            <button
              onClick={() => hideToast(toast.id)}
              className="ml-2 text-white hover:text-gray-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default Toast;