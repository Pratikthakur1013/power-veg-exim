/**
 * Firebase Client SDK Configuration
 * Used for Phone Authentication (OTP) on the client side.
 * 
 * Safely handles missing/empty env variables so the site doesn't crash on boot.
 */
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";

const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;

const firebaseConfig = {
  apiKey: apiKey || "MOCK_API_KEY_PREVENTS_CRASH",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "mock-app.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "mock-app",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "mock-app.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "000000000000",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:000000000000:web:0000000000000000000000",
};

let app: FirebaseApp;
let auth: Auth;

try {
  // Prevent duplicate initialization in HMR environments
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  auth = getAuth(app);
  
  if (!apiKey) {
    console.warn(
      "[Firebase] VITE_FIREBASE_API_KEY is not defined in .env. " +
      "OTP authentication will fail at runtime. Please configure your .env file."
    );
  }
} catch (err) {
  console.error("[Firebase] Initialization error:", err);
  // Fallback mock to prevent import crashes
  app = {} as FirebaseApp;
  auth = {} as Auth;
}

export const firebaseAuth = auth;
export default app;
