// src/hooks/useAuth.js
import { useContext } from 'react';
// Ensure only ONE import of AuthContext
import { AuthContext } from '../context/AuthContext'; 

/**
 * Custom hook to access the current MuniCircle user, profile, and auth methods.
 */
const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined || context === null) {
    throw new Error('useAuth must be used within an AuthProvider. Check your src/main.jsx wrapping.');
  }

  return context;
};

// Default export means you import it as: import useAuth from './hooks/useAuth'
export default useAuth;