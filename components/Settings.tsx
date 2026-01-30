
import React, { useEffect, useState } from 'react';
import { AppSettings } from '../types';
import { Save, Coins, Percent, User, Crown, Clock, Calendar, Mail, AlertTriangle, ShieldCheck, Code2, Linkedin, ExternalLink, Award } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { BackendService } from '../services/backend';

interface Props {
  settings: AppSettings;
  onSave: (settings: AppSettings) => void;
}

const SUPPORT_EMAIL = "aayansah17@gmail.com";
const LINKEDIN_URL = "https://www.linkedin.com/in/aboutakashsah/";

const Settings: React.FC<Props> = ({ settings, onSave }) => {
  const { user } = useAuth();
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const [isSaved, setIsSaved] = useState(false);
  
  // Subscription State
  const [license, setLicense] = useState<any>(null);
  const [loadingLicense, setLoadingLicense] = useState(true);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  useEffect(() => {
      const fetchLicense = async () => {
          if (user) {
              const data = await BackendService.getLicense(user.uid);
              setLicense(data);
          }
          setLoadingLicense(false);
      };
      fetchLicense();
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(localSettings);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const contactSupport = () => {
      window.location.href = `mailto:${SUPPORT_EMAIL}?subject=Support Request - RevenuePro&body=User ID: ${user?.uid}`;
  };

  // Calculations for Subscription Card
  const now = Date.now();
  const expiresAt = license?.expiresAt || 0;
  const startedAt = license?.startedAt || now;
  const totalDuration = expiresAt - startedAt;
  const elapsed = now - startedAt;
  const daysLeft = Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24));
  const progress = Math.min(Math.max((elapsed / totalDuration) * 100, 0), 100);
  const isTrial = license?.planId === 'trial';
  const isExpired = daysLeft <= 0;

  return (
    <div className="p-6 md:p-12 max-w-5xl mx-auto pb-24">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Settings & Account</h1>

        <div className="space-y-8">
            
            {/* 1. Subscription Profile Card */}
            {user && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden relative">
                    <div className={`h-2 w-full ${isExpired ? 'bg-red-500' : isTrial ? 'bg-blue-500' : 'bg-emerald-500'}`}></div>
                    <div className="p-8">
                        <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                            
                            {/* User Info */}
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center border-4 border-white shadow-lg">
                                    {user.photoURL ? (
                                        <img src={user.photoURL} alt="User" className="w-full h-full rounded-full" />
                                    ) : (
                                        <User className="w-8 h-8 text-slate-400" />
                                    )}
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900">{user.displayName || 'User'}</h2>
                                    <p className="text-sm text-slate-500 font-mono">{user.email}</p>
                                    <p className="text-xs text-slate-400 mt-1">ID: {user.uid.slice(0, 8)}...</p>
                                </div>
                            </div>

                            {/* Plan Status */}
                            <div className="flex flex-col items-end">
                                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide border mb-2 ${
                                    isExpired ? 'bg-red-50 text-red-600 border-red-200' : 
                                    isTrial ? 'bg-blue-50 text-blue-600 border-blue-200' : 
                                    'bg-emerald-50 text-emerald-600 border-emerald-200'
                                }`}>
                                    {isTrial ? <Clock className="w-3.5 h-3.5" /> : <Crown className="w-3.5 h-3.5" />}
                                    {isExpired ? 'Expired' : isTrial ? 'Trial Plan' : 'Pro Plan'}
                                </div>
                                <div className="text-right">
                                    <div className={`text-2xl font-black ${daysLeft < 3 ? 'text-red-500' : 'text-slate-800'}`}>
                                        {isExpired ? '0 Days' : `${daysLeft} Days`}
                                    </div>
                                    <div className="text-xs text-slate-400 font-medium">Remaining</div>
                                </div>
                            </div>
                        </div>

                        {/* Progress Bar for Trial */}
                        {!isExpired && (
                            <div className="mt-8">
                                <div className="flex justify-between text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">
                                    <span>Started: {new Date(startedAt).toLocaleDateString()}</span>
                                    <span>Expires: {new Date(expiresAt).toLocaleDateString()}</span>
                                </div>
                                <div className="h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-100">
                                    <div 
                                        className={`h-full rounded-full transition-all duration-1000 shadow-sm ${daysLeft < 3 ? 'bg-red-500' : 'bg-gradient-to-r from-blue-500 to-indigo-600'}`} 
                                        style={{ width: `${progress}%` }}
                                    ></div>
                                </div>
                                {isTrial && (
                                    <div className="mt-4 p-4 bg-blue-50/50 border border-blue-100 rounded-xl flex items-start gap-3">
                                        <AlertTriangle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-bold text-blue-900">Trial Active</p>
                                            <p className="text-xs text-blue-700 mt-1 leading-relaxed">
                                                You are enjoying the 7-day free trial. To unlock unlimited access and remove restrictions after your trial ends, please contact support for a Pro license.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        
                        {isExpired && (
                            <div className="mt-6">
                                <button onClick={contactSupport} className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200">
                                    Renew Subscription Now
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 2. Calculation Defaults */}
                <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm h-full flex flex-col">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="bg-emerald-50 p-2 rounded-lg text-emerald-600">
                            <Coins className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-800">App Defaults</h2>
                    </div>

                    <div className="space-y-6 flex-1">
                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-2">Default Currency</label>
                            <select 
                                value={localSettings.currencySymbol}
                                onChange={e => setLocalSettings({...localSettings, currencySymbol: e.target.value})}
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 bg-slate-50 text-slate-800 font-bold"
                            >
                                <option value="₹">Indian Rupee (₹)</option>
                                <option value="$">US Dollar ($)</option>
                                <option value="€">Euro (€)</option>
                                <option value="£">British Pound (£)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-2">Default Interest Rate (%)</label>
                            <div className="relative">
                                <Percent className="absolute right-4 top-3.5 w-4 h-4 text-slate-400" />
                                <input 
                                    type="number" 
                                    step="0.1"
                                    value={localSettings.defaultInterestRate}
                                    onChange={e => setLocalSettings({...localSettings, defaultInterestRate: Number(e.target.value)})}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-bold text-slate-800 bg-slate-50"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
                        <button 
                            type="submit"
                            className="flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-500 transition-all shadow-md shadow-blue-200"
                        >
                            <Save className="w-4 h-4" />
                            {isSaved ? 'Saved!' : 'Save Defaults'}
                        </button>
                    </div>
                </form>

                 {/* 3. Founder Profile */}
                 <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-[100px] -mr-8 -mt-8 z-0 group-hover:bg-blue-50 transition-colors duration-500"></div>
                    
                    <div className="p-8 relative z-10 flex flex-col h-full">
                        <div className="flex items-start justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-full bg-slate-900 flex items-center justify-center text-white font-bold text-xl shadow-xl border-4 border-white">
                                    AS
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 text-lg">Akash Sah</h3>
                                    <div className="flex items-center gap-1.5 text-xs text-blue-600 font-bold uppercase tracking-wide mt-0.5">
                                        <Award className="w-3 h-3" /> Founder & Lead Engineer
                                    </div>
                                </div>
                            </div>
                            <a 
                                href={LINKEDIN_URL}
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="p-2 bg-[#0077b5] text-white rounded-lg hover:bg-[#006396] transition-colors shadow-sm"
                                title="Connect on LinkedIn"
                            >
                                <Linkedin className="w-5 h-5" />
                            </a>
                        </div>

                        <div className="space-y-4 mb-8">
                            <p className="text-slate-600 text-sm leading-relaxed">
                                A visionary technologist and entrepreneur, Akash is dedicated to transforming the hospitality industry through intelligent software. With deep expertise in Full-Stack Architecture and Financial Analytics, he built <strong>Hotel Revenue Pro</strong> to solve the complex challenges of revenue forecasting.
                            </p>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                Driven by a passion for clean code and user-centric design, Akash continues to push the boundaries of SaaS innovation, empowering business owners to make smarter, data-backed investment decisions.
                            </p>
                        </div>
                        
                        <div className="mt-auto grid grid-cols-2 gap-3">
                            <a 
                                href={LINKEDIN_URL}
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 border border-slate-200 hover:border-blue-200 hover:bg-blue-50 text-slate-700 px-4 py-3 rounded-xl text-sm font-bold transition-all"
                            >
                                <ExternalLink className="w-4 h-4" /> View Profile
                            </a>
                            <button 
                                onClick={contactSupport}
                                className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-3 rounded-xl text-sm font-bold transition-all shadow-md shadow-slate-200"
                            >
                                <Mail className="w-4 h-4" /> Contact
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Legal / Disclaimer */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/60">
                <div className="flex items-center gap-3 mb-4">
                    <div className="bg-slate-200 p-2 rounded-lg text-slate-600">
                        <ShieldCheck className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-slate-800">Legal Disclaimer</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-500 leading-relaxed text-justify">
                    <p>
                        <strong>For Estimation Only:</strong> The figures generated by this application are estimates based on user inputs and standard industry formulas. They should not be considered as guaranteed results.
                    </p>
                    <p>
                        <strong>Not Financial Advice:</strong> This tool does not constitute professional financial, legal, or investment advice. Users should independently verify all calculations before making business decisions.
                    </p>
                    <p>
                        <strong>No Liability:</strong> The developer (Akash Sah) accepts no liability for any loss or damage arising from the use of this software. By using this tool, you agree to these terms.
                    </p>
                </div>
            </div>

             {/* Footer Contact */}
             <div className="text-center pt-8 border-t border-slate-200">
                <p className="text-slate-400 text-xs font-medium">Have a feature request or need enterprise support?</p>
                <a href={`mailto:${SUPPORT_EMAIL}`} className="text-blue-600 text-sm font-bold hover:underline mt-1 inline-block">
                    {SUPPORT_EMAIL}
                </a>
             </div>

        </div>
    </div>
  );
};

export default Settings;
