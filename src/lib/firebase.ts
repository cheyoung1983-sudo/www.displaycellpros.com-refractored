import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from "firebase/app-check";
import firebaseConfig from "../../firebase-applet-config.json";

export const app = initializeApp(firebaseConfig);
export const db = (firebaseConfig as any).firestoreDatabaseId
  ? getFirestore(app, (firebaseConfig as any).firestoreDatabaseId)
  : getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize App Check with reCAPTCHA Enterprise
const SITE_KEY = "6LcgWy4tAAAAABP-_hU5ngbkKF5scb2DnI2_bscl";

if (typeof window !== "undefined") {
  // Enable debug tokens ONLY for local development
  // On production domains (*.web.app), App Check should use the real reCAPTCHA provider
  if (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1") {
    (self as any).FIREBASE_APPCHECK_DEBUG_TOKEN = true;
  }
}

export const appCheck = initializeAppCheck(app, {
  provider: new ReCaptchaEnterpriseProvider(SITE_KEY),
  isTokenAutoRefreshEnabled: true
});

// Add Google Workspace Scopes
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

// Standardized Google Sign-In with forced consent for scope verification
googleProvider.setCustomParameters({
  prompt: "select_account consent",
  access_type: "offline"
});
