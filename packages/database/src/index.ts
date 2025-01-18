import { createClient } from '@supabase/supabase-js';
import { config } from '@eco/shared';

if (!config.SUPABASE_URL || !config.SUPABASE_ANON_KEY) {
  throw new Error('Missing required Supabase configuration');
}

export const supabase = createClient(
  config.SUPABASE_URL,
  config.SUPABASE_ANON_KEY
);

export * from './supabase';
export * from './config';
