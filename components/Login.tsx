import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Building2, CheckCircle2, ShieldCheck, ArrowRight, User, Loader2, KeyRound } from 'lucide-react';

const Login: React.FC = () => {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Hidden Admin Login State
  const [clickCount, setClickCount] = useState(0);
  const [showAdminInput, setShowAdminInput] = useState(false);
  const [adminKey, setAdminKey] = useState('');

  const handleLogin = async () => {
      setLoading(true);
      setError(null);
      try {
          await login();
      } catch (err: any) {
          setError("Failed to sign in. Please try again.");
          console.error(err);
          setLoading(false);
      }
  };

  const handleLogoClick = () => {
      const newCount = clickCount + 1;
      setClickCount(newCount);
      if (newCount >= 5) {
          setShowAdminInput(true);
          setClickCount(0);
      }
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (adminKey === "Imissyoupapa@123") {
          localStorage.setItem('hrp_access_key', 'ADMIN123');
          // Force reload to trigger LicenseGate admin check
          window.location.reload();
      } else {
          setError("Invalid Master Key");
      }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-indigo-900/20 md:hidden"></div>
            <div className="hidden md:block absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[100px]"></div>
            <div className="hidden md:block absolute top-[30%] -right-[10%] w-[40%] h-[60%] bg-indigo-600/20 rounded-full blur-[100px]"></div>
        </div>

        <div className="w-full max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
            
            {/* Left Column: Value Prop */}
            <div className="text-white space-y-8">
                <div 
                    className="flex items-center gap-3 mb-4 cursor-pointer select-none" 
                    onClick={handleLogoClick}
                    title="Click 5 times for Admin Access"
                >
                     <div className="bg-blue-600 p-2 rounded-xl">
                        <Building2 className="w-6 h-6 text-white" />
                     </div>
                     <span className="font-bold text-xl tracking-tight">RevenuePro</span>
                </div>

                <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                    Professional <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Hotel Financial</span> <br/>
                    Forecasting
                </h1>
                
                <p className="text-slate-400 text-lg leading-relaxed max-w-md">
                    Stop using messy spreadsheets. Calculate revenue, ROI, and property valuation in seconds with our professional-grade financial modeling tool.
                </p>

                <div className="space-y-4 pt-4">
                    {[
                        "Real-time Revenue Calculation",
                        "Investment & ROI Analysis",
                        "Detailed Deal Sheet Generation",
                        "Professional PDF Reports"
                    ].map((feature, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                            <span className="text-slate-200">{feature}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right Column: Login Card */}
            <div className="flex justify-center lg:justify-end">
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl w-full max-w-md shadow-2xl transition-all">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-white mb-2">{showAdminInput ? 'Admin Access' : 'Get Started'}</h2>
                        <p className="text-slate-400 text-sm">
                            {showAdminInput ? 'Enter Master Key to bypass login.' : 'Sign in with Google to access the app.'}
                        </p>
                    </div>

                    {error && (
                        <div className="mb-4 bg-red-500/20 border border-red-500/50 p-3 rounded-lg text-red-200 text-sm text-center">
                            {error}
                        </div>
                    )}

                    {!showAdminInput ? (
                        <button 
                            onClick={handleLogin}
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all transform hover:-translate-y-1 shadow-lg group disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin"/> : <User className="w-5 h-5" />}
                            <span>{loading ? 'Connecting...' : 'Sign in with Google'}</span>
                            {!loading && <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity -ml-2 group-hover:ml-0" />}
                        </button>
                    ) : (
                        <form onSubmit={handleAdminSubmit} className="space-y-4">
                             <div className="relative">
                                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <input
                                    type="password"
                                    value={adminKey}
                                    onChange={(e) => setAdminKey(e.target.value)}
                                    placeholder="Master Key"
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono"
                                />
                             </div>
                             <div className="grid grid-cols-2 gap-3">
                                <button type="button" onClick={() => setShowAdminInput(false)} className="bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-xl font-bold text-sm">Cancel</button>
                                <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-bold text-sm">Enter</button>
                             </div>
                        </form>
                    )}

                    <div className="mt-6 text-center">
                        <div className="flex items-center justify-center gap-2 text-slate-500 text-xs">
                            <ShieldCheck className="w-3 h-3 text-emerald-500" />
                            <span>Secure Access • No Credit Card Required</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Footer Attribution */}
        <div className="absolute bottom-8 left-0 w-full flex justify-center z-20 pointer-events-none">
            <div className="mx-4 px-6 py-2.5 rounded-full border border-slate-700 bg-slate-900/80 backdrop-blur-md pointer-events-auto shadow-lg hover:border-slate-600 transition-all">
                <p className="text-slate-500 text-xs font-medium">
                    App created by <span className="text-slate-200 hover:text-white transition-colors font-semibold cursor-default">Akash Sah</span>. All rights reserved.
                </p>
            </div>
        </div>
    </div>
  );
};

export default Login;