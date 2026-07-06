// src/lib/firebase.ts improvement

// ... existing imports

export const app = initializeApp(firebaseConfig);

// Initialize App Check immediately after app initialization
if (typeof window !== "undefined") {
  // Use window object for debug token to ensure global visibility in dev
  if (import.meta.env.DEV) {
    // @ts-ignore
    window.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
  }

  initializeAppCheck(app, {
    provider: new ReCaptchaEnterpriseProvider(
      import.meta.env.VITE_RECAPTCHA_SITE_KEY || "6LcgWy4tAAAAABP-_hU5ngbkKF5scb2DnI2_bscl"
    ),
    isTokenAutoRefreshEnabled: true
  });
}

// These services will now automatically wait for/attach the App Check token
export const db = getFirestore(app);
export const auth = getAuth(app);