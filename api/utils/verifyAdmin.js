
import { auth, db } from './firebaseAdmin.js';

export async function verifyAdmin(req) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Missing Authorization Header');
  }

  const token = authHeader.split('Bearer ')[1];

  try {
    // 1. Verify the ID Token sent from Frontend
    const decodedToken = await auth.verifyIdToken(token);
    const uid = decodedToken.uid;

    // 2. Check if this UID exists in the 'admins' collection
    // (We do not rely on Custom Claims for critical SaaS admin checks to avoid propagation delay)
    const adminDoc = await db.collection('admins').doc(uid).get();

    if (!adminDoc.exists) {
        // Fallback: Check hardcoded admin email env var for bootstrapping
        if (decodedToken.email === process.env.ADMIN_EMAIL) {
            return { uid, email: decodedToken.email };
        }
        throw new Error('User is not an Admin');
    }

    return { uid, email: decodedToken.email, ...adminDoc.data() };
  } catch (error) {
    console.error("Admin Verification Failed:", error);
    throw new Error('Unauthorized');
  }
}
