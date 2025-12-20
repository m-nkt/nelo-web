/**
 * Check if database is configured
 */
export function isDatabaseConfigured() {
  return !!(process.env.SUPABASE_URL && (process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY));
}

/**
 * Get database error message
 */
export function getDatabaseErrorMessage() {
  if (!process.env.SUPABASE_URL) {
    return 'SUPABASE_URL is not set in .env file';
  }
  if (!process.env.SUPABASE_SERVICE_KEY && !process.env.SUPABASE_KEY) {
    return 'SUPABASE_SERVICE_KEY or SUPABASE_KEY is not set in .env file';
  }
  return 'Database is not configured';
}

