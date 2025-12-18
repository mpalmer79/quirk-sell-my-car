/**
 * @jest-environment node
 */

import {
  escapeHtml,
  stripHtml,
  sanitizeString,
  sanitizeName,
  sanitizeEmail,
  sanitizePhone,
  sanitizeVin,
  sanitizeZipCode,
  sanitizeUrl,
  sanitizeObject,
  sanitizeForLogging,
} from '@/lib/security/sanitize';

describe('Sanitization', () => {
  describe('escapeHtml', () => {
    it('escapes angle brackets', () => {
      expect(escapeHtml('<script>')).toBe('&lt;script&gt;');
    });

    it('escapes ampersand', () => {
      expect(escapeHtml('foo & bar')).toBe('foo &amp; bar');
    });

    it('escapes quotes', () => {
      expect(escapeHtml('"hello"')).toBe('&quot;hello&quot;');
      expect(escapeHtml("'hello'")).toBe('&#x27;hello&#x27;');
    });

    it('escapes equals sign', () => {
      expect(escapeHtml('a=b')).toBe('a&#x3D;b');
    });

    it('handles empty string', () => {
      expect(escapeHtml('')).toBe('');
    });

    it('handles string with no special chars', () => {
      expect(escapeHtml('Hello World')).toBe('Hello World');
    });
  });

  describe('stripHtml', () => {
    it('removes HTML tags', () => {
      expect(stripHtml('<p>Hello</p>')).toBe('Hello');
    });

    it('removes nested tags', () => {
      expect(stripHtml('<div><p><strong>Text</strong></p></div>')).toBe('Text');
    });

    it('removes HTML entities', () => {
      expect(stripHtml('Hello&nbsp;World')).toBe('Hello World');
    });

    it('handles script tags', () => {
      expect(stripHtml('<script>alert(1)</script>Text')).toBe('alert(1)Text');
    });

    it('handles empty string', () => {
      expect(stripHtml('')).toBe('');
    });
  });

  describe('sanitizeString', () => {
    it('trims whitespace', () => {
      expect(sanitizeString('  hello  ')).toBe('hello');
    });

    it('removes null bytes', () => {
      expect(sanitizeString('hello\0world')).toBe('helloworld');
    });

    it('collapses multiple spaces', () => {
      expect(sanitizeString('hello    world')).toBe('hello world');
    });

    it('respects maxLength option', () => {
      expect(sanitizeString('hello world', { maxLength: 5 })).toBe('hello');
    });

    it('removes newlines by default', () => {
      expect(sanitizeString('hello\nworld')).toBe('hello world');
    });

    it('preserves newlines when allowNewlines is true', () => {
      expect(sanitizeString('hello\nworld', { allowNewlines: true })).toBe('hello\nworld');
    });

    it('removes control characters', () => {
      expect(sanitizeString('hello\x00\x01\x02world')).toBe('helloworld');
    });

    it('handles empty string', () => {
      expect(sanitizeString('')).toBe('');
    });
  });

  describe('sanitizeName', () => {
    it('allows letters', () => {
      expect(sanitizeName('John')).toBe('John');
    });

    it('allows hyphens', () => {
      expect(sanitizeName('Mary-Jane')).toBe('Mary-Jane');
    });

    it('allows apostrophes', () => {
      expect(sanitizeName("O'Brien")).toBe("O'Brien");
    });

    it('allows spaces', () => {
      expect(sanitizeName('John Paul')).toBe('John Paul');
    });

    it('removes numbers', () => {
      expect(sanitizeName('John123')).toBe('John');
    });

    it('removes special characters', () => {
      expect(sanitizeName('John@Doe!')).toBe('JohnDoe');
    });

    it('trims whitespace', () => {
      expect(sanitizeName('  John  ')).toBe('John');
    });

    it('limits length to 50', () => {
      const longName = 'A'.repeat(60);
      expect(sanitizeName(longName).length).toBe(50);
    });
  });

  describe('sanitizeEmail', () => {
    it('converts to lowercase', () => {
      expect(sanitizeEmail('John@Example.COM')).toBe('john@example.com');
    });

    it('trims whitespace', () => {
      expect(sanitizeEmail('  john@example.com  ')).toBe('john@example.com');
    });

    it('removes invalid characters', () => {
      expect(sanitizeEmail('john<>@example.com')).toBe('john@example.com');
    });

    it('preserves valid email characters', () => {
      expect(sanitizeEmail('john.doe+tag@example.com')).toBe('john.doe+tag@example.com');
    });

    it('limits length to 254', () => {
      const longEmail = 'a'.repeat(250) + '@example.com';
      expect(sanitizeEmail(longEmail).length).toBeLessThanOrEqual(254);
    });
  });

  describe('sanitizePhone', () => {
    it('removes formatting characters', () => {
      expect(sanitizePhone('(603) 555-1234')).toBe('6035551234');
    });

    it('removes dashes', () => {
      expect(sanitizePhone('603-555-1234')).toBe('6035551234');
    });

    it('removes dots', () => {
      expect(sanitizePhone('603.555.1234')).toBe('6035551234');
    });

    it('removes spaces', () => {
      expect(sanitizePhone('603 555 1234')).toBe('6035551234');
    });

    it('handles international prefix', () => {
      expect(sanitizePhone('+1 603 555 1234')).toBe('16035551234');
    });

    it('limits to 15 digits', () => {
      expect(sanitizePhone('12345678901234567890').length).toBe(15);
    });
  });

  describe('sanitizeVin', () => {
    it('converts to uppercase', () => {
      expect(sanitizeVin('1gcvknec0mz123456')).toBe('1GCVKNEC0MZ123456');
    });

    it('removes invalid VIN characters', () => {
      expect(sanitizeVin('1GCVKNEC0MZ123456!')).toBe('1GCVKNEC0MZ123456');
    });

    it('removes I, O, Q', () => {
      expect(sanitizeVin('1GCIKNOQ0MZ123456')).toBe('1GCK0MZ123456');
    });

    it('trims whitespace', () => {
      expect(sanitizeVin('  1GCVKNEC0MZ123456  ')).toBe('1GCVKNEC0MZ123456');
    });

    it('limits to 17 characters', () => {
      expect(sanitizeVin('1GCVKNEC0MZ123456789').length).toBe(17);
    });
  });

  describe('sanitizeZipCode', () => {
    it('handles 5 digit zip', () => {
      expect(sanitizeZipCode('03103')).toBe('03103');
    });

    it('handles 9 digit zip with hyphen', () => {
      expect(sanitizeZipCode('03103-1234')).toBe('03103-1234');
    });

    it('adds hyphen to 9 digit zip', () => {
      expect(sanitizeZipCode('031031234')).toBe('03103-1234');
    });

    it('removes non-digits', () => {
      expect(sanitizeZipCode('03103 NH')).toBe('03103');
    });

    it('limits to 5 digits for short input', () => {
      expect(sanitizeZipCode('0310')).toBe('0310');
    });
  });

  describe('sanitizeUrl', () => {
    it('accepts valid https URL', () => {
      expect(sanitizeUrl('https://example.com')).toBe('https://example.com/');
    });

    it('accepts valid http URL', () => {
      expect(sanitizeUrl('http://example.com')).toBe('http://example.com/');
    });

    it('rejects javascript: protocol', () => {
      expect(sanitizeUrl('javascript:alert(1)')).toBeNull();
    });

    it('rejects data: protocol', () => {
      expect(sanitizeUrl('data:text/html,<script>alert(1)</script>')).toBeNull();
    });

    it('rejects URLs with credentials', () => {
      expect(sanitizeUrl('https://user:pass@example.com')).toBeNull();
    });

    it('rejects invalid URLs', () => {
      expect(sanitizeUrl('not a url')).toBeNull();
    });

    it('handles empty string', () => {
      expect(sanitizeUrl('')).toBeNull();
    });
  });

  describe('sanitizeObject', () => {
    it('sanitizes string values', () => {
      const obj = { name: '  John  ', email: 'john@example.com' };
      const result = sanitizeObject(obj);

      expect(result.name).toBe('John');
    });

    it('handles nested objects', () => {
      const obj = {
        user: {
          name: '  John  ',
          address: {
            city: '  Boston  ',
          },
        },
      };
      const result = sanitizeObject(obj);

      expect((result.user as any).name).toBe('John');
      expect((result.user as any).address.city).toBe('Boston');
    });

    it('handles arrays', () => {
      const obj = {
        items: ['  one  ', '  two  '],
      };
      const result = sanitizeObject(obj);

      expect((result.items as string[])[0]).toBe('one');
    });

    it('preserves non-string values', () => {
      const obj = {
        count: 42,
        active: true,
        data: null,
      };
      const result = sanitizeObject(obj);

      expect(result.count).toBe(42);
      expect(result.active).toBe(true);
    });

    it('respects maxDepth', () => {
      const deep: any = { a: { b: { c: { d: { e: 'value' } } } } };
      const result = sanitizeObject(deep, { maxDepth: 2 });

      expect((result.a as any).b).toBe('[MAX_DEPTH_EXCEEDED]');
    });
  });

  describe('sanitizeForLogging', () => {
    it('redacts password fields', () => {
      const obj = {
        username: 'john',
        password: 'secret123',
      };
      const result = sanitizeForLogging(obj);

      expect(result.username).toBe('john');
      expect(result.password).toBe('[REDACTED]');
    });

    it('redacts api key fields', () => {
      const obj = {
        apiKey: 'sk-1234567890',
        api_key: 'sk-0987654321',
      };
      const result = sanitizeForLogging(obj);

      expect(result.apiKey).toBe('[REDACTED]');
      expect(result.api_key).toBe('[REDACTED]');
    });

    it('redacts credit card fields', () => {
      const obj = {
        cardNumber: '4111111111111111',
        credit_card: '4111111111111111',
        cvv: '123',
      };
      const result = sanitizeForLogging(obj);

      expect(result.cardNumber).toBe('[REDACTED]');
      expect(result.credit_card).toBe('[REDACTED]');
      expect(result.cvv).toBe('[REDACTED]');
    });

    it('redacts authorization headers', () => {
      const obj = {
        authorization: 'Bearer token123',
        cookie: 'session=abc123',
      };
      const result = sanitizeForLogging(obj);

      expect(result.authorization).toBe('[REDACTED]');
      expect(result.cookie).toBe('[REDACTED]');
    });

    it('handles nested sensitive fields', () => {
      const obj = {
        user: {
          name: 'John',
          password: 'secret',
        },
      };
      const result = sanitizeForLogging(obj);

      expect((result.user as any).name).toBe('John');
      expect((result.user as any).password).toBe('[REDACTED]');
    });

    it('preserves non-sensitive fields', () => {
      const obj = {
        email: 'john@example.com',
        name: 'John Doe',
        age: 30,
      };
      const result = sanitizeForLogging(obj);

      expect(result.email).toBe('john@example.com');
      expect(result.name).toBe('John Doe');
      expect(result.age).toBe(30);
    });

    it('accepts custom sensitive fields', () => {
      const obj = {
        secretCode: '12345',
        normalField: 'visible',
      };
      const result = sanitizeForLogging(obj, ['secretCode']);

      expect(result.secretCode).toBe('[REDACTED]');
      expect(result.normalField).toBe('visible');
    });
  });
});
