import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const env = (import.meta as any).env as Record<string, any>;
const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID,
};

const isFirebaseConfigured =
  typeof firebaseConfig.apiKey === "string" &&
  firebaseConfig.apiKey.trim().length > 0 &&
  !firebaseConfig.apiKey.includes("YOUR_") &&
  !firebaseConfig.apiKey.includes("MY_");

export let app: any = null;
export let db: any = null;
export let auth: any = null;
export const googleProvider: any = null; // Google Provider Removed

if (isFirebaseConfigured) {
  try {
    console.log(`[FIREBASE] Initializing with Project ID: ${firebaseConfig.projectId}`);
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);

    // App Check / reCAPTCHA Removed
  } catch (err) {
    console.error("⚠️ Failed to initialize Firebase SDK:", err);
  }
} else {
  console.warn("⚠️ Firebase is not configured. Telemetry-First operations will fallback to offline sandbox mode.");
  
  auth = {
    currentUser: null,
    onAuthStateChanged: (callback: any) => {
      if (typeof callback === "function") {
        callback(null);
      }
      return () => {};
    },
    signOut: async () => {
      console.log("[MOCK AUTH] Simulated Sign-out executed.");
    }
  };
}

export const setAuthTenant = (tenantId: string | null) => {
  if (auth && 'tenantId' in auth) {
    auth.tenantId = tenantId;
  }
  console.log(`[AUTH] Scoped to tenant: ${tenantId || 'Default'}`);
};
