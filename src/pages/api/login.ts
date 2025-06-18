// src/pages/api/login.ts
import { supabase } from '../../lib/supabase.js';

export async function POST({ request }: { request: Request }) {
  try {
    const contentType = request.headers.get('content-type') || '';
    
    let email: string;
    let password: string;

    if (contentType.includes('application/json')) {
      const body = await request.json();
      email = body.email;
      password = body.password;
    } else {
      const form = await request.formData();
      email = form.get('email') as string;
      password = form.get('password') as string;
    }

    // Validasi
    if (!email || !password) {
      return new Response(JSON.stringify({ 
        error: 'Email and password are required' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Supabase login
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password.trim()
    });

    if (error) {
      console.error('Login error:', error);
      return new Response(JSON.stringify({ 
        error: error.message || 'Login failed'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Set cookie untuk session (optional, tapi berguna untuk SSR)
    const response = new Response(JSON.stringify({ 
      success: true,
      user: data.user,
      session: data.session,
      message: 'Login successful'
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        // Set secure cookie jika diperlukan
        'Set-Cookie': `sb-access-token=${data.session?.access_token}; HttpOnly; Secure; SameSite=Strict; Max-Age=3600; Path=/`
      }
    });

    return response;

  } catch (err) {
    console.error('Login server error:', err);
    return new Response(JSON.stringify({ 
      error: 'Internal server error' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}