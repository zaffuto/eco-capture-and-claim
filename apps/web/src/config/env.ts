import { z } from 'zod';

const envSchema = z.object({
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1),
  APP_URL: z.string().url().optional(),
  FIREBASE_API_KEY: z.string().optional(),
  FIREBASE_AUTH_DOMAIN: z.string().optional(),
  FIREBASE_PROJECT_ID: z.string().optional(),
  FIREBASE_STORAGE_BUCKET: z.string().optional(),
  FIREBASE_MESSAGING_SENDER_ID: z.string().optional(),
  FIREBASE_APP_ID: z.string().optional(),
  WHATSAPP_API_TOKEN: z.string().optional(),
  WHATSAPP_PHONE_NUMBER_ID: z.string().optional(),
  SHOPIFY_SHOP_NAME: z.string().optional(),
  SHOPIFY_ACCESS_TOKEN: z.string().optional(),
  MONDAY_API_TOKEN: z.string().optional(),
});

const processEnv = {
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  WHATSAPP_API_TOKEN: process.env.WHATSAPP_API_TOKEN,
  WHATSAPP_PHONE_NUMBER_ID: process.env.WHATSAPP_PHONE_NUMBER_ID,
  SHOPIFY_SHOP_NAME: process.env.SHOPIFY_SHOP_NAME,
  SHOPIFY_ACCESS_TOKEN: process.env.SHOPIFY_ACCESS_TOKEN,
  MONDAY_API_TOKEN: process.env.MONDAY_API_TOKEN,
} as const;

export const ENV = envSchema.parse(processEnv);
