import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import HomePage from '@/app/page';

// Mock next/navigation
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: React.ImgHTMLAttributes<HTMLImageElement> & { priority?: boolean }) => {
    const { priority, ...rest } = props;
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...rest} />;
  },
}));

// Mock window.scrollTo
Object.defineProperty(window, 'scrollTo', {
  value: jest.fn(),
  writable: true,
});

describe('HomePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('hero section', () => {
    it('renders main heading', () => {
      render(<HomePage />);
      
      expect(screen.getByText('GET A REAL OFFER')).toBeInTheDocument();
      expect(screen.getByText('IN 2 MINUTES')).toBeInTheDocument();
    });

    it('renders VIN input field', () => {
      render(<HomePage />);
      
      const input = screen.getByPlaceholderText('Enter your 17-character VIN');
      expect(input).toBeInTheDocument();
    });

    it('renders Get Your Offer button', () => {
      render(<HomePage />);
      
      expect(screen.getByText('Get Your Offer')).toBeInTheDocument();
    });

    it('shows VIN help when button clicked', () => {
      render(<HomePage />);
      
      const helpButton = screen.getByText('Where do I find my VIN?');
      fireEvent.click(helpButton);
      
      expect(screen.getByText('Find your VIN in these locations:')).toBeInTheDocument();
    });
  });

  describe('VIN validation', () => {
    it('shows error for empty VIN submission', async () => {
      render(<HomePage />);
      
      const submitButton = screen.getByText('Get Your Offer');
      fireEvent.click(submitButton);
      
      expect(await screen.findByText('Please enter your VIN')).toBeInTheDocument();
    });

    it('shows error for invalid VIN length', async () => {
      render(<HomePage />);
      
      const input = screen.getByPlaceholderText('Enter your 17-character VIN');
      fireEvent.change(input, { target: { value: 'ABC123' } });
      
      const submitButton = screen.getByText('Get Your Offer');
      fireEvent.click(submitButton);
      
      expect(await screen.findByText('Please enter a valid 17-character VIN')).toBeInTheDocument();
    });

    it('converts VIN to uppercase', () => {
      render(<HomePage />);
      
      const input = screen.getByPlaceholderText('Enter your 17-character VIN') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'abc123' } });
      
      expect(input.value).toBe('ABC123');
    });

    it('shows checkmark for valid 17-character VIN', () => {
      render(<HomePage />);
      
      const input = screen.getByPlaceholderText('Enter your 17-character VIN');
      fireEvent.change(input, { target: { value: '1GCVKNEC0MZ123456' } });
      
      // The checkmark should appear (green circle with check)
      const checkIcon = document.querySelector('.bg-green-500');
      expect(checkIcon).toBeInTheDocument();
    });

    it('navigates to vehicle page on valid VIN submit', async () => {
      render(<HomePage />);
      
      const input = screen.getByPlaceholderText('Enter your 17-character VIN');
      fireEvent.change(input, { target: { value: '1GCVKNEC0MZ123456' } });
      
      const submitButton = screen.getByText('Get Your Offer');
      fireEvent.click(submitButton);
      
      expect(mockPush).toHaveBeenCalledWith('/getoffer/vehicle?vin=1GCVKNEC0MZ123456');
    });
  });

  describe('trust bar', () => {
    it('renders dealership count', () => {
      render(<HomePage />);
      
      expect(screen.getByText('17+')).toBeInTheDocument();
      expect(screen.getByText('Dealership Locations')).toBeInTheDocument();
    });

    it('renders cars purchased count', () => {
      render(<HomePage />);
      
      expect(screen.getByText('30K+')).toBeInTheDocument();
      expect(screen.getByText('Cars Purchased')).toBeInTheDocument();
    });

    it('renders customer rating', () => {
      render(<HomePage />);
      
      expect(screen.getByText('4.3★')).toBeInTheDocument();
      expect(screen.getByText('Customer Rating')).toBeInTheDocument();
    });
  });

  describe('how it works section', () => {
    it('renders section heading', () => {
      render(<HomePage />);
      
      expect(screen.getByText('How it works')).toBeInTheDocument();
    });

    it('renders all three steps', () => {
      render(<HomePage />);
      
      expect(screen.getByText('Enter your VIN')).toBeInTheDocument();
      expect(screen.getByText('Tell us about your car')).toBeInTheDocument();
      expect(screen.getByText('Get your offer')).toBeInTheDocument();
    });
  });

  describe('why choose section', () => {
    it('renders section heading', () => {
      render(<HomePage />);
      
      expect(screen.getByText('Why sell to Quirk Auto Dealers?')).toBeInTheDocument();
    });

    it('renders benefits', () => {
      render(<HomePage />);
      
      expect(screen.getByText('Same-day payment')).toBeInTheDocument();
      expect(screen.getByText('Fair market pricing')).toBeInTheDocument();
      expect(screen.getByText('We handle the paperwork')).toBeInTheDocument();
      expect(screen.getByText('Trade-in or sell outright')).toBeInTheDocument();
    });
  });

  describe('CTA section', () => {
    it('renders CTA heading', () => {
      render(<HomePage />);
      
      expect(screen.getByText('Ready to get your offer?')).toBeInTheDocument();
    });

    it('renders Start Now button', () => {
      render(<HomePage />);
      
      expect(screen.getByText('Start Now →')).toBeInTheDocument();
    });

    it('scrolls to top when Start Now is clicked', () => {
      render(<HomePage />);
      
      const startButton = screen.getByText('Start Now →');
      fireEvent.click(startButton);
      
      expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
    });
  });

  describe('footer', () => {
    it('renders Quirk logo', () => {
      render(<HomePage />);
      
      const logos = screen.getAllByAltText('Quirk Auto Dealers');
      expect(logos.length).toBeGreaterThan(0);
    });

    it('renders company description', () => {
      render(<HomePage />);
      
      expect(screen.getByText(/Quirk Auto Dealers is the New England/)).toBeInTheDocument();
    });

    it('renders social media links', () => {
      render(<HomePage />);
      
      // Check for social media icons by alt text
      expect(screen.getByAltText('Facebook')).toBeInTheDocument();
      expect(screen.getByAltText('LinkedIn')).toBeInTheDocument();
      expect(screen.getByAltText('X')).toBeInTheDocument();
      expect(screen.getByAltText('Instagram')).toBeInTheDocument();
      expect(screen.getByAltText('YouTube')).toBeInTheDocument();
    });

    it('renders contact information', () => {
      render(<HomePage />);
      
      // Phone number appears multiple times on the page
      const phoneNumbers = screen.getAllByText('(603) 263-4552');
      expect(phoneNumbers.length).toBeGreaterThan(0);
    });

    it('renders business hours', () => {
      render(<HomePage />);
      
      expect(screen.getByText('Mon-Sat: 9AM-8PM')).toBeInTheDocument();
      expect(screen.getByText('Sun: 11AM-5PM')).toBeInTheDocument();
    });

    it('renders legal links', () => {
      render(<HomePage />);
      
      // Multiple occurrences of these links
      const privacyLinks = screen.getAllByText('Privacy Policy');
      const termsLinks = screen.getAllByText('Terms of Service');
      
      expect(privacyLinks.length).toBeGreaterThan(0);
      expect(termsLinks.length).toBeGreaterThan(0);
    });

    it('renders copyright', () => {
      render(<HomePage />);
      
      const year = new Date().getFullYear();
      expect(screen.getByText(`© ${year} Quirk Auto Dealers. All rights reserved.`)).toBeInTheDocument();
    });
  });
});
