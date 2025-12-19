'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { HelpCircle, ArrowRight, Check, ChevronDown, Loader2, X } from 'lucide-react';
import { isValidVIN } from '@/services/vinDecoder';

export default function HomePage() {
  const router = useRouter();
  const [vin, setVin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showVinHelp, setShowVinHelp] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanVin = vin.trim().toUpperCase();

    if (!cleanVin) {
      setError('Please enter your VIN');
      return;
    }

    if (!isValidVIN(cleanVin)) {
      setError('Please enter a valid 17-character VIN');
      return;
    }

    setLoading(true);
    router.push(`/getoffer/vehicle?vin=${cleanVin}`);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#00264d]">
        {/* Admin Login Link - Top Right */}
        <div className="absolute top-4 right-4 z-10">
          <a 
            href="/admin/offers" 
            className="text-xs text-white/50 hover:text-white/80 transition-colors"
          >
            Admin Login
          </a>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="pt-12 pb-20 lg:pt-20 lg:pb-32">
            
            {/* Main Content Grid */}
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
              
              {/* Left: Text + Form */}
              <div className={`transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] tracking-tight uppercase">
                  GET A REAL OFFER
                  <span className="block">
                    IN 2 MINUTES
                  </span>
                </h1>
                
                <p className="mt-6 text-xl text-white/90 leading-relaxed max-w-lg">
                  Sell or trade your car 100% online. No haggling, no headaches.
                </p>

                {/* VIN Form */}
                <div className="mt-10">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                      <label htmlFor="vin" className="block text-sm font-semibold text-white mb-2">
                        Vehicle Identification Number (VIN)
                      </label>
                      <div className="relative">
                        <input
                          id="vin"
                          type="text"
                          value={vin}
                          onChange={(e) => {
                            setVin(e.target.value.toUpperCase());
                            setError('');
                          }}
                          placeholder="Enter your 17-character VIN"
                          maxLength={17}
                          className={`w-full px-5 py-4 text-lg font-mono tracking-widest border-2 rounded-xl bg-white transition-all duration-200 placeholder:text-gray-400 placeholder:tracking-normal placeholder:font-sans focus:outline-none focus:ring-4 ${error ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : 'border-gray-200 focus:border-[#0070cc] focus:ring-blue-50'}`}
                        />
                        {vin.length === 17 && !error && (
                          <div className="absolute right-4 top-1/2 -translate-y-1/2">
                            <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                              <Check className="w-4 h-4 text-white" />
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {error && (
                        <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
                          <X className="w-4 h-4" />
                          {error}
                        </p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-[#00A67C] text-white py-4 px-6 rounded-xl font-bold text-lg hover:bg-[#008f6b] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-green-900/20"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Getting your offer...
                        </>
                      ) : (
                        <>
                          Get Your Instant Offer
                          <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  </form>

                  {/* VIN Help */}
                  <div className="mt-4">
                    <button
                      onClick={() => setShowVinHelp(!showVinHelp)}
                      className="flex items-center gap-2 text-white/70 hover:text-white text-sm transition-colors"
                    >
                      <HelpCircle className="w-4 h-4" />
                      Where do I find my VIN?
                      <ChevronDown className={`w-4 h-4 transition-transform ${showVinHelp ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {showVinHelp && (
                      <div className="mt-3 bg-white/10 backdrop-blur-sm rounded-xl p-4 text-sm text-white/90">
                        <p className="font-semibold mb-2">Your VIN can be found:</p>
                        <ul className="space-y-1 ml-4 list-disc">
                          <li>On your vehicle registration or insurance card</li>
                          <li>On the driver&apos;s side dashboard (visible through windshield)</li>
                          <li>Inside the driver&apos;s door jamb</li>
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: Car Image */}
              <div className={`relative transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
                <div className="relative">
                  <Image
                    src="/silverado.jpg"
                    alt="Sell your car"
                    width={800}
                    height={500}
                    className="rounded-2xl shadow-2xl"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              How It Works
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              Get your offer in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Enter Your VIN',
                description: 'Start by entering your 17-character Vehicle Identification Number above.',
                icon: '🔍'
              },
              {
                step: '2',
                title: 'Tell Us About Your Car',
                description: 'Answer a few questions about your vehicle\'s condition and features.',
                icon: '📝'
              },
              {
                step: '3',
                title: 'Get Your Offer',
                description: 'Receive an instant, no-obligation offer you can redeem at any Quirk location.',
                icon: '💰'
              }
            ].map((item) => (
              <div key={item.step} className="relative bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow">
                <div className="absolute -top-4 left-8 w-8 h-8 bg-[#0070cc] text-white rounded-full flex items-center justify-center font-bold text-sm">
                  {item.step}
                </div>
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                Why Sell to Quirk?
              </h2>
              <div className="space-y-6">
                {[
                  {
                    title: 'Instant Cash Offers',
                    description: 'Get a competitive offer in minutes, not days. No waiting, no games.'
                  },
                  {
                    title: 'No Obligation',
                    description: 'Our offers are completely free with no pressure to sell.'
                  },
                  {
                    title: 'Trusted Dealer Network',
                    description: '17+ locations across MA & NH. New England\'s largest family-owned auto group.'
                  },
                  {
                    title: 'We Buy All Makes',
                    description: 'Whether it\'s a Honda, Ford, Tesla, or any other brand - we want it.'
                  }
                ].map((item, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{item.title}</h3>
                      <p className="text-gray-600 mt-1">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Image Grid */}
            <div className="relative grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="rounded-2xl overflow-hidden shadow-lg">
                  <Image
                    src="https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=400&q=80"
                    alt="Handshake deal"
                    width={400}
                    height={300}
                    className="w-full h-48 object-cover"
                  />
                </div>
                <div className="rounded-2xl overflow-hidden shadow-lg">
                  <Image
                    src="https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&w=400&q=80"
                    alt="Car keys handover"
                    width={400}
                    height={400}
                    className="w-full h-56 object-cover"
                  />
                </div>
              </div>
              <div className="space-y-4 pt-8">
                <div className="rounded-2xl overflow-hidden shadow-lg">
                  <Image
                    src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=400&q=80"
                    alt="Signing paperwork"
                    width={400}
                    height={400}
                    className="w-full h-56 object-cover"
                  />
                </div>
                <div className="rounded-2xl overflow-hidden shadow-lg">
                  <Image
                    src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=400&q=80"
                    alt="Driving experience"
                    width={400}
                    height={300}
                    className="w-full h-48 object-cover"
                  />
                </div>
              </div>
              
              {/* Overlay badge */}
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-white rounded-2xl shadow-xl px-6 py-4">
                <div className="flex items-center gap-4">
                  <div className="flex -space-x-2">
                    {['😊', '🙂', '😄'].map((emoji, i) => (
                      <div key={i} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-lg border-2 border-white">
                        {emoji}
                      </div>
                    ))}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">4.3/5 rating</p>
                    <p className="text-sm text-gray-500">from 2,500+ reviews</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Column 1: Contact - Left aligned */}
            <div>
              <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-gray-400">Contact</h4>
              <ul className="space-y-3 text-sm text-gray-300">
                <li>(603) 263-4552</li>
                <li>steve.obrien@quirkcars.com</li>
                <li>Mon-Sat: 9AM-8PM</li>
                <li>Sun: 11AM-5PM</li>
              </ul>
            </div>

            {/* Column 2: Description + Social Icons - Center aligned */}
            <div className="text-center">
              <p className="text-gray-300 text-sm leading-relaxed mb-6">
                Quirk Auto Dealers is New England&apos;s largest family-owned auto group, proudly serving Massachusetts and New Hampshire drivers. From Manchester NH to Greater Boston MA, explore our huge inventory of new and used vehicles across 18 dealerships. Get competitive pricing, easy financing, certified pre-owned cars, trucks &amp; SUVs from top brands, plus expert service and genuine OEM parts.
              </p>
              
              {/* Social Media Icons */}
              <div className="flex justify-center gap-4">
                <a 
                  href="https://www.facebook.com/QuirkAutoDealers/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 flex items-center justify-center rounded-md bg-slate-800 hover:bg-slate-700 transition-colors"
                  aria-label="Facebook"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-5 h-5">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a 
                  href="https://www.linkedin.com/company/quirk-auto-dealers/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 flex items-center justify-center rounded-md bg-slate-800 hover:bg-slate-700 transition-colors"
                  aria-label="LinkedIn"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-5 h-5">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                <a 
                  href="https://x.com/quirkcars" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 flex items-center justify-center rounded-md bg-slate-800 hover:bg-slate-700 transition-colors"
                  aria-label="X (Twitter)"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-5 h-5">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
                <a 
                  href="https://www.instagram.com/quirkcars/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 flex items-center justify-center rounded-md bg-slate-800 hover:bg-slate-700 transition-colors"
                  aria-label="Instagram"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-5 h-5">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                  </svg>
                </a>
                <a 
                  href="https://www.youtube.com/channel/UCy99Nj1jI6PadfPxe7Zl7xQ" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 flex items-center justify-center rounded-md bg-slate-800 hover:bg-slate-700 transition-colors"
                  aria-label="YouTube"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-5 h-5">
                    <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Column 3: Legal - Right aligned */}
            <div className="text-right">
              <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-gray-400">Legal</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="https://www.quirkcars.com/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="https://www.quirkcars.com/privacy-policy" className="text-gray-300 hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Accessibility</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-6 text-center text-sm text-gray-500">
            © {new Date().getFullYear()} Quirk Auto Dealers. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
