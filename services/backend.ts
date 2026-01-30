
import { UserProfile, Subscription, License } from '../types';
import { generateDeviceFingerprint } from '../utils';
import { auth } from '../firebase'; // Import client auth to get tokens

// Change this to empty string '' if deploying on same domain, 
// or full URL 'https://your-project.vercel.app' if separate.
const API_BASE = '/api'; 

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

            if (!response.ok) throw new Error("API Validation Failed");
            
            const data = await response.json();
            return data;
        } catch (e) {
            console.error(e);
            return { authorized: false, reason: 'network_error' };
        }
    },

    // --- ADMIN ACTIONS ---
    
    async getAllUsers(): Promise<Subscription[]> {
        const headers = await this.getAuthHeaders();
        const response = await fetch(`${API_BASE}/admin/list-users`, { headers });
        const data = await response.json();
        return data.users || [];
    },

    async getAllLicenses(): Promise<License[]> {
        // In this architecture, users AND licenses are combined in the 'licenses' collection
        // So we return the same list, just typed differently if needed
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
