import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, query, orderBy, deleteDoc, doc, setDoc, updateDoc } from 'firebase/firestore';
import { KeyRound, Plus, Trash2, Clock, MonitorSmartphone, RefreshCw, AlertCircle, Users, Mail, Check, X } from 'lucide-react';
import { AccessKey, AccessRequest } from '../types';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'keys' | 'requests'>('requests');
  const [keys, setKeys] = useState<AccessKey[]>([]);
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
        if (activeTab === 'keys') {
            await fetchKeys();
        } else {
            await fetchRequests();
        }
    } finally {
        setLoading(false);
    }
  };

  // --- KEYS LOGIC ---
  const fetchKeys = async () => {
      let fetchedKeys: AccessKey[] = [];
      if (db) {
          try {
            const q = query(collection(db, 'access_keys'), orderBy('createdAt', 'desc'));
            const snapshot = await getDocs(q);
            fetchedKeys = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as AccessKey[];
          } catch(e) { console.warn("DB Keys fail"); }
      }
      
      // Merge with local for hybrid feeling
      const local = JSON.parse(localStorage.getItem('hrp_admin_keys') || '[]');
      // Simple merge: prefer DB, but add local if not in DB
      const combined = [...fetchedKeys];
      local.forEach((lk: AccessKey) => {
          if (!combined.find(k => k.id === lk.id)) combined.push(lk);
      });
      setKeys(combined.sort((a,b) => b.createdAt - a.createdAt));
  };

  const generateKeyForUser = async (request?: AccessRequest) => {
      setGenerating(true);
      try {
          const key = Math.random().toString(36).substring(2, 10).toUpperCase();
          const now = Date.now();
          const expiresAt = now + (24 * 60 * 60 * 1000); // 24 hours
          
          const newKeyObj: AccessKey = {
              id: key,
              key,
              expiresAt,
              createdAt: now,
              deviceId: null
          };

          // Save Key
          if (db) {
              try { await setDoc(doc(db, 'access_keys', key), newKeyObj); }
              catch(e) { saveLocalKey(newKeyObj); }
          } else {
              saveLocalKey(newKeyObj);
          }

          if (request) {
              // If generated from a request, delete the request and open email
              await deleteRequest(request.id);
              openEmailResponse(request, key);
              setActiveTab('keys'); // Switch view
          } else {
              await fetchKeys();
          }

      } catch (error) {
          console.error("Gen failed", error);
      } finally {
          setGenerating(false);
      }
  };

  const saveLocalKey = (newKey: AccessKey) => {
      const existing = JSON.parse(localStorage.getItem('hrp_admin_keys') || '[]');
      localStorage.setItem('hrp_admin_keys', JSON.stringify([newKey, ...existing]));
  };

  const deleteKey = async (keyId: string) => {
      if(!window.confirm("Revoke this key?")) return;
      if (db) { try { await deleteDoc(doc(db, 'access_keys', keyId)); } catch(e) {} }
      const existing = JSON.parse(localStorage.getItem('hrp_admin_keys') || '[]');
      localStorage.setItem('hrp_admin_keys', JSON.stringify(existing.filter((k:any) => k.id !== keyId)));
      fetchKeys();
  };

  // --- REQUESTS LOGIC ---
  const fetchRequests = async () => {
      let fetchedReqs: AccessRequest[] = [];
      if (db) {
          try {
              const q = query(collection(db, 'access_requests'), orderBy('requestedAt', 'desc'));
              const snapshot = await getDocs(q);
              fetchedReqs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as AccessRequest[];
          } catch (e) { console.warn("DB Requests fail"); }
      }
      const local = JSON.parse(localStorage.getItem('hrp_requests_local') || '[]');
      const combined = [...fetchedReqs];
      local.forEach((lr: AccessRequest) => {
          if (!combined.find(r => r.id === lr.id)) combined.push(lr);
      });
      setRequests(combined.sort((a,b) => b.requestedAt - a.requestedAt));
  };

  const deleteRequest = async (id: string) => {
      if (db) { try { await deleteDoc(doc(db, 'access_requests', id)); } catch(e){} }
      const local = JSON.parse(localStorage.getItem('hrp_requests_local') || '[]');
      localStorage.setItem('hrp_requests_local', JSON.stringify(local.filter((r:any) => r.id !== id)));
      fetchRequests();
  };

  const openEmailResponse = (req: AccessRequest, key: string) => {
      const subject = "Access Granted: Hotel Revenue Pro";
      const body = `Hi ${req.name},\n\nYour access request has been approved.\n\nYour Access Key: ${key}\n\nThis key is valid for 24 hours and can be used on one device only.\n\nRegards,\nAdmin`;
      window.open(`mailto:${req.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  const formatTimeLeft = (expiresAt: number) => {
      const now = Date.now();
      const left = expiresAt - now;
      if (left <= 0) return "Expired";
      const hours = Math.floor(left / (1000 * 60 * 60));
      return `${hours}h ${Math.floor((left % (1000 * 60 * 60)) / (1000 * 60))}m`;
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Admin Panel</h1>
                <p className="text-slate-500">Manage requests and access keys.</p>
                {!db && (
                    <div className="flex items-center gap-2 mt-2 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded w-fit border border-amber-100">
                        <AlertCircle className="w-3 h-3" />
                        Local Mode
                    </div>
                )}
            </div>
            
            <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                <button 
                    onClick={() => setActiveTab('requests')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'requests' ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                    <Users className="w-4 h-4" /> Requests 
                    {requests.length > 0 && <span className="bg-red-500 text-white text-[10px] px-1.5 rounded-full">{requests.length}</span>}
                </button>
                <button 
                    onClick={() => setActiveTab('keys')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'keys' ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                    <KeyRound className="w-4 h-4" /> Active Keys
                </button>
            </div>
        </div>

        {/* --- REQUESTS TAB --- */}
        {activeTab === 'requests' && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">User</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Contact</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Requested</th>
                            <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? <tr><td colSpan={4} className="p-8 text-center text-slate-400">Loading...</td></tr> : 
                        requests.length === 0 ? <tr><td colSpan={4} className="p-8 text-center text-slate-400">No pending requests.</td></tr> :
                        requests.map(req => (
                            <tr key={req.id} className="hover:bg-slate-50">
                                <td className="px-6 py-4">
                                    <div className="font-bold text-slate-800">{req.name}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm text-slate-600 flex flex-col">
                                        <span className="flex items-center gap-1"><Mail className="w-3 h-3"/> {req.email}</span>
                                        <span className="flex items-center gap-1 mt-1"><MonitorSmartphone className="w-3 h-3"/> {req.mobile}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-500">
                                    {new Date(req.requestedAt).toLocaleDateString()} {new Date(req.requestedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button 
                                            onClick={() => generateKeyForUser(req)}
                                            disabled={generating}
                                            className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 border border-emerald-200"
                                        >
                                            <Check className="w-3 h-3" /> Approve & Email
                                        </button>
                                        <button 
                                            onClick={() => deleteRequest(req.id)}
                                            className="bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 px-2 py-1.5 rounded-lg transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}

        {/* --- KEYS TAB --- */}
        {activeTab === 'keys' && (
            <div className="space-y-4">
                 <div className="flex justify-end">
                    <button 
                        onClick={() => generateKeyForUser()} 
                        disabled={generating}
                        className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-blue-200"
                    >
                        {generating ? <RefreshCw className="w-4 h-4 animate-spin"/> : <Plus className="w-4 h-4"/>} Manual Gen
                    </button>
                 </div>
                 <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Key</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Expires</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Device</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase">Revoke</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {keys.map(key => {
                                const isExpired = Date.now() > key.expiresAt;
                                return (
                                    <tr key={key.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4 font-mono font-bold text-slate-800">{key.key}</td>
                                        <td className="px-6 py-4">
                                            {isExpired 
                                                ? <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-1 rounded-full">EXPIRED</span> 
                                                : <span className="bg-emerald-100 text-emerald-600 text-[10px] font-bold px-2 py-1 rounded-full">ACTIVE</span>
                                            }
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">{formatTimeLeft(key.expiresAt)}</td>
                                        <td className="px-6 py-4 text-xs text-slate-400 truncate max-w-[100px]">{key.deviceId || 'Unclaimed'}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button onClick={() => deleteKey(key.id)} className="text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4"/></button>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                 </div>
            </div>
        )}
    </div>
  );
};

export default AdminDashboard;