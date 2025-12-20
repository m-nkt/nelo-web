/**
 * Test script for WhatsApp webhook
 * Run with: node scripts/test-webhook.js
 */

import dotenv from 'dotenv';
import { sendWhatsAppMessage } from '../src/utils/twilio.js';

dotenv.config();

async function testWebhook() {
  try {
    const testPhoneNumber = process.env.TEST_PHONE_NUMBER || '+1234567890';
    
    console.log('📱 Testing WhatsApp message sending...');
    console.log(`To: ${testPhoneNumber}`);
    
    const message = '🧪 テストメッセージ\n\nこれはテストです。';
    
    const result = await sendWhatsAppMessage(testPhoneNumber.replace('whatsapp:', ''), message);
    
    console.log('✅ Message sent successfully!');
    console.log('Message SID:', result.sid);
  } catch (error) {
    console.error('❌ Error sending message:', error);
    process.exit(1);
  }
}

testWebhook();

