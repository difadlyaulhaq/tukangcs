// src/pages/api/register.ts
import type { APIRoute } from "astro";
import { adminAuth, adminDb } from "../../../lib/firebase-admin"; // Fixed path for auth/login.ts

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
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
        error: errorMessage
      }),
      { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
};