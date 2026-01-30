import * as firebaseAppModule from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';

// Configuration for Hotel Revenue Pro
const firebaseConfig = {
  apiKey: "AIzaSyAXtGrNSPSzKbB24ekcIMuPvpeYdfEKsYE",
  authDomain: "hotelrevenuepro.firebaseapp.com",
  projectId: "hotelrevenuepro",
  storageBucket: "hotelrevenuepro.firebasestorage.app",
  messagingSenderId: "990102574969",
  appId: "1:990102574969:web:f093ed33757cb626ea81a8",
  measurementId: "G-LD9ZE6S86T"
};

// Initialize Firebase
let app;
let auth;
let db;
let googleProvider;
let analytics;

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