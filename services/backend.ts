
import { UserProfile, Subscription, License } from '../types';
import { generateDeviceFingerprint } from '../utils';
import { auth, db } from '../firebase'; 
import { doc, getDoc, setDoc, updateDoc, collection, getDocs, orderBy, query, where } from 'firebase/firestore';

const API_BASE = '/api'; 

const ADMIN_EMAIL = "aayansah17@gmail.com";

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

    // --- FETCH LICENSE (UI Read Only) ---
    async getLicense(userId: string): Promise<License | null> {
        if (!db) return null;
        try {
            const snap = await getDoc(doc(db, 'licenses', userId));
            if (snap.exists()) {
                return snap.data() as License;
            }
            return null;
        } catch (e) {
            console.error("Failed to fetch license", e);
            return null;
        }
    },

    // --- LICENSE GATE (Robust Hybrid Strategy) ---
    async validateLicense(user: UserProfile): Promise<{ authorized: boolean; reason?: string; license?: License; details?: string }> {
        const fingerprint = await generateDeviceFingerprint();
        
        // 0. ADMIN BYPASS (Admins can login anywhere)
        if (user.email === ADMIN_EMAIL) {
            return { authorized: true, details: "Admin Access" };
        }

        let apiFailed = false;
        let apiErrorDetails = "";

        // 1. Try Server API (Preferred for security)
        try {
            const response = await fetch(`${API_BASE}/license/validate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    uid: user.uid,
                    email: user.email,           
                    displayName: user.displayName, 
                    deviceId: fingerprint.hash,
                    deviceLabel: fingerprint.details 
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

                // --- SECURITY: GLOBAL DEVICE CHECK ---
                // Check if this device ID is already used by ANY OTHER user in the system.
                // This prevents creating new Gmails to get new trials on the same laptop.
                const deviceQuery = query(collection(db, 'licenses'), where('deviceId', '==', fingerprint.hash));
                const deviceSnapshot = await getDocs(deviceQuery);
                
                let deviceOwnerEmail = null;
                let deviceOwnerId = null;

                deviceSnapshot.forEach((doc) => {
                    if (doc.id !== user.uid) {
                        deviceOwnerId = doc.id;
                        deviceOwnerEmail = doc.data().email;
                    }
                });

                if (deviceOwnerId) {
                    return { 
                        authorized: false, 
                        reason: 'device_used_by_other', 
                        details: `This device is already registered to ${deviceOwnerEmail || 'another user'}. Multi-account trials are not permitted.` 
                    };
                }
                // -------------------------------------

                // Common data to update 
                const userInfoUpdate = {
                    email: user.email,
                    displayName: user.displayName,
                    lastCheckedAt: Date.now()
                };

                // A. Create Trial if user has no license (AND device check passed)
                if (!snapshot.exists()) {
                    const now = Date.now();
                    const trialLicense: any = {
                        userId: user.uid,
                        email: user.email,           
                        displayName: user.displayName,
                        planId: 'trial',
                        status: 'trial',
                        startedAt: now,
                        expiresAt: now + (7 * 24 * 60 * 60 * 1000), // 7 Days Strict
                        deviceId: fingerprint.hash,
                        deviceLabel: fingerprint.details,
                        deviceHistory: [{ id: fingerprint.hash, date: now, label: fingerprint.details }],
                        isRevoked: false,
                        lastCheckedAt: now
                    };
                    
                    await setDoc(licenseRef, trialLicense);
                    return { authorized: true, license: trialLicense as License };
                }

                const data = snapshot.data();

                // B. Validation Logic
                if (data.isRevoked) {
                    return { authorized: false, reason: 'license_revoked' };
                }

                if (data.expiresAt < Date.now()) {
                    await updateDoc(licenseRef, userInfoUpdate);
                    return { authorized: false, reason: 'expired' };
                }

                // C. Device Binding (User Specific)
                if (!data.deviceId) {
                    await updateDoc(licenseRef, {
                         ...userInfoUpdate,
                         deviceId: fingerprint.hash,
                         deviceLabel: fingerprint.details,
                         deviceHistory: [...(data.deviceHistory || []), { id: fingerprint.hash, date: Date.now(), label: fingerprint.details }]
                    });
                    return { authorized: true, license: { ...data, deviceId: fingerprint.hash } as License };
                }

                if (data.deviceId !== fingerprint.hash) {
                    return { authorized: false, reason: 'device_mismatch', details: `Bound to: ${data.deviceLabel || data.deviceId}` };
                }

                // Update metadata on success
                await updateDoc(licenseRef, userInfoUpdate);
                return { authorized: true, license: data as License };

            } catch (clientErr: any) {
                console.error("Client Fallback Failed:", clientErr);
                
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
            if (db) {
                const ref = doc(db, 'licenses', userId);
                const snap = await getDoc(ref);
                const currentExpiry = snap.exists() ? snap.data().expiresAt : Date.now();
                
                // If currently expired, start from NOW. If active, extend from Expiry.
                const baseTime = Math.max(Date.now(), currentExpiry);
                const newExpiry = baseTime + (days * 24 * 60 * 60 * 1000);
                
                await setDoc(ref, { 
                    status: 'active',
                    expiresAt: newExpiry,
                    planId: 'pro_monthly'
                }, { merge: true });
            }
        }
    }
};
