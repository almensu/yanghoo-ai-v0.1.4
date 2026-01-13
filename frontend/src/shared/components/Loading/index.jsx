import React from 'react';
import PropTypes from 'prop-types';

/**
 * Loading spinner component with different sizes and optional text
 */
function Loading({ size = 'md', text, className = '' }) {
    const sizeClasses = {
        sm: 'loading-sm',
        md: 'loading-md',
        lg: 'loading-lg',
    };

    return (
        <div className={`flex flex-col items-center justify-center gap-2 ${className}`}>
            <span className={`loading loading-spinner ${sizeClasses[size]} text-primary`}></span>
            {text && (
                <span className="text-base-content/70 text-sm">{text}</span>
            )}
        </div>
    );
}

Loading.propTypes = {
    size: PropTypes.oneOf(['sm', 'md', 'lg']),
    text: PropTypes.string,
    className: PropTypes.string,
};

/**
 * Full page loading component for Suspense fallback
 */
function PageLoading({ text = '加载中...' }) {
    return (
        <div className="flex items-center justify-center h-screen bg-base-100">
            <Loading size="lg" text={text} />
        </div>
    );
}

PageLoading.propTypes = {
    text: PropTypes.string,
};

/**
 * Skeleton loading placeholder
 */
function Skeleton({ className = '', variant = 'text' }) {
    const variants = {
        text: 'h-4 w-full',
        title: 'h-6 w-3/4',
        avatar: 'h-12 w-12 rounded-full',
        thumbnail: 'h-32 w-full',
        card: 'h-48 w-full',
    };

    return (
        <div className={`animate-pulse bg-base-300 rounded ${variants[variant]} ${className}`}></div>
    );
}

Skeleton.propTypes = {
    className: PropTypes.string,
    variant: PropTypes.oneOf(['text', 'title', 'avatar', 'thumbnail', 'card']),
};

export { Loading, PageLoading, Skeleton };
export default Loading;
