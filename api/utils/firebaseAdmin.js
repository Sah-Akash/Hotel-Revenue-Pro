
import admin from 'firebase-admin';

// Debugging: Log (safely) if env vars are present
if (!process.env.FIREBASE_PROJECT_ID) console.error("MISSING ENV: FIREBASE_PROJECT_ID");
if (!process.env.FIREBASE_CLIENT_EMAIL) console.error("MISSING ENV: FIREBASE_CLIENT_EMAIL");
if (!process.env.FIREBASE_PRIVATE_KEY) console.error("MISSING ENV: FIREBASE_PRIVATE_KEY");

// Check if already initialized to prevent hot-reload errors in Vercel/Next.js
if (!admin.apps.length) {
  try {
    if (process.env.FIREBASE_PRIVATE_KEY) {
        admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            // Handle newline characters in private keys for Vercel Env Vars
            privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
        }),
        });
        console.log("Firebase Admin Initialized Successfully");
    } else {
        console.error("Firebase Admin skipped - Private Key Missing");
    }
  } catch (error) {
    console.error("Firebase Admin Init Error:", error);
  }
}

// Export db safely - if init failed, this might throw on usage, which we want to see in logs
const db = admin.apps.length ? admin.firestore() : null;
const auth = admin.apps.length ? admin.auth() : null;

export { db, auth, admin };
