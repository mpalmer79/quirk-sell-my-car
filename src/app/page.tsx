
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Car, HelpCircle, ArrowRight, Shield, Clock, DollarSign, Loader2 } from 'lucide-react';
import { isValidVIN } from '@/services/vinDecoder';

export default function HomePage() {
  const router = useRouter();
  const [vin, setVin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showVinHelp, setShowVinHelp] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanVin = vin.trim().toUpperCase();

    if (!cleanVin) {
      setError('Please enter your VIN');
      return;
    }

    if (!isValidVIN(cleanVin)) {
      setError('Invalid VIN. Please enter a 17-character VIN (no I, O, or Q).');
      return;
    }

    setLoading(true);

    // Navigate to vehicle page with VIN
    router.push(`/getoffer/vehicle?vin=${cleanVin}`);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-quirk-gray-900 via-quirk-gray-800 to-quirk-black overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
                Get an Instant
                <span className="block text-quirk-red">Cash Offer</span>
                for Your Car
              </h1>
              <p className="mt-6 text-lg text-quirk-gray-300 max-w-xl mx-auto lg:mx-0">
                Sell or trade your vehicle in minutes. Get a competitive offer backed by New England's trusted dealership network.
              </p>

              {/* Trust badges */}
              <div className="mt-8 flex flex-wrap justify-center lg:justify-start gap-6">
                <div className="flex items-center gap-2 text-quirk-gray-400">
                  <Shield className="w-5 h-5 text-quirk-red" />
                  <span className="text-sm">No Obligation</span>
                </div>
                <div className="flex items-center gap-2 text-quirk-gray-400">
                  <Clock className="w-5 h-5 text-quirk-red" />
                  <span className="text-sm">5 Min Process</span>
                </div>
                <div className="flex items-center gap-2 text-quirk-gray-400">
                  <DollarSign className="w-5 h-5 text-quirk-red" />
                  <span className="text-sm">Same-Day Payment</span>
                </div>
              </div>
            </div>

            {/* Right - VIN Form */}
            <div className="bg-white rounded-2xl shadow-2xl p-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-full gradient-quirk mx-auto flex items-center justify-center mb-4">
                  <Car className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-quirk-gray-900" style={{ fontFamily: 'var(--font-display)' }}>
                  Start Your Offer
                </h2>
                <p className="text-quirk-gray-500 mt-1">Enter your VIN to get started</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="vin" className="block text-sm font-medium text-quirk-gray-700 mb-2">
                    Vehicle Identification Number (VIN)
                  </label>
                  <input
                    id="vin"
                    type="text"
                    value={vin}
                    onChange={(e) => {
                      setVin(e.target.value.toUpperCase());
                      setError('');
                    }}
                    placeholder="Enter 17-character VIN"
                    maxLength={17}
                    className={`input-field font-mono text-lg tracking-wider ${
                      error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
                    }`}
                  />
                  {error && (
                    <p className="mt-2 text-sm text-red-600">{error}</p>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowVinHelp(!showVinHelp)}
                    className="mt-2 text-sm text-quirk-red hover:underline flex items-center gap-1"
                  >
                    <HelpCircle className="w-4 h-4" />
                    Where is my VIN?
                  </button>
                </div>

                {/* VIN Help */}
                {showVinHelp && (
                  <div className="bg-quirk-gray-50 rounded-lg p-4 text-sm text-quirk-gray-600 animate-slide-in">
                    <p className="font-medium text-quirk-gray-800 mb-2">Find your VIN:</p>
                    <ul className="space-y-1 list-disc list-inside">
                      <li>Driver's side dashboard (visible through windshield)</li>
                      <li>Driver's door jamb sticker</li>
                      <li>Vehicle registration or insurance card</li>
                      <li>Vehicle title document</li>
                    </ul>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full flex items-center justify-center gap-2 text-lg py-4"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Looking up your vehicle...
                    </>
                  ) : (
                    <>
                      Get Your Offer
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>

              <p className="text-center text-xs text-quirk-gray-400 mt-4">
                By continuing, you agree to our{' '}
                <a href="#" className="text-quirk-red hover:underline">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="text-quirk-red hover:underline">Privacy Policy</a>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-quirk-gray-900" style={{ fontFamily: 'var(--font-display)' }}>
              How It Works
            </h2>
            <p className="mt-4 text-lg text-quirk-gray-500">
              Get your cash offer in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Enter Your VIN',
                description: 'We\'ll instantly look up your vehicle details and decode your VIN.',
              },
              {
                step: '2',
                title: 'Answer a Few Questions',
                description: 'Tell us about your vehicle\'s condition, features, and mileage.',
              },
              {
                step: '3',
                title: 'Get Your Offer',
                description: 'Receive a competitive cash offer valid for 7 days. No obligation.',
              },
            ].map((item) => (
              <div key={item.step} className="relative">
                <div className="card-hover text-center">
                  <div className="w-12 h-12 rounded-full gradient-quirk text-white text-xl font-bold flex items-center justify-center mx-auto mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-semibold text-quirk-gray-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-quirk-gray-500">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Quirk */}
      <section className="py-20 bg-quirk-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-quirk-gray-900" style={{ fontFamily: 'var(--font-display)' }}>
              Why Sell to Quirk?
            </h2>
            <p className="mt-4 text-lg text-quirk-gray-500">
              New England's trusted automotive network since 1995
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: '🏆', title: '17+ Locations', desc: 'Convenient locations across MA & NH' },
              { icon: '💰', title: 'Competitive Offers', desc: 'Market-based pricing you can trust' },
              { icon: '⚡', title: 'Fast Payment', desc: 'Get paid same-day, no waiting' },
              { icon: '🤝', title: 'No Pressure', desc: 'Your offer, your choice, no obligation' },
            ].map((item) => (
              <div key={item.title} className="card text-center">
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="font-semibold text-quirk-gray-900 mb-1">{item.title}</h3>
                <p className="text-sm text-quirk-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-quirk-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-lg gradient-quirk flex items-center justify-center">
                  <Car className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
                  QUIRK
                </span>
              </div>
              <p className="text-quirk-gray-400 text-sm">
                New England's trusted automotive network with 17+ locations in Massachusetts and New Hampshire.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-quirk-gray-400">
                <li><a href="https://www.quirkchevynh.com" className="hover:text-white transition-colors">Search Inventory</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Sell Your Car</a></li>
                <li><a href="https://www.quirkchevynh.com/service" className="hover:text-white transition-colors">Service Center</a></li>
                <li><a href="https://www.quirkchevynh.com/finance" className="hover:text-white transition-colors">Financing</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-quirk-gray-400">
                <li>(603) 555-2000</li>
                <li>sell@quirkautodealers.com</li>
                <li>Mon-Sat: 9AM-8PM</li>
                <li>Sun: 11AM-5PM</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-quirk-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Accessibility</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-quirk-gray-800 mt-8 pt-8 text-center text-sm text-quirk-gray-400">
            © {new Date().getFullYear()} Quirk Auto Dealers. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
