// src/pages/api/auth/register.ts
import type { APIRoute } from "astro";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    console.log('Register API called at:', new Date().toISOString());

    // Dynamic import untuk menghindari masalah init
    const { adminAuth, adminDb } = await import("../../../lib/firebase-admin");
    
    if (!adminAuth || !adminDb) {
      console.error('Firebase Admin not initialized');
      return new Response(
        JSON.stringify({
          success: false,
          error: "Service tidak tersedia saat ini"
        }),
        { 
          status: 500,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    const body = await request.json();
    const { email, password, nama_umkm, sektor, sosmed } = body;

    // Validate required fields
    if (!email || !password || !nama_umkm || !sektor) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Semua field wajib diisi"
        }),
        { 
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    // Validate password length
    if (password.length < 6) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Password minimal 6 karakter"
        }),
        { 
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    // Create user with Firebase Admin
    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName: nama_umkm,
    });

    // Save additional user data to Firestore
    await adminDb.collection('users').doc(userRecord.uid).set({
      email,
      nama_umkm,
      sektor,
      sosmed: sosmed || [],
      createdAt: new Date().toISOString(),
      role: 'user'
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Registrasi berhasil! Silakan login dengan akun baru Anda."
      }),
      { 
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );

  } catch (error: any) {
    console.error('Registration error:', error);
    
    let errorMessage = "Gagal melakukan registrasi";
    
    if (error.code === 'auth/email-already-exists') {
      errorMessage = "Email sudah terdaftar, gunakan email lain";
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = "Format email tidak valid";
    } else if (error.code === 'auth/weak-password') {
      errorMessage = "Password terlalu lemah";
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
        debug: process.env.NODE_ENV === 'development' ? error.message : undefined
      }),
      { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
};