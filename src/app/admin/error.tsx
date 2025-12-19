'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, ArrowLeft, Shield } from 'lucide-react';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Admin dashboard error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-gray-400" />
            <span className="font-semibold text-gray-900">Admin Dashboard</span>
          </div>
          <a 
            href="/" 
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Exit Admin
          </a>
        </div>
      </header>

      <div className="flex items-center justify-center p-6" style={{ minHeight: 'calc(100vh - 65px)' }}>
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-red-100 mx-auto flex items-center justify-center mb-6">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Dashboard Error
          </h1>
          
          <p className="text-gray-500 mb-6">
            An error occurred while loading the admin dashboard. This has been logged for review.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={reset}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Reload Dashboard
            </button>
            
            <a
              href="/admin/offers"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Offers
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
                  <p className="text-gray-500 text-xs font-mono mb-4">
                    Digest: {error.digest}
                  </p>
                )}
                {error.stack && (
                  <pre className="text-xs text-gray-400 font-mono whitespace-pre-wrap">
                    {error.stack}
                  </pre>
                )}
              </div>
            </details>
          )}
        </div>
      </div>
    </div>
  );
}
