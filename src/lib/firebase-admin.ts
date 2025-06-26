// src/lib/firebase-admin.ts
import admin from 'firebase-admin';
import { getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Pastikan environment variables di-load dengan benar
// Astro menggunakan import.meta.env
const serviceAccount = {
  projectId: import.meta.env.FIREBASE_PROJECT_ID,
  clientEmail: import.meta.env.FIREBASE_CLIENT_EMAIL,
  // Kunci privat seringkali jadi masalah. Lihat catatan di bawah.
  privateKey: import.meta.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

// Cek jika app belum diinisialisasi untuk mencegah error "already exists"
if (getApps().length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log('Firebase Admin initialized.');
}

export const adminAuth = getAuth();
export const adminDb = getFirestore();