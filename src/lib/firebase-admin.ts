// src/lib/firebase-admin.ts
import { initializeApp, cert, getApps, getApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

// Singleton pattern for serverless environments
let adminApp: any = null;

function getFirebaseAdmin() {
  if (adminApp) {
    return adminApp;
  }

  // Check if already initialized
  const existingApps = getApps();
  if (existingApps.length > 0) {
    adminApp = getApp();
    return adminApp;
  }

  // Get Firebase credentials from environment variables
  const projectId = import.meta.env.FIREBASE_PROJECT_ID;
  const clientEmail = import.meta.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = import.meta.env.FIREBASE_PRIVATE_KEY;
  const privateKeyId = import.meta.env.FIREBASE_PRIVATE_KEY_ID;

  // Debug logging for deployment
  console.log('Firebase Admin initialization:', {
    projectId: projectId ? '✓' : '✗',
    clientEmail: clientEmail ? '✓' : '✗',
    privateKey: privateKey ? `✓ (${privateKey.substring(0, 50)}...)` : '✗',
    privateKeyId: privateKeyId ? '✓' : '✗'
  });

  // Validate required environment variables
  if (!projectId || !clientEmail || !privateKey) {
    const error = new Error(
      'Missing required Firebase environment variables:\n' +
      `FIREBASE_PROJECT_ID: ${projectId ? '✓' : '✗'}\n` +
      `FIREBASE_CLIENT_EMAIL: ${clientEmail ? '✓' : '✗'}\n` +
      `FIREBASE_PRIVATE_KEY: ${privateKey ? '✓' : '✗'}`
    );
    console.error('Firebase Admin configuration error:', error);
    throw error;
  }

  try {
    // Clean up private key - handle different formats
    let cleanPrivateKey = privateKey;
    
    // Remove quotes if present
    if (cleanPrivateKey.startsWith('"') && cleanPrivateKey.endsWith('"')) {
      cleanPrivateKey = cleanPrivateKey.slice(1, -1);
    }
    
    // Replace escaped newlines with actual newlines
    cleanPrivateKey = cleanPrivateKey.replace(/\\n/g, '\n');

    // Create Firebase Admin configuration
    const firebaseConfig = {
      type: "service_account",
      project_id: projectId,
      private_key_id: privateKeyId,
      private_key: cleanPrivateKey,
      client_email: clientEmail,
      client_id: import.meta.env.FIREBASE_CLIENT_ID || "",
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url: import.meta.env.FIREBASE_CLIENT_CERT_URL || ""
    };

    adminApp = initializeApp({
      credential: cert(firebaseConfig as any),
      projectId: projectId,
    });

    console.log('Firebase Admin initialized successfully for project:', projectId);
    return adminApp;

  } catch (error) {
    console.error('Failed to initialize Firebase Admin:', error);
    if (error instanceof Error) {
      throw new Error(`Firebase Admin initialization failed: ${error.message}`);
    } else {
      throw new Error('Firebase Admin initialization failed: Unknown error');
    }
  }
}

// Initialize and export
const app = getFirebaseAdmin();
export const adminAuth = getAuth(app);
export const adminDb = getFirestore(app);