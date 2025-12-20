/**
 * Simple logger utility
 */

const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

const currentLogLevel = process.env.LOG_LEVEL 
  ? LOG_LEVELS[process.env.LOG_LEVEL.toUpperCase()] || LOG_LEVELS.INFO
  : LOG_LEVELS.INFO;

export const logger = {
  error: (...args) => {
    if (currentLogLevel >= LOG_LEVELS.ERROR) {
      console.error('❌', ...args);
    }
  },
  
  warn: (...args) => {
    if (currentLogLevel >= LOG_LEVELS.WARN) {
      console.warn('⚠️ ', ...args);
    }
  },
  
  info: (...args) => {
    if (currentLogLevel >= LOG_LEVELS.INFO) {
      console.log('ℹ️ ', ...args);
    }
  },
  
  debug: (...args) => {
    if (currentLogLevel >= LOG_LEVELS.DEBUG) {
      console.log('🔍', ...args);
    }
  },
  
  success: (...args) => {
    if (currentLogLevel >= LOG_LEVELS.INFO) {
      console.log('✅', ...args);
    }
  }
};

