import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import HomePage from '@/app/page';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
}));

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: React.ImgHTMLAttributes<HTMLImageElement> & { src: string; alt: string }) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt} />;
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
      
      expect(screen.getByText(/Get Your Offer/i)).toBeInTheDocument();
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
      const submitButton = screen.getByText(/Get Your Offer/i);
      
      fireEvent.change(vinInput, { target: { value: 'INVALID' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Please enter a valid 17-character VIN/i)).toBeInTheDocument();
      });
    });
  });

  describe('VIN help section', () => {
    it('toggles VIN help when clicking help button', () => {
      render(<HomePage />);
      
      const helpButton = screen.getByText(/Where do I find my VIN/i);
      
      // Initially hidden
      expect(screen.queryByText(/Driver's side dashboard/i)).not.toBeInTheDocument();
      
      // Click to show
      fireEvent.click(helpButton);
      expect(screen.getByText(/Driver's side dashboard/i)).toBeInTheDocument();
      
      // Click to hide
      fireEvent.click(helpButton);
      expect(screen.queryByText(/Driver's side dashboard/i)).not.toBeInTheDocument();
    });
  });

  describe('How It Works section', () => {
    it('renders section heading', () => {
      render(<HomePage />);
      
      expect(screen.getByText('How It Works')).toBeInTheDocument();
    });

    it('renders all three steps', () => {
      render(<HomePage />);
      
      expect(screen.getByText('Enter Your VIN')).toBeInTheDocument();
      expect(screen.getByText('Answer Questions')).toBeInTheDocument();
      expect(screen.getByText('Get Your Offer')).toBeInTheDocument();
    });
  });

  describe('Why Quirk section', () => {
    it('renders section heading', () => {
      render(<HomePage />);
      
      expect(screen.getByText(/Why Quirk/i)).toBeInTheDocument();
    });

    it('renders benefit cards', () => {
      render(<HomePage />);
      
      expect(screen.getByText('Instant Online Offers')).toBeInTheDocument();
      expect(screen.getByText('No Hidden Fees')).toBeInTheDocument();
      expect(screen.getByText('Same-Day Payment')).toBeInTheDocument();
      expect(screen.getByText('Trade or Sell')).toBeInTheDocument();
    });
  });

  describe('footer', () => {
    it('renders contact information', () => {
      render(<HomePage />);
      
      expect(screen.getByText('Contact')).toBeInTheDocument();
      expect(screen.getByText('(603) 263-4552')).toBeInTheDocument();
      expect(screen.getByText('steve.obrien@quirkcars.com')).toBeInTheDocument();
    });

    it('renders company description', () => {
      render(<HomePage />);
      
      expect(screen.getByText(/Quirk Auto Dealers is the New England/i)).toBeInTheDocument();
    });

    it('renders legal links', () => {
      render(<HomePage />);
      
      expect(screen.getByText('Legal')).toBeInTheDocument();
      expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
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
    it('shows loading state during submission', async () => {
      (global.fetch as jest.Mock).mockImplementationOnce(() => 
        new Promise(resolve => setTimeout(() => resolve({
          ok: true,
          json: () => Promise.resolve({ success: true, data: {} })
        }), 100))
      );

      render(<HomePage />);
      
      const vinInput = screen.getByPlaceholderText(/Enter your 17-character VIN/i);
      const submitButton = screen.getByText(/Get Your Offer/i);
      
      fireEvent.change(vinInput, { target: { value: '1HGBH41JXMN109186' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Looking up/i)).toBeInTheDocument();
      });
    });

    it('handles API error gracefully', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      render(<HomePage />);
      
      const vinInput = screen.getByPlaceholderText(/Enter your 17-character VIN/i);
      const submitButton = screen.getByText(/Get Your Offer/i);
      
      fireEvent.change(vinInput, { target: { value: '1HGBH41JXMN109186' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Unable to decode VIN/i)).toBeInTheDocument();
      });
    });
  });
});
