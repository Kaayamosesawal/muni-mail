import React, { createContext, useState, useEffect, useContext } from 'react';
import { db } from '../firebase/index';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useAuthContext } from './AuthContext'; 

export const ClubContext = createContext();

/**
 * Updated ClubContext:
 * 1. Role-Aware Access: Distinguishes between membership and administrative access.
 * 2. Optimized Listeners: Handles "permission-denied" errors during auth transitions.
 * 3. Access Helpers: logic to support Observer Mode (Staff/Alumni/Admins).
 */
export const ClubProvider = ({ children }) => {
  const { user, userData } = useAuthContext(); 
  const [myClubs, setMyClubs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Derived role from AuthContext
  const userRole = userData?.role || 'Student';

  useEffect(() => {
    // 1. Guard: If no user is logged in, reset and stop
    if (!user) {
      setMyClubs([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    // 2. Query Logic:
    // If Admin/Staff, we might want to see ALL clubs, 
    // but for the "My Clubs" sidebar, we still filter by membership.
    const q = query(
      collection(db, 'clubs'), 
      where('members', 'array-contains', user.uid)
    );

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const clubs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setMyClubs(clubs);
        setLoading(false);
      }, 
      (error) => {
        console.warn("Club listener restricted: ", error.message);
        
        // Fail gracefully on permission shifts
        if (error.code === 'permission-denied') {
          setMyClubs([]);
        }
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user?.uid]);

  /**
   * Helper: Check if user is a standard member (for voting eligibility)
   */
  const isMemberOf = (clubId) => {
    return myClubs.some(club => club.id === clubId);
  };

  /**
   * Helper: Check if user can ENTER the club/election portal.
   * Members, Admins, Staff, and Alumni all return true.
   */
  const canAccessClub = (clubId) => {
    const isObserver = ['Staff', 'Alumni', 'Admin'].includes(userRole);
    return isMemberOf(clubId) || isObserver;
  };

  /**
   * Helper: Check if user is the designated Club Leader
   */
  const isClubLeader = (clubId) => {
    const club = myClubs.find(c => c.id === clubId);
    return club?.leaderId === user?.uid;
  };

  const value = {
    myClubs,
    isMemberOf,
    canAccessClub,
    isClubLeader,
    userRole,
    loading
  };

  return (
    <ClubContext.Provider value={value}>
      {children}
    </ClubContext.Provider>
  );
};

export const useClubs = () => {
  const context = useContext(ClubContext);
  if (!context) {
    throw new Error("useClubs must be used within a ClubProvider");
  }
  return context;
};