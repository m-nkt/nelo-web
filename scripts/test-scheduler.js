/**
 * Test script for scheduler functions
 * Tests 24-hour auto-cancel and reminders
 * Run with: node scripts/test-scheduler.js
 */

import dotenv from 'dotenv';
import { sendReminders, autoCancelNoResponse } from '../src/services/reminder.js';

dotenv.config();

async function testScheduler() {
  console.log('🧪 Testing Scheduler Functions\n');
  console.log('='.repeat(60));
  
  try {
    // Test reminders
    console.log('\n🔔 Test: Send Reminders');
    console.log('-'.repeat(60));
    await sendReminders();
    console.log('✅ Reminders check completed');
    
    // Test auto-cancel
    console.log('\n🔄 Test: Auto-Cancel (24 hours before start)');
    console.log('-'.repeat(60));
    await autoCancelNoResponse();
    console.log('✅ Auto-cancel check completed');
    
    console.log('\n' + '='.repeat(60));
    console.log('🎉 All scheduler tests completed!');
    console.log('\nNote: Check your database and WhatsApp messages to verify results.');
    
  } catch (error) {
    console.error('❌ Error in test:', error);
    process.exit(1);
  }
}

testScheduler();

