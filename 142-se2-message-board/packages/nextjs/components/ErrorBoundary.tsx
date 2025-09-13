// packages/nextjs/components/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    private handleRetry = () => {
        this.setState({ hasError: false, error: undefined });
    };

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <div className="text-6xl mb-4">⚠️</div>
                    <h3 className="text-lg font-semibold text-red-800 mb-2">發生錯誤</h3>
                    <p className="text-red-600 mb-4">
                        {this.state.error?.message || '應用程式遇到未預期的錯誤'}
                    </p>
                    <button
                        onClick={this.handleRetry}
                        className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors mr-3"
                    >
                        重試
                    </button>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
                    >
                        重新載入頁面
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}