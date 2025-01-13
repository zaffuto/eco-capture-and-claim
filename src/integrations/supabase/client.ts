import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Use environment variables or runtime config
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables');
}

// Log environment info for debugging
console.log("Supabase Configuration Check:");
console.log("SUPABASE_URL:", SUPABASE_URL);
console.log("SUPABASE_ANON_KEY exists:", !!SUPABASE_ANON_KEY);
console.log("SUPABASE_ANON_KEY length:", SUPABASE_ANON_KEY.length);
console.log("Current environment:", import.meta.env.MODE);

// Create and export the supabase client
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);

// Test the connection
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error('Error connecting to Supabase:', error.message);
  } else {
    console.log('Successfully connected to Supabase');
    console.log('Session data:', data);
  }
});