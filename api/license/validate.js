
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

  if (!db) {
      console.error("DB Validation Error:", initError);
      return res.status(500).json({ 
          error: `Server Config Error: ${initError || 'Database not initialized'}` 
      });
  }

  const { uid, deviceId, email, displayName, deviceLabel } = req.body;

  if (!uid || !deviceId) {
    return res.status(400).json({ allowed: false, reason: 'Missing parameters' });
  }

  try {
    const licenseRef = db.collection('licenses').doc(uid);
    const licenseDoc = await licenseRef.get();

    // Data to update for identification
    const identityUpdate = {
        email: email || null,
        displayName: displayName || null,
        lastCheckedAt: Date.now()
    };

    // 1. CREATE NEW TRIAL
    if (!licenseDoc.exists) {
        const now = Date.now();
        const trialData = {
            userId: uid,
            email: email || null,
            displayName: displayName || null,
            planId: 'trial',
            status: 'trial',
            startedAt: now,
            expiresAt: now + (7 * 24 * 60 * 60 * 1000), // 7 Days
            deviceId: deviceId, 
            deviceLabel: deviceLabel || 'Unknown',
            deviceHistory: [{ id: deviceId, date: now, label: deviceLabel }],
            isRevoked: false,
            lastCheckedAt: now
        };
        
        await licenseRef.set(trialData);
        await logAttempt(uid, deviceId, 'created_trial');
        
        return res.status(200).json({ allowed: true, license: trialData });
    }

    const data = licenseDoc.data();

    // 2. CHECK REVOKED
    if (data.isRevoked) {
      return res.status(200).json({ allowed: false, reason: 'license_revoked' });
    }

    // 3. CHECK EXPIRY
    if (data.expiresAt < Date.now()) {
      await licenseRef.update(identityUpdate); // Keep identifying info fresh even if expired
      return res.status(200).json({ allowed: false, reason: 'expired' });
    }

    // 4. DEVICE BINDING
    let currentBoundDevice = data.deviceId;

    if (!currentBoundDevice) {
      const updateData = { 
        ...identityUpdate,
        deviceId: deviceId,
        deviceLabel: deviceLabel || 'Unknown',
        deviceHistory: ((data.deviceHistory || []).concat([{ id: deviceId, date: Date.now(), label: deviceLabel }]))
      };
      await licenseRef.update(updateData);
      
      await logAttempt(uid, deviceId, 'bound_new_device');
      return res.status(200).json({ 
        allowed: true, 
        license: { ...data, ...updateData } 
      });
    }

    // 5. DEVICE MISMATCH
    if (currentBoundDevice !== deviceId) {
       await logAttempt(uid, deviceId, 'device_mismatch');
       return res.status(200).json({ 
         allowed: false, 
         reason: 'device_mismatch',
         boundTo: data.deviceLabel || currentBoundDevice
       });
    }

    // 6. SUCCESS
    await licenseRef.update(identityUpdate);
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
