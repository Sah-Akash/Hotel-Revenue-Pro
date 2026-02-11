
import React, { useState, useEffect } from 'react';
import { BackendService } from '../services/backend'; 
import { Subscription, License } from '../types';
import { RefreshCw, AlertCircle, Crown, Clock, Ban, CalendarPlus, X, Mail, Search } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const AdminDashboard: React.FC = () => {
  const { logout } = useAuth();
  
  // Data State
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Filter State
  const [filter, setFilter] = useState<'all' | 'active' | 'expired' | 'trial'>('all');
  const [search, setSearch] = useState('');

  // Extension Modal State
  const [extensionTarget, setExtensionTarget] = useState<{id: string, name: string} | null>(null);
  const [manualDays, setManualDays] = useState<number>(30);
  const [isProcessingExtension, setIsProcessingExtension] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
        const data = await BackendService.getAllUsers();
        setUsers(data);
    } catch (e: any) {
        console.error(e);
        setError('Failed to fetch data. Ensure you are logged in as Admin.');
    } finally {
        setLoading(false);
    }
  };

  const handleLogout = async () => {
      await logout();
      window.location.reload();
  };

  // --- ACTIONS ---

  const handleExtendSubmit = async () => {
      if (!extensionTarget) return;
      setIsProcessingExtension(true);
      try {
        await BackendService.extendSubscription(extensionTarget.id, manualDays);
        await fetchData(); // Refresh UI
        setExtensionTarget(null);
      } catch(e) { 
        alert("Activation failed"); 
      } finally {
        setIsProcessingExtension(false);
      }
  };

  const revokeLicense = async (licenseId: string) => {
      if(!confirm("PERMANENTLY REVOKE LICENSE?\n\nThis will block the user and their device from accessing the trial. They will see the 'Buy Pro' message.")) return;
       try {
        await BackendService.revokeLicense(licenseId);
        await fetchData();
      } catch(e) { alert("Action failed"); }
  };

  const unbindDevice = async (licenseId: string) => {
      if(!confirm("Unbind device? User can login on a new device.")) return;
       try {
        await BackendService.unbindDevice(licenseId);
        await fetchData();
      } catch(e) { alert("Action failed"); }
  };

  // --- FILTERING ---

  const filteredUsers = users.filter(user => {
      const matchesSearch = (user.email || '').toLowerCase().includes(search.toLowerCase()) || 
                            (user.displayName || '').toLowerCase().includes(search.toLowerCase()) ||
                            user.userId.includes(search);
      
      const isExpired = user.expiresAt < Date.now();
      const isTrial = user.planId === 'trial';
      
      if (!matchesSearch) return false;

      if (filter === 'active') return !isExpired && !user.isRevoked;
      if (filter === 'expired') return isExpired;
      if (filter === 'trial') return isTrial && !isExpired;
      
      return true;
  });

  // KPI CALCS
  const activeCount = users.filter(u => u.expiresAt > Date.now() && !u.isRevoked).length;
  const trialCount = users.filter(u => u.planId === 'trial' && u.expiresAt > Date.now()).length;
  const expiredCount = users.filter(u => u.expiresAt < Date.now()).length;

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto min-h-screen bg-slate-50 font-sans relative">
        
        {/* MODAL OVERLAY */}
        {extensionTarget && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-200">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <h3 className="text-lg font-bold text-slate-900">Manage Access</h3>
                        <button onClick={() => setExtensionTarget(null)} className="p-1 hover:bg-slate-200 rounded-full transition-colors"><X className="w-5 h-5 text-slate-500" /></button>
                    </div>
                    <div className="p-6">
                        <div className="mb-6">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">User</p>
                            <p className="text-lg font-bold text-slate-800">{extensionTarget.name}</p>
                        </div>
                        
                        <div className="mb-8">
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Add Days</label>
                            <div className="flex items-center gap-2 mb-3">
                                <button onClick={() => setManualDays(7)} className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${manualDays === 7 ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}>+7 Days</button>
                                <button onClick={() => setManualDays(30)} className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${manualDays === 30 ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}>+30 Days</button>
                                <button onClick={() => setManualDays(365)} className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${manualDays === 365 ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}>+1 Year</button>
                            </div>
                            <div className="relative">
                                <input 
                                    type="number" 
                                    value={manualDays} 
                                    onChange={(e) => setManualDays(Number(e.target.value))}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-lg font-bold text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all pl-4 pr-12"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 uppercase pointer-events-none">Days</span>
                            </div>
                        </div>

                        <button 
                            onClick={handleExtendSubmit}
                            disabled={isProcessingExtension}
                            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isProcessingExtension ? <RefreshCw className="w-5 h-5 animate-spin" /> : <CalendarPlus className="w-5 h-5" />}
                            {isProcessingExtension ? 'Updating...' : 'Confirm Extension'}
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">SaaS Command Center</h1>
                <p className="text-slate-500 font-medium">Manage subscriptions and user access</p>
            </div>
            <div className="flex gap-3">
                <button onClick={fetchData} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 font-bold text-sm shadow-sm transition-all">
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
                </button>
                <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white border border-slate-900 rounded-xl hover:bg-slate-800 font-bold text-sm shadow-lg shadow-slate-200 transition-all">
                    <Ban className="w-4 h-4" /> Exit
                </button>
            </div>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 border border-red-100 flex items-center gap-2"><AlertCircle className="w-5 h-5"/> {error}</div>}

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><Crown className="w-6 h-6" /></div>
                <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wide">Active Users</div>
                    <div className="text-2xl font-black text-slate-900">{activeCount}</div>
                </div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Clock className="w-6 h-6" /></div>
                <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wide">On Trial</div>
                    <div className="text-2xl font-black text-slate-900">{trialCount}</div>
                </div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-red-50 text-red-600 rounded-xl"><AlertCircle className="w-6 h-6" /></div>
                <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wide">Expired / Churned</div>
                    <div className="text-2xl font-black text-slate-900">{expiredCount}</div>
                </div>
            </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-t-2xl border border-slate-200 p-4 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                {['all', 'active', 'trial', 'expired'].map(f => (
                    <button 
                        key={f}
                        onClick={() => setFilter(f as any)}
                        className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${filter === f ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                    >
                        {f}
                    </button>
                ))}
            </div>
            <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                    type="text" 
                    placeholder="Search email or name..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
        </div>

        {/* User Table */}
        <div className="bg-white rounded-b-2xl border-x border-b border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-50/50 border-b border-slate-100">
                        <tr>
                            <th className="px-6 py-4 font-bold text-xs uppercase text-slate-400 tracking-wider">User Identity</th>
                            <th className="px-6 py-4 font-bold text-xs uppercase text-slate-400 tracking-wider">Plan Status</th>
                            <th className="px-6 py-4 font-bold text-xs uppercase text-slate-400 tracking-wider">Device</th>
                            <th className="px-6 py-4 font-bold text-xs uppercase text-slate-400 tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {filteredUsers.map(user => {
                            const isExpired = user.expiresAt < Date.now();
                            const daysLeft = Math.ceil((user.expiresAt - Date.now()) / (1000 * 60 * 60 * 24));
                            
                            return (
                                <tr key={user.userId} className={`hover:bg-slate-50/80 transition-colors group ${user.isRevoked ? 'bg-red-50/30' : ''}`}>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">
                                                {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-900 text-sm">{user.displayName || 'Unnamed User'}</div>
                                                <div className="text-xs text-slate-500 font-mono flex items-center gap-1">
                                                    <Mail className="w-3 h-3" /> {user.email || 'No Email'}
                                                </div>
                                                <div className="text-[10px] text-slate-400 mt-0.5 font-mono select-all">ID: {user.userId}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                {user.isRevoked ? (
                                                    <span className="bg-red-600 text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase shadow-sm">REVOKED</span>
                                                ) : isExpired ? (
                                                    <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase border border-slate-200">EXPIRED</span>
                                                ) : (
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border flex items-center gap-1 ${user.planId === 'trial' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'}`}>
                                                        {user.planId === 'trial' ? '7-Day Trial' : 'PRO Plan'}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-xs font-medium text-slate-600">
                                                {isExpired ? (
                                                    <span className="text-red-500">Expired {Math.abs(daysLeft)} days ago</span>
                                                ) : (
                                                    <span className="text-emerald-600">{daysLeft} days remaining</span>
                                                )}
                                            </div>
                                            <div className="text-[10px] text-slate-400">
                                                Until {new Date(user.expiresAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-bold text-slate-700">{user.deviceLabel || 'Unknown Device'}</div>
                                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">{user.deviceId ? user.deviceId.substring(0,8)+'...' : 'Unbound'}</div>
                                        {user.deviceId && (
                                            <button onClick={() => unbindDevice(user.userId)} className="text-[10px] text-blue-600 hover:underline mt-1">
                                                Reset Binding
                                            </button>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                            {/* Quick Actions */}
                                            <button 
                                                onClick={() => {
                                                    setExtensionTarget({ id: user.userId, name: user.displayName || user.email || 'User' });
                                                    setManualDays(30);
                                                }}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm transition-colors flex items-center gap-1 ${isExpired ? 'bg-indigo-600 text-white hover:bg-indigo-500' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                                                title="Manually Add Days"
                                            >
                                                <CalendarPlus className="w-3.5 h-3.5" />
                                                {isExpired ? 'Reactivate' : 'Add Days'}
                                            </button>
                                            
                                            {!user.isRevoked && (
                                                <button onClick={() => revokeLicense(user.userId)} className="p-2 text-slate-400 hover:text-white hover:bg-red-600 rounded-lg transition-colors" title="Revoke & Block Device">
                                                    <Ban className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        {filteredUsers.length === 0 && (
                            <tr>
                                <td colSpan={4} className="p-12 text-center">
                                    <div className="text-slate-400 font-medium">No users found matching filters.</div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );
};

export default AdminDashboard;
