import React from 'react';
import PropTypes from 'prop-types';

/**
 * ErrorBoundary component to catch JavaScript errors in child components
 * Prevents entire app from crashing due to component errors
 */
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ errorInfo });
        // Log error to console in development
        if (process.env.NODE_ENV === 'development') {
            console.error('ErrorBoundary caught an error:', error, errorInfo);
        }
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
    };

    render() {
        if (this.state.hasError) {
            // Custom fallback UI
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="flex flex-col items-center justify-center min-h-[200px] p-6 bg-base-200 rounded-lg">
                    <div className="text-error text-4xl mb-4">⚠️</div>
                    <h2 className="text-xl font-semibold text-base-content mb-2">
                        出现了一些问题
                    </h2>
                    <p className="text-base-content/70 text-center mb-4 max-w-md">
                        {this.props.message || '组件加载失败，请刷新页面或稍后再试。'}
                    </p>
                    {process.env.NODE_ENV === 'development' && this.state.error && (
                        <details className="mb-4 text-sm text-base-content/60 max-w-full overflow-auto">
                            <summary className="cursor-pointer hover:text-primary">
                                查看错误详情
                            </summary>
                            <pre className="mt-2 p-3 bg-base-300 rounded text-xs overflow-x-auto">
                                {this.state.error.toString()}
                                {this.state.errorInfo?.componentStack}
                            </pre>
                        </details>
                    )}
                    <button
                        className="btn btn-primary btn-sm"
                        onClick={this.handleRetry}
                    >
                        重试
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

ErrorBoundary.propTypes = {
    children: PropTypes.node.isRequired,
    fallback: PropTypes.node,
    message: PropTypes.string,
};

export default ErrorBoundary;
