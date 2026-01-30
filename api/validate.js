
import admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    }),
  });
}

const db = admin.firestore();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { key, deviceId } = req.body;

  if (!key || !deviceId) {
    return res.status(400).json({ error: 'Missing key or device fingerprint' });
  }

  try {
    const keyRef = db.collection('access_keys').doc(key);
    const doc = await keyRef.get();

    // 1. Check if key exists
    if (!doc.exists) {
      return res.status(403).json({ error: 'Invalid Access Key' });
    }

    const data = doc.data();

    // 2. Check Expiry
    if (Date.now() > data.expiresAt) {
      return res.status(403).json({ error: 'Access Key Expired' });
    }

    // 3. Device Binding Logic (One-Time Link)
    if (data.deviceId) {
      // Key is already bound. Check if it matches this device.
      if (data.deviceId !== deviceId) {
        return res.status(403).json({ error: 'Key already used on another device' });
      }
    } else {
      // First time use! Bind to this device.
      await keyRef.update({ deviceId: deviceId });
    }

    return res.status(200).json({ 
      success: true, 
      expiresAt: data.expiresAt 
    });

  } catch (error) {
    console.error('Validation error:', error);
    return res.status(500).json({ error: 'Server Error' });
  }
}
