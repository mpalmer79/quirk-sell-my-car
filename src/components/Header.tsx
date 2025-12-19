'use client';

import { useState, useEffect } from 'react';

export default function Header() {
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
          {/* Left: HOME Button */}
          <a
            href="https://quirk-sell-my-car.vercel.app/"
            className="bg-[#0070cc] text-white px-6 py-2.5 rounded-full font-semibold hover:bg-[#005fa3] transition-colors"
          >
            HOME
          </a>

          {/* Center: Logo */}
          <a 
            href="https://www.quirkchevynh.com" 
            target="_blank"
            rel="noopener noreferrer"
            className="absolute left-1/2 transform -translate-x-1/2 flex items-center group"
          >
            <img 
              src="/quirk-logo.png" 
              alt="Quirk Auto Dealers" 
              className="h-12 lg:h-16 w-auto group-hover:opacity-80 transition-opacity"
            />
          </a>

          {/* Right: Phone Number */}
          <div className="flex items-center gap-2 text-gray-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <span className="font-medium">(603) 263-4552</span>
          </div>
        </div>
      </div>
    </header>
  );
}
