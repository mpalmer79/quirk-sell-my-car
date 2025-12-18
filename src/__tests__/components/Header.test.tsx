import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Header from '@/components/Header';

describe('Header', () => {
  beforeEach(() => {
    // Reset scroll position
    Object.defineProperty(window, 'scrollY', {
      value: 0,
      writable: true,
    });
  });

  describe('rendering', () => {
    it('should render the Quirk logo', () => {
      render(<Header />);
      
      const logo = screen.getByAltText('Quirk Auto Dealers');
      expect(logo).toBeInTheDocument();
      expect(logo).toHaveAttribute('src', '/quirk-logo.png');
    });

    it('should render navigation links', () => {
      render(<Header />);
      
      expect(screen.getAllByText('Buy a Car').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Sell/Trade').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Service').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Financing').length).toBeGreaterThan(0);
    });

    it('should render phone number', () => {
      render(<Header />);
      
      const phoneLinks = screen.getAllByText('(603) 263-4552');
      expect(phoneLinks.length).toBeGreaterThan(0);
    });

    it('should render Get Your Offer CTA button', () => {
      render(<Header />);
      
      const ctaButtons = screen.getAllByText('Get Your Offer');
      expect(ctaButtons.length).toBeGreaterThan(0);
    });

    it('should render mobile menu toggle button', () => {
      render(<Header />);
      
      const menuButton = screen.getByLabelText('Toggle menu');
      expect(menuButton).toBeInTheDocument();
    });
  });

  describe('navigation links', () => {
    it('should link to quirkchevynh.com for Buy a Car', () => {
      render(<Header />);
      
      const buyCarLinks = screen.getAllByText('Buy a Car');
      const link = buyCarLinks[0].closest('a');
      
      expect(link).toHaveAttribute('href', 'https://www.quirkchevynh.com');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('should link to homepage for Sell/Trade', () => {
      render(<Header />);
      
      const sellTradeLinks = screen.getAllByText('Sell/Trade');
      const link = sellTradeLinks[0].closest('a');
      
      expect(link).toHaveAttribute('href', '/');
    });

    it('should highlight Sell/Trade as active', () => {
      render(<Header />);
      
      const sellTradeLinks = screen.getAllByText('Sell/Trade');
      const link = sellTradeLinks[0].closest('a');
      
      expect(link).toHaveClass('text-[#0070cc]');
      expect(link).toHaveClass('bg-blue-50');
    });

    it('should link to service page', () => {
      render(<Header />);
      
      const serviceLinks = screen.getAllByText('Service');
      const link = serviceLinks[0].closest('a');
      
      expect(link).toHaveAttribute('href', 'https://www.quirkchevynh.com/service');
    });

    it('should link to financing page', () => {
      render(<Header />);
      
      const financingLinks = screen.getAllByText('Financing');
      const link = financingLinks[0].closest('a');
      
      expect(link).toHaveAttribute('href', 'https://www.quirkchevynh.com/finance');
    });
  });

  describe('mobile menu', () => {
    it('should not show mobile menu initially', () => {
      render(<Header />);
      
      const mobileNav = document.querySelector('.lg\\:hidden.py-4');
      expect(mobileNav).not.toBeInTheDocument();
    });

    it('should show mobile menu when toggle is clicked', () => {
      render(<Header />);
      
      const menuButton = screen.getByLabelText('Toggle menu');
      fireEvent.click(menuButton);
      
      // Mobile menu should now be visible
      const mobileNav = document.querySelector('.lg\\:hidden.py-4');
      expect(mobileNav).toBeInTheDocument();
    });

    it('should hide mobile menu when toggle is clicked again', () => {
      render(<Header />);
      
      const menuButton = screen.getByLabelText('Toggle menu');
      
      // Open menu
      fireEvent.click(menuButton);
      expect(document.querySelector('.lg\\:hidden.py-4')).toBeInTheDocument();
      
      // Close menu
      fireEvent.click(menuButton);
      expect(document.querySelector('.lg\\:hidden.py-4')).not.toBeInTheDocument();
    });

    it('should close mobile menu when a link is clicked', () => {
      render(<Header />);
      
      const menuButton = screen.getByLabelText('Toggle menu');
      fireEvent.click(menuButton);
      
      // Click on a navigation link in the mobile menu
      const mobileLinks = document.querySelectorAll('.lg\\:hidden.py-4 a');
      const sellTradeLink = Array.from(mobileLinks).find(link => 
        link.textContent?.includes('Sell/Trade')
      );
      
      if (sellTradeLink) {
        fireEvent.click(sellTradeLink);
      }
      
      // Menu should be closed
      expect(document.querySelector('.lg\\:hidden.py-4')).not.toBeInTheDocument();
    });
  });

  describe('scroll behavior', () => {
    it('should not have scrolled styles initially', () => {
      render(<Header />);
      
      const header = document.querySelector('header');
      expect(header).toHaveClass('bg-white');
      expect(header).not.toHaveClass('bg-white/95');
    });

    it('should add scrolled styles when scrollY > 10', () => {
      render(<Header />);
      
      // Simulate scroll
      Object.defineProperty(window, 'scrollY', { value: 50 });
      fireEvent.scroll(window);
      
      const header = document.querySelector('header');
      expect(header).toHaveClass('bg-white/95');
      expect(header).toHaveClass('backdrop-blur-md');
      expect(header).toHaveClass('shadow-sm');
    });

    it('should remove scrolled styles when scrolling back to top', () => {
      render(<Header />);
      
      // Scroll down
      Object.defineProperty(window, 'scrollY', { value: 50 });
      fireEvent.scroll(window);
      
      // Scroll back to top
      Object.defineProperty(window, 'scrollY', { value: 0 });
      fireEvent.scroll(window);
      
      const header = document.querySelector('header');
      expect(header).not.toHaveClass('bg-white/95');
    });

    it('should clean up scroll listener on unmount', () => {
      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
      
      const { unmount } = render(<Header />);
      unmount();
      
      expect(removeEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
      
      removeEventListenerSpy.mockRestore();
    });
  });

  describe('phone link', () => {
    it('should have correct tel: href', () => {
      render(<Header />);
      
      const phoneLinks = screen.getAllByText('(603) 263-4552');
      const link = phoneLinks[0].closest('a');
      
      expect(link).toHaveAttribute('href', 'tel:+16032634552');
    });
  });

  describe('logo link', () => {
    it('should link to Quirk Chevy NH website', () => {
      render(<Header />);
      
      const logo = screen.getByAltText('Quirk Auto Dealers');
      const link = logo.closest('a');
      
      expect(link).toHaveAttribute('href', 'https://www.quirkchevynh.com');
    });
  });

  describe('accessibility', () => {
    it('should have accessible menu toggle button', () => {
      render(<Header />);
      
      const menuButton = screen.getByLabelText('Toggle menu');
      expect(menuButton).toBeInTheDocument();
    });

    it('should have logo alt text', () => {
      render(<Header />);
      
      const logo = screen.getByAltText('Quirk Auto Dealers');
      expect(logo).toBeInTheDocument();
    });
  });
});
