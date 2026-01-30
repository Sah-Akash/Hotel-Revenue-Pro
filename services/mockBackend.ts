
import { Subscription, License, UserProfile } from '../types';
import { generateDeviceFingerprint } from '../utils';

// KEYS for LocalStorage (Simulating Database Tables)
const DB_SUBSCRIPTIONS = 'hrp_db_subscriptions';
const DB_LICENSES = 'hrp_db_licenses';

// --- MOCK SERVER API ---

export const MockBackend = {
    // 1. Get or Create Subscription
    async getSubscription(user: UserProfile): Promise<Subscription> {
        await delay(500); // Simulate network latency
        const subs = getStored<Subscription>(DB_SUBSCRIPTIONS);
        let sub = subs.find(s => s.userId === user.uid);

        if (!sub) {
            // Auto-create a TRIAL subscription for new users
            sub = {
                id: user.uid,
                userId: user.uid,
                planId: 'trial',
                status: 'active',
                startedAt: Date.now(),
                expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 Days Trial
            };
            saveStored(DB_SUBSCRIPTIONS, [...subs, sub]);
        }
        return sub;
    },

    // 2. Validate License (The Core Logic)
    async validateLicense(user: UserProfile): Promise<{ authorized: boolean; reason?: string; license?: License }> {
        await delay(800);
        
        // A. Check Subscription
        const sub = await this.getSubscription(user);
        if (sub.status !== 'active' && sub.status !== 'trial') {
            return { authorized: false, reason: 'no_subscription' };
        }
        if (Date.now() > sub.expiresAt) {
            return { authorized: false, reason: 'expired' };
        }

        // B. Check Device Binding
        const fingerprint = await generateDeviceFingerprint();
        const licenses = getStored<License>(DB_LICENSES);
        
        // Find existing license for this user
        const existingLicense = licenses.find(l => l.userId === user.uid);

        if (existingLicense) {
            if (existingLicense.isRevoked) {
                 return { authorized: false, reason: 'license_revoked' };
            }
            // Strict Device Check
            if (existingLicense.deviceId !== fingerprint.hash) {
                return { authorized: false, reason: 'device_mismatch' };
            }
            // All good - update last checked
            existingLicense.lastCheckedAt = Date.now();
            saveStored(DB_LICENSES, licenses.map(l => l.id === existingLicense.id ? existingLicense : l));
            return { authorized: true, license: existingLicense };
        } else {
            // First time device - BIND IT
            const newLicense: License = {
                id: crypto.randomUUID(),
                userId: user.uid,
                subscriptionId: sub.id,
                deviceId: fingerprint.hash,
                deviceLabel: fingerprint.details,
                issuedAt: Date.now(),
                lastCheckedAt: Date.now(),
                isRevoked: false
            };
            saveStored(DB_LICENSES, [...licenses, newLicense]);
            return { authorized: true, license: newLicense };
        }
    },

    // --- ADMIN ACTIONS ---
    
    async getAllUsers(): Promise<Subscription[]> {
        return getStored<Subscription>(DB_SUBSCRIPTIONS);
    },

    async getAllLicenses(): Promise<License[]> {
        return getStored<License>(DB_LICENSES);
    },

    async revokeLicense(licenseId: string) {
        const licenses = getStored<License>(DB_LICENSES);
        const updated = licenses.map(l => l.id === licenseId ? { ...l, isRevoked: true } : l);
        saveStored(DB_LICENSES, updated);
    },

    async unbindDevice(licenseId: string) {
        const licenses = getStored<License>(DB_LICENSES);
        const updated = licenses.filter(l => l.id !== licenseId);
        saveStored(DB_LICENSES, updated);
    },

    async extendSubscription(userId: string, days: number = 30) {
        const subs = getStored<Subscription>(DB_SUBSCRIPTIONS);
        const updated = subs.map(s => {
            if (s.userId === userId) {
                return {
                    ...s,
                    status: 'active' as const,
                    expiresAt: Math.max(Date.now(), s.expiresAt) + (days * 24 * 60 * 60 * 1000)
                };
            }
            return s;
        });
        saveStored(DB_SUBSCRIPTIONS, updated);
    }
};

// Helpers
function getStored<T>(key: string): T[] {
    try {
        return JSON.parse(localStorage.getItem(key) || '[]');
    } catch { return []; }
}

function saveStored(key: string, data: any[]) {
    localStorage.setItem(key, JSON.stringify(data));
}

function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
