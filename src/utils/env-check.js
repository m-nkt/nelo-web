/**
 * Environment variable checker
 * Automatically checks and warns about missing environment variables
 */

const REQUIRED_ENV_VARS = {
  // Optional - server will start but features won't work
  optional: [
    'SUPABASE_URL',
    'SUPABASE_KEY',
    'TWILIO_ACCOUNT_SID',
    'TWILIO_AUTH_TOKEN',
    'OPENAI_API_KEY',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'STRIPE_SECRET_KEY'
  ],
  // Required for basic server operation
  required: []
};

/**
 * Check all environment variables and log warnings
 */
export function checkEnvironmentVariables() {
  const warnings = [];
  const errors = [];
  
  // Check required variables
  for (const varName of REQUIRED_ENV_VARS.required) {
    if (!process.env[varName]) {
      errors.push(`❌ Required: ${varName} is not set`);
    }
  }
  
  // Check optional variables
  for (const varName of REQUIRED_ENV_VARS.optional) {
    if (!process.env[varName]) {
      warnings.push(`⚠️  Optional: ${varName} is not set (some features may not work)`);
    }
  }
  
  // Log errors (if any)
  if (errors.length > 0) {
    console.error('\n❌ Environment Variable Errors:');
    errors.forEach(err => console.error(`   ${err}`));
    console.error('   Server may not start properly.\n');
  }
  
  // Log warnings (if any)
  if (warnings.length > 0) {
    console.warn('\n⚠️  Environment Variable Warnings:');
    warnings.forEach(warn => console.warn(`   ${warn}`));
    console.warn('   Server will start, but some features may not work.\n');
  }
  
  // Return status
  return {
    hasErrors: errors.length > 0,
    hasWarnings: warnings.length > 0,
    errors,
    warnings
  };
}

/**
 * Check if a specific service is configured
 */
export function isServiceConfigured(serviceName) {
  const serviceConfigs = {
    database: {
      required: ['SUPABASE_URL', 'SUPABASE_KEY']
    },
    twilio: {
      required: ['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN']
    },
    openai: {
      required: ['OPENAI_API_KEY']
    },
    google: {
      required: ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET']
    },
    stripe: {
      required: ['STRIPE_SECRET_KEY']
    }
  };
  
  const config = serviceConfigs[serviceName];
  if (!config) {
    return false;
  }
  
  return config.required.every(varName => !!process.env[varName]);
}

