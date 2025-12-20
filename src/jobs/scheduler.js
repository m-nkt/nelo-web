import cron from 'node-cron';
import { autoMatchAllUsers } from '../services/autoMatching.js';
import { sendReminders, autoCancelNoResponse } from '../services/reminder.js';
import { isServiceConfigured } from '../utils/env-check.js';

/**
 * Initialize scheduled jobs
 */
export function initializeScheduler() {
  console.log('⏰ Initializing scheduler...');
  
  // Only run jobs if database is configured
  if (!isServiceConfigured('database')) {
    console.warn('⚠️  Scheduler not started: Database is not configured');
    return;
  }
  
  // Run automatic matching every 6 hours (only if Twilio is configured)
  if (isServiceConfigured('twilio')) {
    cron.schedule('0 */6 * * *', async () => {
      try {
        console.log('🔄 Running automatic matching...');
        await autoMatchAllUsers();
      } catch (error) {
        console.error('❌ Error in automatic matching:', error);
      }
    });
    console.log('📅 Automatic matching: Every 6 hours');
  } else {
    console.warn('⚠️  Automatic matching disabled: Twilio is not configured');
  }
  
  // Send reminders every hour (only if Twilio is configured)
  if (isServiceConfigured('twilio')) {
    cron.schedule('0 * * * *', async () => {
      try {
        console.log('🔔 Checking for reminders...');
        await sendReminders();
      } catch (error) {
        console.error('❌ Error in reminders:', error);
      }
    });
    console.log('📅 Reminders: Every hour');
  } else {
    console.warn('⚠️  Reminders disabled: Twilio is not configured');
  }
  
  // Check for auto-cancel every hour (only if Twilio is configured)
  if (isServiceConfigured('twilio')) {
    cron.schedule('0 * * * *', async () => {
      try {
        console.log('🔄 Checking for auto-cancel...');
        await autoCancelNoResponse();
      } catch (error) {
        console.error('❌ Error in auto-cancel:', error);
      }
    });
    console.log('📅 Auto-cancel check: Every hour');
  } else {
    console.warn('⚠️  Auto-cancel disabled: Twilio is not configured');
  }
  
  console.log('✅ Scheduler initialized');
}

