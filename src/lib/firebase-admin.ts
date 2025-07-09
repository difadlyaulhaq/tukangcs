// src/lib/firebase-admin.ts
import { initializeApp, getApps, type ServiceAccount } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import admin from 'firebase-admin';

// Check if we're in production (deployment)
const isProduction = import.meta.env.PROD;

// Initialize Firebase Admin
let app;

if (getApps().length === 0) {
  try {
    if (isProduction) {
      // In production, use default credentials (for Firebase Functions or Cloud Run)
      app = initializeApp({
        projectId: 'tukang-cs',
        storageBucket: 'tukang-cs.firebasestorage.app'
      });
      console.log('✅ Firebase Admin initialized with default credentials');
    } else {
      // In development, use service account credentials
      const serviceAccount: ServiceAccount = {
        projectId: import.meta.env.FIREBASE_PROJECT_ID,
        clientEmail: import.meta.env.FIREBASE_CLIENT_EMAIL,
        privateKey: import.meta.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      };

      // Validate required fields
      if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
        console.error('Missing Firebase Admin credentials:', {
          projectId: !!serviceAccount.projectId,
          clientEmail: !!serviceAccount.clientEmail,
          privateKey: !!serviceAccount.privateKey
        });
        throw new Error('Missing required Firebase Admin credentials. Please check your environment variables.');
      }

      app = initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: serviceAccount.projectId,
        storageBucket: 'tukang-cs.firebasestorage.app'
      });
      console.log('✅ Firebase Admin initialized with service account credentials');
    }
  } catch (error) {
    console.error('❌ Firebase Admin initialization failed:', error);
    throw error;
  }
} else {
  app = getApps()[0];
  console.log('✅ Firebase Admin already initialized');
}

// Export services
export const adminAuth = getAuth(app);
export const adminDb = getFirestore(app);
export const adminStorage = getStorage(app);
export { app as adminApp };