// src/firebase/client.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyD_b0lWXcpnNbSRIt1v9A1jCgCsfXWI6Zw",
  authDomain: "tukang-cs.firebaseapp.com",
  projectId: "tukang-cs",
  storageBucket: "tukang-cs.firebasestorage.app",
  messagingSenderId: "831215047916",
  appId: "1:831215047916:web:624e207e0e1514819881c9",
  measurementId: "G-WTH48T6G59"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize Analytics (only in browser)
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;