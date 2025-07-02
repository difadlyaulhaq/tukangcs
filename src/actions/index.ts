// src/actions/index.ts
import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';

export const server = {
  login: defineAction({
    accept: 'form',
    input: z.object({
      email: z.string().email('Email tidak valid'),
      password: z.string().min(1, 'Password wajib diisi'),
    }),
    handler: async (input, context) => {
      const { email, password } = input;
      
      try {
        // Dynamic import untuk menghindari masalah init
        const { adminAuth, adminDb } = await import("../lib/firebase-admin");
        
        if (!adminAuth || !adminDb) {
          throw new Error('Service tidak tersedia saat ini');
        }

        // Using Firebase Auth REST API for email/password authentication
        const apiKey = "AIzaSyD_b0lWXcpnNbSRIt1v9A1jCgCsfXWI6Zw";
        const authResponse = await fetch(
          `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email,
              password,
              returnSecureToken: true,
            }),
          }
        );

        const authData = await authResponse.json();
        
        if (!authResponse.ok) {
          console.error('Firebase Auth error:', authData);
          let errorMessage = 'Login gagal';
          
          if (authData.error?.message) {
            switch (authData.error.message) {
              case 'EMAIL_NOT_FOUND':
                errorMessage = 'Email tidak terdaftar';
                break;
              case 'INVALID_PASSWORD':
                errorMessage = 'Password salah';
                break;
              case 'USER_DISABLED':
                errorMessage = 'Akun dinonaktifkan';
                break;
              case 'TOO_MANY_ATTEMPTS_TRY_LATER':
                errorMessage = 'Terlalu banyak percobaan, coba lagi nanti';
                break;
              case 'INVALID_LOGIN_CREDENTIALS':
                errorMessage = 'Email atau password salah';
                break;
              default:
                errorMessage = authData.error.message;
            }
          }
          
          throw new Error(errorMessage);
        }

        // Verify the ID token and get user data
        const decodedToken = await adminAuth.verifyIdToken(authData.idToken);
        console.log('Token verified for user:', decodedToken.uid);

        // Get additional user data from Firestore
        const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
        const userData = userDoc.exists ? userDoc.data() : null;

        // Create session cookie
        const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
        const sessionCookie = await adminAuth.createSessionCookie(authData.idToken, { expiresIn });

        // Set the session cookie
        context.cookies.set('session', sessionCookie, {
          path: '/',
          maxAge: expiresIn / 1000,
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
        });

        console.log('Login successful for:', email);
        
        return {
          success: true,
          message: 'Login berhasil',
          user: {
            uid: decodedToken.uid,
            email: decodedToken.email,
            name: decodedToken.name || userData?.nama_umkm || 'User',
            ...userData
          }
        };

      } catch (error) {
        console.error('Login error:', error);
        throw new Error(error instanceof Error ? error.message : 'Login gagal');
      }
    },
  }),
};
