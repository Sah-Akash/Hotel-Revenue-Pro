
import React, { useEffect, useState } from 'react';
import { AppSettings } from '../types';
import { Save, Coins, Percent, User, Settings2, Trash2, Database, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { BackendService } from '../services/backend';

interface Props {
  settings: AppSettings;
  onSave: (settings: AppSettings) => void;
}

const Settings: React.FC<Props> = ({ settings, onSave }) => {
  const { user } = useAuth();
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const [isSaved, setIsSaved] = useState(false);
  
  // Subscription State
  const [license, setLicense] = useState<any>(null);
  
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  useEffect(() => {
      const fetchLicense = async () => {
          if (user) {
              const data = await BackendService.getLicense(user.uid);
              setLicense(data);
          }
      };
      fetchLicense();
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(localSettings);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
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
    <div className="p-6 md:p-12 max-w-5xl mx-auto pb-24 font-sans">
        <div className="flex items-center gap-4 mb-10">
            <div className="p-3 bg-slate-900 text-white rounded-2xl shadow-lg shadow-slate-300">
                <Settings2 className="w-6 h-6" />
            </div>
            <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Settings & Account</h1>
                <p className="text-slate-500 font-medium">Manage your subscription and app preferences</p>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Col: Subscription (Enhanced Visuals) */}
            <div className="lg:col-span-2 space-y-8">
                {user && (
                    <div className="bg-white rounded-[32px] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden relative">
                         {/* Header Gradient */}
                         <div className="absolute top-0 w-full h-40 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 z-0"></div>
                         
                         <div className="relative z-10 p-8 pt-10">
                            <div className="flex justify-between items-start mb-10">
                                <div className="flex items-center gap-5">
                                    <div className="w-24 h-24 rounded-[24px] bg-white p-1.5 shadow-2xl ring-4 ring-white/10">
                                        <div className="w-full h-full rounded-[18px] bg-slate-100 flex items-center justify-center overflow-hidden">
                                            {user.photoURL ? (
                                                <img src={user.photoURL} alt="User" className="w-full h-full object-cover" />
                                            ) : (
                                                <User className="w-10 h-10 text-slate-400" />
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-white mt-4">
                                        <h2 className="text-3xl font-bold tracking-tight">{user.displayName || 'User'}</h2>
                                        <p className="text-slate-300 text-sm font-medium opacity-80">{user.email}</p>
                                        <div className="text-[10px] text-slate-400 font-mono mt-1 opacity-60">ID: {user.uid.substring(0,8)}...</div>
                                    </div>
                                </div>
                                <div className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest border backdrop-blur-md shadow-lg ${isTrial ? 'bg-blue-500/20 border-blue-400/30 text-blue-100' : 'bg-emerald-500/20 border-emerald-400/30 text-emerald-100'}`}>
                                    {isTrial ? 'Trial Plan' : 'Pro Plan'}
                                </div>
                            </div>

                            {/* Status Card */}
                            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                                <div className="flex justify-between items-center mb-8">
                                    <div>
                                        <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Subscription Status</div>
                                        <div className={`text-xl font-bold flex items-center gap-2 ${isExpired ? 'text-red-600' : 'text-slate-800'}`}>
                                            {isExpired ? (
                                                <><AlertTriangle className="w-6 h-6" /> Subscription Expired</>
                                            ) : (
                                                <><CheckCircle2 className="w-6 h-6 text-emerald-500" /> Active License</>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Time Remaining</div>
                                        <div className="text-4xl font-black text-slate-900 tracking-tight">{daysLeft > 0 ? daysLeft : 0}<span className="text-lg text-slate-400 font-medium ml-1">days</span></div>
                                    </div>
                                </div>
                                
                                {/* Progress Bar */}
                                <div className="h-4 bg-slate-100 rounded-full overflow-hidden mb-3 border border-slate-50">
                                    <div className={`h-full transition-all duration-1000 ${daysLeft < 3 ? 'bg-red-500' : 'bg-slate-900'}`} style={{ width: `${progress}%` }}></div>
                                </div>
                                <div className="flex justify-between text-[11px] text-slate-400 font-bold uppercase tracking-wide">
                                    <span>Started: {new Date(startedAt).toLocaleDateString()}</span>
                                    <span>Expires: {new Date(expiresAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                         </div>
                    </div>
                )}
            </div>

            {/* Right Col: Preferences */}
            <div className="lg:col-span-1">
                 <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-xl shadow-slate-200/50 h-full flex flex-col">
                    <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-100">
                        <div className="bg-blue-50 p-2.5 rounded-xl text-blue-600">
                            <Settings2 className="w-5 h-5" />
                        </div>
                        <h2 className="font-bold text-slate-800 text-xl">App Defaults</h2>
                    </div>

                    <div className="space-y-8 flex-1">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Currency Symbol</label>
                            <div className="relative group">
                                <Coins className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                                <select 
                                    value={localSettings.currencySymbol}
                                    onChange={e => setLocalSettings({...localSettings, currencySymbol: e.target.value})}
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-700 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none cursor-pointer hover:bg-slate-100"
                                >
                                    <option value="₹">₹ INR</option>
                                    <option value="$">$ USD</option>
                                    <option value="€">€ EUR</option>
                                    <option value="£">£ GBP</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Default Interest Rate (%)</label>
                            <div className="relative group">
                                <Percent className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                                <input 
                                    type="number" 
                                    step="0.1"
                                    value={localSettings.defaultInterestRate}
                                    onChange={e => setLocalSettings({...localSettings, defaultInterestRate: Number(e.target.value)})}
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-700 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                />
                            </div>
                        </div>

                        {/* Local Data Management */}
                        <div className="pt-8 mt-8 border-t border-slate-100">
                             <div className="flex items-center gap-2 mb-4">
                                <Database className="w-4 h-4 text-slate-400" />
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Data Zone</span>
                             </div>
                             <button 
                                type="button"
                                onClick={() => { if(confirm("Are you sure you want to clear all local data? This cannot be undone.")) { localStorage.clear(); window.location.reload(); }}}
                                className="w-full py-3 px-4 rounded-xl border border-red-100 bg-red-50 text-red-600 text-xs font-bold hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                             >
                                <Trash2 className="w-4 h-4" /> Clear Cache & Reset
                             </button>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-100">
                        <button 
                            type="submit"
                            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-300 flex items-center justify-center gap-2 text-base hover:-translate-y-1"
                        >
                            <Save className="w-5 h-5" />
                            {isSaved ? 'Changes Saved!' : 'Save Preferences'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
        
        <div className="mt-20 pt-8 border-t border-slate-200 text-center">
            <p className="text-slate-400 text-sm font-medium">© {new Date().getFullYear()} All rights reserved by Akash Sah.</p>
        </div>
    </div>
  );
};

export default Settings;
