import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ChatWidget from '@/components/ChatWidget';

const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

describe('ChatWidget', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initial render', () => {
    it('should render chat toggle button', () => {
      render(<ChatWidget />);
      
      const toggleButton = screen.getByLabelText('Open chat');
      expect(toggleButton).toBeInTheDocument();
    });

    it('should not show chat window initially', () => {
      render(<ChatWidget />);
      
      expect(screen.queryByText('Quirk Assistant')).not.toBeInTheDocument();
    });

    it('should show MessageCircle icon when closed', () => {
      render(<ChatWidget />);
      
      const toggleButton = screen.getByLabelText('Open chat');
      expect(toggleButton.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('opening chat', () => {
    it('should show chat window when toggle button is clicked', () => {
      render(<ChatWidget />);
      
      const toggleButton = screen.getByLabelText('Open chat');
      fireEvent.click(toggleButton);
      
      expect(screen.getByText('Quirk Assistant')).toBeInTheDocument();
    });

    it('should show "Powered by AI" subtitle', () => {
      render(<ChatWidget />);
      
      fireEvent.click(screen.getByLabelText('Open chat'));
      
      expect(screen.getByText(/Powered by AI/i)).toBeInTheDocument();
    });

    it('should change button to Close chat', () => {
      render(<ChatWidget />);
      
      fireEvent.click(screen.getByLabelText('Open chat'));
      
      expect(screen.getByLabelText('Close chat')).toBeInTheDocument();
    });

    it('should show welcome message', () => {
      render(<ChatWidget />);
      
      fireEvent.click(screen.getByLabelText('Open chat'));
      
      expect(screen.getByText(/Hi! I'm here to help/i)).toBeInTheDocument();
    });

    it('should show quick topic buttons', () => {
      render(<ChatWidget />);
      
      fireEvent.click(screen.getByLabelText('Open chat'));
      
      expect(screen.getByText('How do I get an offer to sell my car?')).toBeInTheDocument();
      expect(screen.getByText('How does the trade-in process work?')).toBeInTheDocument();
      expect(screen.getByText('What documents do I need?')).toBeInTheDocument();
      expect(screen.getByText('How long is my offer valid?')).toBeInTheDocument();
    });

    it('should show message input field', () => {
      render(<ChatWidget />);
      
      fireEvent.click(screen.getByLabelText('Open chat'));
      
      expect(screen.getByPlaceholderText('Type your message...')).toBeInTheDocument();
    });

    it('should show send button', () => {
      render(<ChatWidget />);
      
      fireEvent.click(screen.getByLabelText('Open chat'));
      
      const sendButton = document.querySelector('button[type="submit"]');
      expect(sendButton).toBeInTheDocument();
    });
  });

  describe('closing chat', () => {
    it('should hide chat window when close button is clicked', () => {
      render(<ChatWidget />);
      
      // Open chat
      fireEvent.click(screen.getByLabelText('Open chat'));
      expect(screen.getByText('Quirk Assistant')).toBeInTheDocument();
      
      // Close chat
      fireEvent.click(screen.getByLabelText('Close chat'));
      expect(screen.queryByText('Quirk Assistant')).not.toBeInTheDocument();
    });
  });

  describe('sending messages', () => {
    it('should send user message when submit is clicked', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ content: 'AI response' }),
      } as Response);

      render(<ChatWidget />);
      
      fireEvent.click(screen.getByLabelText('Open chat'));
      
      const input = screen.getByPlaceholderText('Type your message...');
      await userEvent.type(input, 'Hello there');
      
      const sendButton = document.querySelector('button[type="submit"]');
      fireEvent.click(sendButton!);
      
      await waitFor(() => {
        expect(screen.getByText('Hello there')).toBeInTheDocument();
      });
    });

    it('should display user message in chat', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ content: 'AI response' }),
      } as Response);

      render(<ChatWidget />);
      
      fireEvent.click(screen.getByLabelText('Open chat'));
      
      const input = screen.getByPlaceholderText('Type your message...');
      await userEvent.type(input, 'Test message');
      fireEvent.submit(input.closest('form')!);
      
      await waitFor(() => {
        expect(screen.getByText('Test message')).toBeInTheDocument();
      });
    });

    it('should clear input after sending', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ content: 'AI response' }),
      } as Response);

      render(<ChatWidget />);
      
      fireEvent.click(screen.getByLabelText('Open chat'));
      
      const input = screen.getByPlaceholderText('Type your message...') as HTMLInputElement;
      await userEvent.type(input, 'Test message');
      fireEvent.submit(input.closest('form')!);
      
      await waitFor(() => {
        expect(input.value).toBe('');
      });
    });

    it('should display AI response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ content: 'This is the AI response!' }),
      } as Response);

      render(<ChatWidget />);
      
      fireEvent.click(screen.getByLabelText('Open chat'));
      
      const input = screen.getByPlaceholderText('Type your message...');
      await userEvent.type(input, 'Hello');
      fireEvent.submit(input.closest('form')!);
      
      await waitFor(() => {
        expect(screen.getByText('This is the AI response!')).toBeInTheDocument();
      });
    });

    it('should not send empty messages', async () => {
      render(<ChatWidget />);
      
      fireEvent.click(screen.getByLabelText('Open chat'));
      
      const input = screen.getByPlaceholderText('Type your message...');
      fireEvent.submit(input.closest('form')!);
      
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should not send whitespace-only messages', async () => {
      render(<ChatWidget />);
      
      fireEvent.click(screen.getByLabelText('Open chat'));
      
      const input = screen.getByPlaceholderText('Type your message...');
      await userEvent.type(input, '   ');
      fireEvent.submit(input.closest('form')!);
      
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should disable send button when input is empty', () => {
      render(<ChatWidget />);
      
      fireEvent.click(screen.getByLabelText('Open chat'));
      
      const sendButton = document.querySelector('button[type="submit"]');
      expect(sendButton).toBeDisabled();
    });

    it('should enable send button when input has text', async () => {
      render(<ChatWidget />);
      
      fireEvent.click(screen.getByLabelText('Open chat'));
      
      const input = screen.getByPlaceholderText('Type your message...');
      await userEvent.type(input, 'Hello');
      
      const sendButton = document.querySelector('button[type="submit"]');
      expect(sendButton).not.toBeDisabled();
    });
  });

  describe('quick topics', () => {
    it('should send message when quick topic is clicked', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ content: 'Response' }),
      } as Response);

      render(<ChatWidget />);
      
      fireEvent.click(screen.getByLabelText('Open chat'));
      
      const quickTopic = screen.getByText('How do I get an offer to sell my car?');
      fireEvent.click(quickTopic);
      
      await waitFor(() => {
        expect(screen.getByText('How do I get an offer to sell my car?')).toBeInTheDocument();
      });
      
      expect(mockFetch).toHaveBeenCalledWith('/api/chat', expect.any(Object));
    });

    it('should hide quick topics after first message', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ content: 'Response' }),
      } as Response);

      render(<ChatWidget />);
      
      fireEvent.click(screen.getByLabelText('Open chat'));
      
      const quickTopic = screen.getByText('What documents do I need?');
      fireEvent.click(quickTopic);
      
      await waitFor(() => {
        expect(screen.queryByText('Popular topics:')).not.toBeInTheDocument();
      });
    });
  });

  describe('loading state', () => {
    it('should show loading spinner while waiting for response', async () => {
      // Create a promise that doesn't resolve immediately
      let resolvePromise: (value: Response) => void;
      const pendingPromise = new Promise<Response>((resolve) => {
        resolvePromise = resolve;
      });
      mockFetch.mockReturnValueOnce(pendingPromise);

      render(<ChatWidget />);
      
      fireEvent.click(screen.getByLabelText('Open chat'));
      
      const input = screen.getByPlaceholderText('Type your message...');
      await userEvent.type(input, 'Hello');
      fireEvent.submit(input.closest('form')!);
      
      // Loading spinner should be visible
      await waitFor(() => {
        const spinner = document.querySelector('.animate-spin');
        expect(spinner).toBeInTheDocument();
      });
      
      // Resolve the promise
      resolvePromise!({
        ok: true,
        json: async () => ({ content: 'Done' }),
      } as Response);
    });

    it('should disable input while loading', async () => {
      let resolvePromise: (value: Response) => void;
      const pendingPromise = new Promise<Response>((resolve) => {
        resolvePromise = resolve;
      });
      mockFetch.mockReturnValueOnce(pendingPromise);

      render(<ChatWidget />);
      
      fireEvent.click(screen.getByLabelText('Open chat'));
      
      const input = screen.getByPlaceholderText('Type your message...');
      await userEvent.type(input, 'Hello');
      fireEvent.submit(input.closest('form')!);
      
      await waitFor(() => {
        expect(input).toBeDisabled();
      });
      
      // Cleanup
      resolvePromise!({
        ok: true,
        json: async () => ({ content: 'Done' }),
      } as Response);
    });
  });

  describe('error handling', () => {
    it('should display error message when API fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
      } as Response);

      render(<ChatWidget />);
      
      fireEvent.click(screen.getByLabelText('Open chat'));
      
      const input = screen.getByPlaceholderText('Type your message...');
      await userEvent.type(input, 'Hello');
      fireEvent.submit(input.closest('form')!);
      
      await waitFor(() => {
        expect(screen.getByText(/trouble connecting/i)).toBeInTheDocument();
      });
    });

    it('should display error message with phone number', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      render(<ChatWidget />);
      
      fireEvent.click(screen.getByLabelText('Open chat'));
      
      const input = screen.getByPlaceholderText('Type your message...');
      await userEvent.type(input, 'Hello');
      fireEvent.submit(input.closest('form')!);
      
      await waitFor(() => {
        expect(screen.getByText(/\(603\) 263-4552/)).toBeInTheDocument();
      });
    });
  });

  describe('message history', () => {
    it('should include previous messages in API request', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ content: 'First response' }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ content: 'Second response' }),
        } as Response);

      render(<ChatWidget />);
      
      fireEvent.click(screen.getByLabelText('Open chat'));
      
      const input = screen.getByPlaceholderText('Type your message...');
      
      // Send first message
      await userEvent.type(input, 'First message');
      fireEvent.submit(input.closest('form')!);
      
      await waitFor(() => {
        expect(screen.getByText('First response')).toBeInTheDocument();
      });
      
      // Send second message
      await userEvent.type(input, 'Second message');
      fireEvent.submit(input.closest('form')!);
      
      await waitFor(() => {
        // Check that the second API call includes message history
        const secondCall = mockFetch.mock.calls[1];
        const body = JSON.parse(secondCall[1]?.body as string);
        
        expect(body.messages).toHaveLength(3); // 2 user + 1 assistant
      });
    });
  });

  describe('accessibility', () => {
    it('should have aria-label on toggle button', () => {
      render(<ChatWidget />);
      
      expect(screen.getByLabelText('Open chat')).toBeInTheDocument();
    });

    it('should have aria-label for close state', () => {
      render(<ChatWidget />);
      
      fireEvent.click(screen.getByLabelText('Open chat'));
      
      expect(screen.getByLabelText('Close chat')).toBeInTheDocument();
    });
  });
});
