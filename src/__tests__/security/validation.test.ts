/**
 * @jest-environment node
 */

import {
  vinSchema,
  chatMessageSchema,
  chatRequestSchema,
  contactInfoSchema,
  vehicleBasicsSchema,
  validateInput,
} from '@/lib/security/validation';

describe('Validation Schemas', () => {
  describe('vinSchema', () => {
    it('accepts valid VIN', () => {
      const validVins = [
        '1GCVKNEC0MZ123456',
        '5YJSA1E26MF123456',
        'WVWZZZ3CZWE123456',
      ];

      for (const vin of validVins) {
        const result = vinSchema.safeParse(vin);
        expect(result.success).toBe(true);
      }
    });

    it('rejects VIN with wrong length', () => {
      const result = vinSchema.safeParse('1GCVKNEC0MZ12345'); // 16 chars
      expect(result.success).toBe(false);
    });

    it('rejects VIN with invalid characters (I, O, Q)', () => {
      const invalidVins = [
        '1GCVKNEC0MI123456', // Contains I
        '1GCVKNEC0MO123456', // Contains O
        '1GCVKNEC0MQ123456', // Contains Q
      ];

      for (const vin of invalidVins) {
        const result = vinSchema.safeParse(vin);
        expect(result.success).toBe(false);
      }
    });

    it('converts lowercase to uppercase', () => {
      const result = vinSchema.safeParse('1gcvknec0mz123456');
      if (result.success) {
        expect(result.data).toBe('1GCVKNEC0MZ123456');
      }
    });

    it('trims whitespace', () => {
      const result = vinSchema.safeParse('  1GCVKNEC0MZ123456  ');
      if (result.success) {
        expect(result.data).toBe('1GCVKNEC0MZ123456');
      }
    });

    it('rejects empty string', () => {
      const result = vinSchema.safeParse('');
      expect(result.success).toBe(false);
    });
  });

  describe('chatMessageSchema', () => {
    it('accepts valid user message', () => {
      const result = chatMessageSchema.safeParse({
        role: 'user',
        content: 'Hello, I want to sell my car',
      });
      expect(result.success).toBe(true);
    });

    it('accepts valid assistant message', () => {
      const result = chatMessageSchema.safeParse({
        role: 'assistant',
        content: 'I can help you with that!',
      });
      expect(result.success).toBe(true);
    });

    it('rejects invalid role', () => {
      const result = chatMessageSchema.safeParse({
        role: 'system',
        content: 'Test',
      });
      expect(result.success).toBe(false);
    });

    it('rejects empty content', () => {
      const result = chatMessageSchema.safeParse({
        role: 'user',
        content: '',
      });
      expect(result.success).toBe(false);
    });

    it('rejects content over 2000 characters', () => {
      const result = chatMessageSchema.safeParse({
        role: 'user',
        content: 'a'.repeat(2001),
      });
      expect(result.success).toBe(false);
    });

    it('rejects content with script tags', () => {
      const result = chatMessageSchema.safeParse({
        role: 'user',
        content: '<script>alert("xss")</script>',
      });
      expect(result.success).toBe(false);
    });

    it('rejects content with javascript: protocol', () => {
      const result = chatMessageSchema.safeParse({
        role: 'user',
        content: 'Click here: javascript:alert(1)',
      });
      expect(result.success).toBe(false);
    });

    it('rejects content with event handlers', () => {
      const result = chatMessageSchema.safeParse({
        role: 'user',
        content: '<img onerror="alert(1)">',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('chatRequestSchema', () => {
    it('accepts valid request with messages', () => {
      const result = chatRequestSchema.safeParse({
        messages: [
          { role: 'user', content: 'Hello' },
          { role: 'assistant', content: 'Hi there!' },
        ],
      });
      expect(result.success).toBe(true);
    });

    it('rejects empty messages array', () => {
      const result = chatRequestSchema.safeParse({
        messages: [],
      });
      expect(result.success).toBe(false);
    });

    it('rejects too many messages (>50)', () => {
      const messages = Array.from({ length: 51 }, (_, i) => ({
        role: i % 2 === 0 ? 'user' : 'assistant',
        content: `Message ${i}`,
      }));
      const result = chatRequestSchema.safeParse({ messages });
      expect(result.success).toBe(false);
    });

    it('rejects request without messages', () => {
      const result = chatRequestSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });

  describe('contactInfoSchema', () => {
    it('accepts valid contact info', () => {
      const result = contactInfoSchema.safeParse({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '(603) 555-1234',
        preferredContact: 'email',
      });
      expect(result.success).toBe(true);
    });

    it('normalizes phone number to digits', () => {
      const result = contactInfoSchema.safeParse({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '(603) 555-1234',
        preferredContact: 'phone',
      });
      if (result.success) {
        expect(result.data.phone).toBe('6035551234');
      }
    });

    it('rejects invalid email', () => {
      const result = contactInfoSchema.safeParse({
        firstName: 'John',
        lastName: 'Doe',
        email: 'not-an-email',
        phone: '6035551234',
        preferredContact: 'email',
      });
      expect(result.success).toBe(false);
    });

    it('rejects name with numbers', () => {
      const result = contactInfoSchema.safeParse({
        firstName: 'John123',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '6035551234',
        preferredContact: 'email',
      });
      expect(result.success).toBe(false);
    });

    it('rejects filled honeypot field', () => {
      const result = contactInfoSchema.safeParse({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '6035551234',
        preferredContact: 'email',
        website: 'http://spam.com', // Honeypot should be empty
      });
      expect(result.success).toBe(false);
    });

    it('accepts empty honeypot field', () => {
      const result = contactInfoSchema.safeParse({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '6035551234',
        preferredContact: 'email',
        website: '', // Empty is OK
      });
      expect(result.success).toBe(true);
    });

    it('accepts names with hyphens and apostrophes', () => {
      const result = contactInfoSchema.safeParse({
        firstName: "Mary-Jane",
        lastName: "O'Brien",
        email: 'mary@example.com',
        phone: '6035551234',
        preferredContact: 'text',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('vehicleBasicsSchema', () => {
    it('accepts valid vehicle basics', () => {
      const result = vehicleBasicsSchema.safeParse({
        mileage: 50000,
        zipCode: '03103',
        hasLoan: false,
      });
      expect(result.success).toBe(true);
    });

    it('accepts 9-digit zip code', () => {
      const result = vehicleBasicsSchema.safeParse({
        mileage: 50000,
        zipCode: '03103-1234',
        hasLoan: false,
      });
      expect(result.success).toBe(true);
    });

    it('rejects negative mileage', () => {
      const result = vehicleBasicsSchema.safeParse({
        mileage: -1000,
        zipCode: '03103',
        hasLoan: false,
      });
      expect(result.success).toBe(false);
    });

    it('rejects unreasonably high mileage', () => {
      const result = vehicleBasicsSchema.safeParse({
        mileage: 600000,
        zipCode: '03103',
        hasLoan: false,
      });
      expect(result.success).toBe(false);
    });

    it('rejects invalid zip code', () => {
      const result = vehicleBasicsSchema.safeParse({
        mileage: 50000,
        zipCode: '1234', // Too short
        hasLoan: false,
      });
      expect(result.success).toBe(false);
    });

    it('accepts loan balance when hasLoan is true', () => {
      const result = vehicleBasicsSchema.safeParse({
        mileage: 50000,
        zipCode: '03103',
        hasLoan: true,
        loanBalance: 15000,
      });
      expect(result.success).toBe(true);
    });
  });

  describe('validateInput helper', () => {
    it('returns success with data for valid input', () => {
      const result = validateInput(chatMessageSchema, {
        role: 'user',
        content: 'Hello',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.content).toBe('Hello');
      }
    });

    it('returns errors array for invalid input', () => {
      const result = validateInput(chatMessageSchema, {
        role: 'invalid',
        content: '',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors.length).toBeGreaterThan(0);
      }
    });

    it('includes field path in error messages', () => {
      const result = validateInput(contactInfoSchema, {
        firstName: '',
        lastName: 'Doe',
        email: 'invalid',
        phone: '123',
        preferredContact: 'email',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        const hasEmailError = result.errors.some(e => e.includes('email'));
        expect(hasEmailError).toBe(true);
      }
    });
  });
});
