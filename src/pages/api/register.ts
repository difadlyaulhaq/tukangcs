// src/pages/api/register.ts
import { supabase } from '../../lib/supabase.js';

export async function POST({ request }: { request: Request }) {
  try {
    const contentType = request.headers.get('content-type') || '';

    let email: string;
    let password: string;
    let nama_umkm: string;
    let sektor: string;
    let sosmed: string[];

    if (contentType.includes('application/json')) {
      const body = await request.json();
      email = body.email;
      password = body.password;
      nama_umkm = body.nama_umkm;
      sektor = body.sektor;
      sosmed = body.sosmed || [];
    } else {
      const form = await request.formData();
      email = form.get('email') as string;
      password = form.get('password') as string;
      nama_umkm = form.get('nama_umkm') as string;
      sektor = form.get('sektor') as string;
      sosmed = form.getAll('sosmed') as string[];
    }

    // Trim and validate fields
    const trimmedEmail = email?.trim();
    const trimmedPassword = password?.trim();
    const trimmedNamaUmkm = nama_umkm?.trim();
    const trimmedSektor = sektor?.trim();

    if (!trimmedEmail || !trimmedPassword || !trimmedNamaUmkm || !trimmedSektor) {
      return new Response(JSON.stringify({
        error: 'Semua field wajib diisi: email, password, nama_umkm, sektor'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Validasi email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return new Response(JSON.stringify({
        error: 'Format email tidak valid'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Validasi password minimal 6 karakter
    if (trimmedPassword.length < 6) {
      return new Response(JSON.stringify({
        error: 'Password minimal 6 karakter'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Sign up user dengan metadata
    const { data, error } = await supabase.auth.signUp({
      email: trimmedEmail,
      password: trimmedPassword,
      options: {
        data: {
          nama_umkm: trimmedNamaUmkm,
          sektor: trimmedSektor,
          sosmed: sosmed.length > 0 ? sosmed.join(', ') : '',
          full_name: trimmedNamaUmkm // Tambahan untuk kompatibilitas
        }
      }
    });

    if (error) {
      console.error('Registration error:', error);
      
      // Handle specific error cases
      if (error.message.includes('already registered')) {
        return new Response(JSON.stringify({ 
          error: 'Email sudah terdaftar. Silakan gunakan email lain atau login.' 
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      return new Response(JSON.stringify({ 
        error: error.message || 'Registrasi gagal'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Jika user langsung confirmed (tanpa email verification)
    if (data.user && data.session) {
      return new Response(JSON.stringify({
        success: true,
        message: 'Registrasi berhasil! Anda akan diarahkan ke dashboard.',
        data: {
          user: data.user,
          session: data.session
        },
        autoLogin: true
      }), {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Set-Cookie': `sb-access-token=${data.session.access_token}; HttpOnly; Secure; SameSite=Strict; Max-Age=3600; Path=/`
        }
      });
    }

    // Jika perlu email confirmation
    return new Response(JSON.stringify({
      success: true,
      message: 'Registrasi berhasil! Silakan cek email untuk verifikasi.',
      data: {
        user: data.user,
        session: data.session
      },
      needsConfirmation: true
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    console.error('Registration server error:', err);
    return new Response(JSON.stringify({
      error: 'Terjadi kesalahan pada server. Silakan coba lagi.'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}