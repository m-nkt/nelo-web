import twilio from 'twilio';
import '../config/env.js'; // Ensure environment variables are loaded

// Lazy initialization: Get Twilio client dynamically
function getTwilioClient() {
  const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER;
  
  if (!twilioAccountSid || !twilioAuthToken || !fromNumber) {
    return null;
  }
  
  return twilio(twilioAccountSid, twilioAuthToken);
}

// Cache the client instance
let client = null;

/**
 * Get or create Twilio client
 */
function getClient() {
  // Always check environment variables fresh (in case they were loaded later)
  const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER;
  
  // If we have a cached client but env vars are missing, clear cache
  if (client && (!twilioAccountSid || !twilioAuthToken || !fromNumber)) {
    client = null;
  }
  
  // If we don't have a client or env vars changed, create new one
  if (!client && twilioAccountSid && twilioAuthToken && fromNumber) {
    client = getTwilioClient();
  }
  
  return client;
}

/**
 * Get FROM number
 */
function getFromNumber() {
  return process.env.TWILIO_WHATSAPP_NUMBER;
}

/**
 * Send WhatsApp message via Twilio
 */
export async function sendWhatsAppMessage(to, message) {
  const twilioClient = getClient();
  const fromNumber = getFromNumber();
  
  if (!twilioClient || !fromNumber) {
    const missing = [];
    if (!process.env.TWILIO_ACCOUNT_SID) missing.push('TWILIO_ACCOUNT_SID');
    if (!process.env.TWILIO_AUTH_TOKEN) missing.push('TWILIO_AUTH_TOKEN');
    if (!process.env.TWILIO_WHATSAPP_NUMBER) missing.push('TWILIO_WHATSAPP_NUMBER');
    
    console.warn('⚠️  Twilio is not configured. Message not sent.');
    console.warn('   Missing:', missing.join(', '));
    return null;
  }
  
  try {
    const result = await twilioClient.messages.create({
      from: fromNumber,
      to: to.startsWith('whatsapp:') ? to : `whatsapp:${to}`,
      body: message
    });
    
    console.log('✅ WhatsApp message sent:', result.sid);
    return result;
  } catch (error) {
    console.error('❌ Error sending WhatsApp message:', error);
    throw error;
  }
}

/**
 * Send WhatsApp message with media (optional)
 */
export async function sendWhatsAppMessageWithMedia(to, message, mediaUrl) {
  const twilioClient = getClient();
  const fromNumber = getFromNumber();
  
  if (!twilioClient || !fromNumber) {
    console.warn('⚠️  Twilio is not configured. Message with media not sent.');
    return null;
  }
  
  try {
    const result = await twilioClient.messages.create({
      from: fromNumber,
      to: to.startsWith('whatsapp:') ? to : `whatsapp:${to}`,
      body: message,
      mediaUrl: [mediaUrl]
    });
    
    console.log('✅ WhatsApp message with media sent:', result.sid);
    return result;
  } catch (error) {
    console.error('❌ Error sending WhatsApp message with media:', error);
    throw error;
  }
}

