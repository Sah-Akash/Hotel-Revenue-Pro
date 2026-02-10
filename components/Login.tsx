
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { CheckCircle2, ShieldCheck, ArrowRight, User, Loader2, KeyRound } from 'lucide-react';

const PremiumLogo = ({ className = "w-24 h-24" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Classic Royal Crest Shield Shape */}
    <path d="M50 5C50 5 10 20 10 50C10 75 30 90 50 95C70 90 90 75 90 50C90 20 50 5 50 5Z" fill="url(#login-logo-grad)" stroke="url(#login-stroke-grad)" strokeWidth="1"/>
    
    {/* Inner detail lines for 'Old Style' feel */}
    <path d="M50 15V85" stroke="white" strokeWidth="0.5" strokeOpacity="0.2"/>
    <path d="M20 50H80" stroke="white" strokeWidth="0.5" strokeOpacity="0.2"/>

    {/* The Monogram 'R' & 'P' Interlocked - Serif Style */}
    <path d="M35 30H55C65 30 70 35 70 42C70 49 65 54 55 54H35V30Z" stroke="white" strokeWidth="4" fill="none"/>
    <path d="M35 30V70" stroke="white" strokeWidth="4" strokeLinecap="square"/>
    <path d="M45 54L65 70" stroke="white" strokeWidth="4" strokeLinecap="square"/>

    <defs>
      <linearGradient id="login-logo-grad" x1="10" y1="10" x2="90" y2="90" gradientUnits="userSpaceOnUse">
        <stop stopColor="#f59e0b" /> {/* Amber/Gold */}
        <stop offset="1" stopColor="#b45309" /> {/* Dark Gold */}
      </linearGradient>
      <linearGradient id="login-stroke-grad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
        <stop stopColor="#fcd34d" />
        <stop offset="1" stopColor="#78350f" />
      </linearGradient>
    </defs>
  </svg>
);

