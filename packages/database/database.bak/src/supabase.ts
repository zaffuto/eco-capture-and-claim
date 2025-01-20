import { createClient } from '@supabase/supabase-js';
import { config } from './config';

export const supabase = createClient(
  config.SUPABASE_URL,
  config.SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      storageKey: `sb-${config.SUPABASE_PROJECT_ID}-auth-token`,
    },
    global: {
      headers: {
        'x-application-name': config.SUPABASE_PROJECT_ID,
      },
    },
  }
);
