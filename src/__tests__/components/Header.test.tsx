import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Header from '@/components/Header';

describe('Header', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'scrollY', { value: 0, writable: true });
  });

  describe('rendering', () => {
    it('renders Quirk logo', () => {
      render(<Header />);
      expect(screen.getByAltText('Quirk Auto Dealers')).toBeInTheDocument();
    });

    it('renders navigation links', () => {
      render(<Header />);
      expect(screen.getAllByText('Buy a Car').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Sell/Trade').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Service').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Financing').length).toBeGreaterThan(0);
    });

    it('renders phone number', () => {
      render(<Header />);
      const phoneLinks = screen.getAllByText('(603) 263-4552');
      expect(phoneLinks.length).toBeGreaterThan(0);
    });

    it('renders Get Your Offer button', () => {
      render(<Header />);
      const buttons = screen.getAllByText('Get Your Offer');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('renders mobile menu toggle', () => {
      render(<Header />);
      expect(screen.getByLabelText('Toggle menu')).toBeInTheDocument();
    });
  });

  describe('mobile menu', () => {
    it('opens when toggle clicked', () => {
      render(<Header />);
      
      fireEvent.click(screen.getByLabelText('Toggle menu'));
      
      const mobileMenu = document.querySelector('.lg\\:hidden.py-4');
      expect(mobileMenu).toBeInTheDocument();
    });

    it('closes when toggle clicked again', () => {
      render(<Header />);
      
      fireEvent.click(screen.getByLabelText('Toggle menu'));
      fireEvent.click(screen.getByLabelText('Toggle menu'));
      
      const mobileMenu = document.querySelector('.lg\\:hidden.py-4');
      expect(mobileMenu).not.toBeInTheDocument();
    });
  });

  describe('scroll behavior', () => {
    it('adds shadow on scroll', () => {
      render(<Header />);
      
      Object.defineProperty(window, 'scrollY', { value: 50 });
      fireEvent.scroll(window);
      
      const header = document.querySelector('header');
      expect(header).toHaveClass('shadow-sm');
    });
  });

  describe('links', () => {
    it('has correct phone tel: href', () => {
      render(<Header />);
      
      const phoneLinks = screen.getAllByText('(603) 263-4552');
      const link = phoneLinks[0].closest('a');
      expect(link).toHaveAttribute('href', 'tel:+16032634552');
    });
  });
});
