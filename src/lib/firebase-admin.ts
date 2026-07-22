import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

if (!getApps().length) {
  const adminKey = process.env.FIREBASE_ADMIN_KEY;

  if (adminKey) {
    try {
      const serviceAccount = JSON.parse(adminKey);
      initializeApp({
        credential: cert(serviceAccount),
        projectId: serviceAccount.project_id || process.env.VITE_FIREBASE_PROJECT_ID || "displaycellpros-com",
      });
    } catch (e) {
      console.error("Failed to parse FIREBASE_ADMIN_KEY, falling back to default initialization:", e);
      initializeApp({
        projectId: process.env.VITE_FIREBASE_PROJECT_ID || "displaycellpros-com",
      });
    }
  } else {
    initializeApp({
      projectId: process.env.VITE_FIREBASE_PROJECT_ID || "displaycellpros-com",
    });
  }
}

export const adminAuth = getAuth();
export const adminDb = getFirestore();
