// src/lib/firebase-admin.ts
import { initializeApp, cert, getApps, getApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

// Tambahkan console.log untuk debugging
console.log("Project ID:", process.env.FIREBASE_PROJECT_ID);
console.log("Client Email exists:", !!process.env.FIREBASE_CLIENT_EMAIL);
console.log("Private Key exists:", !!process.env.FIREBASE_PRIVATE_KEY);
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

  try {
    // Ambil environment variables dengan fallback
    const serviceAccount = {
      type: "service_account",
      project_id: process.env.FIREBASE_PROJECT_ID || import.meta.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID || import.meta.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: (process.env.FIREBASE_PRIVATE_KEY || import.meta.env.FIREBASE_PRIVATE_KEY)?.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL || import.meta.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID || import.meta.env.FIREBASE_CLIENT_ID || "",
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs"
    };

    // Validasi environment variables
    if (!serviceAccount.project_id || !serviceAccount.private_key || !serviceAccount.client_email) {
      console.error('Firebase Admin: Environment variables tidak lengkap', {
        project_id: !!serviceAccount.project_id,
        private_key: !!serviceAccount.private_key,
        client_email: !!serviceAccount.client_email
      });
      throw new Error('Firebase Admin: Environment variables tidak lengkap');
    }

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

// Export services dengan error handling
let adminAuth: any = null;
let adminDb: any = null;

try {
  adminAuth = getAuth(initFirebaseAdmin());
  adminDb = getFirestore(initFirebaseAdmin());
} catch (error) {
  console.error('Failed to initialize Firebase Admin services:', error);
  // Set fallback values to prevent further errors
  adminAuth = null;
  adminDb = null;
}

export { adminAuth, adminDb };