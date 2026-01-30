
import { db } from '../utils/firebaseAdmin.js';
import { verifyAdmin } from '../utils/verifyAdmin.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    await verifyAdmin(req);
    const { userId } = req.body;

    await db.collection('licenses').doc(userId).update({
        isRevoked: true,
        updatedAt: Date.now()
    });

    return res.status(200).json({ success: true });

  } catch (error) {
    return res.status(401).json({ error: error.message });
  }
}
