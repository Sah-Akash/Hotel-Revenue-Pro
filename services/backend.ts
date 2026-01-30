
import { UserProfile, Subscription, License } from '../types';
import { generateDeviceFingerprint } from '../utils';
import { auth } from '../firebase'; 

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
    
    async getAuthHeaders() {
        const user = auth.currentUser;
        if (!user) throw new Error("Not logged in");
        const token = await user.getIdToken();
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
    },

    async validateLicense(user: UserProfile): Promise<{ authorized: boolean; reason?: string; license?: License; details?: string }> {
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

            const contentType = response.headers.get("content-type");
            
            // Handle Non-JSON responses (e.g. Vercel 500 error HTML page, or 404 default page)
            if (!contentType || !contentType.includes("application/json")) {
                const text = await response.text();
                console.error("API Returned Non-JSON:", text.substring(0, 200)); // Log first 200 chars
                throw new Error(`Server Error (${response.status}): The server returned an unexpected response.`);
            }

            const data = await response.json();

            if (!response.ok) {
                // API returned an error JSON object
                throw new Error(data.error || `Server Error: ${response.status}`);
            }
            
            return data;

        } catch (e: any) {
            console.error("Validation Request Failed:", e);
            
            // LOCALHOST FALLBACK
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                console.warn("⚠️ API Unreachable on Localhost. Using Mock Fallback.");
                return { authorized: true, license: { ...MOCK_LICENSE, userId: user.uid, deviceId: fingerprint.hash } };
            }

            // Return the specific error message to the UI
            return { 
                authorized: false, 
                reason: 'network_error', 
                details: e.message || 'Unknown Network Error'
            };
        }
    },

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
