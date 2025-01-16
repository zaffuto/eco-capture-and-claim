import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = 'https://bvpneuiyavayfthqjlye.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2cG5ldWl5YXZheWZ0aHFqbHllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ4OTQwNzMsImV4cCI6MjA1MDQ3MDA3M30.zrQZc6-l_pWUJJ7TohhPOmo7zPnKOgCCmuyMorI2WI4';

// Log configuration info for debugging
console.log("Supabase Configuration:");
console.log("SUPABASE_URL:", SUPABASE_URL);
console.log("SUPABASE_ANON_KEY exists:", !!SUPABASE_ANON_KEY);
console.log("Current environment:", process.env.NODE_ENV);
console.log("Callback URL:", `${SUPABASE_URL}/auth/v1/callback`);

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
});

// Test the connection
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error('Error connecting to Supabase:', error.message);
  } else {
    console.log('Successfully connected to Supabase');
    console.log('Session data:', data);
  }
});