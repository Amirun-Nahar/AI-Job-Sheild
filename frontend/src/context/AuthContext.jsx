import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize and load any existing session from localStorage
  useEffect(() => {
    const savedSession = localStorage.getItem('ai_job_shield_user');
    if (savedSession) {
      try {
        setUser(JSON.parse(savedSession));
      } catch (err) {
        console.error('Failed to restore auth session:', err);
      }
    }
    setLoading(false);
  }, []);

  // Mock Register
  const register = async (email, password, displayName) => {
    setLoading(true);
    // Simulate API network delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const userData = {
      uid: 'uid_' + Math.random().toString(36).substr(2, 9),
      email,
      displayName: displayName || email.split('@')[0],
      createdAt: new Date().toISOString()
    };

    setUser(userData);
    localStorage.setItem('ai_job_shield_user', JSON.stringify(userData));
    setLoading(false);
    return userData;
  };

  // Mock Login
  const login = async (email, password) => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));

    // For testing/mock purposes, any login works
    const userData = {
      uid: 'uid_mock_user_123',
      email,
      displayName: email.split('@')[0],
      createdAt: new Date().toISOString()
    };

    setUser(userData);
    localStorage.setItem('ai_job_shield_user', JSON.stringify(userData));
    setLoading(false);
    return userData;
  };

  // Mock Logout
  const logout = async () => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 400));
    setUser(null);
    localStorage.removeItem('ai_job_shield_user');
    setLoading(false);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

/* 
========================================================================
FIREBASE INTEGRATION NOTES:
To swap this mock implementation for real Firebase Auth, follow these steps:

1. Install firebase SDK in the frontend directory:
   npm install firebase

2. Create a firebase config file (e.g., src/config/firebase.js):
   import { initializeApp } from 'firebase/app';
   import { getAuth } from 'firebase/auth';

   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_AUTH_DOMAIN",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_STORAGE_BUCKET",
     messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
     appId: "YOUR_APP_ID"
   };

   const app = initializeApp(firebaseConfig);
   export const auth = getAuth(app);

3. Re-write this AuthContext file to use:
   import { auth } from '../config/firebase';
   import { 
     signInWithEmailAndPassword, 
     createUserWithEmailAndPassword, 
     signOut, 
     onAuthStateChanged,
     updateProfile
   } from 'firebase/auth';

   - In useEffect, subscribe to onAuthStateChanged:
     onAuthStateChanged(auth, (currentUser) => {
       setUser(currentUser);
       setLoading(false);
     });
   - Re-map login() to signInWithEmailAndPassword(auth, email, password)
   - Re-map register() to createUserWithEmailAndPassword(auth, email, password) followed by updateProfile
   - Re-map logout() to signOut(auth)
========================================================================
*/
