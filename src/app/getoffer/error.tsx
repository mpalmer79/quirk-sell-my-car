'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, ArrowLeft, Phone } from 'lucide-react';

export default function GetOfferError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('GetOffer flow error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <a href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5" />
            Back to Start
          </a>
        </div>
      </header>

      <div className="flex items-center justify-center p-6" style={{ minHeight: 'calc(100vh - 73px)' }}>
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-amber-100 mx-auto flex items-center justify-center mb-6">
            <AlertTriangle className="w-8 h-8 text-amber-600" />
          </div>
          
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            We hit a bump in the road
          </h1>
          
          <p className="text-gray-500 mb-6">
            There was a problem processing your vehicle information. Your data has been saved — let&apos;s try that again.
          </p>
          
          <div className="flex flex-col gap-3">
            <button
              onClick={reset}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#00A67C] text-white rounded-xl font-medium hover:bg-[#008f6b] transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
              Continue My Offer
            </button>
            
            
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-100 transition-colors"
            >
              Start Over with New VIN
            </a>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-2">
              Rather talk to someone?
            </p>
            
              href="tel:+16032634552"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              <Phone className="w-4 h-4" />
              (603) 263-4552
            </a>
          </div>

          {process.env.NODE_ENV === 'development' && (
            <details className="mt-6 text-left">
              <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">
                Error details
              </summary>
              <pre className="mt-2 p-4 bg-gray-100 rounded-lg text-xs text-red-600 overflow-auto">
                {error.message}
                {error.stack && `\n\n${error.stack}`}
              </pre>
            </details>
          )}
        </div>
      </div>
    </div>
  );
}
