import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Building2, CheckCircle2, TrendingUp, ShieldCheck, ArrowRight, AlertCircle, User } from 'lucide-react';

const Login: React.FC = () => {
  const { login, continueAsGuest } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
      setError(null);
      try {
          await login();
      } catch (err: any) {
          if (err.code === 'auth/api-key-not-valid.-please-pass-a-valid-api-key.' || err.message?.includes('api-key-not-valid')) {
              setError("Missing Firebase Configuration. Please open 'firebase.ts' and add your API Key, or use Guest Mode.");
          } else if (err.code === 'auth/popup-closed-by-user') {
              setError("Sign-in cancelled.");
          } else {
              setError(err.message || "Failed to sign in. Check console for details.");
          }
      }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
            <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[100px]"></div>
            <div className="absolute top-[30%] -right-[10%] w-[40%] h-[60%] bg-indigo-600/20 rounded-full blur-[100px]"></div>
        </div>

        <div className="w-full max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
            
            {/* Left Column: Value Prop */}
            <div className="text-white space-y-8">
                <div className="flex items-center gap-3 mb-4">
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
                        "Cloud Portfolio Sync",
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
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl w-full max-w-md shadow-2xl">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
                        <p className="text-slate-400 text-sm">Sign in to access your saved portfolio</p>
                    </div>

                    {error && (
                        <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                            <p className="text-sm text-red-200 text-left">{error}</p>
                        </div>
                    )}

                    <button 
                        onClick={handleLogin}
                        className="w-full bg-white hover:bg-slate-50 text-slate-900 font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all transform hover:-translate-y-1 shadow-lg mb-4 group"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                fill="#4285F4"
                            />
                            <path
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                fill="#34A853"
                            />
                            <path
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                fill="#FBBC05"
                            />
                            <path
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                fill="#EA4335"
                            />
                        </svg>
                        <span>Continue with Google</span>
                        <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity -ml-2 group-hover:ml-0" />
                    </button>

                    <button 
                        onClick={continueAsGuest}
                        className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-3 px-6 rounded-xl flex items-center justify-center gap-3 transition-colors border border-slate-700 hover:border-slate-600"
                    >
                        <User className="w-4 h-4" />
                        <span>Continue as Guest</span>
                    </button>

                    <div className="mt-6 text-center">
                        <div className="flex items-center justify-center gap-2 text-slate-500 text-xs">
                            <ShieldCheck className="w-3 h-3 text-emerald-500" />
                            <span>Bank-level security for your data</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default Login;