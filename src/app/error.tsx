'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home, Phone } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console
    console.error('Global error:', error);
    
    // TODO: Send to error reporting service (e.g., Sentry)
    // if (process.env.NODE_ENV === 'production') {
    //   reportError(error);
    // }
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="text-center max-w-lg">
        <div className="w-20 h-20 rounded-full bg-red-100 mx-auto flex items-center justify-center mb-6">
          <AlertTriangle className="w-10 h-10 text-red-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Oops! Something went wrong
        </h1>
        
        <p className="text-gray-500 mb-8">
          We&apos;re sorry for the inconvenience. Our team has been notified and is working on a fix.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            Try Again
          </button>
          
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-100 transition-colors"
          >
            <Home className="w-5 h-5" />
            Back to Home
          </a>
        </div>

        <div className="pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-2">Need immediate assistance?</p>
          
            href="tel:+16032634552"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            <Phone className="w-4 h-4" />
            (603) 263-4552
          </a>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <details className="mt-8 text-left">
            <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">
              Developer: View error details
            </summary>
            <div className="mt-4 p-4 bg-gray-900 rounded-lg overflow-auto">
              <p className="text-red-400 text-sm font-mono mb-2">
                {error.message}
              </p>
              {error.digest && (
                <p className="text-gray-500 text-xs font-mono">
                  Digest: {error.digest}
                </p>
              )}
              {error.stack && (
                <pre className="mt-4 text-xs text-gray-400 font-mono whitespace-pre-wrap">
                  {error.stack}
                </pre>
              )}
            </div>
          </details>
        )}
      </div>
    </div>
  );
}
