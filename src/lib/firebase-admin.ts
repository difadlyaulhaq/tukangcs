// src/lib/firebase-admin.ts
import { initializeApp, cert, getApps, getApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

// Singleton untuk serverless environment
let app: any = null;

function initFirebaseAdmin() {
  // Kalau sudah ada app, return aja
  if (app) return app;
  
  // Cek kalau sudah diinit sebelumnya
  if (getApps().length > 0) {
    app = getApp();
    return app;
  }

  // Ambil environment variables
  const serviceAccount = {
    type: "service_account",
    project_id: import.meta.env.FIREBASE_PROJECT_ID,
    private_key_id: import.meta.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: import.meta.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: import.meta.env.FIREBASE_CLIENT_EMAIL,
    client_id: import.meta.env.FIREBASE_CLIENT_ID || "",
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs"
  };

  // Validasi environment variables
  if (!serviceAccount.project_id || !serviceAccount.private_key || !serviceAccount.client_email) {
    throw new Error('Firebase Admin: Environment variables tidak lengkap');
  }

  try {
    app = initializeApp({
      credential: cert(serviceAccount as any),
      projectId: serviceAccount.project_id,
    });
    
    console.log('Firebase Admin berhasil diinisialisasi');
    return app;
  } catch (error) {
    console.error('Error Firebase Admin:', error);
    throw error;
  }
}

// Export services
export const adminAuth = getAuth(initFirebaseAdmin());
export const adminDb = getFirestore(initFirebaseAdmin());