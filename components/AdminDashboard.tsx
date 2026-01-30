import React, { useState, useEffect } from 'react';
import { BackendService } from '../services/backend'; // Use Real Backend
import { Subscription, License } from '../types';
import { Users, Search, ShieldCheck, Smartphone, RefreshCw, AlertCircle, CheckCircle2, Lock, Unlock, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const AdminDashboard: React.FC = () => {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'users' | 'licenses'>('users');
  const [users, setUsers] = useState<Subscription[]>([]);
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
        if (activeTab === 'users') {
            const data = await BackendService.getAllUsers();
            setUsers(data);
        } else {
            const data = await BackendService.getAllLicenses();
            setLicenses(data);
        }
    } catch (e: any) {
        console.error(e);
        setError('Failed to fetch data. Ensure you are an admin.');
    } finally {
        setLoading(false);
    }
  };

  const handleLogout = async () => {
      await logout();
      window.location.reload();
  };

  const extendSubscription = async (uid: string) => {
      if(!confirm("Extend subscription by 30 days?")) return;
      try {
        await BackendService.extendSubscription(uid);
        fetchData();
      } catch(e) { alert("Action failed"); }
  };

  const revokeLicense = async (licenseId: string) => {
      if(!confirm("Revoke this license? User will be blocked immediately.")) return;
       try {
        await BackendService.revokeLicense(licenseId);
        fetchData();
      } catch(e) { alert("Action failed"); }
  };

  const unbindDevice = async (licenseId: string) => {
      if(!confirm("Unbind device? User can login on a new device.")) return;
       try {
        await BackendService.unbindDevice(licenseId);
        fetchData();
      } catch(e) { alert("Action failed"); }
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto min-h-screen bg-slate-50">
        
        <div className="flex justify-between items-center mb-10">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Admin Console</h1>
                <p className="text-slate-500">Live Backend Mode</p>
            </div>
            <div className="flex gap-2">
                <button onClick={fetchData} className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50">
                    <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                </button>
                <button onClick={handleLogout} className="p-2 bg-slate-900 text-white border border-slate-900 rounded-xl hover:bg-slate-800">
                    <LogOut className="w-5 h-5" />
                </button>
            </div>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6">{error}</div>}

        {/* Tabs */}
        <div className="flex gap-6 mb-6 border-b border-slate-200">
            <button 
                onClick={() => setActiveTab('users')} 
                className={`pb-4 px-2 text-sm font-bold uppercase tracking-wider border-b-2 transition-colors ${activeTab === 'users' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
            >
                Subscribers ({users.length})
            </button>
            <button 
                onClick={() => setActiveTab('licenses')} 
                className={`pb-4 px-2 text-sm font-bold uppercase tracking-wider border-b-2 transition-colors ${activeTab === 'licenses' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
            >
                Device Licenses ({licenses.length})
            </button>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            
            {activeTab === 'users' && (
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 font-bold text-xs uppercase text-slate-500">User ID</th>
                            <th className="px-6 py-4 font-bold text-xs uppercase text-slate-500">Plan</th>
                            <th className="px-6 py-4 font-bold text-xs uppercase text-slate-500">Status</th>
                            <th className="px-6 py-4 font-bold text-xs uppercase text-slate-500">Expires</th>
                            <th className="px-6 py-4 font-bold text-xs uppercase text-slate-500 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {users.map(user => (
                            <tr key={user.userId} className="hover:bg-slate-50">
                                <td className="px-6 py-4 font-mono text-sm text-slate-600">{user.userId.substring(0,8)}...</td>
                                <td className="px-6 py-4">
                                    <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded text-xs font-bold uppercase">{user.planId}</span>
                                </td>
                                <td className="px-6 py-4">
                                    {user.status === 'active' || user.status === 'trial'
                                        ? <span className="flex items-center gap-1 text-emerald-600 font-bold text-xs"><CheckCircle2 className="w-3 h-3"/> {user.status.toUpperCase()}</span>
                                        : <span className="flex items-center gap-1 text-red-500 font-bold text-xs"><AlertCircle className="w-3 h-3"/> {user.status}</span>
                                    }
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-600">
                                    {new Date(user.expiresAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button onClick={() => extendSubscription(user.userId)} className="text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">
                                        + 30 Days
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {users.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-slate-400">No active licenses found</td></tr>}
                    </tbody>
                </table>
            )}

            {activeTab === 'licenses' && (
                 <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 font-bold text-xs uppercase text-slate-500">User</th>
                            <th className="px-6 py-4 font-bold text-xs uppercase text-slate-500">Device</th>
                            <th className="px-6 py-4 font-bold text-xs uppercase text-slate-500">State</th>
                            <th className="px-6 py-4 font-bold text-xs uppercase text-slate-500 text-right">Security</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {licenses.map(lic => (
                            <tr key={lic.id} className="hover:bg-slate-50">
                                <td className="px-6 py-4 font-mono text-sm text-slate-600">{lic.userId.substring(0,8)}...</td>
                                <td className="px-6 py-4">
                                    <div className="text-sm font-bold text-slate-800">{lic.deviceLabel || 'Unknown Device'}</div>
                                    <div className="text-xs font-mono text-slate-400">{lic.deviceId ? lic.deviceId.substring(0, 8) + '...' : 'Unbound'}</div>
                                </td>
                                <td className="px-6 py-4">
                                    {lic.isRevoked
                                        ? <span className="bg-red-50 text-red-600 px-2 py-1 rounded text-xs font-bold uppercase">REVOKED</span>
                                        : <span className="bg-emerald-50 text-emerald-600 px-2 py-1 rounded text-xs font-bold uppercase">VALID</span>
                                    }
                                </td>
                                <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                                    <button onClick={() => unbindDevice(lic.userId)} className="text-slate-500 hover:text-blue-600 hover:bg-slate-100 p-2 rounded" title="Unbind Device">
                                        <Unlock className="w-4 h-4"/>
                                    </button>
                                    {!lic.isRevoked && (
                                        <button onClick={() => revokeLicense(lic.userId)} className="text-slate-500 hover:text-red-600 hover:bg-red-50 p-2 rounded" title="Revoke Access">
                                            <Lock className="w-4 h-4"/>
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                         {licenses.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-slate-400">No licenses active</td></tr>}
                    </tbody>
                </table>
            )}

        </div>
    </div>
  );
};

export default AdminDashboard;