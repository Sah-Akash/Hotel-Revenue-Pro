import * as firebaseAppModule from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';

const metaEnv = (import.meta as any).env || {};

// Configuration for Hotel Revenue Pro
const firebaseConfig = {
  apiKey: metaEnv.VITE_FIREBASE_API_KEY || "AIzaSyAXtGrNSPSzKbB24ekcIMuPvpeYdfEKsYE",
  authDomain: metaEnv.VITE_FIREBASE_AUTH_DOMAIN || "hotelrevenuepro.firebaseapp.com",
  projectId: metaEnv.VITE_FIREBASE_PROJECT_ID || "hotelrevenuepro",
  storageBucket: metaEnv.VITE_FIREBASE_STORAGE_BUCKET || "hotelrevenuepro.firebasestorage.app",
  messagingSenderId: metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || "990102574969",
  appId: metaEnv.VITE_FIREBASE_APP_ID || "1:990102574969:web:f093ed33757cb626ea81a8",
  measurementId: metaEnv.VITE_FIREBASE_MEASUREMENT_ID || "G-LD9ZE6S86T"
};

// Initialize Firebase
let app: any;
let auth: any;
let db: any;
let googleProvider: any;
let analytics: any;

try {
  // Use modular check to prevent re-initialization in strict mode/hot reload
  // Casting to any to workaround type definition issues where exported members are not found
  const firebaseApp = firebaseAppModule as any;
  
  if (firebaseApp.getApps && firebaseApp.getApps().length > 0) {
    app = firebaseApp.getApp();
  } else {
    app = firebaseApp.initializeApp(firebaseConfig);
  }

  auth = getAuth(app);
  db = getFirestore(app);
  googleProvider = new GoogleAuthProvider();
  
  // Initialize Analytics conditionally (it requires a browser environment)
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });

} catch (error) {
  console.warn("Firebase not configured correctly or network issue.", error);
}

export { auth, db, googleProvider, analytics };