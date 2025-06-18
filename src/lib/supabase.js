// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js';

// Gunakan environment variables untuk security yang lebih baik
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || 'https://ptjiesujcnjsxzbfndht.supabase.co';
const supabaseKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0amllc3VqY25qc3h6YmZuZGh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5NzQyNDQsImV4cCI6MjA2NTU1MDI0NH0.lkmlfmdEMAkoSnBKrrbDOk_FvPdu3KgI-_K3wkJ-Dyo';

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false // Disable session detection in URL for security
  }
});

// Test connection function
export async function testConnection() {
  try {
    const { data, error } = await supabase.from('_test').select('*').limit(1);
    if (error && error.code !== 'PGRST116') { // PGRST116 = table not found, which is expected
      console.error('Supabase connection error:', error);
      return false;
    }
    console.log('Supabase connected successfully');
    return true;
  } catch (err) {
    console.error('Supabase connection failed:', err);
    return false;
  }
}