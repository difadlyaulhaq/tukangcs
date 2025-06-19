// src/lib/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

// Konfigurasi Firebase
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
const app = initializeApp(firebaseConfig);

// Export services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Analytics hanya di browser
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;