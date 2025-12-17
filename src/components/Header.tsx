
'use client';

import Link from 'next/link';
import { Car, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-quirk-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-lg gradient-quirk flex items-center justify-center group-hover:scale-105 transition-transform">
              <Car className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-quirk-red tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
                QUIRK
              </span>
              <span className="text-[10px] text-quirk-gray-500 -mt-1 tracking-wide">
                AUTO DEALERS
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="https://www.quirkchevynh.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-quirk-gray-600 hover:text-quirk-red transition-colors"
            >
              Search Cars
            </Link>
            <Link
              href="/"
              className="text-sm font-medium text-quirk-red"
            >
              Sell/Trade
            </Link>
            <Link
              href="https://www.quirkchevynh.com/service"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-quirk-gray-600 hover:text-quirk-red transition-colors"
            >
              Service
            </Link>
            <Link
              href="https://www.quirkchevynh.com/finance"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-quirk-gray-600 hover:text-quirk-red transition-colors"
            >
              Financing
            </Link>
          </nav>

          {/* CTA Button */}
          <div className="hidden md:block">
            <Link
              href="tel:+16035552000"
              className="btn-primary text-sm py-2 px-4"
            >
              Call (603) 555-2000
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-quirk-gray-100 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-quirk-gray-700" />
            ) : (
              <Menu className="w-6 h-6 text-quirk-gray-700" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-quirk-gray-100 animate-slide-in">
            <nav className="flex flex-col gap-2">
              <Link
                href="https://www.quirkchevynh.com"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-3 rounded-lg text-quirk-gray-600 hover:bg-quirk-gray-50 hover:text-quirk-red transition-colors"
              >
                Search Cars
              </Link>
              <Link
                href="/"
                className="px-4 py-3 rounded-lg bg-quirk-red/10 text-quirk-red font-medium"
              >
                Sell/Trade
              </Link>
              <Link
                href="https://www.quirkchevynh.com/service"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-3 rounded-lg text-quirk-gray-600 hover:bg-quirk-gray-50 hover:text-quirk-red transition-colors"
              >
                Service
              </Link>
              <Link
                href="https://www.quirkchevynh.com/finance"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-3 rounded-lg text-quirk-gray-600 hover:bg-quirk-gray-50 hover:text-quirk-red transition-colors"
              >
                Financing
              </Link>
              <div className="pt-2 px-4">
                <Link
                  href="tel:+16035552000"
                  className="btn-primary block text-center text-sm py-3"
                >
                  Call (603) 555-2000
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
