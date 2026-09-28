import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load .env from root or local backend folder
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform((val) => parseInt(val, 10)).default('5000'),
  API_VERSION: z.string().default('v1'),
  FRONTEND_URL: z.string().default('http://localhost:3000'),
  BACKEND_URL: z.string().default('http://localhost:5000'),
  MONGODB_URI: z.string().default('mongodb://localhost:27017/marketlink'),
  
  JWT_SECRET: z.string().default('super_secret_jwt_access_key_marketlink_min_64_chars_long_dev'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_SECRET: z.string().default('super_secret_jwt_refresh_key_marketlink_min_64_chars_long_dev'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  COOKIE_SECRET: z.string().default('super_secret_cookie_key_marketlink'),
  
  // Abstraction Provider settings
  AI_PROVIDER: z.enum(['mock', 'gemini', 'openai']).default('mock'),
  MAP_PROVIDER: z.enum(['openstreetmap', 'googlemaps']).default('openstreetmap'),
  STORAGE_PROVIDER: z.enum(['local', 's3', 'cloudinary']).default('local'),

  // OAuth Provider Secrets & Callbacks
  GOOGLE_CLIENT_ID: z.string().default('mock_google_client_id'),
  GOOGLE_CLIENT_SECRET: z.string().default('mock_google_client_secret'),
  GOOGLE_CALLBACK_URL: z.string().default('http://localhost:5000/api/v1/auth/google/callback'),

  GITHUB_CLIENT_ID: z.string().default('mock_github_client_id'),
  GITHUB_CLIENT_SECRET: z.string().default('mock_github_client_secret'),
  GITHUB_CALLBACK_URL: z.string().default('http://localhost:5000/api/v1/auth/github/callback'),

  LINKEDIN_CLIENT_ID: z.string().default('mock_linkedin_client_id'),
  LINKEDIN_CLIENT_SECRET: z.string().default('mock_linkedin_client_secret'),
  LINKEDIN_CALLBACK_URL: z.string().default('http://localhost:5000/api/v1/auth/linkedin/callback'),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('❌ Environment validation error:', parsedEnv.error.format());
  throw new Error('Invalid environment variables configured.');
}

export const env = parsedEnv.data;
