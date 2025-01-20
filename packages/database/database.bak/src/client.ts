import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config';

const supabaseUrl = SUPABASE_URL;
const supabaseAnonKey = SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export type Database = {
  public: {
    Tables: {
      recycling_records: {
        Row: {
          id: string;
          location: { latitude: number; longitude: number };
          timestamp: Date;
          createdAt: Date;
          userId: string;
          containerId: string;
          batteryType: string;
          certificateId?: string;
        };
        Insert: {
          id?: string;
          location: { latitude: number; longitude: number };
          timestamp: Date;
          createdAt?: Date;
          userId: string;
          containerId: string;
          batteryType: string;
          certificateId?: string;
        };
        Update: {
          id?: string;
          location?: { latitude: number; longitude: number };
          timestamp?: Date;
          createdAt?: Date;
          userId?: string;
          containerId?: string;
          batteryType?: string;
          certificateId?: string;
        };
      };
    };
  };
};

export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);
