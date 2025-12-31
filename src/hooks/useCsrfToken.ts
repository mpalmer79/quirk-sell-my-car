/**
 * useCsrfToken Hook
 * 
 * Fetches and manages CSRF tokens for form submissions.
 * Automatically refreshes token when expired.
 * 
 * Usage:
 *   const { token, loading, error, fetchWithCsrf } = useCsrfToken();
 *   
 *   // Option 1: Use token directly
 *   await fetch('/api/offers', {
 *     method: 'POST',
 *     headers: { 'x-csrf-token': token },
 *     body: JSON.stringify(data),
 *   });
 *   
 *   // Option 2: Use helper function
 *   await fetchWithCsrf('/api/offers', {
 *     method: 'POST',
 *     body: JSON.stringify(data),
 *   });
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface CsrfTokenData {
  token: string;
  headerName: string;
  fieldName: string;
}

interface UseCsrfTokenResult {
  token: string | null;
  headerName: string;
  fieldName: string;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  fetchWithCsrf: (url: string, options?: RequestInit) => Promise<Response>;
  getFormProps: () => { name: string; value: string };
}

const TOKEN_REFRESH_INTERVAL = 20 * 60 * 1000; // 20 minutes

export function useCsrfToken(): UseCsrfTokenResult {
  const [tokenData, setTokenData] = useState<CsrfTokenData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchToken = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/csrf', {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch CSRF token: ${response.status}`);
      }

      const data = await response.json();
      setTokenData(data);

      // Schedule next refresh
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
      refreshTimeoutRef.current = setTimeout(fetchToken, TOKEN_REFRESH_INTERVAL);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      console.error('CSRF token fetch error:', message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchToken();

    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [fetchToken]);

  /**
   * Fetch wrapper that automatically includes CSRF token
   */
  const fetchWithCsrf = useCallback(
    async (url: string, options: RequestInit = {}): Promise<Response> => {
      // Ensure we have a token
      if (!tokenData?.token) {
        await fetchToken();
      }

      const headers = new Headers(options.headers);
      
      if (tokenData?.token) {
        headers.set(tokenData.headerName, tokenData.token);
      }

      // Ensure credentials are included for cookie
      return fetch(url, {
        ...options,
        headers,
        credentials: 'include',
      });
    },
    [tokenData, fetchToken]
  );

  /**
   * Get props for hidden form input
   */
  const getFormProps = useCallback(() => {
    return {
      name: tokenData?.fieldName || '_csrf',
      value: tokenData?.token || '',
    };
  }, [tokenData]);

  return {
    token: tokenData?.token || null,
    headerName: tokenData?.headerName || 'x-csrf-token',
    fieldName: tokenData?.fieldName || '_csrf',
    loading,
    error,
    refresh: fetchToken,
    fetchWithCsrf,
    getFormProps,
  };
}

/**
 * Hidden CSRF input component for forms
 */
export function CsrfInput(): JSX.Element | null {
  const { token, fieldName, loading } = useCsrfToken();

  if (loading || !token) {
    return null;
  }

  return <input type="hidden" name={fieldName} value={token} />;
}

export default useCsrfToken;
