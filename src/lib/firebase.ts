import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from "firebase/app-check";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Initialize Core App
export const app = initializeApp(firebaseConfig);

/**
 * 🛡️ APP CHECK (Security Best Practice)
 * Prevents "Firebase App Check token is invalid" errors in production.
 */
if (typeof window !== "undefined") {
  if (import.meta.env.DEV) {
    // @ts-ignore
    self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
  }

  initializeAppCheck(app, {
    provider: new ReCaptchaEnterpriseProvider(
      import.meta.env.VITE_RECAPTCHA_SITE_KEY || "6LcgWy4tAAAAABP-_hU5ngbkKF5scb2DnI2_bscl"
    ),
    isTokenAutoRefreshEnabled: true
  });
}

// Initialize Services
export const db = getFirestore(app);
export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();

/**
 * 🔐 HARDENED IDENTITY GATEWAY (OIDC)
 * Purged Restricted Scopes (Drive, Gmail, Docs, etc.) to expedite Google Trust & Safety approval.
 * We retreat to the Identity-Only Tier to bypass CASA audit requirements.
 */
googleProvider.addScope("https://www.googleapis.com/auth/userinfo.email");
googleProvider.addScope("https://www.googleapis.com/auth/userinfo.profile");
googleProvider.addScope("openid");

// Standardized Google Sign-In with popup
googleProvider.setCustomParameters({ prompt: "select_account" });
