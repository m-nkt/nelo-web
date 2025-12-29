/**
 * Environment configuration loader
 * This must be imported first to ensure dotenv is loaded before any other modules
 */
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env file from project root
const envPath = join(__dirname, '../../.env');
dotenv.config({ path: envPath });

// Also try default location (current working directory)
dotenv.config();

// Export a function to ensure env is loaded
export function ensureEnvLoaded() {
  // Force reload if needed
  dotenv.config({ path: envPath, override: false });
  dotenv.config({ override: false });
}

// Log environment variables status (for debugging)
if (process.env.NODE_ENV !== 'production') {
  console.log('🔧 Environment loaded:', {
    hasSupabaseUrl: !!process.env.SUPABASE_URL,
    hasSupabaseKey: !!(process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_KEY),
    hasTwilioSid: !!process.env.TWILIO_ACCOUNT_SID,
    hasTwilioToken: !!process.env.TWILIO_AUTH_TOKEN,
    hasTwilioNumber: !!process.env.TWILIO_WHATSAPP_NUMBER,
    hasGeminiKey: !!process.env.GEMINI_API_KEY,
    baseUrl: process.env.BASE_URL || process.env.APP_URL || process.env.APP_BASE_URL || 'https://nelo.so'
  });
}

