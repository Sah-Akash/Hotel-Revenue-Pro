import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Building2, CheckCircle2, ShieldCheck, ArrowRight, User } from 'lucide-react';

const Login: React.FC = () => {
  const { continueAsGuest } = useAuth();

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
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl w-full max-w-md shadow-2xl">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-white mb-2">Get Started</h2>
                        <p className="text-slate-400 text-sm">Access the financial modeling suite instantly.</p>
                    </div>

                    <button 
                        onClick={continueAsGuest}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all transform hover:-translate-y-1 shadow-lg group"
                    >
                        <User className="w-5 h-5" />
                        <span>Launch App</span>
                        <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity -ml-2 group-hover:ml-0" />
                    </button>

                    <div className="mt-6 text-center">
                        <div className="flex items-center justify-center gap-2 text-slate-500 text-xs">
                            <ShieldCheck className="w-3 h-3 text-emerald-500" />
                            <span>No account required. Data stored locally.</span>
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