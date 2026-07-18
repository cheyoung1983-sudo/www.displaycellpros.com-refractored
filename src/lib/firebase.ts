import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, doc, getDocFromServer } from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId); // Enforces enterprise DB selection
export const auth = getAuth(app);

// Explicitly configure browser local persistence for session retention
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log("[Firebase Auth] Session persistence initialized to browserLocalPersistence successfully.");
  })
  .catch((err) => {
    console.warn("[Firebase Auth] Warning: could not set explicit persistence:", err.message || err);
  });

export const googleProvider = new GoogleAuthProvider();

// Standardized Google Sign-In with popup
googleProvider.setCustomParameters({ prompt: "select_account" });


