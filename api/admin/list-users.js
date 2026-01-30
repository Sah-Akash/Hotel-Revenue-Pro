
import { db } from '../utils/firebaseAdmin.js';
import { verifyAdmin } from '../utils/verifyAdmin.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  if (!db) {
      return res.status(500).json({ error: 'Database Not Initialized. Check Env Vars.' });
  }

  try {
    await verifyAdmin(req);

    // Fetch all licenses
    const snapshot = await db.collection('licenses').orderBy('startedAt', 'desc').get();
    
    const users = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));

    return res.status(200).json({ users });

  } catch (error) {
    return res.status(401).json({ error: error.message });
  }
}
