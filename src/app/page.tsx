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
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#f0f7ff] via-white to-white" />
        
        {/* Decorative circles */}
        <div className="absolute top-20 -right-40 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-blue-50 to-transparent opacity-60" />
        <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] rounded-full bg-gradient-to-tr from-blue-50 to-transparent opacity-40" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="pt-8 pb-20 lg:pt-16 lg:pb-32">
            
            {/* Main Content Grid */}
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
              
              {/* Left: Text + Form */}
              <div className={`transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-[1.1] tracking-tight">
                  Get a real offer in
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#0070cc] to-[#0088ff]">
                    2 minutes or less
                  </span>
                </h1>
                
                <p className="mt-6 text-xl text-gray-600 leading-relaxed max-w-lg">
                  Enter your VIN for an instant cash offer. No haggling, no hidden fees — just a fair price for your car.
                </p>

                {/* VIN Form */}
                <div className="mt-10">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                      <label htmlFor="vin" className="block text-sm font-semibold text-gray-700 mb-2">
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
                          className={`
                            w-full px-5 py-4 text-lg font-mono tracking-widest
                            border-2 rounded-xl bg-white
                            transition-all duration-200
                            placeholder:text-gray-400 placeholder:tracking-normal placeholder:font-sans
                            focus:outline-none focus:ring-4
                            ${error 
                              ? 'border-blue-400 focus:border-blue-500 focus:ring-blue-100' 
                              : 'border-gray-200 focus:border-[#0070cc] focus:ring-blue-50'
                            }
                          `}
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
                        <p className="mt-2 text-sm text-blue-600 flex items-center gap-1">
                          <X className="w-4 h-4" />
                          {error}
                        </p>
                      )}
                      
                      <button
                        type="button"
                        onClick={() => setShowVinHelp(!showVinHelp)}
                        className="mt-3 text-sm text-gray-500 hover:text-[#0070cc] flex items-center gap-1.5 transition-colors"
                      >
                        <HelpCircle className="w-4 h-4" />
                        Where do I find my VIN?
                        <ChevronDown className={`w-4 h-4 transition-transform ${showVinHelp ? 'rotate-180' : ''}`} />
                      </button>
                    </div>

                    {/* VIN Help Panel */}
                    {showVinHelp && (
                      <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 animate-fadeIn">
                        <p className="font-semibold text-gray-800 mb-3">Find your VIN in these locations:</p>
                        <div className="grid sm:grid-cols-2 gap-3">
                          {[
                            { icon: '🚗', text: 'Driver-side dashboard (visible through windshield)' },
                            { icon: '🚪', text: 'Inside driver-side door jamb' },
                            { icon: '📄', text: 'Vehicle registration card' },
                            { icon: '📋', text: 'Insurance documents' },
                          ].map((item, i) => (
                            <div key={i} className="flex items-start gap-2 text-sm text-gray-600">
                              <span className="text-base">{item.icon}</span>
                              <span>{item.text}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className={`
                        w-full sm:w-auto px-8 py-4 text-lg font-semibold text-white
                        rounded-xl shadow-lg
                        transition-all duration-200
                        flex items-center justify-center gap-3
                        ${loading 
                          ? 'bg-gray-400 cursor-not-allowed' 
                          : 'bg-[#0070cc] hover:bg-[#005fa3] hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0'
                        }
                      `}
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

                  <p className="mt-4 text-xs text-gray-400">
                    By continuing, you agree to our{' '}
                    <a href="#" className="underline hover:text-gray-600">Terms of Service</a>
                    {' '}and{' '}
                    <a href="#" className="underline hover:text-gray-600">Privacy Policy</a>
                  </p>
                </div>
              </div>

              {/* Right: Car Image */}
              <div className={`relative transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
                <div className="relative">
                  {/* Glow effect behind car */}
                  <div className="absolute inset-0 bg-gradient-to-r from-[#0070cc]/10 to-blue-500/10 rounded-full blur-3xl scale-110" />
                  
                  {/* Car Image */}
                  <div className="relative">
                    <Image
                      src="https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80"
                      alt="Sell your car"
                      width={700}
                      height={450}
                      className="w-full h-auto object-contain drop-shadow-2xl"
                      priority
                    />
                  </div>
                  
                  {/* Floating badges */}
                  <div className="absolute -left-4 top-1/4 bg-white rounded-2xl shadow-xl p-4 animate-float">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                        <span className="text-2xl">💰</span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Instant offer</p>
                        <p className="text-lg font-bold text-gray-900">In 2 minutes</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="absolute -right-4 bottom-1/4 bg-white rounded-2xl shadow-xl p-4 animate-float-delayed">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-2xl">✓</span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">No obligation</p>
                        <p className="text-lg font-bold text-gray-900">100% free</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="py-8 bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center items-center gap-8 lg:gap-16">
            {[
              { value: '17+', label: 'Dealership Locations' },
              { value: '30K+', label: 'Cars Purchased' },
              { value: '4.8★', label: 'Customer Rating' },
              { value: '24hr', label: 'Offer Valid' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-2xl lg:text-3xl font-bold text-[#0070cc]">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
              How it works
            </h2>
            <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
              Selling your car has never been easier. Get a real offer in minutes.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {[
              {
                step: '01',
                icon: '🔍',
                title: 'Enter your VIN',
                description: "We'll decode your VIN and instantly look up your vehicle's details, trim, and features.",
              },
              {
                step: '02',
                icon: '📝',
                title: 'Tell us about your car',
                description: "Answer a few quick questions about mileage, condition, and any features or upgrades.",
              },
              {
                step: '03',
                icon: '💵',
                title: 'Get your offer',
                description: "Receive a competitive cash offer valid for 7 days. Accept it or walk away — no pressure.",
              },
            ].map((item, i) => (
              <div 
                key={item.step} 
                className="relative group"
              >
                {/* Connector line */}
                {i < 2 && (
                  <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-gray-200 to-transparent" />
                )}
                
                <div className="relative bg-white rounded-2xl p-8 border border-gray-100 hover:border-gray-200 hover:shadow-xl transition-all duration-300">
                  {/* Step number */}
                  <div className="absolute -top-4 left-8 px-3 py-1 bg-[#0070cc] text-white text-xs font-bold rounded-full">
                    STEP {item.step}
                  </div>
                  
                  {/* Icon */}
                  <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">
                    {item.icon}
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {item.title}
                  </h3>
                  <p className="text-gray-500 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Quirk */}
      <section className="py-20 lg:py-28 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left content */}
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                Why sell to Quirk?
              </h2>
              <p className="mt-4 text-lg text-gray-500">
                New England's most trusted automotive network. Family-owned since 1973.
              </p>
              
              <div className="mt-10 space-y-6">
                {[
                  {
                    icon: '⚡',
                    title: 'Same-day payment',
                    desc: 'Get paid the same day you bring in your vehicle. No waiting for checks to clear.',
                  },
                  {
                    icon: '🎯',
                    title: 'Fair market pricing',
                    desc: 'Our offers are based on real-time market data. No lowball tactics.',
                  },
                  {
                    icon: '📋',
                    title: 'We handle the paperwork',
                    desc: 'Title transfer, registration, payoff — we take care of everything.',
                  },
                  {
                    icon: '🚗',
                    title: 'Trade-in or sell outright',
                    desc: 'Upgrade to a new vehicle or just cash out. Your choice.',
                  },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[#0070cc]/10 flex items-center justify-center text-xl">
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{item.title}</h3>
                      <p className="text-gray-500 text-sm mt-1">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Right image grid */}
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="rounded-2xl overflow-hidden shadow-lg">
                    <Image
                      src="https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=400&q=80"
                      alt="Car dealership"
                      width={400}
                      height={300}
                      className="w-full h-48 object-cover"
                    />
                  </div>
                  <div className="rounded-2xl overflow-hidden shadow-lg">
                    <Image
                      src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=400&q=80"
                      alt="Happy customer"
                      width={400}
                      height={400}
                      className="w-full h-56 object-cover"
                    />
                  </div>
                </div>
                <div className="space-y-4 pt-8">
                  <div className="rounded-2xl overflow-hidden shadow-lg">
                    <Image
                      src="https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=400&q=80"
                      alt="Car inspection"
                      width={400}
                      height={400}
                      className="w-full h-56 object-cover"
                    />
                  </div>
                  <div className="rounded-2xl overflow-hidden shadow-lg">
                    <Image
                      src="https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&w=400&q=80"
                      alt="Car keys handover"
                      width={400}
                      height={300}
                      className="w-full h-48 object-cover"
                    />
                  </div>
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
                    <p className="font-bold text-gray-900">4.8/5 rating</p>
                    <p className="text-sm text-gray-500">from 2,500+ reviews</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#0070cc]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white">
            Ready to get your offer?
          </h2>
          <p className="mt-4 text-xl text-white/80">
            It only takes 2 minutes. No obligation, no pressure.
          </p>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="mt-8 px-8 py-4 bg-white text-[#0070cc] font-semibold text-lg rounded-xl hover:bg-gray-100 transition-colors shadow-lg"
          >
            Start Now →
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12">
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-lg bg-[#0070cc] flex items-center justify-center font-bold text-xl">
                  Q
                </div>
                <span className="text-xl font-bold">QUIRK</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                New England's trusted automotive network with 17+ locations across Massachusetts and New Hampshire.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-gray-400">Quick Links</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="https://www.quirkchevynh.com" className="text-gray-300 hover:text-white transition-colors">Search Inventory</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Sell Your Car</a></li>
                <li><a href="https://www.quirkchevynh.com/service" className="text-gray-300 hover:text-white transition-colors">Service Center</a></li>
                <li><a href="https://www.quirkchevynh.com/finance" className="text-gray-300 hover:text-white transition-colors">Financing</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-gray-400">Contact</h4>
              <ul className="space-y-3 text-sm text-gray-300">
                <li>(603) 555-2000</li>
                <li>sell@quirkautodealers.com</li>
                <li>Mon-Sat: 9AM-8PM</li>
                <li>Sun: 11AM-5PM</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-gray-400">Legal</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Accessibility</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm text-gray-500">
            © {new Date().getFullYear()} Quirk Auto Dealers. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
