/**
 * useFormSecurity Hook
 * Provides bot protection for React forms
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface FormSecurityData {
  formToken: string;
  honeypot: string;
  mouseMovements: number;
  keystrokes: number;
  timeOnPage: number;
  timestamp: number;
}

interface UseFormSecurityOptions {
  trackMouse?: boolean;
  trackKeystrokes?: boolean;
}

interface UseFormSecurityReturn {
  securityData: FormSecurityData;
  honeypotProps: {
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    autoComplete: string;
    tabIndex: number;
    'aria-hidden': boolean;
    style: React.CSSProperties;
  };
  getSecurityHeaders: () => Record<string, string>;
  isFormValid: () => { valid: boolean; reason?: string };
}

/**
 * Generate a form token
 */
function generateFormToken(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2);
  return btoa(`${timestamp}:${random}`);
}

/**
 * Hook for form security
 */
export function useFormSecurity(options: UseFormSecurityOptions = {}): UseFormSecurityReturn {
  const { trackMouse = true, trackKeystrokes = true } = options;

  const [formToken] = useState(() => generateFormToken());
  const [honeypot, setHoneypot] = useState('');
  const [mouseMovements, setMouseMovements] = useState(0);
  const [keystrokes, setKeystrokes] = useState(0);
  const startTimeRef = useRef(Date.now());

  // Track mouse movements
  useEffect(() => {
    if (!trackMouse) return;

    let moveCount = 0;
    const handleMouseMove = () => {
      moveCount++;
      // Throttle state updates
      if (moveCount % 10 === 0) {
        setMouseMovements(moveCount);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, [trackMouse]);

  // Track keystrokes
  useEffect(() => {
    if (!trackKeystrokes) return;

    const handleKeyDown = () => {
      setKeystrokes((prev) => prev + 1);
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [trackKeystrokes]);

  // Honeypot field props
  const honeypotProps = {
    name: 'website',
    value: honeypot,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setHoneypot(e.target.value),
    autoComplete: 'off',
    tabIndex: -1,
    'aria-hidden': true as const,
    style: {
      position: 'absolute' as const,
      left: '-9999px',
      top: '-9999px',
      opacity: 0,
      height: 0,
      width: 0,
      overflow: 'hidden' as const,
      pointerEvents: 'none' as const,
    },
  };

  // Get security data
  const securityData: FormSecurityData = {
    formToken,
    honeypot,
    mouseMovements,
    keystrokes,
    timeOnPage: Date.now() - startTimeRef.current,
    timestamp: Date.now(),
  };

  // Get headers to send with form submission
  const getSecurityHeaders = useCallback(() => {
    return {
      'X-Form-Token': formToken,
      'X-Mouse-Movements': String(mouseMovements),
      'X-Keystrokes': String(keystrokes),
      'X-Time-On-Page': String(Date.now() - startTimeRef.current),
    };
  }, [formToken, mouseMovements, keystrokes]);

  // Validate form before submission
  const isFormValid = useCallback(() => {
    // Check honeypot
    if (honeypot) {
      return { valid: false, reason: 'Bot detected' };
    }

    // Check time on page (minimum 3 seconds)
    const timeOnPage = Date.now() - startTimeRef.current;
    if (timeOnPage < 3000) {
      return { valid: false, reason: 'Form submitted too quickly' };
    }

    // Check for some mouse activity (at least 5 movements)
    if (trackMouse && mouseMovements < 5) {
      return { valid: false, reason: 'Insufficient interaction detected' };
    }

    return { valid: true };
  }, [honeypot, mouseMovements, trackMouse]);

  return {
    securityData,
    honeypotProps,
    getSecurityHeaders,
    isFormValid,
  };
}

/**
 * Honeypot field component
 */
export function HoneypotField({ value, onChange }: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <input
      type="text"
      name="website"
      value={value}
      onChange={onChange}
      autoComplete="off"
      tabIndex={-1}
      aria-hidden
      style={{
        position: 'absolute',
        left: '-9999px',
        top: '-9999px',
        opacity: 0,
        height: 0,
        width: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    />
  );
}

export default useFormSecurity;
