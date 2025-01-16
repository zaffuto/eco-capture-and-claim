import { z } from 'zod';
import * as dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

// Schema para validar variables de entorno
const envSchema = z.object({
  // BuilderBot Cloud
  BUILDERBOT_TOKEN: z.string(),
  PHONE_NUMBER: z.string(),
  
  // Base de datos
  DATABASE_URL: z.string().url(),
  
  // Seguridad
  JWT_SECRET: z.string().min(32),
  ENCRYPTION_KEY: z.string().min(32),
  
  // APIs
  SHOPIFY_ACCESS_TOKEN: z.string().optional(),
  SHOPIFY_SHOP_NAME: z.string().optional(),
  
  // Configuración
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
});

// Validar y exportar configuración
export const config = envSchema.parse({
  BUILDERBOT_TOKEN: process.env.BUILDERBOT_TOKEN,
  PHONE_NUMBER: process.env.PHONE_NUMBER || '+56979540471',
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  ENCRYPTION_KEY: process.env.ENCRYPTION_KEY,
  SHOPIFY_ACCESS_TOKEN: process.env.SHOPIFY_ACCESS_TOKEN,
  SHOPIFY_SHOP_NAME: process.env.SHOPIFY_SHOP_NAME,
  NODE_ENV: process.env.NODE_ENV,
  LOG_LEVEL: process.env.LOG_LEVEL,
});
