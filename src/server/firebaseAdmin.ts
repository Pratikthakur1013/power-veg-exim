/**
 * Firebase Admin SDK — Server-side initialization
 * Used to verify Firebase Phone Auth ID tokens after OTP confirmation.
 *
 * NEVER import this in frontend/client code.
 * SETUP: Add FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY to .env
 */
import { initializeApp, getApps, getApp, cert, App } from "firebase-admin/app";
import { getAuth, DecodedIdToken } from "firebase-admin/auth";

let adminApp: App | null = null;

export function getFirebaseAdmin(): App | null {
  if (adminApp) return adminApp;

  const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } = process.env;

  if (!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY) {
    console.warn(
      "[FirebaseAdmin] Missing Firebase Admin credentials. " +
      "OTP verification will be unavailable. " +
      "Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY in .env"
    );
    return null;
  }

  if (getApps().length === 0) {
    adminApp = initializeApp({
      credential: cert({
        projectId: FIREBASE_PROJECT_ID,
        clientEmail: FIREBASE_CLIENT_EMAIL,
        // Replace escaped newlines that env files may inject
        privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      }),
    });
  } else {
    adminApp = getApp();
  }

  return adminApp;
}

/**
 * Verify a Firebase ID token (issued after successful Phone OTP confirmation).
 * Returns the decoded token payload or throws on invalid/expired token.
 */
export async function verifyFirebaseIdToken(idToken: string): Promise<DecodedIdToken> {
  const app = getFirebaseAdmin();
  if (!app) {
    throw new Error("Firebase Admin SDK not initialized. Cannot verify OTP token.");
  }
  return getAuth(app).verifyIdToken(idToken, true /* checkRevoked */);
}
