import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { db } from './config';

/**
 * USER OPERATIONS
 */

// Fetch a single user profile
export const getUserProfile = async (uid) => {
  try {
    const userDoc = await getDoc(doc(db, "users", uid));
    return userDoc.exists() ? userDoc.data() : null;
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error;
  }
};

// Update user points (Reward system)
export const updateUserPoints = async (uid, amount) => {
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, {
    points: increment(amount)
  });
};

/**
 * NEWS FEED & POSTS
 */

// Create a new post
export const createPost = async (userId, postData) => {
  const postRef = doc(collection(db, "posts"));
  await setDoc(postRef, {
    ...postData,
    authorId: userId,
    createdAt: serverTimestamp(),
    likes: [],
    commentsCount: 0
  });
  return postRef.id;
};

// Get feed (Filtered by faculty or global)
export const getFeed = async (facultyFilter = null) => {
  let q;
  if (facultyFilter && facultyFilter !== 'Global') {
    q = query(
      collection(db, "posts"),
      where("faculty", "==", facultyFilter),
      orderBy("createdAt", "desc"),
      limit(20)
    );
  } else {
    q = query(
      collection(db, "posts"),
      orderBy("createdAt", "desc"),
      limit(20)
    );
  }
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

/**
 * CLUB & CIRCLE OPERATIONS
 */

// Join or Leave a Club
export const toggleClubMembership = async (clubId, userId, isJoining) => {
  const clubRef = doc(db, "clubs", clubId);
  const userRef = doc(db, "users", userId);

  if (isJoining) {
    await updateDoc(clubRef, { members: arrayUnion(userId) });
    await updateDoc(userRef, { joinedClubs: arrayUnion(clubId) });
  } else {
    await updateDoc(clubRef, { members: arrayRemove(userId) });
    await updateDoc(userRef, { joinedClubs: arrayRemove(clubId) });
  }
};

// Fetch all clubs
export const getAllClubs = async () => {
  const querySnapshot = await getDocs(collection(db, "clubs"));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

/**
 * VOTING & ELECTIONS
 */

// Cast a vote
export const castVote = async (electionId, candidateId, userId) => {
  const electionRef = doc(db, "elections", electionId);
  
  // 1. Check if user already voted (Security)
  const electionDoc = await getDoc(electionRef);
  if (electionDoc.data().voters?.includes(userId)) {
    throw new Error("You have already cast your vote for this election.");
  }

  // 2. Atomic update: Add user to voters and increment candidate count
  await updateDoc(electionRef, {
    voters: arrayUnion(userId),
    [`results.${candidateId}`]: increment(1)
  });
};

/**
 * SEARCH LOGIC
 */

// Search for users or clubs
export const searchCircle = async (searchTerm, category = 'users') => {
  const q = query(
    collection(db, category),
    where("username", ">=", searchTerm.toLowerCase()),
    where("username", "<=", searchTerm.toLowerCase() + "\uf8ff"),
    limit(10)
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};