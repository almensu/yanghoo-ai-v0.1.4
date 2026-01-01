import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

// Toast 类型
export const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

// Toast 管理器
class ToastManager {
  constructor() {
    this.toasts = [];
    this.listeners = [];
  }

  addToast(message, type = TOAST_TYPES.INFO, duration = 3000) {
    const id = Date.now() + Math.random();
    const toast = { id, message, type, duration };
    
    this.toasts.push(toast);
    this.notifyListeners();

    // 自动移除
    if (duration > 0) {
      setTimeout(() => {
        this.removeToast(id);
      }, duration);
    }

    return id;
  }

  removeToast(id) {
    this.toasts = this.toasts.filter(toast => toast.id !== id);
    this.notifyListeners();
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notifyListeners() {
    this.listeners.forEach(listener => listener(this.toasts));
  }

  success(message, duration) {
    return this.addToast(message, TOAST_TYPES.SUCCESS, duration);
  }

  error(message, duration) {
    return this.addToast(message, TOAST_TYPES.ERROR, duration);
  }

  warning(message, duration) {
    return this.addToast(message, TOAST_TYPES.WARNING, duration);
  }

  info(message, duration) {
    return this.addToast(message, TOAST_TYPES.INFO, duration);
  }
}

// 全局 Toast 管理器实例
export const toastManager = new ToastManager();

// Toast 容器组件
const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const unsubscribe = toastManager.subscribe(setToasts);
    return unsubscribe;
  }, []);

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map(toast => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onClose={() => toastManager.removeToast(toast.id)}
        />
      ))}
    </div>
  );
};

// 单个 Toast 项组件
const ToastItem = ({ toast, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // 进入动画
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(onClose, 300); // 等待退出动画完成
  };

  const getToastStyles = () => {
    const baseStyles = "flex items-center p-4 rounded-lg shadow-lg max-w-sm w-full transition-all duration-300 transform";
    
    const typeStyles = {
      [TOAST_TYPES.SUCCESS]: "bg-green-50 border border-green-200 text-green-800",
      [TOAST_TYPES.ERROR]: "bg-red-50 border border-red-200 text-red-800",
      [TOAST_TYPES.WARNING]: "bg-yellow-50 border border-yellow-200 text-yellow-800",
      [TOAST_TYPES.INFO]: "bg-blue-50 border border-blue-200 text-blue-800"
    };

    const animationStyles = isLeaving 
      ? "translate-x-full opacity-0" 
      : isVisible 
        ? "translate-x-0 opacity-100" 
        : "translate-x-full opacity-0";

    return `${baseStyles} ${typeStyles[toast.type]} ${animationStyles}`;
  };

  const getIcon = () => {
    const iconProps = { size: 20, className: "flex-shrink-0" };
    
    switch (toast.type) {
      case TOAST_TYPES.SUCCESS:
        return <CheckCircle {...iconProps} className="flex-shrink-0 text-green-500" />;
      case TOAST_TYPES.ERROR:
        return <XCircle {...iconProps} className="flex-shrink-0 text-red-500" />;
      case TOAST_TYPES.WARNING:
        return <AlertCircle {...iconProps} className="flex-shrink-0 text-yellow-500" />;
      case TOAST_TYPES.INFO:
      default:
        return <Info {...iconProps} className="flex-shrink-0 text-blue-500" />;
    }
  };

  return (
    <div className={getToastStyles()}>
      {getIcon()}
      <div className="ml-3 flex-1">
        <p className="text-sm font-medium">{toast.message}</p>
      </div>
      <button
        onClick={handleClose}
        className="ml-4 flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <X size={16} />
      </button>
    </div>
  );
};

// Hook 用于在组件中使用 Toast
export const useToast = () => {
  return {
    success: (message, duration) => toastManager.success(message, duration),
    error: (message, duration) => toastManager.error(message, duration),
    warning: (message, duration) => toastManager.warning(message, duration),
    info: (message, duration) => toastManager.info(message, duration)
  };
};

export default ToastContainer; 