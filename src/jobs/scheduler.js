import cron from 'node-cron';
import { autoMatchAllUsers } from '../services/autoMatching.js';
import { sendReminders, autoCancelNoResponse } from '../services/reminder.js';
import { sendRegistrationReminders } from '../services/registrationReminder.js';
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
  
  // Run automatic matching every 1 minute (only if Twilio is configured)
  if (isServiceConfigured('twilio')) {
    cron.schedule('* * * * *', async () => {
      try {
        console.log('🔄 Running automatic matching...');
        await autoMatchAllUsers();
      } catch (error) {
        console.error('❌ Error in automatic matching:', error);
      }
    });
    console.log('📅 Automatic matching: Every 1 minute');
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
  
  // Send 24-hour registration reminders every hour (only if Twilio is configured)
  if (isServiceConfigured('twilio')) {
    cron.schedule('0 * * * *', async () => {
      try {
        console.log('🔔 Checking for 24-hour registration reminders...');
        await sendRegistrationReminders();
      } catch (error) {
        console.error('❌ Error in registration reminders:', error);
      }
    });
    console.log('📅 Registration reminders: Every hour');
  } else {
    console.warn('⚠️  Registration reminders disabled: Twilio is not configured');
  }
  
  console.log('✅ Scheduler initialized');
}

