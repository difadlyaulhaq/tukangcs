// src/pages/api/register.js
import { supabase } from '../../lib/supabase.js';

export async function post({ request }) {
  const form = await request.formData();
  const email = form.get('email');
  const password = form.get('password');
  const nama_umkm = form.get('nama_umkm');
  const sektor = form.get('sektor');
  const sosmed = form.getAll('sosmed');

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        nama_umkm,
        sektor,
        sosmed: sosmed.join(', ')
      }
    }
  });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
