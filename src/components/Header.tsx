'use client';

import Link from 'next/link';
import { Menu, X, Phone } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-sm' 
          : 'bg-white'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <img 
              src="/quirk-logo.png" 
              alt="Quirk Auto Dealers" 
              className="h-10 w-auto group-hover:opacity-80 transition-opacity"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {[
              { label: 'Buy a Car', href: 'https://www.quirkchevynh.com', external: true },
              { label: 'Sell/Trade', href: '/', active: true },
              { label: 'Service', href: 'https://www.quirkchevynh.com/service', external: true },
              { label: 'Financing', href: 'https://www.quirkchevynh.com/finance', external: true },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                target={item.external ? '_blank' : undefined}
                rel={item.external ? 'noopener noreferrer' : undefined}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  item.active 
                    ? 'text-[#C41230] bg-red-50' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* CTA Button */}
          <div className="hidden lg:flex items-center gap-4">
            <a
              href="tel:+16035552000"
              className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-[#C41230] transition-colors"
            >
              <Phone className="w-4 h-4" />
              (603) 555-2000
            </a>
            <Link
              href="/"
              className="px-5 py-2.5 bg-[#C41230] text-white text-sm font-semibold rounded-xl hover:bg-[#a50f28] transition-colors shadow-lg shadow-red-500/20"
            >
              Get Your Offer
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-700" />
            ) : (
              <Menu className="w-6 h-6 text-gray-700" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gray-100 animate-fadeIn">
            <nav className="flex flex-col gap-1">
              {[
                { label: 'Buy a Car', href: 'https://www.quirkchevynh.com', external: true },
                { label: 'Sell/Trade', href: '/', active: true },
                { label: 'Service', href: 'https://www.quirkchevynh.com/service', external: true },
                { label: 'Financing', href: 'https://www.quirkchevynh.com/finance', external: true },
              ].map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  target={item.external ? '_blank' : undefined}
                  rel={item.external ? 'noopener noreferrer' : undefined}
                  className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    item.active 
                      ? 'text-[#C41230] bg-red-50' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              
              <div className="pt-4 mt-2 border-t border-gray-100 space-y-3 px-4">
                <a
                  href="tel:+16035552000"
                  className="flex items-center justify-center gap-2 py-3 text-sm font-medium text-gray-600 hover:text-[#C41230] transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  (603) 555-2000
                </a>
                <Link
                  href="/"
                  className="block w-full py-3 bg-[#C41230] text-white text-sm font-semibold rounded-xl text-center hover:bg-[#a50f28] transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Get Your Offer
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
