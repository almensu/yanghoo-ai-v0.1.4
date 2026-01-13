/**
 * Toast notification component with manager
 * Provides global toast notifications with animations and auto-dismiss
 * @module shared/components/Toast
 */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

// Toast types enum
export const TOAST_TYPES = {
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info'
};

/**
 * Toast Manager class for global state management
 */
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
        this.listeners.forEach(listener => listener([...this.toasts]));
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

// Global toast manager instance
export const toastManager = new ToastManager();

/**
 * Individual toast item component
 */
const ToastItem = ({ toast, onClose }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isLeaving, setIsLeaving] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 10);
        return () => clearTimeout(timer);
    }, []);

    const handleClose = () => {
        setIsLeaving(true);
        setTimeout(onClose, 300);
    };

    const getTypeStyles = () => {
        const styles = {
            [TOAST_TYPES.SUCCESS]: "bg-success/10 border-success/30 text-success",
            [TOAST_TYPES.ERROR]: "bg-error/10 border-error/30 text-error",
            [TOAST_TYPES.WARNING]: "bg-warning/10 border-warning/30 text-warning",
            [TOAST_TYPES.INFO]: "bg-info/10 border-info/30 text-info"
        };
        return styles[toast.type] || styles[TOAST_TYPES.INFO];
    };

    const getIcon = () => {
        const iconClass = "flex-shrink-0 w-5 h-5";
        switch (toast.type) {
            case TOAST_TYPES.SUCCESS:
                return <CheckCircle className={iconClass} />;
            case TOAST_TYPES.ERROR:
                return <XCircle className={iconClass} />;
            case TOAST_TYPES.WARNING:
                return <AlertCircle className={iconClass} />;
            case TOAST_TYPES.INFO:
            default:
                return <Info className={iconClass} />;
        }
    };

    const animationClass = isLeaving
        ? "translate-x-full opacity-0"
        : isVisible
            ? "translate-x-0 opacity-100"
            : "translate-x-full opacity-0";

    return (
        <div
            className={`
        flex items-center p-4 rounded-lg shadow-lg 
        border backdrop-blur-sm
        max-w-sm w-full 
        transition-all duration-300 transform
        ${getTypeStyles()}
        ${animationClass}
      `}
        >
            {getIcon()}
            <p className="ml-3 flex-1 text-sm font-medium">{toast.message}</p>
            <button
                onClick={handleClose}
                className="ml-4 flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
                aria-label="关闭通知"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
};

ToastItem.propTypes = {
    toast: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        message: PropTypes.string.isRequired,
        type: PropTypes.oneOf(Object.values(TOAST_TYPES)).isRequired,
        duration: PropTypes.number,
    }).isRequired,
    onClose: PropTypes.func.isRequired,
};

/**
 * Toast container component - renders all active toasts
 */
function ToastContainer() {
    const [toasts, setToasts] = useState([]);

    useEffect(() => {
        const unsubscribe = toastManager.subscribe(setToasts);
        return unsubscribe;
    }, []);

    return (
        <div
            className="fixed top-4 right-4 z-50 space-y-2"
            role="region"
            aria-label="通知"
        >
            {toasts.map(toast => (
                <ToastItem
                    key={toast.id}
                    toast={toast}
                    onClose={() => toastManager.removeToast(toast.id)}
                />
            ))}
        </div>
    );
}

/**
 * Hook for using toast notifications in components
 * @returns {Object} Toast methods (success, error, warning, info)
 */
export const useToast = () => {
    return {
        success: (message, duration) => toastManager.success(message, duration),
        error: (message, duration) => toastManager.error(message, duration),
        warning: (message, duration) => toastManager.warning(message, duration),
        info: (message, duration) => toastManager.info(message, duration)
    };
};

export default ToastContainer;