const Login: React.FC = () => {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [clickCount, setClickCount] = useState(0);
  const [showAdminInput, setShowAdminInput] = useState(false);
  const [adminKey, setAdminKey] = useState('');

  const handleLogin = async () => {
      setLoading(true);
      setError(null);
      try {
          await login();
      } catch (err: any) {
          setError("Identity verification failed. Please use a valid account.");
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
          window.location.reload();
      } else {
          setError("Master Key Rejected");
      }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center relative overflow-hidden font-sans">
        {/* Deep Atmosphere Ray-Tracing Effect */}
        <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(17,24,39,1)_0%,rgba(2,6,23,1)_100%)]"></div>
            <div className="absolute -top-[25%] -left-[15%] w-[70%] h-[70%] bg-amber-600/5 rounded-full blur-[160px]"></div>
            <div className="absolute bottom-[0%] -right-[15%] w-[70%] h-[70%] bg-slate-800/20 rounded-full blur-[160px]"></div>
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>
        </div>

        <div className="w-full max-w-7xl mx-auto px-10 grid grid-cols-1 lg:grid-cols-2 gap-32 items-center relative z-10">
            
            {/* Left Column: Brand Hero */}
            <div className="text-white">
                <div 
                    className="flex items-center gap-8 mb-24 cursor-pointer select-none group w-fit" 
                    onClick={handleLogoClick}
                >
                     <div className="relative">
                        <div className="absolute -inset-10 bg-amber-500/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-all duration-1000"></div>
                        <div className="relative bg-[#0f172a]/80 backdrop-blur-3xl p-6 rounded-3xl border border-white/5 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.7)]">
                            <PremiumLogo className="w-16 h-16" />
                        </div>
                     </div>
                     <div className="flex flex-col">
                        <span className="font-serif font-bold text-4xl tracking-wide leading-none">REVENUE<span className="text-amber-500 ml-1">PRO</span></span>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.5em] mt-3">Est. 2024</span>
                     </div>
                </div>

                <h1 className="text-7xl md:text-[90px] font-serif font-medium leading-[0.9] tracking-tight mb-16">
                    Heritage <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-white">Intelligence</span>
                </h1>
                
                <p className="text-slate-500 text-2xl leading-relaxed max-w-xl font-light mb-16">
                    The institutional standard for hospitality modeling. Precision data engineering meets executive-grade design.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 pt-10 border-t border-white/5">
                    {[
                        "Institutional Yield Analytics",
                        "High-Stakes Deal Analysis",
                        "Tier-1 Asset Reporting",
                        "Predictive Market Mapping"
                    ].map((feature, i) => (
                        <div key={i} className="flex items-center gap-5">
                            <div className="w-7 h-7 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                                <CheckCircle2 className="w-4 h-4 text-amber-500" />
                            </div>
                            <span className="text-slate-400 text-base font-medium tracking-tight uppercase">{feature}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right Column: Premium Auth Card */}
            <div className="flex justify-center lg:justify-end">
                <div className="bg-[#0f172a]/40 backdrop-blur-3xl border border-white/[0.05] p-16 rounded-[60px] w-full max-w-lg shadow-[0_50px_120px_-30px_rgba(0,0,0,0.9)] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 blur-[100px] rounded-full -mr-32 -mt-32 group-hover:bg-amber-500/10 transition-all duration-1000"></div>
                    
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-serif font-bold text-white mb-4 tracking-tight">{showAdminInput ? 'Administrative Key' : 'Member Access'}</h2>
                        <p className="text-slate-600 text-sm font-bold tracking-[0.2em] uppercase">
                            {showAdminInput ? 'Enter master override code.' : 'Authorized Personnel Only'}
                        </p>
                    </div>

                    {error && (
                        <div className="mb-10 bg-red-900/10 border border-red-500/20 p-6 rounded-3xl text-red-400 text-xs font-bold text-center flex items-center justify-center gap-4 uppercase tracking-widest">
                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                            {error}
                        </div>
                    )}

                    {!showAdminInput ? (
                        <button 
                            onClick={handleLogin}
                            disabled={loading}
                            className="w-full bg-white text-[#020617] font-bold py-6 px-10 rounded-[24px] flex items-center justify-center gap-5 transition-all transform hover:-translate-y-2 hover:shadow-2xl hover:shadow-amber-500/20 group disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="w-7 h-7 animate-spin"/> : <User className="w-7 h-7" />}
                            <span className="tracking-tight text-xl">{loading ? 'Verifying...' : 'Sign in with Google'}</span>
                            {!loading && <ArrowRight className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-all -ml-4 group-hover:ml-0" />}
                        </button>
                    ) : (
                        <form onSubmit={handleAdminSubmit} className="space-y-8">
                             <div className="relative">
                                <KeyRound className="absolute left-6 top-1/2 -translate-y-1/2 w-7 h-7 text-slate-600" />
                                <input
                                    type="password"
                                    value={adminKey}
                                    onChange={(e) => setAdminKey(e.target.value)}
                                    placeholder="Access Code"
                                    className="w-full bg-black/40 border border-white/10 rounded-[28px] py-6 pl-16 pr-8 text-white placeholder:text-slate-700 focus:outline-none focus:border-amber-500 transition-all font-mono text-xl"
                                />
                             </div>
                             <div className="grid grid-cols-2 gap-5">
                                <button type="button" onClick={() => setShowAdminInput(false)} className="bg-white/5 hover:bg-white/10 text-slate-500 py-5 rounded-[20px] font-bold text-xs uppercase tracking-widest transition-colors">Cancel</button>
                                <button type="submit" className="bg-amber-600 hover:bg-amber-500 text-white py-5 rounded-[20px] font-bold text-xs uppercase tracking-widest transition-all shadow-xl shadow-amber-600/30">Authorize</button>
                             </div>
                        </form>
                    )}

                    <div className="mt-16 pt-12 border-t border-white/[0.03] text-center">
                        <div className="flex items-center justify-center gap-5 text-slate-700 text-[10px] font-bold uppercase tracking-[0.3em]">
                            <ShieldCheck className="w-5 h-5 text-amber-600" />
                            <span>Encrypted Session</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Global Executive Footer */}
        <div className="absolute bottom-12 left-0 w-full flex justify-center z-20">
            <p className="text-slate-800 text-[10px] font-bold uppercase tracking-[0.6em]">
                AKASH SAH <span className="mx-4 text-amber-900">•</span> REVENUE PRO
            </p>
        </div>
    </div>
  );
};

export default Login;
