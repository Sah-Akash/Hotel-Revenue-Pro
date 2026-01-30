
import { UserProfile, Subscription, License } from '../types';
import { generateDeviceFingerprint } from '../utils';
import { auth } from '../firebase'; // Import client auth to get tokens

const API_BASE = '/api'; 

// MOCK FALLBACK for Local Development
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
    
    // --- AUTH HELPER ---
    async getAuthHeaders() {
        const user = auth.currentUser;
        if (!user) throw new Error("Not logged in");
        const token = await user.getIdToken();
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
    },

    // --- LICENSE GATE ---
    async validateLicense(user: UserProfile): Promise<{ authorized: boolean; reason?: string; license?: License }> {
        const fingerprint = await generateDeviceFingerprint();
        
        try {
            const response = await fetch(`${API_BASE}/license/validate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    uid: user.uid,
                    deviceId: fingerprint.hash
                })
            });

            // Handle Server Errors (e.g. 500 Config Error)
            if (!response.ok) {
                const text = await response.text();
                console.error(`API Error (${response.status}):`, text);
                
                // If it's a 404, it means the API route doesn't exist (Localhost without Vercel Dev)
                // If it's a 500, it's likely Env Vars missing on Vercel
                throw new Error(`Server Error: ${response.status}`);
            }
            
            const data = await response.json();
            return data;

        } catch (e: any) {
            console.error("Validation Request Failed:", e);
            
            // LOCALHOST FALLBACK
            // If we are developing locally and the API is unreachable (404/Network), assume authorized for testing.
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                console.warn("⚠️ API Unreachable on Localhost. Using Mock Fallback.");
                return { authorized: true, license: { ...MOCK_LICENSE, userId: user.uid, deviceId: fingerprint.hash } };
            }

            return { authorized: false, reason: 'network_error' };
        }
    },

    // --- ADMIN ACTIONS ---
    
    async getAllUsers(): Promise<Subscription[]> {
        const headers = await this.getAuthHeaders();
        const response = await fetch(`${API_BASE}/admin/list-users`, { headers });
        if (!response.ok) throw new Error("Failed to fetch users");
        const data = await response.json();
        return data.users || [];
    },

    async getAllLicenses(): Promise<License[]> {
        return this.getAllUsers() as unknown as License[];
    },

    async revokeLicense(userId: string) {
        const headers = await this.getAuthHeaders();
        await fetch(`${API_BASE}/admin/revoke-license`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ userId })
        });
    },

    async unbindDevice(userId: string) {
        const headers = await this.getAuthHeaders();
        await fetch(`${API_BASE}/admin/reset-device`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ userId })
        });
    },

    async extendSubscription(userId: string, days: number = 30) {
        const headers = await this.getAuthHeaders();
        await fetch(`${API_BASE}/admin/create-license`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ userId, durationDays: days, planId: 'pro_monthly' })
        });
    }
};
