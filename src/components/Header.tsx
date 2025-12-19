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
        <div className="flex items-center justify-center h-16 lg:h-20">
          {/* Logo */}
          <a 
            href="https://www.quirkcars.com" 
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center group"
          >
            <img 
              src="/quirk-logo.png" 
              alt="Quirk Auto Dealers" 
              className="h-12 lg:h-16 w-auto group-hover:opacity-80 transition-opacity"
            />
          </a>
        </div>
      </div>
    </header>
  );
}
