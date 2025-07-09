'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { auth, firestore } from '@/firebase'; // Assuming firebase setup is in @/firebase
import { doc, getDoc, setDoc } from 'firebase/firestore';

import { User as FirebaseUser } from 'firebase/auth'; // Alias User to avoid conflict if I define my own User type
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  // GoogleAuthProvider, // For Google Sign-In (later)
  // GithubAuthProvider, // For GitHub Sign-In (later)
  // signInWithPopup // For Google/GitHub Sign-In (later)
} from 'firebase/auth';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  isGuest: boolean;
  signInAsGuest: () => void;
  signUpWithEmail: (email: string, password: string) => Promise<User | null>;
  signInWithEmail: (email: string, password: string) => Promise<User | null>;
  signOut: () => Promise<void>;
  // TODO: Add Google/GitHub sign-in methods
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        if (user.isAnonymous) {
          setIsGuest(true);
          setCurrentUser(user); // Keep anonymous user for potential Firebase interactions
        } else {
          setIsGuest(false);
          const userProfileRef = doc(firestore, 'users', user.uid);
          const userProfileSnap = await getDoc(userProfileRef);
          if (!userProfileSnap.exists()) {
            await setDoc(userProfileRef, {
              email: user.email,
              displayName: user.displayName || user.email?.split('@')[0] || 'User',
              createdAt: new Date(),
              // Initialize empty profiles/configs array or similar here if needed
              vpnConfigs: [],
            });
          }
          setCurrentUser(user);
        }
      } else {
        setCurrentUser(null);
        setIsGuest(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInAsGuest = () => { // No need for async if just setting local state
    setLoading(true);
    // Option 1: Pure local guest state (no Firebase anonymous user)
    setIsGuest(true);
    setCurrentUser(null);
    console.log("Signed in as guest (local state)");
    setLoading(false);

    // Option 2: Firebase Anonymous Sign-In (if you prefer to have a Firebase user object for guests)
    // signInAnonymously(auth).then(userCredential => {
    //   setCurrentUser(userCredential.user);
    //   setIsGuest(true); // Or rely on user.isAnonymous
    //   console.log("Signed in as anonymous Firebase user");
    // }).catch(error => {
    //   console.error("Error signing in anonymously:", error);
    // }).finally(() => {
    //   setLoading(false);
    // });
  };

  const signUpWithEmail = async (email: string, password: string): Promise<User | null> => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Firestore document creation is handled by onAuthStateChanged
      setIsGuest(false);
      return userCredential.user;
    } catch (error) {
      console.error("Error signing up with email and password:", error);
      // TODO: Handle specific error codes (e.g., email-already-in-use) and provide user feedback
      return null;
    } finally {
      setLoading(false);
    }
  };

  const signInWithEmail = async (email: string, password: string): Promise<User | null> => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setIsGuest(false);
      return userCredential.user;
    } catch (error) {
      console.error("Error signing in with email and password:", error);
      // TODO: Handle specific error codes (e.g., user-not-found, wrong-password)
      return null;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await firebaseSignOut(auth); // This will sign out Firebase (anonymous or regular) users
      // onAuthStateChanged will handle setting currentUser to null and isGuest to false
      console.log("Signed out");
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setLoading(false); // onAuthStateChanged will also set loading, but this is fine
    }
  };

  const value = {
    currentUser,
    loading,
    isGuest,
    signInAsGuest,
    signUpWithEmail,
    signInWithEmail,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
