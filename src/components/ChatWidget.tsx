
'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Sparkles } from 'lucide-react';
import { ChatMessage } from '@/types/vehicle';

const QUICK_TOPICS = [
  'How do I get an offer to sell my car?',
  'How does the trade-in process work?',
  'What documents do I need?',
  'How long is my offer valid?',
];

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.content,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm sorry, I'm having trouble connecting right now. Please try again or call us at (603) 263-4552 for immediate assistance.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  const handleQuickTopic = (topic: string) => {
    sendMessage(topic);
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg transition-all duration-300 ${
          isOpen
            ? 'bg-quirk-gray-800 hover:bg-quirk-gray-700'
            : 'gradient-quirk hover:scale-110'
        }`}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white mx-auto" />
        ) : (
          <MessageCircle className="w-6 h-6 text-white mx-auto" />
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-3rem)] bg-white rounded-2xl shadow-2xl border border-quirk-gray-200 overflow-hidden animate-slide-in">
          {/* Header */}
          <div className="gradient-quirk px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Quirk Assistant</h3>
                <p className="text-white/80 text-xs">Powered by AI • Available 24/7</p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="h-80 overflow-y-auto p-4 space-y-4 bg-quirk-gray-50">
            {messages.length === 0 ? (
              <div className="space-y-4">
                <div className="chat-bubble assistant">
                  <p className="text-sm">
                    Hi! I'm here to help you sell or trade your car. What would you like to know?
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-quirk-gray-500 font-medium">Popular topics:</p>
                  {QUICK_TOPICS.map((topic) => (
                    <button
                      key={topic}
                      onClick={() => handleQuickTopic(topic)}
                      className="block w-full text-left text-sm px-3 py-2 rounded-lg bg-white border border-quirk-gray-200 text-quirk-gray-700 hover:border-quirk-red hover:text-quirk-red transition-colors"
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`chat-bubble ${message.role}`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
              ))
            )}
            {isLoading && (
              <div className="chat-bubble assistant">
                <Loader2 className="w-5 h-5 animate-spin text-quirk-gray-400" />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-4 border-t border-quirk-gray-200 bg-white">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 rounded-full border border-quirk-gray-200 focus:border-quirk-red focus:ring-2 focus:ring-quirk-red/20 text-sm"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="w-10 h-10 rounded-full gradient-quirk flex items-center justify-center text-white disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-transform"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
