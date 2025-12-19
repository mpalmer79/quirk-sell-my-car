'use client';

import { ReactNode } from 'react';
import { VehicleProvider } from '@/context/VehicleContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import Header from '@/components/Header';
import ChatWidget from '@/components/ChatWidget';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ErrorBoundary>
      <VehicleProvider>
        <Header />
        <main className="pt-16 lg:pt-20">
          {children}
        </main>
        <ErrorBoundary
          fallback={null}
          onError={(error) => {
            console.error('ChatWidget error:', error);
          }}
        >
          <ChatWidget />
        </ErrorBoundary>
      </VehicleProvider>
    </ErrorBoundary>
  );
}
