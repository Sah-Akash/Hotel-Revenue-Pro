
import React, { useEffect, useState } from 'react';
import { AppSettings, SubscriptionStatus } from '../types';
import { Save, Coins, Percent, User, Settings2, Trash2, Database, AlertTriangle, CheckCircle2, Clock, Calendar, Shield, CreditCard, RefreshCw, Smartphone, Copy } from 'lucide-react';
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
  const [loadingLicense, setLoadingLicense] = useState(true);
  
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const fetchLicense = async () => {
      if (user) {
          setLoadingLicense(true);
          try {
            const data = await BackendService.getLicense(user.uid);
            setLicense(data);
          } catch (e) {
            console.error("Failed to load license", e);
          } finally {
            setLoadingLicense(false);
          }
      } else {
          setLoadingLicense(false);
      }
  };

  useEffect(() => {
      fetchLicense();
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(localSettings);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const copyToClipboard = (text: string) => {
      navigator.clipboard.writeText(text);
      alert("Copied to clipboard!");
  };

  // Calculations for Subscription Card
  const now = Date.now();
  const expiresAt = license?.expiresAt || 0;
  const startedAt = license?.startedAt || now;
  const totalDuration = Math.max(expiresAt - startedAt, 1); // Avoid div by zero
  const elapsed = Math.max(now - startedAt, 0);
  
  const daysLeftRaw = (expiresAt - now) / (1000 * 60 * 60 * 24);
  const daysLeft = Math.ceil(daysLeftRaw);
  
  const progressPercent = Math.min(Math.max((elapsed / totalDuration) * 100, 0), 100);
  const isTrial = license?.planId === 'trial';
  const isExpired = daysLeft <= 0;
  const status = isExpired ? 'expired' : (license?.status || 'active');

  const formatDate = (ts: number) => {
      if (!ts) return 'N/A';
      return new Date(ts).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (!user) {
      return (
          <div className="p-12 text-center">
              <h2 className="text-xl font-bold text-slate-700">Please Sign In</h2>
              <p className="text-slate-500">You must be logged in to view settings.</p>
          </div>
      );
  }

  return (
    <div className="p-6 md:p-12 max-w-6xl mx-auto pb-24 font-sans">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div className="flex items-center gap-4">
                <div className="p-3.5 bg-slate-900 text-white rounded-2xl shadow-lg shadow-slate-300 ring-4 ring-slate-100">
                    <Settings2 className="w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Settings & Profile</h1>
                    <p className="text-slate-500 font-medium mt-1">Manage your account, subscription, and app preferences</p>
                </div>
            </div>
            
             <button 
                onClick={fetchLicense} 
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 text-sm font-bold hover:bg-slate-50 transition-colors shadow-sm self-start md:self-auto"
            >
                <RefreshCw className={`w-4 h-4 ${loadingLicense ? 'animate-spin' : ''}`} /> Sync Data
            </button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            
            {/* Left Col: User Profile & Subscription */}
            <div className="xl:col-span-2 space-y-8">
                
                {/* 1. Identity Card */}
                <div className="bg-white rounded-[32px] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden relative group">
                     {/* Decorative Background */}
                     <div className="absolute top-0 w-full h-48 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 z-0"></div>
                     <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl z-0 pointer-events-none"></div>

                     <div className="relative z-10 pt-12 px-8 pb-8">
                        <div className="flex flex-col md:flex-row items-start md:items-end gap-6 mb-8">
                            <div className="w-28 h-28 rounded-[28px] bg-white p-1.5 shadow-2xl ring-4 ring-white/20">
                                <div className="w-full h-full rounded-[22px] bg-slate-100 flex items-center justify-center overflow-hidden relative">
                                    {user.photoURL ? (
                                        <img src={user.photoURL} alt="User" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 w-full h-full flex items-center justify-center text-white text-3xl font-bold">
                                            {user.displayName ? user.displayName.charAt(0).toUpperCase() : <User className="w-10 h-10" />}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="text-white flex-1 mb-2">
                                <h2 className="text-3xl font-bold tracking-tight shadow-black/10 drop-shadow-md">{user.displayName || 'Guest User'}</h2>
                                <div className="flex items-center gap-3 text-blue-100 font-medium mt-1 text-sm md:text-base">
                                    <span>{user.email}</span>
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                                    <span className="opacity-80">Since {new Date().getFullYear()}</span>
                                </div>
                            </div>
                            <div className="mb-2 hidden md:block">
                                <span className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest border backdrop-blur-md shadow-lg ${isTrial ? 'bg-blue-500/20 border-blue-400/30 text-blue-50' : 'bg-emerald-500/20 border-emerald-400/30 text-emerald-50'}`}>
                                    {loadingLicense ? 'Checking...' : (isTrial ? 'Trial Access' : 'Pro Member')}
                                </span>
                            </div>
                        </div>

                        {/* Subscription Detail Grid */}
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 relative">
                             {loadingLicense ? (
                                 <div className="space-y-4 animate-pulse">
                                     <div className="h-6 bg-slate-100 rounded w-1/3"></div>
                                     <div className="h-4 bg-slate-100 rounded w-full"></div>
                                     <div className="h-20 bg-slate-50 rounded-xl mt-4"></div>
                                 </div>
                             ) : (
                                 <>
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <CreditCard className="w-4 h-4 text-slate-400" />
                                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Current Plan</span>
                                            </div>
                                            <div className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                                {isTrial ? 'Free Trial' : 'Professional Plan'}
                                                <span className={`px-2 py-0.5 text-[10px] rounded-full uppercase tracking-wide ${isExpired ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                                    {isExpired ? 'Expired' : 'Active'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-left sm:text-right bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-0.5">Time Remaining</div>
                                            <div className={`text-2xl font-black ${isExpired ? 'text-red-500' : 'text-slate-900'}`}>
                                                {daysLeft > 0 ? daysLeft : 0} <span className="text-sm font-bold text-slate-400">Days</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="mb-6">
                                        <div className="flex justify-between text-xs font-bold text-slate-500 mb-2">
                                            <span>Usage</span>
                                            <span>{Math.round(progressPercent)}%</span>
                                        </div>
                                        <div className="h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-50">
                                            <div 
                                                className={`h-full rounded-full transition-all duration-1000 ${isExpired ? 'bg-red-500' : (daysLeft < 3 ? 'bg-orange-500' : 'bg-blue-600')}`} 
                                                style={{ width: `${progressPercent}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    {/* Meta Details */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-slate-100">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-slate-50 text-slate-500 rounded-lg">
                                                <Calendar className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <div className="text-[10px] text-slate-400 font-bold uppercase">Start Date</div>
                                                <div className="text-sm font-semibold text-slate-700">{formatDate(startedAt)}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-slate-50 text-slate-500 rounded-lg">
                                                <Clock className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <div className="text-[10px] text-slate-400 font-bold uppercase">Expiration</div>
                                                <div className="text-sm font-semibold text-slate-700">{formatDate(expiresAt)}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 md:col-span-2 group cursor-pointer" onClick={() => copyToClipboard(user.uid)}>
                                            <div className="p-2 bg-slate-50 text-slate-500 rounded-lg group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                                <Shield className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1 overflow-hidden">
                                                <div className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
                                                    User ID <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </div>
                                                <div className="text-xs font-mono font-medium text-slate-500 truncate group-hover:text-blue-600 transition-colors" title={user.uid}>
                                                    {user.uid}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 md:col-span-2">
                                            <div className="p-2 bg-slate-50 text-slate-500 rounded-lg">
                                                <Smartphone className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1 overflow-hidden">
                                                <div className="text-[10px] text-slate-400 font-bold uppercase">Registered Device</div>
                                                <div className="text-xs font-medium text-slate-600 truncate" title={license?.deviceLabel}>
                                                    {license?.deviceLabel || 'Unknown Device'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                 </>
                             )}
                        </div>
                     </div>
                </div>

                {/* 2. Security Zone */}
                {/* Optional area for changing password etc, but we use Google Auth so skipped */}

            </div>

            {/* Right Col: Preferences */}
            <div className="xl:col-span-1">
                 <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-xl shadow-slate-200/50 h-full flex flex-col relative overflow-hidden">
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
                                className="w-full py-3 px-4 rounded-xl border border-red-100 bg-red-50 text-red-600 text-xs font-bold hover:bg-red-100 transition-colors flex items-center justify-center gap-2 group"
                             >
                                <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" /> Clear Cache & Reset App
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
