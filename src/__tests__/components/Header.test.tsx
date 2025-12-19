import { render, screen } from '@testing-library/react';
import Header from '@/components/Header';

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  );
});

describe('Header', () => {
  beforeEach(() => {
    // Reset scroll position mock
    Object.defineProperty(window, 'scrollY', { value: 0, writable: true });
  });

  describe('rendering', () => {
    it('renders the header', () => {
      render(<Header />);
      
      const header = document.querySelector('header');
      expect(header).toBeInTheDocument();
    });

    it('renders the logo', () => {
      render(<Header />);
      
      const logo = screen.getByAltText('Quirk Auto Dealers');
      expect(logo).toBeInTheDocument();
    });

    it('renders the HOME button', () => {
      render(<Header />);
      
      const homeButton = screen.getByText('HOME');
      expect(homeButton).toBeInTheDocument();
      expect(homeButton).toHaveAttribute('href', 'https://quirk-sell-my-car.vercel.app/');
    });

    it('renders the phone number', () => {
      render(<Header />);
      
      const phone = screen.getByText('(603) 263-4552');
      expect(phone).toBeInTheDocument();
    });

    it('logo links to quirkchevynh.com', () => {
      render(<Header />);
      
      const logo = screen.getByAltText('Quirk Auto Dealers');
      const link = logo.closest('a');
      expect(link).toHaveAttribute('href', 'https://www.quirkchevynh.com');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('logo has correct src', () => {
      render(<Header />);
      
      const logo = screen.getByAltText('Quirk Auto Dealers') as HTMLImageElement;
      expect(logo.src).toContain('/quirk-logo.png');
    });
  });

  describe('scroll behavior', () => {
    it('has default styling when not scrolled', () => {
      render(<Header />);
      
      const header = document.querySelector('header');
      expect(header).toHaveClass('bg-white');
    });

    it('adds scroll event listener on mount', () => {
      const addEventListenerSpy = jest.spyOn(window, 'addEventListener');
      render(<Header />);
      
      expect(addEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
      addEventListenerSpy.mockRestore();
    });

    it('removes scroll event listener on unmount', () => {
      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
      const { unmount } = render(<Header />);
      
      unmount();
      
      expect(removeEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
      removeEventListenerSpy.mockRestore();
    });
  });

  describe('layout', () => {
    it('has proper flex layout', () => {
      render(<Header />);
      
      const container = document.querySelector('.flex.items-center.justify-between');
      expect(container).toBeInTheDocument();
    });

    it('has fixed positioning', () => {
      render(<Header />);
      
      const header = document.querySelector('header');
      expect(header).toHaveClass('fixed');
      expect(header).toHaveClass('top-0');
      expect(header).toHaveClass('left-0');
      expect(header).toHaveClass('right-0');
      expect(header).toHaveClass('z-50');
    });
  });
});
