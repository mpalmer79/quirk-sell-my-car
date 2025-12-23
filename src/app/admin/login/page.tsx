'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Lock, Mail, ArrowLeft, Shield, AlertCircle, Key, CheckCircle } from 'lucide-react';

type LoginStep = 'credentials' | '2fa' | 'backup';

export default function AdminLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<LoginStep>('credentials');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [backupCodeWarning, setBackupCodeWarning] = useState<string | null>(null);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [backupCode, setBackupCode] = useState('');

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      if (data.requires2FA) {
        setStep('2fa');
      } else {
        router.push('/admin/offers');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handle2FASubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch('/api/admin/auth/verify-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          code: twoFactorCode.replace(/\s/g, '') 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Verification failed');
      }

      router.push('/admin/offers');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
      setTwoFactorCode('');
    } finally {
      setLoading(false);
    }
  };

  const handleBackupCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBackupCodeWarning(null);
    setLoading(true);

    try {
      // Format: remove any existing dashes, then the API will handle it
      const formattedCode = backupCode.toUpperCase().replace(/-/g, '');
      
      const response = await fetch('/api/admin/auth/verify-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          code: formattedCode
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Invalid backup code');
      }

      // Check if backup code was used and show warning about remaining codes
      if (data.usedBackupCode && data.remainingBackupCodes !== undefined) {
        if (data.remainingBackupCodes <= 2) {
          setBackupCodeWarning(
            `Warning: Only ${data.remainingBackupCodes} backup code${data.remainingBackupCodes === 1 ? '' : 's'} remaining. ` +
            'Please generate new codes in Settings.'
          );
          // Brief delay to show warning before redirect
          await new Promise(resolve => setTimeout(resolve, 2500));
        }
      }

      router.push('/admin/offers');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid backup code');
      setBackupCode('');
    } finally {
      setLoading(false);
    }
  };

  // Format backup code as user types (XXXX-XXXX)
  const handleBackupCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    
    // Insert dash after 4 characters
    if (value.length > 4) {
      value = value.slice(0, 4) + '-' + value.slice(4, 8);
    }
    
    setBackupCode(value);
  };

  const resetToCredentials = () => {
    setStep('credentials');
    setTwoFactorCode('');
    setBackupCode('');
    setError(null);
    setBackupCodeWarning(null);
  };

  const getHeaderContent = () => {
    switch (step) {
      case 'credentials':
        return {
          icon: <Lock className="w-6 h-6 text-white" />,
          title: 'Admin Login',
          subtitle: 'Sign in to access the dashboard'
        };
      case '2fa':
        return {
          icon: <Shield className="w-6 h-6 text-white" />,
          title: 'Two-Factor Authentication',
          subtitle: 'Enter your verification code'
        };
      case 'backup':
        return {
          icon: <Key className="w-6 h-6 text-white" />,
          title: 'Backup Code',
          subtitle: 'Enter one of your backup codes'
        };
    }
  };

  const header = getHeaderContent();

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-[#00264d] px-8 py-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                {header.icon}
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">{header.title}</h1>
                <p className="text-white/70 text-sm">{header.subtitle}</p>
              </div>
            </div>
          </div>

          <div className="p-8">
            {/* Success Warning for low backup codes */}
            {backupCodeWarning && (
              <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-800">Login successful!</p>
                  <p className="text-sm text-amber-700 mt-1">{backupCodeWarning}</p>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Credentials Form */}
            {step === 'credentials' && (
              <form onSubmit={handleCredentialsSubmit} className="space-y-5">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@quirkcars.com"
                      required
                      className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-[#0070cc] text-white font-semibold rounded-lg hover:bg-[#005fa3] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </form>
            )}

            {/* 2FA Code Form */}
            {step === '2fa' && (
              <form onSubmit={handle2FASubmit} className="space-y-5">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-8 h-8 text-blue-600" />
                  </div>
                  <p className="text-gray-600">
                    Enter the 6-digit code from your authenticator app
                  </p>
                </div>

                <div>
                  <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                    Verification Code
                  </label>
                  <input
                    id="code"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    value={twoFactorCode}
                    onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    required
                    autoFocus
                    className="w-full px-4 py-4 text-center text-2xl font-mono tracking-[0.5em] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || twoFactorCode.length !== 6}
                  className="w-full py-3 px-4 bg-[#0070cc] text-white font-semibold rounded-lg hover:bg-[#005fa3] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Verify & Sign In'
                  )}
                </button>

                <button
                  type="button"
                  onClick={resetToCredentials}
                  className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  ← Use different account
                </button>

                <div className="pt-4 border-t border-gray-200 text-center">
                  <button
                    type="button"
                    className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                    onClick={() => {
                      setStep('backup');
                      setTwoFactorCode('');
                      setError(null);
                    }}
                  >
                    Use a backup code instead
                  </button>
                </div>
              </form>
            )}

            {/* Backup Code Form */}
            {step === 'backup' && (
              <form onSubmit={handleBackupCodeSubmit} className="space-y-5">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
                    <Key className="w-8 h-8 text-amber-600" />
                  </div>
                  <p className="text-gray-600">
                    Enter one of your 8-character backup codes
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    Each backup code can only be used once
                  </p>
                </div>

                <div>
                  <label htmlFor="backupCode" className="block text-sm font-medium text-gray-700 mb-2">
                    Backup Code
                  </label>
                  <input
                    id="backupCode"
                    type="text"
                    maxLength={9}
                    value={backupCode}
                    onChange={handleBackupCodeChange}
                    placeholder="XXXX-XXXX"
                    required
                    autoFocus
                    autoComplete="off"
                    autoCapitalize="characters"
                    className="w-full px-4 py-4 text-center text-2xl font-mono tracking-wider border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all uppercase"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || backupCode.replace(/-/g, '').length !== 8}
                  className="w-full py-3 px-4 bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Use Backup Code'
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStep('2fa');
                    setBackupCode('');
                    setError(null);
                  }}
                  className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  ← Back to authenticator code
                </button>

                <button
                  type="button"
                  onClick={resetToCredentials}
                  className="w-full py-2 text-sm text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Use different account
                </button>
              </form>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Protected area. Unauthorized access is prohibited.
        </p>
      </div>
    </div>
  );
}
