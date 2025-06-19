// src/lib/firebase-admin.ts
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

// Initialize Firebase Admin SDK
if (!getApps().length) {
  // Get Firebase credentials from environment variables
  const projectId = import.meta.env.FIREBASE_PROJECT_ID;
  const clientEmail = import.meta.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = import.meta.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const privateKeyId = import.meta.env.FIREBASE_PRIVATE_KEY_ID;

  // Validate required environment variables
  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      'Missing required Firebase environment variables. Please check:\n' +
      `FIREBASE_PROJECT_ID: ${projectId ? '✓' : '✗'}\n` +
      `FIREBASE_CLIENT_EMAIL: ${clientEmail ? '✓' : '✗'}\n` +
      `FIREBASE_PRIVATE_KEY: ${privateKey ? '✓' : '✗'}`
    );
  }

  // Create Firebase Admin configuration
  const firebaseConfig = {
    type: "service_account",
    project_id: projectId,
    private_key_id: privateKeyId,
    private_key: privateKey,
    client_email: clientEmail,
    client_id: import.meta.env.FIREBASE_CLIENT_ID,
    auth_uri: import.meta.env.FIREBASE_AUTH_URI || "https://accounts.google.com/o/oauth2/auth",
    token_uri: import.meta.env.FIREBASE_TOKEN_URI || "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: import.meta.env.FIREBASE_AUTH_CERT_URL || "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: import.meta.env.FIREBASE_CLIENT_CERT_URL
  };

  try {
    initializeApp({
      credential: cert(firebaseConfig as any),
      projectId: projectId,
    });
    console.log('Firebase Admin initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Firebase Admin:', error);
    throw error;
  }
}

export const adminAuth = getAuth();
export const adminDb = getFirestore();