'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  Loader2, Shield, CheckCircle2, Copy, Check, ArrowLeft,
  AlertTriangle, Smartphone, Key
} from 'lucide-react';

type SetupStep = 'intro' | 'scan' | 'verify' | 'backup' | 'complete';

export default function Setup2FAPage() {
  const router = useRouter();
  const [step, setStep] = useState<SetupStep>('intro');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [secret, setSecret] = useState<string>('');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState('');
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedBackup, setCopiedBackup] = useState(false);

  const initializeSetup = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/auth/2fa/setup', { method: 'POST' });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Failed to initialize 2FA setup');

      setSecret(data.secret);
      setQrCodeUrl(data.qrCodeUrl);
      setBackupCodes(data.backupCodes);
      setStep('scan');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Setup failed');
    } finally {
      setLoading(false);
    }
  };

  const verifyAndEnable = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/auth/2fa/enable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: verificationCode }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Verification failed');

      setStep('backup');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
      setVerificationCode('');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, type: 'secret' | 'backup') => {
    await navigator.clipboard.writeText(text);
    if (type === 'secret') {
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 2000);
    } else {
      setCopiedBackup(true);
      setTimeout(() => setCopiedBackup(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-lg mx-auto">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to settings
        </button>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-[#00264d] px-8 py-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Two-Factor Authentication</h1>
                <p className="text-white/70 text-sm">Secure your admin account</p>
              </div>
            </div>
          </div>

          <div className="p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {step === 'intro' && (
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-6">
                  <Smartphone className="w-10 h-10 text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-3">Add Extra Security</h2>
                <p className="text-gray-600 mb-8">
                  Two-factor authentication adds an extra layer of security. You'll need an authenticator app like Google Authenticator or Authy.
                </p>
                <button
                  onClick={initializeSetup}
                  disabled={loading}
                  className="w-full py-3 px-4 bg-[#0070cc] text-white font-semibold rounded-lg hover:bg-[#005fa3] disabled:bg-gray-400 transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Shield className="w-5 h-5" />}
                  {loading ? 'Setting up...' : 'Begin Setup'}
                </button>
              </div>
            )}

            {step === 'scan' && (
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4 text-center">Scan QR Code</h2>
                <p className="text-gray-600 text-sm mb-6 text-center">Open your authenticator app and scan this QR code</p>

                <div className="bg-white border-2 border-gray-200 rounded-xl p-4 mb-6 flex items-center justify-center">
                  {qrCodeUrl ? (
                    <Image src={qrCodeUrl} alt="2FA QR Code" width={200} height={200} className="rounded" />
                  ) : (
                    <div className="w-[200px] h-[200px] bg-gray-100 flex items-center justify-center">
                      <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
                    </div>
                  )}
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <p className="text-xs text-gray-500 mb-2">Or enter this code manually:</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-sm font-mono bg-white px-3 py-2 rounded border border-gray-200 break-all">{secret}</code>
                    <button onClick={() => copyToClipboard(secret, 'secret')} className="p-2 text-gray-500 hover:text-gray-700">
                      {copiedSecret ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <button onClick={() => setStep('verify')} className="w-full py-3 px-4 bg-[#0070cc] text-white font-semibold rounded-lg hover:bg-[#005fa3] transition-colors">
                  Continue
                </button>
              </div>
            )}

            {step === 'verify' && (
              <form onSubmit={verifyAndEnable}>
                <h2 className="text-lg font-bold text-gray-900 mb-4 text-center">Verify Setup</h2>
                <p className="text-gray-600 text-sm mb-6 text-center">Enter the 6-digit code from your authenticator app</p>

                <div className="mb-6">
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    required
                    autoFocus
                    className="w-full px-4 py-4 text-center text-2xl font-mono tracking-[0.5em] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || verificationCode.length !== 6}
                  className="w-full py-3 px-4 bg-[#0070cc] text-white font-semibold rounded-lg hover:bg-[#005fa3] disabled:bg-gray-400 transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                  {loading ? 'Verifying...' : 'Verify & Enable'}
                </button>

                <button type="button" onClick={() => setStep('scan')} className="w-full mt-3 py-2 text-sm text-gray-500 hover:text-gray-700">
                  ← Back to QR code
                </button>
              </form>
            )}

            {step === 'backup' && (
              <div>
                <div className="text-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
                    <Key className="w-8 h-8 text-amber-600" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900 mb-2">Save Your Backup Codes</h2>
                  <p className="text-gray-600 text-sm">Store these codes securely. Use them if you lose your phone.</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-2 gap-2">
                    {backupCodes.map((code, i) => (
                      <code key={i} className="text-sm font-mono bg-white px-3 py-2 rounded border border-gray-200 text-center">{code}</code>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => copyToClipboard(backupCodes.join('\n'), 'backup')}
                  className="w-full mb-6 py-2 px-4 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-2"
                >
                  {copiedBackup ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  {copiedBackup ? 'Copied!' : 'Copy all codes'}
                </button>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                  <div className="flex gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                    <p className="text-sm text-amber-800"><strong>Important:</strong> Each backup code can only be used once.</p>
                  </div>
                </div>

                <button onClick={() => setStep('complete')} className="w-full py-3 px-4 bg-[#0070cc] text-white font-semibold rounded-lg hover:bg-[#005fa3]">
                  I've Saved My Codes
                </button>
              </div>
            )}

            {step === 'complete' && (
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-3">2FA Enabled!</h2>
                <p className="text-gray-600 mb-8">Your account is now protected with two-factor authentication.</p>
                <button onClick={() => router.push('/admin/offers')} className="w-full py-3 px-4 bg-[#0070cc] text-white font-semibold rounded-lg hover:bg-[#005fa3]">
                  Go to Dashboard
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
