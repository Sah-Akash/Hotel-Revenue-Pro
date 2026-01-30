import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Lock, ArrowRight, ShieldAlert, Loader2, KeyRound } from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

const AccessGate: React.FC<Props> = ({ children }) => {
  const [accessKey, setAccessKey] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkSession();
  }, []);

  const getDeviceId = () => {
    let id = localStorage.getItem('hrp_device_id');
    if (!id) {
      id = uuidv4();
      localStorage.setItem('hrp_device_id', id);
    }
    return id;
  };

  const checkSession = () => {
    const sessionExpiry = localStorage.getItem('hrp_session_expiry');
    const storedKey = localStorage.getItem('hrp_access_key');

    if (sessionExpiry && storedKey) {
      const now = Date.now();
      if (parseInt(sessionExpiry) > now) {
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem('hrp_session_expiry');
        localStorage.removeItem('hrp_access_key');
        setError('Your session has expired. Please request a new key.');
      }
    }
    setLoading(false);
  };

  const handleValidate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const deviceId = getDeviceId();
      const response = await fetch('/api/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: accessKey.trim().toUpperCase(), deviceId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Validation failed');
      }

      // Success
      localStorage.setItem('hrp_access_key', accessKey.trim().toUpperCase());
      localStorage.setItem('hrp_session_expiry', data.expiresAt.toString());
      setIsAuthenticated(true);
    } catch (err: any) {
      setError(err.message);
      // If key is invalid, ensure we don't have lingering session data
      localStorage.removeItem('hrp_session_expiry');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-blue-900/10 rounded-full blur-[120px]"></div>
        <div className="absolute top-[40%] -right-[10%] w-[40%] h-[60%] bg-indigo-900/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <div className="bg-slate-900/50 border border-slate-800 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <Lock className="w-8 h-8 text-blue-500" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Restricted Access</h1>
          <p className="text-slate-400">Enter your 24-hour access key to continue.</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl">
          <form onSubmit={handleValidate} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                Access Key
              </label>
              <div className="relative">
                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="text"
                  value={accessKey}
                  onChange={(e) => setAccessKey(e.target.value)}
                  placeholder="e.g. A1B2-C3D4"
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono tracking-widest uppercase text-center text-lg"
                  maxLength={20}
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <p className="text-sm text-red-300 leading-relaxed">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !accessKey}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-900/20"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Unlock Calculator <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <p className="text-xs text-slate-500">
              Keys are valid for 24 hours and bound to this device.
              <br /> Contact admin for access.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessGate;