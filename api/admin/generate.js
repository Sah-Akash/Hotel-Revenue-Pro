
import admin from 'firebase-admin';

// Initialize Firebase Admin (Singleton pattern)
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

  // 1. Admin Security Check
  const authHeader = req.headers.authorization;
  if (!process.env.ADMIN_SECRET || authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized: Invalid Admin Secret' });
  }

  try {
    // 2. Generate Random Key (8 chars, uppercase)
    const key = Math.random().toString(36).substring(2, 10).toUpperCase();

    // 3. Set Expiry (24 Hours)
    const now = Date.now();
    const expiresAt = now + (24 * 60 * 60 * 1000);

    // 4. Store in Firestore
    await db.collection('access_keys').doc(key).set({
      key,
      expiresAt,
      createdAt: now,
      deviceId: null // Not bound yet
    });

    return res.status(200).json({ key, expiresAt });

  } catch (error) {
    console.error('Error creating key:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
