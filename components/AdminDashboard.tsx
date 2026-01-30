import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, query, orderBy, deleteDoc, doc, setDoc } from 'firebase/firestore';
import { KeyRound, Plus, Trash2, Clock, MonitorSmartphone, RefreshCw, AlertCircle, Users, Mail, Check, X, Copy } from 'lucide-react';
import { AccessKey, AccessRequest } from '../types';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'keys' | 'requests'>('requests');
  const [keys, setKeys] = useState<AccessKey[]>([]);
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  
  // New State for displaying the generated key
  const [generatedKeyData, setGeneratedKeyData] = useState<{key: string, user: string} | null>(null);

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
      
      const local = JSON.parse(localStorage.getItem('hrp_admin_keys') || '[]');
      const combined = [...fetchedKeys];
      // Merge local keys that might not be in DB (if any)
      local.forEach((lk: AccessKey) => {
          if (!combined.find(k => k.id === lk.id)) combined.push(lk);
      });
      setKeys(combined.sort((a,b) => b.createdAt - a.createdAt));
  };

  const approveRequest = async (request: AccessRequest) => {
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

          // 1. Save Key
          if (db) {
              await setDoc(doc(db, 'access_keys', key), newKeyObj);
              // Also delete request
              await deleteDoc(doc(db, 'access_requests', request.id));
          } else {
              saveLocalKey(newKeyObj);
          }

          // 2. Show Key to Admin
          setGeneratedKeyData({ key, user: request.name });

          // 3. Refresh
          setRequests(prev => prev.filter(r => r.id !== request.id));
          
      } catch (error) {
          console.error("Approval failed", error);
          alert("Error approving request. Check console.");
      } finally {
          setGenerating(false);
      }
  };
  
  const manualGenerate = async () => {
      const key = Math.random().toString(36).substring(2, 10).toUpperCase();
      const now = Date.now();
      const expiresAt = now + (24 * 60 * 60 * 1000);
      const newKeyObj = { id: key, key, expiresAt, createdAt: now, deviceId: null };
      
      if(db) await setDoc(doc(db, 'access_keys', key), newKeyObj);
      else saveLocalKey(newKeyObj);
      
      setGeneratedKeyData({ key, user: "Manual Generation" });
      fetchKeys();
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
      // Note: We don't fetch local requests because user requests from other devices won't be in local storage here.
      setRequests(fetchedReqs.sort((a,b) => b.requestedAt - a.requestedAt));
  };

  const deleteRequest = async (id: string) => {
      if (db) { try { await deleteDoc(doc(db, 'access_requests', id)); } catch(e){} }
      setRequests(prev => prev.filter(r => r.id !== id));
  };

  const formatTimeLeft = (expiresAt: number) => {
      const now = Date.now();
      const left = expiresAt - now;
      if (left <= 0) return "Expired";
      const hours = Math.floor(left / (1000 * 60 * 60));
      return `${hours}h ${Math.floor((left % (1000 * 60 * 60)) / (1000 * 60))}m`;
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto relative">
        
        {/* KEY GENERATED MODAL */}
        {generatedKeyData && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
                <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600">
                        <Check className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Key Generated!</h2>
                    <p className="text-slate-500 mb-6">For user: <strong>{generatedKeyData.user}</strong></p>
                    
                    <div className="bg-slate-100 p-4 rounded-xl border border-slate-200 mb-6 flex items-center justify-between gap-4">
                        <code className="text-2xl font-mono font-bold text-blue-600">{generatedKeyData.key}</code>
                        <button 
                            onClick={() => navigator.clipboard.writeText(generatedKeyData.key)}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-white rounded-lg transition-all"
                            title="Copy to clipboard"
                        >
                            <Copy className="w-5 h-5" />
                        </button>
                    </div>

                    <p className="text-xs text-slate-400 mb-6">
                        Copy this key and send it to the user via Email or WhatsApp.<br/>
                        It is valid for 24 hours.
                    </p>

                    <button 
                        onClick={() => setGeneratedKeyData(null)}
                        className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800"
                    >
                        Done
                    </button>
                </div>
            </div>
        )}

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Admin Panel</h1>
                <p className="text-slate-500">Manage requests and access keys.</p>
                {!db && (
                    <div className="flex items-center gap-2 mt-2 text-xs text-red-600 bg-red-50 px-2 py-1 rounded w-fit border border-red-100 font-bold">
                        <AlertCircle className="w-3 h-3" />
                        Database Not Connected - Requests won't appear here!
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
                {!db && (
                    <div className="p-6 text-center text-slate-500 border-b border-slate-100">
                        <p className="font-bold text-red-500 mb-2">Setup Required</p>
                        <p className="text-sm">You must configure Firebase in <code>firebase.ts</code> for requests to appear here.</p>
                        <p className="text-xs mt-2">Currently, users are sending requests via Email only.</p>
                    </div>
                )}
                
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
                        requests.length === 0 ? <tr><td colSpan={4} className="p-8 text-center text-slate-400">No pending requests found.</td></tr> :
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
                                            onClick={() => approveRequest(req)}
                                            disabled={generating}
                                            className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 border border-emerald-200 transition-colors"
                                        >
                                            <Check className="w-3 h-3" /> Approve
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
                        onClick={manualGenerate} 
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