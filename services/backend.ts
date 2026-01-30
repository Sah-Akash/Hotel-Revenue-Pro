
import { UserProfile, Subscription, License } from '../types';
import { generateDeviceFingerprint } from '../utils';
import { auth, db } from '../firebase'; 
import { doc, getDoc, setDoc, updateDoc, collection, getDocs, orderBy, query } from 'firebase/firestore';

const API_BASE = '/api'; 

// MOCK FALLBACK for Local Development / Emergency
const MOCK_LICENSE: License = {
    id: 'mock-license',
    userId: 'local-user',
    deviceId: 'local-device',
    subscriptionId: 'sub-123',
    issuedAt: Date.now(),
    lastCheckedAt: Date.now(),
    deviceLabel: 'Local Dev Machine',
    isRevoked: false
};

export const BackendService = {
    
    async getAuthHeaders() {
        const user = auth.currentUser;
        if (!user) throw new Error("Not logged in");
        const token = await user.getIdToken();
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
    },

    // --- LICENSE GATE (Robust Hybrid Strategy) ---
    async validateLicense(user: UserProfile): Promise<{ authorized: boolean; reason?: string; license?: License; details?: string }> {
        const fingerprint = await generateDeviceFingerprint();
        let apiFailed = false;
        let apiErrorDetails = "";

        // 1. Try Server API (Preferred for security)
        try {
            const response = await fetch(`${API_BASE}/license/validate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    uid: user.uid,
                    deviceId: fingerprint.hash
                })
            });

            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                throw new Error(`Server returned non-JSON (${response.status})`);
            }

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || `Server Error ${response.status}`);
            
            return data;

        } catch (e: any) {
            console.warn("API Validation Failed. Switching to Client-Side Fallback.", e);
            apiFailed = true;
            apiErrorDetails = e.message;
        }

        // 2. Client-Side Fallback (If API fails)
        if (apiFailed) {
            try {
                if (!db) throw new Error("Firebase Client DB not initialized");
                
                const licenseRef = doc(db, 'licenses', user.uid);
                const snapshot = await getDoc(licenseRef);

                // A. Create Trial if user has no license
                if (!snapshot.exists()) {
                    const now = Date.now();
                    const trialLicense: any = {
                        userId: user.uid,
                        planId: 'trial',
                        status: 'trial',
                        startedAt: now,
                        expiresAt: now + (7 * 24 * 60 * 60 * 1000), // 7 Days
                        deviceId: fingerprint.hash,
                        deviceHistory: [{ id: fingerprint.hash, date: now }],
                        isRevoked: false,
                        lastCheckedAt: now
                    };
                    
                    // Client-side creation allowed by rules: create if isOwner
                    await setDoc(licenseRef, trialLicense);
                    return { authorized: true, license: trialLicense as License };
                }

                const data = snapshot.data();

                // B. Validation Logic (Mirrors Server Logic)
                if (data.isRevoked) {
                    return { authorized: false, reason: 'license_revoked' };
                }

                if (data.expiresAt < Date.now()) {
                    return { authorized: false, reason: 'expired' };
                }

                // C. Device Binding
                if (!data.deviceId) {
                    await updateDoc(licenseRef, {
                         deviceId: fingerprint.hash,
                         lastCheckedAt: Date.now(),
                         deviceHistory: [...(data.deviceHistory || []), { id: fingerprint.hash, date: Date.now() }]
                    });
                    return { authorized: true, license: { ...data, deviceId: fingerprint.hash } as License };
                }

                if (data.deviceId !== fingerprint.hash) {
                    return { authorized: false, reason: 'device_mismatch', details: `Bound to: ${data.deviceId}` };
                }

                return { authorized: true, license: data as License };

            } catch (clientErr: any) {
                console.error("Client Fallback Failed:", clientErr);
                
                // Last Resort: Localhost Mock
                if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                    return { authorized: true, license: { ...MOCK_LICENSE, userId: user.uid, deviceId: fingerprint.hash } };
                }

                return { 
                    authorized: false, 
                    reason: 'network_error', 
                    details: `Server: ${apiErrorDetails} | Client: ${clientErr.message}`
                };
            }
        }
        
        return { authorized: false, reason: 'error' };
    },

    // --- ADMIN ACTIONS (With Client Fallback) ---
    
    async getAllUsers(): Promise<Subscription[]> {
        try {
            const headers = await this.getAuthHeaders();
            const response = await fetch(`${API_BASE}/admin/list-users`, { headers });
            if (!response.ok) throw new Error("API Failed");
            const data = await response.json();
            return data.users || [];
        } catch (e) {
            // Fallback: Read directly from Firestore
            if (!db) return [];
            try {
                const q = query(collection(db, 'licenses'), orderBy('startedAt', 'desc'));
                const snapshot = await getDocs(q);
                return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as any));
            } catch (err) {
                console.error("Fetch users failed", err);
                return [];
            }
        }
    },

    async getAllLicenses(): Promise<License[]> {
        return this.getAllUsers() as unknown as License[];
    },

    async revokeLicense(userId: string) {
        try {
            const headers = await this.getAuthHeaders();
            await fetch(`${API_BASE}/admin/revoke-license`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ userId })
            });
        } catch (e) {
            // Fallback
            if (db) await updateDoc(doc(db, 'licenses', userId), { isRevoked: true });
        }
    },

    async unbindDevice(userId: string) {
        try {
            const headers = await this.getAuthHeaders();
            await fetch(`${API_BASE}/admin/reset-device`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ userId })
            });
        } catch (e) {
            // Fallback
            if (db) await updateDoc(doc(db, 'licenses', userId), { deviceId: null });
        }
    },

    async extendSubscription(userId: string, days: number = 30) {
        try {
            const headers = await this.getAuthHeaders();
            await fetch(`${API_BASE}/admin/create-license`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ userId, durationDays: days, planId: 'pro_monthly' })
            });
        } catch (e) {
            // Fallback
            if (db) {
                const ref = doc(db, 'licenses', userId);
                const snap = await getDoc(ref);
                const currentExpiry = snap.exists() ? snap.data().expiresAt : Date.now();
                const newExpiry = Math.max(Date.now(), currentExpiry) + (days * 24 * 60 * 60 * 1000);
                await setDoc(ref, { 
                    status: 'active',
                    expiresAt: newExpiry,
                    planId: 'pro_monthly'
                }, { merge: true });
            }
        }
    }
};
