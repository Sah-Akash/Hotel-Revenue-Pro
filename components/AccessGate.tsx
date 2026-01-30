import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Lock, ArrowRight, ShieldAlert, Loader2, KeyRound, User, Phone, Mail, Send, CheckCircle2, ChevronLeft } from 'lucide-react';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

// SECURITY CONFIG
const MASTER_KEY = "Imissyoupapa@123";
const ADMIN_EMAIL = "aayansah17@gmail.com"; 

interface Props {
  children: React.ReactNode;
  onAdminAccess: () => void;
}

const AccessGate: React.FC<Props> = ({ children, onAdminAccess }) => {
  const [mode, setMode] = useState<'enter' | 'request'>('enter');
  
  // Auth State
  const [accessKey, setAccessKey] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Request Form State
  const [reqName, setReqName] = useState('');
  const [reqEmail, setReqEmail] = useState('');
  const [reqMobile, setReqMobile] = useState('');
  const [requestSent, setRequestSent] = useState(false);
  const [sendingRequest, setSendingRequest] = useState(false);

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

  const validateLocalKey = (key: string, deviceId: string) => {
      const localKeys = JSON.parse(localStorage.getItem('hrp_admin_keys') || '[]');
      const keyData = localKeys.find((k: any) => k.key === key);

      if (!keyData) throw new Error('Invalid Access Key');
      if (Date.now() > keyData.expiresAt) throw new Error('Access Key Expired');
      
      // Allow key reuse on same device
      if (keyData.deviceId && keyData.deviceId !== deviceId) {
          throw new Error('Key already used on another device');
      }
      
      if (!keyData.deviceId) {
          keyData.deviceId = deviceId;
          const updatedKeys = localKeys.map((k: any) => k.key === key ? keyData : k);
          localStorage.setItem('hrp_admin_keys', JSON.stringify(updatedKeys));
      }

      return keyData.expiresAt;
  };

  const handleValidate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const key = accessKey.trim(); 

    // 1. Master Admin Check
    if (key === MASTER_KEY) {
        localStorage.setItem('hrp_access_key', 'ADMIN123');
        localStorage.setItem('hrp_session_expiry', (Date.now() + 86400000).toString());
        setIsAuthenticated(true);
        onAdminAccess();
        setLoading(false);
        return;
    }

    // 2. Regular User Key Check
    const formattedKey = key.toUpperCase();

    try {
      const deviceId = getDeviceId();
      let isValid = false;
      let expiry = 0;

      // Try API/DB Validation first
      try {
          // If using real backend API
          const response = await fetch('/api/validate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key: formattedKey, deviceId }),
          });
          
          if (response.headers.get("content-type")?.includes("application/json")) {
             const data = await response.json();
             if (response.ok) {
                 isValid = true;
                 expiry = data.expiresAt;
             } else {
                 throw new Error(data.error || 'Validation failed');
             }
          } else {
              throw new Error("API_UNAVAILABLE");
          }
      } catch (err: any) {
          // Fallback to Local/Firestore check handled by component logic if API fails
          if (err.message === "API_UNAVAILABLE" || err.message.includes("Failed to fetch") || err.name === 'SyntaxError') {
              // Check Local Storage (Syncs with Admin Dashboard on same device)
              expiry = validateLocalKey(formattedKey, deviceId);
              isValid = true;
          } else {
              throw err;
          }
      }

      if (isValid) {
        localStorage.setItem('hrp_access_key', formattedKey);
        localStorage.setItem('hrp_session_expiry', expiry.toString());
        setIsAuthenticated(true);
      }

    } catch (err: any) {
      setError(err.message);
      localStorage.removeItem('hrp_session_expiry');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setSendingRequest(true);
      setError(null);

      // Validation
      if (!reqEmail.toLowerCase().endsWith('@gmail.com')) {
          setError('Only @gmail.com addresses are accepted.');
          setSendingRequest(false);
          return;
      }
      if (!/^\d{10}$/.test(reqMobile)) {
          setError('Please enter a valid 10-digit mobile number.');
          setSendingRequest(false);
          return;
      }

      const requestData = {
          name: reqName,
          email: reqEmail,
          mobile: reqMobile,
          requestedAt: Date.now(),
          status: 'pending'
      };

      try {
          // 1. Save to Database (So it shows in Admin Panel)
          if (db) {
             try { 
                 await addDoc(collection(db, 'access_requests'), requestData); 
             } catch (e) {
                 console.error("DB Save failed", e);
                 // We continue anyway so the email triggers
             }
          } else {
              // Fallback for local testing
              const existing = JSON.parse(localStorage.getItem('hrp_requests_local') || '[]');
              localStorage.setItem('hrp_requests_local', JSON.stringify([requestData, ...existing]));
          }
          
          // 2. Trigger Email Client (Reliable delivery)
          const subject = "Request for RevenuePro Access Key";
          const body = `Hi Admin,\n\nI request an access key.\n\nName: ${reqName}\nMobile: ${reqMobile}\nEmail: ${reqEmail}\n\nPlease verify and send the key.`;
          window.location.href = `mailto:${ADMIN_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
          
          setRequestSent(true);
      } catch (err) {
          setError("Failed to submit request.");
      } finally {
          setSendingRequest(false);
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
      
      {/* Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-slate-950 md:hidden"></div>
        <div className="hidden md:block absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-blue-900/10 rounded-full blur-[120px]"></div>
        <div className="hidden md:block absolute top-[40%] -right-[10%] w-[40%] h-[60%] bg-indigo-900/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="bg-slate-900/50 border border-slate-800 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <Lock className="w-8 h-8 text-blue-500" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
              {mode === 'enter' ? 'Restricted Access' : 'Request Access'}
          </h1>
          <p className="text-slate-400 text-sm">
              {mode === 'enter' 
                ? 'Enter your access key or password.' 
                : 'Keys are valid for 24 hours.'}
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-3xl shadow-2xl">
          
          {/* --- ENTER KEY MODE --- */}
          {mode === 'enter' && (
              <form onSubmit={handleValidate} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                    Key / Password
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type="text"
                      value={accessKey}
                      onChange={(e) => setAccessKey(e.target.value)}
                      placeholder="Enter Key"
                      className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono tracking-widest text-center text-lg"
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
                      Unlock App <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>

                <div className="text-center pt-2">
                    <button 
                        type="button"
                        onClick={() => { setMode('request'); setError(null); }}
                        className="text-slate-400 hover:text-white text-sm font-medium transition-colors"
                    >
                        Don't have a key? <span className="text-blue-400 hover:underline">Request one</span>
                    </button>
                </div>
              </form>
          )}

          {/* --- REQUEST KEY MODE --- */}
          {mode === 'request' && !requestSent && (
              <form onSubmit={handleRequestSubmit} className="space-y-4">
                  <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Full Name</label>
                      <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                          <input type="text" required value={reqName} onChange={e => setReqName(e.target.value)} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 pl-11 pr-4 text-white focus:border-blue-500 focus:outline-none" placeholder="Your Name" />
                      </div>
                  </div>
                  <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Mobile Number</label>
                      <div className="relative">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                          <input type="tel" required pattern="\d{10}" value={reqMobile} onChange={e => setReqMobile(e.target.value)} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 pl-11 pr-4 text-white focus:border-blue-500 focus:outline-none" placeholder="10-digit Mobile" />
                      </div>
                  </div>
                  <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Email (Gmail Only)</label>
                      <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                          <input type="email" required pattern=".+@gmail\.com" value={reqEmail} onChange={e => setReqEmail(e.target.value)} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 pl-11 pr-4 text-white focus:border-blue-500 focus:outline-none" placeholder="you@gmail.com" />
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
                    disabled={sendingRequest}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 mt-4"
                  >
                    {sendingRequest ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Send Request <Send className="w-4 h-4" /></>}
                  </button>

                  <button 
                      type="button"
                      onClick={() => { setMode('enter'); setError(null); }}
                      className="w-full text-slate-400 hover:text-white text-sm font-medium py-2 transition-colors flex items-center justify-center gap-2"
                  >
                      <ChevronLeft className="w-4 h-4" /> Back to Login
                  </button>
              </form>
          )}

          {/* --- REQUEST SUCCESS STATE --- */}
          {mode === 'request' && requestSent && (
              <div className="text-center py-4">
                  <div className="w-16 h-16 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Email Opened!</h3>
                  <p className="text-slate-400 text-sm mb-6">
                      Please <strong>send the email</strong> that just opened. <br/>
                      The admin will review and send you a key shortly.
                  </p>
                  
                  <button 
                      onClick={() => { setMode('enter'); setRequestSent(false); }}
                      className="text-blue-400 hover:text-blue-300 font-bold text-sm"
                  >
                      Back to Login
                  </button>
              </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default AccessGate;