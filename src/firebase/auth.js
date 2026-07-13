import { 
  GoogleAuthProvider, 
  signInWithRedirect, 
  getRedirectResult, 
  signOut 
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./index";

const MUNI_DOMAIN = "@muni.ac.ug";

/**
 * 1. INITIATE REDIRECT
 * Triggered by your login button.
 * Uses authorized URIs to bypass COOP/popup security blocks.
 */
export const signInWithMuniGoogle = async () => {
  const provider = new GoogleAuthProvider();
  
  provider.setCustomParameters({ 
    prompt: 'select_account',
    hd: 'muni.ac.ug' 
  });

  // Redirects the current window to Google's login page
  await signInWithRedirect(auth, provider);
};

/**
 * 2. HANDLE REDIRECT RESULT
 * Processes the login data after the user is redirected back to the app.
 * Includes domain restriction and Firestore profile checks.
 */
export const handleRedirectResult = async () => {
  try {
    const result = await getRedirectResult(auth);
    
    // If there is no result (e.g., page just loaded normally), return null
    if (!result) return null;

    const user = result.user;

    // Domain Restriction Check
    if (!user.email.endsWith(MUNI_DOMAIN)) {
      await signOut(auth);
      throw new Error(`Access restricted. Use your ${MUNI_DOMAIN} email.`);
    }

    // Check Firestore for existing profile
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);

    // Return combined auth and profile metadata
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      exists: userDoc.exists(),
      profileData: userDoc.exists() ? userDoc.data() : null
    };

  } catch (error) {
    console.error("Auth Redirect Error:", error.message);
    throw error;
  }
};

/**
 * Global Logout
 */
export const logoutUser = async () => {
  try {
    await signOut(auth);
    return true;
  } catch (error) {
    console.error("Logout Error:", error);
    throw error;
  }
};