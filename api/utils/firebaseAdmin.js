
import admin from 'firebase-admin';

// Check if already initialized to prevent hot-reload errors in Vercel/Next.js
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // Handle newline characters in private keys for Vercel Env Vars
        privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
      }),
    });
    console.log("Firebase Admin Initialized");
  } catch (error) {
    console.error("Firebase Admin Init Error:", error.stack);
  }
}

const db = admin.firestore();
const auth = admin.auth();

export { db, auth, admin };
