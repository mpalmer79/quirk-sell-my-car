
import type { Metadata } from 'next';
import './globals.css';
import { VehicleProvider } from '@/context/VehicleContext';
import Header from '@/components/Header';
import ChatWidget from '@/components/ChatWidget';

export const metadata: Metadata = {
  title: 'Sell Your Car | Quirk Auto Dealers',
  description: 'Get an instant cash offer for your car. Sell or trade your vehicle at Quirk Auto Dealers - New England\'s trusted automotive network.',
  keywords: 'sell my car, trade in car, instant car offer, Quirk Auto, car value, vehicle appraisal',
  openGraph: {
    title: 'Sell Your Car | Quirk Auto Dealers',
    description: 'Get an instant cash offer for your car at Quirk Auto Dealers.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-quirk-gray-50">
        <VehicleProvider>
          <Header />
          <main className="pt-16">
            {children}
          </main>
          <ChatWidget />
        </VehicleProvider>
      </body>
    </html>
  );
}
