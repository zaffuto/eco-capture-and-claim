// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://bvpneuiyavayfthqjlye.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2cG5ldWl5YXZheWZ0aHFqbHllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ4OTQwNzMsImV4cCI6MjA1MDQ3MDA3M30.zrQZc6-l_pWUJJ7TohhPOmo7zPnKOgCCmuyMorI2WI4";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);