import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HomePage from '@/app/page';

const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
  }),
}));

jest.mock('@/services/vinDecoder', () => ({
  isValidVIN: jest.fn(),
}));

import { isValidVIN } from '@/services/vinDecoder';

const mockIsValidVIN = isValidVIN as jest.MockedFunction<typeof isValidVIN>;

describe('HomePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsValidVIN.mockReturnValue(true);
  });

  describe('rendering', () => {
    it('renders hero headline', () => {
      render(<HomePage />);
      expect(screen.getByText('GET A REAL OFFER')).toBeInTheDocument();
      expect(screen.getByText('IN 2 MINUTES')).toBeInTheDocument();
    });

    it('renders VIN input', () => {
      render(<HomePage />);
      expect(screen.getByPlaceholderText('Enter your 17-character VIN')).toBeInTheDocument();
    });

    it('renders Get Your Offer button', () => {
      render(<HomePage />);
      expect(screen.getByRole('button', { name: /Get Your Offer/i })).toBeInTheDocument();
    });

    it('renders VIN help button', () => {
      render(<HomePage />);
      expect(screen.getByText(/Where do I find my VIN/i)).toBeInTheDocument();
    });

    it('renders value propositions', () => {
      render(<HomePage />);
      expect(screen.getByText('Same-day payment')).toBeInTheDocument();
      expect(screen.getByText('Fair market pricing')).toBeInTheDocument();
    });
  });

  describe('VIN input', () => {
    it('converts to uppercase', async () => {
      render(<HomePage />);
      
      const input = screen.getByPlaceholderText('Enter your 17-character VIN') as HTMLInputElement;
      await userEvent.type(input, '1gcvknec0mz123456');
      
      expect(input.value).toBe('1GCVKNEC0MZ123456');
    });

    it('has maxLength of 17', () => {
      render(<HomePage />);
      
      const input = screen.getByPlaceholderText('Enter your 17-character VIN');
      expect(input).toHaveAttribute('maxLength', '17');
    });

    it('shows checkmark when 17 chars entered and valid', async () => {
      mockIsValidVIN.mockReturnValue(true);
      render(<HomePage />);
      
      const input = screen.getByPlaceholderText('Enter your 17-character VIN');
      await userEvent.type(input, '1GCVKNEC0MZ123456');
      
      const checkmark = document.querySelector('.bg-green-500');
      expect(checkmark).toBeInTheDocument();
    });
  });

  describe('form submission', () => {
    it('shows error when VIN is empty', async () => {
      render(<HomePage />);
      
      fireEvent.click(screen.getByRole('button', { name: /Get Your Offer/i }));
      
      expect(screen.getByText('Please enter your VIN')).toBeInTheDocument();
    });

    it('shows error when VIN is invalid', async () => {
      mockIsValidVIN.mockReturnValue(false);
      render(<HomePage />);
      
      const input = screen.getByPlaceholderText('Enter your 17-character VIN');
      await userEvent.type(input, 'INVALID');
      fireEvent.click(screen.getByRole('button', { name: /Get Your Offer/i }));
      
      expect(screen.getByText(/valid 17-character VIN/i)).toBeInTheDocument();
    });

    it('navigates to vehicle page with valid VIN', async () => {
      mockIsValidVIN.mockReturnValue(true);
      render(<HomePage />);
      
      const input = screen.getByPlaceholderText('Enter your 17-character VIN');
      await userEvent.type(input, '1GCVKNEC0MZ123456');
      fireEvent.click(screen.getByRole('button', { name: /Get Your Offer/i }));
      
      expect(mockPush).toHaveBeenCalledWith('/getoffer/vehicle?vin=1GCVKNEC0MZ123456');
    });

    it('shows loading state', async () => {
      mockIsValidVIN.mockReturnValue(true);
      render(<HomePage />);
      
      const input = screen.getByPlaceholderText('Enter your 17-character VIN');
      await userEvent.type(input, '1GCVKNEC0MZ123456');
      fireEvent.click(screen.getByRole('button', { name: /Get Your Offer/i }));
      
      expect(screen.getByText(/Looking up your vehicle/i)).toBeInTheDocument();
    });

    it('clears error when typing', async () => {
      mockIsValidVIN.mockReturnValue(false);
      render(<HomePage />);
      
      const input = screen.getByPlaceholderText('Enter your 17-character VIN');
      await userEvent.type(input, 'SHORT');
      fireEvent.click(screen.getByRole('button', { name: /Get Your Offer/i }));
      
      expect(screen.getByText(/valid 17-character VIN/i)).toBeInTheDocument();
      
      await userEvent.type(input, 'A');
      
      expect(screen.queryByText(/valid 17-character VIN/i)).not.toBeInTheDocument();
    });
  });

  describe('VIN help panel', () => {
    it('not visible initially', () => {
      render(<HomePage />);
      expect(screen.queryByText(/Driver-side dashboard/i)).not.toBeInTheDocument();
    });

    it('shows when clicked', () => {
      render(<HomePage />);
      
      fireEvent.click(screen.getByText(/Where do I find my VIN/i));
      
      expect(screen.getByText(/Driver-side dashboard/i)).toBeInTheDocument();
    });

    it('hides when clicked again', () => {
      render(<HomePage />);
      
      fireEvent.click(screen.getByText(/Where do I find my VIN/i));
      fireEvent.click(screen.getByText(/Where do I find my VIN/i));
      
      expect(screen.queryByText(/Driver-side dashboard/i)).not.toBeInTheDocument();
    });
  });

  describe('CTA section', () => {
    it('renders CTA', () => {
      render(<HomePage />);
      expect(screen.getByText('Ready to get your offer?')).toBeInTheDocument();
    });

    it('scrolls to top when Start Now clicked', () => {
      render(<HomePage />);
      
      fireEvent.click(screen.getByText('Start Now →'));
      
      expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
    });
  });

  describe('footer', () => {
    it('renders quick links', () => {
      render(<HomePage />);
      expect(screen.getByText('Search Inventory')).toBeInTheDocument();
      expect(screen.getByText('Sell Your Car')).toBeInTheDocument();
    });

    it('renders copyright', () => {
      render(<HomePage />);
      expect(screen.getByText(/Quirk Auto Dealers/)).toBeInTheDocument();
    });
  });
});
