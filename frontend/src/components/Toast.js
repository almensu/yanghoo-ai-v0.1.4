import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, XCircle, X } from 'lucide-react';

const Toast = ({ 
  message, 
  type = 'info', 
  duration = 3000, 
  onClose,
  isVisible = false 
}) => {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose && onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const getToastStyle = () => {
    const baseStyle = "fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg border flex items-center gap-3 min-w-80 max-w-md transition-all duration-300 transform";
    
    switch (type) {
      case 'success':
        return `${baseStyle} bg-green-50 border-green-200 text-green-800`;
      case 'error':
        return `${baseStyle} bg-red-50 border-red-200 text-red-800`;
      case 'warning':
        return `${baseStyle} bg-yellow-50 border-yellow-200 text-yellow-800`;
      default:
        return `${baseStyle} bg-blue-50 border-blue-200 text-blue-800`;
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} className="text-green-600 flex-shrink-0" />;
      case 'error':
        return <XCircle size={20} className="text-red-600 flex-shrink-0" />;
      case 'warning':
        return <AlertCircle size={20} className="text-yellow-600 flex-shrink-0" />;
      default:
        return <AlertCircle size={20} className="text-blue-600 flex-shrink-0" />;
    }
  };

  return (
    <div className={getToastStyle()}>
      {getIcon()}
      <div className="flex-1">
        <p className="text-sm font-medium">{message}</p>
      </div>
      <button
        onClick={onClose}
        className="flex-shrink-0 p-1 hover:bg-black hover:bg-opacity-10 rounded"
      >
        <X size={16} />
      </button>
    </div>
  );
};

// Toast管理器Hook
export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'info', duration = 3000) => {
    const id = Date.now() + Math.random();
    const newToast = { id, message, type, duration };
    
    setToasts(prev => [...prev, newToast]);
  };

  const hideToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const ToastContainer = () => (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          isVisible={true}
          onClose={() => hideToast(toast.id)}
        />
      ))}
    </div>
  );

  return {
    showToast,
    hideToast,
    ToastContainer,
    // 便捷方法
    showSuccess: (message, duration) => showToast(message, 'success', duration),
    showError: (message, duration) => showToast(message, 'error', duration),
    showWarning: (message, duration) => showToast(message, 'warning', duration),
    showInfo: (message, duration) => showToast(message, 'info', duration)
  };
};

export default Toast; 