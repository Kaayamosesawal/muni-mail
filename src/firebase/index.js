import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getAuth, 
  setPersistence, 
  browserLocalPersistence, 
  GoogleAuthProvider 
} from "firebase/auth";
import { 
  initializeFirestore, 
  CACHE_SIZE_UNLIMITED, 
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  getDocs
} from "firebase/firestore";
import { getDatabase } from "firebase/database";
import { getMessaging } from "firebase/messaging"; // Added Messaging import

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  databaseURL: `https://${import.meta.env.VITE_FIREBASE_PROJECT_ID}-default-rtdb.firebaseio.com`
};

// --- 1. INITIALIZATION ---
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const rtdb = getDatabase(app);
export const messaging = getMessaging(app); // Added Messaging initialization and export

// Initialize Firestore once
export const db = getApps().length > 0 
  ? getFirestore(app)
  : initializeFirestore(app, { cacheSizeBytes: CACHE_SIZE_UNLIMITED });

// --- 2. AUTH PROVIDERS ---
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// RECTIFICATION: Export 'provider' to fix the Login.jsx build error
export const provider = googleProvider; 

// --- 3. HELPER UTILITIES ---

/**
 * FIXED: Base64 Image Compression
 * Resizes image to 400px and 60% quality to fit in Firestore 1MB limit.
 */
export const uploadImage = async (file) => {
  if (!file) return null;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        
        const MAX_WIDTH = 400; 
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const base64string = canvas.toDataURL('image/jpeg', 0.6); 
        
        console.log("🔥 Firestore-Ready Size:", Math.round(base64string.length / 1024), "KB");
        resolve(base64string);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

/**
 * RECTIFIED: Create Post Logic
 */
export const createPost = async (postData) => {
  try {
    const postsRef = collection(db, "posts");
    const docRef = await addDoc(postsRef, {
      ...postData,
      createdAt: serverTimestamp(),
      likes: {}, 
      commentsCount: 0,
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating post:", error);
    throw error;
  }
};

/**
 * RECTIFIED: Fetch Feed Logic
 */
export const getFeed = async (facultyFilter = 'Global') => {
  try {
    const postsRef = collection(db, "posts");
    const q = (facultyFilter === 'Global')
      ? query(postsRef, orderBy("createdAt", "desc"))
      : query(postsRef, where("faculty", "==", facultyFilter), orderBy("createdAt", "desc"));

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching feed:", error);
    return [];
  }
};

/**
 * User Profile & Role Transition
 */
export const getUserProfile = async (uid) => {
  try {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      const now = new Date();
      
      if (data.role === 'Member' && data.endYear && 
         (now.getFullYear() > data.endYear || (now.getFullYear() === data.endYear && now.getMonth() >= 5))) {
        await updateDoc(docRef, { role: 'Alumni' });
        return { uid, ...data, role: 'Alumni' };
      }
      return { uid, ...data };
    }
    return null;
  } catch (error) {
    console.error("Profile Fetch Error:", error);
    return null;
  }
};

// Auth Persistence
setPersistence(auth, browserLocalPersistence).catch(console.error);

export default app;