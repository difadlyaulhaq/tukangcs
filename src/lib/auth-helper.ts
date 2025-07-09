// src/lib/auth-helper.ts
import { auth } from './firebase';
import { onAuthStateChanged, type User } from 'firebase/auth';

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

// Function to get current user
export const getCurrentUser = (): Promise<User | null> => {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, 
      (user) => {
        unsubscribe();
        resolve(user);
      },
      reject
    );
  });
};

// Function to wait for auth state to be determined
export const waitForAuthState = (): Promise<User | null> => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
};

// Function to get user ID safely
export const getCurrentUserId = async (): Promise<string | null> => {
  try {
    const user = await getCurrentUser();
    return user?.uid || null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

// Function to check if user is authenticated
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const user = await getCurrentUser();
    return !!user;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
};

// Function to get user display name
export const getUserDisplayName = async (): Promise<string | null> => {
  try {
    const user = await getCurrentUser();
    return user?.displayName || user?.email || null;
  } catch (error) {
    console.error('Error getting user display name:', error);
    return null;
  }
};

// Function to get user email
export const getUserEmail = async (): Promise<string | null> => {
  try {
    const user = await getCurrentUser();
    return user?.email || null;
  } catch (error) {
    console.error('Error getting user email:', error);
    return null;
  }
};

// Type for auth state listener
export type AuthStateListener = (user: User | null) => void;

// Function to listen to auth state changes
export const onAuthStateChange = (callback: AuthStateListener) => {
  return onAuthStateChanged(auth, callback);
};