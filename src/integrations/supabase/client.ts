import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Use environment variables or runtime config
const SUPABASE_URL = "https://bvpneuiyavayfthqjlye.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2cG5ldWl5YXZheWZ0aHFqbHllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ4OTQwNzMsImV4cCI6MjA1MDQ3MDA3M30.zrQZc6-l_pWUJJ7TohhPOmo7zPnKOgCCmuyMorI2WI4";

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