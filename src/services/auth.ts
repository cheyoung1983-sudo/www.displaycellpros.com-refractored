import { 
  signInWithPopup, 
  signOut, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  User 
} from "firebase/auth";
import { auth, googleProvider } from "../lib/firebase";

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google:", error);
    throw error;
  }
};

export const signOutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};

/**
 * 1. USER CREATION (SIGN UP)
 * Creates a new user account using an email address and a secure password.
 */
export async function registerNewUser(email: string, password: string): Promise<User> {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
    console.log("Successfully created new user account:", userCredential.user.uid);
    return userCredential.user;
  } catch (error: any) {
    console.error("Failed to create user account. Reason:", error.message);
    throw new Error(error.message);
  }
}

/**
 * 2. SIGN IN
 * Authenticates an existing user and establishes a secure session.
 */
export async function signInUser(email: string, password: string): Promise<User> {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
    console.log("User signed in successfully:", userCredential.user.uid);
    return userCredential.user;
  } catch (error: any) {
    console.error("Sign-in failed. Please check your credentials.", error.message);
    throw new Error("Invalid login credentials.");
  }
}

/**
 * 3. SIGN OUT
 * Terminates the current user's session and clears local authentication tokens.
 */
export async function logOutUser(): Promise<void> {
  try {
    await signOut(auth);
    console.log("User has been successfully signed out.");
  } catch (error: any) {
    console.error("An error occurred during sign out:", error.message);
    throw new Error("Failed to sign out.");
  }
}
