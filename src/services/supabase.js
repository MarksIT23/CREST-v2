import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://unaxchblqookqxmlxmyk.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVuYXhjaGJscW9va3F4bWx4bXlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAxNTU2NzcsImV4cCI6MjEwNTczMTY3N30.1Oc1U9-Mslxd22KlVLEnbWmwuDuczYV1MPo6u5Z90Lo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
