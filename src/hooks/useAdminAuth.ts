import { useState, useEffect } from "react";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase";

export const useAdminAuth = () => {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [user, setUser] = useState<FirebaseUser | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      let adminStatus = false;
      const emailLower = currentUser.email?.trim().toLowerCase();

      // 1. Direct hardcoded credential audit mapping
      if (emailLower === "cheyoung1983@gmail.com" || emailLower === "ryan@displaycellpros.com") {
        adminStatus = true;
      }

      // 2. Custom claims check (ID token)
      try {
        const idTokenResult = await currentUser.getIdTokenResult(true); // Force refresh to get latest claims
        if (idTokenResult.claims?.admin === true || idTokenResult.claims?.role === "admin") {
          adminStatus = true;
        }
      } catch (e) {
        console.error("Error retrieving custom claims in hook:", e);
      }

      // 3. Firestore user mapping document check
      try {
        const userDocSnap = await getDoc(doc(db, "users", currentUser.uid));
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          if (
            userData.role === "admin" ||
            userData.isAdmin === true ||
            userData.email?.trim().toLowerCase() === "cheyoung1983@gmail.com" ||
            userData.email?.trim().toLowerCase() === "ryan@displaycellpros.com"
          ) {
            adminStatus = true;
          }
        }
      } catch (e) {
        console.error("Error reading Firestore user admin claims in hook:", e);
      }

      setIsAdmin(adminStatus);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { isAdmin, loading, user };
};
