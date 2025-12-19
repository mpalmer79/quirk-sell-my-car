import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import HomePage from '@/app/page';

// Mock next/navigation
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
}));

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: React.ImgHTMLAttributes<HTMLImageElement> & { src: string; alt: string; priority?: boolean }) => {
    const { priority, ...rest } = props;
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...rest} data-priority={priority ? 'true' : undefined} alt={props.alt} />;
  },
}));

// Mock fetch for VIN decoding
global.fetch = jest.fn();

describe('HomePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock window.scrollTo
    window.scrollTo = jest.fn();
  });

  describe('hero section', () => {
    it('renders main heading', () => {
      render(<HomePage />);
      
      expect(screen.getByText('GET A REAL OFFER')).toBeInTheDocument();
      expect(screen.getByText('IN 2 MINUTES')).toBeInTheDocument();
    });

    it('renders subheading', () => {
      render(<HomePage />);
      
      expect(screen.getByText(/Sell or trade your car 100% online/)).toBeInTheDocument();
    });

    it('renders VIN input field', () => {
      render(<HomePage />);
      
      const vinInput = screen.getByPlaceholderText(/Enter your 17-character VIN/i);
      expect(vinInput).toBeInTheDocument();
    });

    it('renders VIN help button', () => {
      render(<HomePage />);
      
      expect(screen.getByText(/Where do I find my VIN/i)).toBeInTheDocument();
    });

    it('renders Get Your Offer button', () => {
      render(<HomePage />);
      
      // Use getByRole to specifically target the button
      const submitButton = screen.getByRole('button', { name: /Get Your Offer/i });
      expect(submitButton).toBeInTheDocument();
    });

    it('renders Admin Login link', () => {
      render(<HomePage />);
      
      const adminLink = screen.getByText('Admin Login');
      expect(adminLink).toBeInTheDocument();
      expect(adminLink).toHaveAttribute('href', '/admin/offers');
    });
  });

  describe('VIN input validation', () => {
    it('accepts valid VIN input', () => {
      render(<HomePage />);
      
      const vinInput = screen.getByPlaceholderText(/Enter your 17-character VIN/i) as HTMLInputElement;
      fireEvent.change(vinInput, { target: { value: '1HGBH41JXMN109186' } });
      
      expect(vinInput.value).toBe('1HGBH41JXMN109186');
    });

    it('converts VIN to uppercase', () => {
      render(<HomePage />);
      
      const vinInput = screen.getByPlaceholderText(/Enter your 17-character VIN/i) as HTMLInputElement;
      fireEvent.change(vinInput, { target: { value: '1hgbh41jxmn109186' } });
      
      expect(vinInput.value).toBe('1HGBH41JXMN109186');
    });

    it('limits VIN to 17 characters', () => {
      render(<HomePage />);
      
      const vinInput = screen.getByPlaceholderText(/Enter your 17-character VIN/i) as HTMLInputElement;
      expect(vinInput).toHaveAttribute('maxLength', '17');
    });

    it('shows error for invalid VIN on submit', async () => {
      render(<HomePage />);
      
      const vinInput = screen.getByPlaceholderText(/Enter your 17-character VIN/i);
      const submitButton = screen.getByRole('button', { name: /Get Your Offer/i });
      
      fireEvent.change(vinInput, { target: { value: 'INVALID' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Please enter a valid 17-character VIN/i)).toBeInTheDocument();
      });
    });

    it('shows error when VIN is empty on submit', async () => {
      render(<HomePage />);
      
      const submitButton = screen.getByRole('button', { name: /Get Your Offer/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Please enter your VIN/i)).toBeInTheDocument();
      });
    });
  });

  describe('VIN help section', () => {
    it('toggles VIN help when clicking help button', () => {
      render(<HomePage />);
      
      const helpButton = screen.getByText(/Where do I find my VIN/i);
      
      // Initially hidden
      expect(screen.queryByText(/Driver-side dashboard/i)).not.toBeInTheDocument();
      
      // Click to show
      fireEvent.click(helpButton);
      expect(screen.getByText(/Driver-side dashboard/i)).toBeInTheDocument();
      
      // Click to hide
      fireEvent.click(helpButton);
      expect(screen.queryByText(/Driver-side dashboard/i)).not.toBeInTheDocument();
    });

    it('shows all VIN location options when help is expanded', () => {
      render(<HomePage />);
      
      const helpButton = screen.getByText(/Where do I find my VIN/i);
      fireEvent.click(helpButton);
      
      expect(screen.getByText(/Driver-side dashboard/i)).toBeInTheDocument();
      expect(screen.getByText(/driver-side door jamb/i)).toBeInTheDocument();
      expect(screen.getByText(/Vehicle registration card/i)).toBeInTheDocument();
      expect(screen.getByText(/Insurance documents/i)).toBeInTheDocument();
    });
  });

  describe('How It Works section', () => {
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

    it('renders step descriptions', () => {
      render(<HomePage />);
      
      expect(screen.getByText(/decode your VIN/i)).toBeInTheDocument();
      expect(screen.getByText(/quick questions about mileage/i)).toBeInTheDocument();
      expect(screen.getByText(/competitive cash offer/i)).toBeInTheDocument();
    });
  });

  describe('Why Quirk section', () => {
    it('renders section heading', () => {
      render(<HomePage />);
      
      expect(screen.getByText(/Why sell to Quirk/i)).toBeInTheDocument();
    });

    it('renders benefit items', () => {
      render(<HomePage />);
      
      expect(screen.getByText('Same-day payment')).toBeInTheDocument();
      expect(screen.getByText('Fair market pricing')).toBeInTheDocument();
      expect(screen.getByText('We handle the paperwork')).toBeInTheDocument();
      expect(screen.getByText('Trade-in or sell outright')).toBeInTheDocument();
    });

    it('renders benefit descriptions', () => {
      render(<HomePage />);
      
      expect(screen.getByText(/Get paid the same day/i)).toBeInTheDocument();
      expect(screen.getByText(/real-time market data/i)).toBeInTheDocument();
      expect(screen.getByText(/Title transfer, registration/i)).toBeInTheDocument();
    });
  });

  describe('Trust Bar section', () => {
    it('renders trust statistics', () => {
      render(<HomePage />);
      
      expect(screen.getByText('17+')).toBeInTheDocument();
      expect(screen.getByText('30K+')).toBeInTheDocument();
      expect(screen.getByText('4.3★')).toBeInTheDocument();
      expect(screen.getByText('24hr')).toBeInTheDocument();
    });

    it('renders trust labels', () => {
      render(<HomePage />);
      
      expect(screen.getByText('Dealership Locations')).toBeInTheDocument();
      expect(screen.getByText('Cars Purchased')).toBeInTheDocument();
      expect(screen.getByText('Customer Rating')).toBeInTheDocument();
      expect(screen.getByText('Offer Valid')).toBeInTheDocument();
    });
  });

  describe('footer', () => {
    it('renders contact information', () => {
      render(<HomePage />);
      
      expect(screen.getByText('Contact')).toBeInTheDocument();
      expect(screen.getByText('(603) 263-4552')).toBeInTheDocument();
      expect(screen.getByText('steve.obrien@quirkcars.com')).toBeInTheDocument();
    });

    it('renders business hours', () => {
      render(<HomePage />);
      
      expect(screen.getByText('Mon-Sat: 9AM-8PM')).toBeInTheDocument();
      expect(screen.getByText('Sun: 11AM-5PM')).toBeInTheDocument();
    });

    it('renders company description', () => {
      render(<HomePage />);
      
      expect(screen.getByText(/Quirk Auto Dealers is the New England/i)).toBeInTheDocument();
    });

    it('renders legal links', () => {
      render(<HomePage />);
      
      expect(screen.getByText('Legal')).toBeInTheDocument();
      // Use getAllByText since Privacy Policy appears twice (hero terms + footer)
      const privacyLinks = screen.getAllByText('Privacy Policy');
      expect(privacyLinks.length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('Terms of Service')).toBeInTheDocument();
      expect(screen.getByText('Accessibility')).toBeInTheDocument();
    });

    it('renders copyright', () => {
      render(<HomePage />);
      
      const currentYear = new Date().getFullYear();
      expect(screen.getByText(new RegExp(`© ${currentYear} Quirk Auto Dealers`))).toBeInTheDocument();
    });

    it('renders social media icons', () => {
      render(<HomePage />);
      
      expect(screen.getByAltText('Facebook')).toBeInTheDocument();
      expect(screen.getByAltText('LinkedIn')).toBeInTheDocument();
      expect(screen.getByAltText('X')).toBeInTheDocument();
      expect(screen.getByAltText('Instagram')).toBeInTheDocument();
      expect(screen.getByAltText('YouTube')).toBeInTheDocument();
    });
  });

  describe('form submission', () => {
    it('navigates to vehicle page with valid VIN', async () => {
      render(<HomePage />);
      
      const vinInput = screen.getByPlaceholderText(/Enter your 17-character VIN/i);
      const submitButton = screen.getByRole('button', { name: /Get Your Offer/i });
      
      fireEvent.change(vinInput, { target: { value: '1HGBH41JXMN109186' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/getoffer/vehicle?vin=1HGBH41JXMN109186');
      });
    });

    it('shows loading state during submission', async () => {
      render(<HomePage />);
      
      const vinInput = screen.getByPlaceholderText(/Enter your 17-character VIN/i);
      const submitButton = screen.getByRole('button', { name: /Get Your Offer/i });
      
      fireEvent.change(vinInput, { target: { value: '1HGBH41JXMN109186' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Looking up your vehicle/i)).toBeInTheDocument();
      });
    });

    it('does not submit with invalid VIN', async () => {
      render(<HomePage />);
      
      const vinInput = screen.getByPlaceholderText(/Enter your 17-character VIN/i);
      const submitButton = screen.getByRole('button', { name: /Get Your Offer/i });
      
      fireEvent.change(vinInput, { target: { value: 'INVALID' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockPush).not.toHaveBeenCalled();
      });
    });
  });
});
