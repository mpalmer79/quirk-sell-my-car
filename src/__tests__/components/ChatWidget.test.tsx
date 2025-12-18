import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ChatWidget from '@/components/ChatWidget';

const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

describe('ChatWidget', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initial render', () => {
    it('renders chat toggle button', () => {
      render(<ChatWidget />);
      expect(screen.getByLabelText('Open chat')).toBeInTheDocument();
    });

    it('does not show chat window initially', () => {
      render(<ChatWidget />);
      expect(screen.queryByText('Quirk Assistant')).not.toBeInTheDocument();
    });
  });

  describe('opening chat', () => {
    it('shows chat window when button clicked', async () => {
      render(<ChatWidget />);
      
      await act(async () => {
        fireEvent.click(screen.getByLabelText('Open chat'));
      });
      
      expect(screen.getByText('Quirk Assistant')).toBeInTheDocument();
    });

    it('shows welcome message', async () => {
      render(<ChatWidget />);
      
      await act(async () => {
        fireEvent.click(screen.getByLabelText('Open chat'));
      });
      
      expect(screen.getByText(/I'm here to help/)).toBeInTheDocument();
    });

    it('shows quick topic buttons', async () => {
      render(<ChatWidget />);
      
      await act(async () => {
        fireEvent.click(screen.getByLabelText('Open chat'));
      });
      
      expect(screen.getByText('How do I get an offer to sell my car?')).toBeInTheDocument();
      expect(screen.getByText('What documents do I need?')).toBeInTheDocument();
    });

    it('changes button label to Close chat', async () => {
      render(<ChatWidget />);
      
      await act(async () => {
        fireEvent.click(screen.getByLabelText('Open chat'));
      });
      
      expect(screen.getByLabelText('Close chat')).toBeInTheDocument();
    });
  });

  describe('closing chat', () => {
    it('hides chat window when close clicked', async () => {
      render(<ChatWidget />);
      
      await act(async () => {
        fireEvent.click(screen.getByLabelText('Open chat'));
      });
      expect(screen.getByText('Quirk Assistant')).toBeInTheDocument();
      
      await act(async () => {
        fireEvent.click(screen.getByLabelText('Close chat'));
      });
      expect(screen.queryByText('Quirk Assistant')).not.toBeInTheDocument();
    });
  });

  describe('sending messages', () => {
    it('displays user message in chat', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ content: 'AI response' }),
      } as Response);

      render(<ChatWidget />);
      
      await act(async () => {
        fireEvent.click(screen.getByLabelText('Open chat'));
      });
      
      const input = screen.getByPlaceholderText('Type your message...');
      
      await act(async () => {
        await userEvent.type(input, 'Hello');
        fireEvent.submit(input.closest('form')!);
      });
      
      await waitFor(() => {
        expect(screen.getByText('Hello')).toBeInTheDocument();
      });
    });

    it('displays AI response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ content: 'This is the AI response' }),
      } as Response);

      render(<ChatWidget />);
      
      await act(async () => {
        fireEvent.click(screen.getByLabelText('Open chat'));
      });
      
      const input = screen.getByPlaceholderText('Type your message...');
      
      await act(async () => {
        await userEvent.type(input, 'Hello');
        fireEvent.submit(input.closest('form')!);
      });
      
      await waitFor(() => {
        expect(screen.getByText('This is the AI response')).toBeInTheDocument();
      });
    });

    it('clears input after sending', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ content: 'Response' }),
      } as Response);

      render(<ChatWidget />);
      
      await act(async () => {
        fireEvent.click(screen.getByLabelText('Open chat'));
      });
      
      const input = screen.getByPlaceholderText('Type your message...') as HTMLInputElement;
      
      await act(async () => {
        await userEvent.type(input, 'Test');
        fireEvent.submit(input.closest('form')!);
      });
      
      await waitFor(() => {
        expect(input.value).toBe('');
      });
    });

    it('does not send empty messages', async () => {
      render(<ChatWidget />);
      
      await act(async () => {
        fireEvent.click(screen.getByLabelText('Open chat'));
      });
      
      const input = screen.getByPlaceholderText('Type your message...');
      
      await act(async () => {
        fireEvent.submit(input.closest('form')!);
      });
      
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe('quick topics', () => {
    it('sends message when quick topic clicked', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ content: 'Response' }),
      } as Response);

      render(<ChatWidget />);
      
      await act(async () => {
        fireEvent.click(screen.getByLabelText('Open chat'));
      });
      
      await act(async () => {
        fireEvent.click(screen.getByText('What documents do I need?'));
      });
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/chat', expect.any(Object));
      });
    });
  });

  describe('error handling', () => {
    it('displays error message when API fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
      } as Response);

      render(<ChatWidget />);
      
      await act(async () => {
        fireEvent.click(screen.getByLabelText('Open chat'));
      });
      
      const input = screen.getByPlaceholderText('Type your message...');
      
      await act(async () => {
        await userEvent.type(input, 'Hello');
        fireEvent.submit(input.closest('form')!);
      });
      
      await waitFor(() => {
        expect(screen.getByText(/trouble connecting/i)).toBeInTheDocument();
      });
    });
  });
});
