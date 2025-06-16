// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ptjiesujcnjsxzbfndht.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0amllc3VqY25qc3h6YmZuZGh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5NzQyNDQsImV4cCI6MjA2NTU1MDI0NH0.lkmlfmdEMAkoSnBKrrbDOk_FvPdu3KgI-_K3wkJ-Dyo';

export const supabase = createClient(supabaseUrl, supabaseKey);
