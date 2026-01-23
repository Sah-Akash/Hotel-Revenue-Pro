import React, { useEffect, useState } from 'react';
import { AppSettings } from '../types';
import { Save, Coins, Percent } from 'lucide-react';

interface Props {
  settings: AppSettings;
  onSave: (settings: AppSettings) => void;
}

const Settings: React.FC<Props> = ({ settings, onSave }) => {
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(localSettings);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="p-6 md:p-12 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Settings & Preferences</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Application Defaults */}
            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-emerald-50 p-2 rounded-lg text-emerald-600">
                        <Coins className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800">Calculation Defaults</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-2">Default Currency Symbol</label>
                        <select 
                             value={localSettings.currencySymbol}
                             onChange={e => setLocalSettings({...localSettings, currencySymbol: e.target.value})}
                             className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 bg-white"
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
                            <Percent className="absolute right-3 top-2.5 w-4 h-4 text-slate-400" />
                            <input 
                                type="number" 
                                step="0.1"
                                value={localSettings.defaultInterestRate}
                                onChange={e => setLocalSettings({...localSettings, defaultInterestRate: Number(e.target.value)})}
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-end gap-4">
                 {isSaved && <span className="text-green-600 text-sm font-medium animate-pulse">Changes Saved Successfully!</span>}
                 <button 
                    type="submit"
                    className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
                 >
                    <Save className="w-5 h-5" />
                    Save Changes
                 </button>
            </div>

        </form>
    </div>
  );
};

export default Settings;