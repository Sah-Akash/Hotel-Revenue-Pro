
import admin from 'firebase-admin';

let initError = null;

// Helper to safely format private key
const getPrivateKey = () => {
    let key = process.env.FIREBASE_PRIVATE_KEY;
    if (!key) return null;
    
    // Remove surrounding quotes if user copy-pasted "..." from JSON
    if (key.startsWith('"') && key.endsWith('"')) {
        key = key.slice(1, -1);
    }
    
    // Replace literal "\n" with actual newlines
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
        const missing = [];
        if(!projectId) missing.push("FIREBASE_PROJECT_ID");
        if(!clientEmail) missing.push("FIREBASE_CLIENT_EMAIL");
        if(!privateKey) missing.push("FIREBASE_PRIVATE_KEY");
        
        initError = `Missing Env Vars: ${missing.join(', ')}`;
        console.error("FIREBASE INIT FAILED:", initError);
    }
  } catch (error) {
    initError = `Init Exception: ${error.message}`;
    console.error("Firebase Admin Init Error:", error);
  }
}

const db = admin.apps.length ? admin.firestore() : null;
const auth = admin.apps.length ? admin.auth() : null;

export { db, auth, admin, initError };
