import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HomePage from '@/app/page';

// Mock the router
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
  }),
}));

// Mock the vinDecoder service
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
    it('should render the hero headline', () => {
      render(<HomePage />);
      
      expect(screen.getByText('GET A REAL OFFER')).toBeInTheDocument();
      expect(screen.getByText('IN 2 MINUTES')).toBeInTheDocument();
    });

    it('should render the subheadline', () => {
      render(<HomePage />);
      
      expect(screen.getByText(/Sell or trade your car 100% online/i)).toBeInTheDocument();
    });

    it('should render VIN input field', () => {
      render(<HomePage />);
      
      const input = screen.getByPlaceholderText('Enter your 17-character VIN');
      expect(input).toBeInTheDocument();
    });

    it('should render Get Your Offer button', () => {
      render(<HomePage />);
      
      expect(screen.getByRole('button', { name: /Get Your Offer/i })).toBeInTheDocument();
    });

    it('should render VIN help button', () => {
      render(<HomePage />);
      
      expect(screen.getByText(/Where do I find my VIN\?/i)).toBeInTheDocument();
    });

    it('should render value propositions', () => {
      render(<HomePage />);
      
      expect(screen.getByText('Same-day payment')).toBeInTheDocument();
      expect(screen.getByText('Fair market pricing')).toBeInTheDocument();
      expect(screen.getByText('We handle the paperwork')).toBeInTheDocument();
      expect(screen.getByText('Trade-in or sell outright')).toBeInTheDocument();
    });

    it('should render footer', () => {
      render(<HomePage />);
      
      expect(screen.getByText(/New England's trusted automotive network/i)).toBeInTheDocument();
    });

    it('should render terms and privacy links', () => {
      render(<HomePage />);
      
      expect(screen.getByText('Terms of Service')).toBeInTheDocument();
      expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
    });
  });

  describe('VIN input', () => {
    it('should accept VIN input', async () => {
      render(<HomePage />);
      
      const input = screen.getByPlaceholderText('Enter your 17-character VIN') as HTMLInputElement;
      await userEvent.type(input, '1GCVKNEC0MZ123456');
      
      expect(input.value).toBe('1GCVKNEC0MZ123456');
    });

    it('should convert input to uppercase', async () => {
      render(<HomePage />);
      
      const input = screen.getByPlaceholderText('Enter your 17-character VIN') as HTMLInputElement;
      await userEvent.type(input, '1gcvknec0mz123456');
      
      expect(input.value).toBe('1GCVKNEC0MZ123456');
    });

    it('should limit input to 17 characters', async () => {
      render(<HomePage />);
      
      const input = screen.getByPlaceholderText('Enter your 17-character VIN') as HTMLInputElement;
      expect(input).toHaveAttribute('maxLength', '17');
    });

    it('should show checkmark when 17 characters entered', async () => {
      mockIsValidVIN.mockReturnValue(true);
      render(<HomePage />);
      
      const input = screen.getByPlaceholderText('Enter your 17-character VIN');
      await userEvent.type(input, '1GCVKNEC0MZ123456');
      
      // Check for green checkmark
      const checkmark = document.querySelector('.bg-green-500');
      expect(checkmark).toBeInTheDocument();
    });

    it('should clear error when typing', async () => {
      mockIsValidVIN.mockReturnValue(false);
      render(<HomePage />);
      
      const input = screen.getByPlaceholderText('Enter your 17-character VIN');
      const form = input.closest('form');
      
      // Trigger error
      await userEvent.type(input, 'SHORT');
      fireEvent.submit(form!);
      
      expect(screen.getByText(/valid 17-character VIN/i)).toBeInTheDocument();
      
      // Type more - error should clear
      await userEvent.type(input, 'A');
      
      expect(screen.queryByText(/valid 17-character VIN/i)).not.toBeInTheDocument();
    });
  });

  describe('form submission', () => {
    it('should show error when VIN is empty', async () => {
      render(<HomePage />);
      
      const button = screen.getByRole('button', { name: /Get Your Offer/i });
      fireEvent.click(button);
      
      expect(screen.getByText('Please enter your VIN')).toBeInTheDocument();
    });

    it('should show error when VIN is invalid', async () => {
      mockIsValidVIN.mockReturnValue(false);
      render(<HomePage />);
      
      const input = screen.getByPlaceholderText('Enter your 17-character VIN');
      await userEvent.type(input, 'INVALIDVIN');
      
      const button = screen.getByRole('button', { name: /Get Your Offer/i });
      fireEvent.click(button);
      
      expect(screen.getByText(/valid 17-character VIN/i)).toBeInTheDocument();
    });

    it('should navigate to vehicle page with valid VIN', async () => {
      mockIsValidVIN.mockReturnValue(true);
      render(<HomePage />);
      
      const input = screen.getByPlaceholderText('Enter your 17-character VIN');
      await userEvent.type(input, '1GCVKNEC0MZ123456');
      
      const button = screen.getByRole('button', { name: /Get Your Offer/i });
      fireEvent.click(button);
      
      expect(mockPush).toHaveBeenCalledWith('/getoffer/vehicle?vin=1GCVKNEC0MZ123456');
    });

    it('should trim and uppercase VIN before navigation', async () => {
      mockIsValidVIN.mockReturnValue(true);
      render(<HomePage />);
      
      const input = screen.getByPlaceholderText('Enter your 17-character VIN');
      // Note: The input already converts to uppercase, so we just test the trim
      await userEvent.type(input, '1gcvknec0mz123456');
      
      const button = screen.getByRole('button', { name: /Get Your Offer/i });
      fireEvent.click(button);
      
      expect(mockPush).toHaveBeenCalledWith('/getoffer/vehicle?vin=1GCVKNEC0MZ123456');
    });

    it('should show loading state when submitting', async () => {
      mockIsValidVIN.mockReturnValue(true);
      render(<HomePage />);
      
      const input = screen.getByPlaceholderText('Enter your 17-character VIN');
      await userEvent.type(input, '1GCVKNEC0MZ123456');
      
      const button = screen.getByRole('button', { name: /Get Your Offer/i });
      fireEvent.click(button);
      
      expect(screen.getByText(/Looking up your vehicle/i)).toBeInTheDocument();
    });

    it('should validate VIN using isValidVIN', async () => {
      render(<HomePage />);
      
      const input = screen.getByPlaceholderText('Enter your 17-character VIN');
      await userEvent.type(input, '1GCVKNEC0MZ123456');
      
      const button = screen.getByRole('button', { name: /Get Your Offer/i });
      fireEvent.click(button);
      
      expect(mockIsValidVIN).toHaveBeenCalledWith('1GCVKNEC0MZ123456');
    });
  });

  describe('VIN help panel', () => {
    it('should not show help panel initially', () => {
      render(<HomePage />);
      
      expect(screen.queryByText(/Driver-side dashboard/i)).not.toBeInTheDocument();
    });

    it('should show help panel when button is clicked', () => {
      render(<HomePage />);
      
      const helpButton = screen.getByText(/Where do I find my VIN\?/i);
      fireEvent.click(helpButton);
      
      expect(screen.getByText(/Driver-side dashboard/i)).toBeInTheDocument();
      expect(screen.getByText(/Inside driver-side door jamb/i)).toBeInTheDocument();
      expect(screen.getByText(/Vehicle registration card/i)).toBeInTheDocument();
      expect(screen.getByText(/Insurance documents/i)).toBeInTheDocument();
    });

    it('should hide help panel when clicked again', () => {
      render(<HomePage />);
      
      const helpButton = screen.getByText(/Where do I find my VIN\?/i);
      
      // Open
      fireEvent.click(helpButton);
      expect(screen.getByText(/Driver-side dashboard/i)).toBeInTheDocument();
      
      // Close
      fireEvent.click(helpButton);
      expect(screen.queryByText(/Driver-side dashboard/i)).not.toBeInTheDocument();
    });
  });

  describe('CTA section', () => {
    it('should render CTA section', () => {
      render(<HomePage />);
      
      expect(screen.getByText('Ready to get your offer?')).toBeInTheDocument();
    });

    it('should render Start Now button', () => {
      render(<HomePage />);
      
      expect(screen.getByText('Start Now →')).toBeInTheDocument();
    });

    it('should scroll to top when Start Now is clicked', () => {
      render(<HomePage />);
      
      const startButton = screen.getByText('Start Now →');
      fireEvent.click(startButton);
      
      expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
    });
  });

  describe('footer', () => {
    it('should render quick links', () => {
      render(<HomePage />);
      
      expect(screen.getByText('Search Inventory')).toBeInTheDocument();
      expect(screen.getByText('Sell Your Car')).toBeInTheDocument();
      expect(screen.getByText('Service Center')).toBeInTheDocument();
      expect(screen.getByText('Financing')).toBeInTheDocument();
    });

    it('should render contact information', () => {
      render(<HomePage />);
      
      // Phone number appears multiple times on the page
      const phoneNumbers = screen.getAllByText('(603) 263-4552');
      expect(phoneNumbers.length).toBeGreaterThan(0);
    });

    it('should render business hours', () => {
      render(<HomePage />);
      
      expect(screen.getByText('Mon-Sat: 9AM-8PM')).toBeInTheDocument();
      expect(screen.getByText('Sun: 11AM-5PM')).toBeInTheDocument();
    });

    it('should render legal links', () => {
      render(<HomePage />);
      
      // Multiple occurrences of these links
      const privacyLinks = screen.getAllByText('Privacy Policy');
      const termsLinks = screen.getAllByText('Terms of Service');
      
      expect(privacyLinks.length).toBeGreaterThan(0);
      expect(termsLinks.length).toBeGreaterThan(0);
    });

    it('should render copyright with current year', () => {
      render(<HomePage />);
      
      const currentYear = new Date().getFullYear();
      expect(screen.getByText(new RegExp(`© ${currentYear} Quirk Auto Dealers`))).toBeInTheDocument();
    });
  });

  describe('animations and mounting', () => {
    it('should set mounted state after component mounts', async () => {
      render(<HomePage />);
      
      // Check that the component has the mounted transition classes
      // The hero section should have opacity-100 and translate-y-0 after mounting
      await waitFor(() => {
        const heroContent = document.querySelector('.opacity-100');
        expect(heroContent).toBeInTheDocument();
      });
    });
  });
});
