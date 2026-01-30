
import { db } from '../utils/firebaseAdmin.js';
import { verifyAdmin } from '../utils/verifyAdmin.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    // Security Check
    await verifyAdmin(req);

    const { userId, planId, durationDays } = req.body;
    
    // Calculate Expiry
    const now = Date.now();
    const duration = (durationDays || 30) * 24 * 60 * 60 * 1000;
    
    // Check if exists to preserve original start date
    const licenseRef = db.collection('licenses').doc(userId);
    const doc = await licenseRef.get();
    
    let startedAt = now;
    if (doc.exists) {
        startedAt = doc.data().startedAt || now;
    }

    const licenseData = {
        userId,
        planId: planId || 'pro_monthly',
        status: 'active',
        startedAt,
        expiresAt: now + duration,
        isRevoked: false,
        deviceId: doc.exists ? doc.data().deviceId : null, // Preserve device if exists
        updatedAt: now
    };

    await licenseRef.set(licenseData, { merge: true });

    return res.status(200).json({ success: true, license: licenseData });

  } catch (error) {
    return res.status(401).json({ error: error.message });
  }
}
