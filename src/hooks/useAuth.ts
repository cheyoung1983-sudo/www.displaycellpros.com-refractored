import { useState, useEffect } from "react";
import { onAuthStateChanged, User, signInWithPopup, signOut, sendEmailVerification } from "firebase/auth";
import { auth, googleProvider } from "../lib/firebase";

export interface UseAuthResult {
  user: User | null;
  loading: boolean;
  error: Error | null;
  emailVerified: boolean;
  isVerified: boolean;
  loginWithGoogle: () => Promise<User>;
  logout: () => Promise<void>;
  sendVerification: () => Promise<void>;
  reloadUser: () => Promise<void>;
}

/**
 * Custom hook to simplify access to Firebase's authenticated user state.
 * Listens to onAuthStateChanged and exposes current user, loading state,
 * as well as integrated Google Sign-In and logout helper methods.
 */
export const useAuth = (): UseAuthResult => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Subscribe to Firebase Auth state change observer
    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        setUser(currentUser);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("Firebase useAuth State Observer Error:", err);
        setError(err);
        setLoading(false);
      }
    );

    // Clean up subscription on unmount
    return () => unsubscribe();
  }, []);

  const emailVerified = user ? (user.isAnonymous || user.emailVerified) : false;
  const isVerified = user ? (user.isAnonymous || user.emailVerified) : false;

  /**
   * Triggers the Google Sign-In popup flow
   */
  const loginWithGoogle = async (): Promise<User> => {
    setLoading(true);
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error("GATEWAY_TIMEOUT"));
      }, 8000);
    });

    try {
      const result = await Promise.race([
        signInWithPopup(auth, googleProvider),
        timeoutPromise
      ]);
      setUser(result.user);
      setError(null);
      return result.user;
    } catch (err: any) {
      console.error("useAuth Sign-In Error:", err);
      if (err.message === "GATEWAY_TIMEOUT") {
        const timeoutError = new Error("Our login gateway is experiencing high latency. Please try again in a few moments.");
        setError(timeoutError);
        throw timeoutError;
      }
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Triggers the sign-out flow
   */
  const logout = async (): Promise<void> => {
    setLoading(true);
    try {
      await signOut(auth);
      setUser(null);
      setError(null);
    } catch (err: any) {
      console.error("useAuth Sign-Out Error:", err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Sends email verification to the authenticated user
   */
  const sendVerification = async (): Promise<void> => {
    if (auth.currentUser) {
      try {
        await sendEmailVerification(auth.currentUser);
      } catch (err: any) {
        console.error("useAuth sendVerification Error:", err);
        throw err;
      }
    } else {
      throw new Error("No user is currently authenticated to send verification email.");
    }
  };

  /**
   * Reloads the user's data from Firebase auth (e.g. to check if verified)
   */
  const reloadUser = async (): Promise<void> => {
    if (auth.currentUser) {
      try {
        await auth.currentUser.reload();
        setUser({ ...auth.currentUser });
      } catch (err: any) {
        console.error("useAuth reloadUser Error:", err);
        throw err;
      }
    }
  };

  return { 
    user, 
    loading, 
    error, 
    emailVerified, 
    isVerified,
    loginWithGoogle, 
    logout, 
    sendVerification, 
    reloadUser 
  };
};
