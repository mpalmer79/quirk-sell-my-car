'use client';

import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return React.createElement(
        'div',
        { className: 'min-h-[400px] flex items-center justify-center p-6' },
        React.createElement(
          'div',
          { className: 'text-center max-w-md' },
          React.createElement(
            'div',
            { className: 'w-16 h-16 rounded-full bg-red-100 mx-auto flex items-center justify-center mb-4' },
            React.createElement(AlertTriangle, { className: 'w-8 h-8 text-red-600' })
          ),
          React.createElement('h2', { className: 'text-xl font-semibold text-gray-900 mb-2' }, 'Something went wrong'),
          React.createElement(
            'p',
            { className: 'text-gray-500 mb-6' },
            'We encountered an unexpected error. Please try again or return to the home page.'
          ),
          React.createElement(
            'div',
            { className: 'flex flex-col sm:flex-row gap-3 justify-center' },
            React.createElement(
              'button',
              {
                onClick: this.handleRetry,
                className: 'inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors',
              },
              React.createElement(RefreshCw, { className: 'w-4 h-4' }),
              'Try Again'
            ),
            React.createElement(
              'a',
              {
                href: '/',
                className: 'inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors',
              },
              React.createElement(Home, { className: 'w-4 h-4' }),
              'Go Home'
            )
          ),
          process.env.NODE_ENV === 'development' && this.state.error
            ? React.createElement(
                'details',
                { className: 'mt-6 text-left' },
                React.createElement(
                  'summary',
                  { className: 'text-sm text-gray-500 cursor-pointer hover:text-gray-700' },
                  'Error details'
                ),
                React.createElement(
                  'pre',
                  { className: 'mt-2 p-4 bg-gray-100 rounded-lg text-xs text-red-600 overflow-auto' },
                  this.state.error.message,
                  '\n\n',
                  this.state.error.stack
                )
              )
            : null
        )
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
