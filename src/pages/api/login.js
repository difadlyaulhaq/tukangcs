// src/pages/api/login.js
import { supabase } from '../../lib/supabase.js';

export async function post({ request }) {
  const form = await request.formData();
  const email = form.get('email');
  const password = form.get('password');

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
