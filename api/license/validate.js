
import { db, initError } from '../utils/firebaseAdmin.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check if DB initialized
  if (!db) {
      // Return the specific initialization error to help the user debug
      console.error("DB Validation Error:", initError);
      return res.status(500).json({ 
          error: `Server Config Error: ${initError || 'Database not initialized'}` 
      });
  }

  const { uid, deviceId } = req.body;

  if (!uid || !deviceId) {
    return res.status(400).json({ allowed: false, reason: 'Missing parameters' });
  }

  try {
    const licenseRef = db.collection('licenses').doc(uid);
    const licenseDoc = await licenseRef.get();

    // 1. Check if License Exists - If NOT, Create TRIAL
    if (!licenseDoc.exists) {
        const now = Date.now();
        const trialData = {
            userId: uid,
            planId: 'trial',
            status: 'trial',
            startedAt: now,
            expiresAt: now + (7 * 24 * 60 * 60 * 1000), // 7 Days
            deviceId: deviceId, // Auto-bind first device
            deviceHistory: [{ id: deviceId, date: now }],
            isRevoked: false,
            lastCheckedAt: now
        };
        
        await licenseRef.set(trialData);
        await logAttempt(uid, deviceId, 'created_trial');
        
        return res.status(200).json({ allowed: true, license: trialData });
    }

    const data = licenseDoc.data();

    // 2. Check if Revoked
    if (data.isRevoked) {
      return res.status(200).json({ allowed: false, reason: 'license_revoked' });
    }

    // 3. Check Expiry
    if (data.expiresAt < Date.now()) {
      return res.status(200).json({ allowed: false, reason: 'expired' });
    }

    // 4. Device Binding Logic
    let currentBoundDevice = data.deviceId;

    if (!currentBoundDevice) {
      await licenseRef.update({ 
        deviceId: deviceId,
        lastCheckedAt: Date.now(),
        deviceHistory: ((data.deviceHistory || []).concat([{ id: deviceId, date: Date.now() }]))
      });
      await logAttempt(uid, deviceId, 'bound_new_device');
      return res.status(200).json({ 
        allowed: true, 
        license: { ...data, deviceId: deviceId } 
      });
    }

    // 5. Verify Device Match
    if (currentBoundDevice !== deviceId) {
       await logAttempt(uid, deviceId, 'device_mismatch');
       return res.status(200).json({ 
         allowed: false, 
         reason: 'device_mismatch',
         boundTo: currentBoundDevice
       });
    }

    // 6. Success
    await licenseRef.update({ lastCheckedAt: Date.now() });
    return res.status(200).json({ allowed: true, license: data });

  } catch (error) {
    console.error("Validation Error", error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}

async function logAttempt(userId, deviceId, result) {
    try {
        if(db) {
            await db.collection('licenseLogs').add({
                userId,
                deviceId,
                result,
                timestamp: Date.now()
            });
        }
    } catch(e) { console.error("Logging failed", e); }
}
