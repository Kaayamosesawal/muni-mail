import React, { createContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [manualNeedsOnboarding, setManualNeedsOnboarding] = useState(null);
  
  // Initialized as null, updated only when UID actually changes
  const [quickPhoto, setQuickPhoto] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      // 1. If no user, reset everything immediately and stop loading
      if (!firebaseUser) {
        setUser(null);
        setProfile(null);
        setQuickPhoto(null);
        setManualNeedsOnboarding(false);
        setLoading(false);
        return;
      }

      // 2. We have a user. Set core auth state.
      setUser(firebaseUser);
      setLoading(true); 

      // Capture Google photo ONLY once per login session.
      if (firebaseUser.photoURL !== quickPhoto) {
        setQuickPhoto(firebaseUser.photoURL);
      }

      try {
        const docRef = doc(db, "users", firebaseUser.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProfile(data);
          
          // Use Firestore photo if it exists, otherwise stick with Google
          if (data.photoURL) {
            setQuickPhoto(data.photoURL);
          }
          
          setManualNeedsOnboarding(!data.onboarded);
        } else {
          setProfile(null);
          setManualNeedsOnboarding(true);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        // Fallback: stay on onboarding if profile can't be verified
        setManualNeedsOnboarding(true); 
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [quickPhoto]); // Linked dependency check to track session photo configuration safely

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const needsOnboarding = user && manualNeedsOnboarding;

  const value = {
    user,
    profile,
    loading,
    needsOnboarding,
    quickPhoto, 
    logout,
    setNeedsOnboarding: setManualNeedsOnboarding,
    setProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Original Hook Export
export const useAuthContext = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

// FIXED ALIAS: Allows all of your components to call named { useAuth } seamlessly!
export const useAuth = () => useAuthContext();