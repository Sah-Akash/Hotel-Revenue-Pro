
import admin from 'firebase-admin';

// Helper to safely format private key
const getPrivateKey = () => {
    const key = process.env.FIREBASE_PRIVATE_KEY;
    if (!key) return null;
    // Replace literal "\n" with actual newlines if necessary, or use as is
    return key.replace(/\\n/g, '\n');
};

if (!admin.apps.length) {
  try {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = getPrivateKey();

    if (projectId && clientEmail && privateKey) {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId,
                clientEmail,
                privateKey,
            }),
        });
        console.log("Firebase Admin Initialized Successfully");
    } else {
        console.error("FIREBASE INIT FAILED: Missing Env Vars");
        console.error("ProjectID:", !!projectId, "Email:", !!clientEmail, "Key:", !!privateKey);
    }
  } catch (error) {
    console.error("Firebase Admin Init Error:", error);
  }
}

const db = admin.apps.length ? admin.firestore() : null;
const auth = admin.apps.length ? admin.auth() : null;

export { db, auth, admin };
