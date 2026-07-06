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

/**
 * 🏢 MULTI-TENANCY HANDLER
 * Use this to scope the session to a specific B2B tenant.
 */
export const setAuthTenant = (tenantId: string | null) => {
  auth.tenantId = tenantId;
  console.log(`[AUTH] Scoped to tenant: ${tenantId || 'Default'}`);
};

export const googleProvider = new GoogleAuthProvider();

// Google Workspace Scopes
googleProvider.addScope("https://www.googleapis.com/auth/forms.body");
googleProvider.addScope("https://www.googleapis.com/auth/forms.responses.readonly");
googleProvider.addScope("https://www.googleapis.com/auth/forms");
googleProvider.addScope("https://www.googleapis.com/auth/drive.readonly");
googleProvider.addScope("https://www.googleapis.com/auth/gmail.send");
googleProvider.addScope("https://www.googleapis.com/auth/gmail.readonly");
googleProvider.addScope("https://www.googleapis.com/auth/gmail.compose");
googleProvider.addScope("https://www.googleapis.com/auth/gmail.modify");
googleProvider.addScope("https://www.googleapis.com/auth/spreadsheets");
googleProvider.addScope("https://www.googleapis.com/auth/documents");
googleProvider.addScope("https://www.googleapis.com/auth/calendar");
googleProvider.addScope("https://www.googleapis.com/auth/chat.messages");
googleProvider.addScope("https://www.googleapis.com/auth/chat.spaces.readonly");
googleProvider.addScope("https://www.googleapis.com/auth/drive");
googleProvider.addScope("https://www.googleapis.com/auth/drive.file");
googleProvider.addScope("https://www.googleapis.com/auth/drive.metadata.readonly");

// Contacts Scopes
googleProvider.addScope("https://www.googleapis.com/auth/contacts");
googleProvider.addScope("https://www.googleapis.com/auth/contacts.other.readonly");
googleProvider.addScope("https://www.googleapis.com/auth/contacts.readonly");
googleProvider.addScope("https://www.googleapis.com/auth/directory.readonly");
googleProvider.addScope("https://www.googleapis.com/auth/user.addresses.read");
googleProvider.addScope("https://www.googleapis.com/auth/user.birthday.read");
googleProvider.addScope("https://www.googleapis.com/auth/user.emails.read");
googleProvider.addScope("https://www.googleapis.com/auth/user.gender.read");
googleProvider.addScope("https://www.googleapis.com/auth/user.organization.read");
googleProvider.addScope("https://www.googleapis.com/auth/user.phonenumbers.read");

googleProvider.setCustomParameters({ prompt: "select_account" });