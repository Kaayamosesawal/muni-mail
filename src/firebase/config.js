import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  setPersistence, 
  browserLocalPersistence, 
  GoogleAuthProvider 
} from 'firebase/auth';
import { 
  getFirestore, 
  initializeFirestore, 
  CACHE_SIZE_UNLIMITED,
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  getDoc
} from 'firebase/firestore';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getDatabase } from 'firebase/database';

// 1. Firebase Configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  databaseURL: `https://${import.meta.env.VITE_FIREBASE_PROJECT_ID}-default-rtdb.firebaseio.com`
};

// 2. Safe Initialization (The fix for duplicate-app error)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// 3. Initialize & Export Services
export const auth = getAuth(app);
export const storage = getStorage(app);
export const rtdb = getDatabase(app); // Realtime Database for notifications
export const googleProvider = new GoogleAuthProvider();

// Initialize Firestore as 'db' with unlimited cache
export const db = !getApps().length 
  ? initializeFirestore(app, { cacheSizeBytes: CACHE_SIZE_UNLIMITED })
  : getFirestore(app);

// 4. Provider Customization
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// 5. Shared Helper Functions (To fix 'does not provide export' errors)

export const getUserProfile = async (uid) => {
  try {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { uid, ...docSnap.data() } : null;
  } catch (error) {
    console.error("Profile Fetch Error:", error);
    return null;
  }
};

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

export const uploadImage = async (file, folder = 'uploads') => {
  if (!file) return null;
  const sRef = storageRef(storage, `${folder}/${Date.now()}_${file.name}`);
  const snap = await uploadBytes(sRef, file);
  return await getDownloadURL(snap.ref);
};

// 6. Set Persistence
setPersistence(auth, browserLocalPersistence).catch((err) => {
  console.error("Auth persistence error:", err);
});

export default app;