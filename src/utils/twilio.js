import twilio from 'twilio';
import '../config/env.js'; // Ensure environment variables are loaded

// Rate limiting: Track message history per phone number to prevent spam
// Safety mechanism to protect wallet and WhatsApp account health
const messageHistory = new Map(); // phoneNumber -> [timestamp1, timestamp2, ...]

// Rate limit configuration
const RATE_LIMIT_MESSAGES = 20; // Maximum messages per window (relaxed from 5 to 20)
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute in milliseconds

/**
 * Check if sending a message would exceed rate limit
 * Returns { allowed: boolean, reason?: string }
 */
function checkRateLimit(phoneNumber) {
  const now = Date.now();
  const normalizedPhone = phoneNumber.startsWith('whatsapp:') 
    ? phoneNumber.replace('whatsapp:', '') 
    : phoneNumber;
  
  // Get or initialize message history for this phone number
  if (!messageHistory.has(normalizedPhone)) {
    messageHistory.set(normalizedPhone, []);
  }
  
  const timestamps = messageHistory.get(normalizedPhone);
  
  // Remove timestamps older than 1 minute
  const cutoffTime = now - RATE_LIMIT_WINDOW_MS;
  const recentTimestamps = timestamps.filter(ts => ts > cutoffTime);
  
  // Update history with cleaned timestamps
  messageHistory.set(normalizedPhone, recentTimestamps);
  
  // Check if we've exceeded the limit
  if (recentTimestamps.length >= RATE_LIMIT_MESSAGES) {
    const oldestTimestamp = recentTimestamps[0];
    const waitTime = Math.ceil((oldestTimestamp + RATE_LIMIT_WINDOW_MS - now) / 1000);
    return {
      allowed: false,
      reason: `Rate limit exceeded: ${recentTimestamps.length} messages sent in the last minute. Please wait ${waitTime} seconds.`
    };
  }
  
  return { allowed: true };
}

/**
 * Record a message send timestamp
 */
function recordMessageSent(phoneNumber) {
  const normalizedPhone = phoneNumber.startsWith('whatsapp:') 
    ? phoneNumber.replace('whatsapp:', '') 
    : phoneNumber;
  
  if (!messageHistory.has(normalizedPhone)) {
    messageHistory.set(normalizedPhone, []);
  }
  
  const timestamps = messageHistory.get(normalizedPhone);
  timestamps.push(Date.now());
  
  // Keep only recent timestamps (cleanup old ones)
  const now = Date.now();
  const cutoffTime = now - RATE_LIMIT_WINDOW_MS;
  const recentTimestamps = timestamps.filter(ts => ts > cutoffTime);
  messageHistory.set(normalizedPhone, recentTimestamps);
}

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
 * Includes rate limiting to prevent spam (max 20 messages per minute per phone number)
 */
export async function sendWhatsAppMessage(to, message) {
  // Check rate limit BEFORE sending (safety mechanism)
  const rateLimitCheck = checkRateLimit(to);
  if (!rateLimitCheck.allowed) {
    console.warn(`🚫 Rate limit blocked message to ${to}:`, rateLimitCheck.reason);
    console.warn('   This is a safety mechanism to prevent spam and protect your WhatsApp account.');
    throw new Error(`Rate limit exceeded: ${rateLimitCheck.reason}`);
  }
  
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
    
    // Record successful send (for rate limiting)
    recordMessageSent(to);
    
    console.log('✅ WhatsApp message sent:', result.sid);
    return result;
  } catch (error) {
    console.error('❌ Error sending WhatsApp message:', error);
    throw error;
  }
}

/**
 * Send WhatsApp message with media (optional)
 * Includes rate limiting to prevent spam (max 5 messages per minute per phone number)
 */
export async function sendWhatsAppMessageWithMedia(to, message, mediaUrl) {
  // Check rate limit BEFORE sending (safety mechanism)
  const rateLimitCheck = checkRateLimit(to);
  if (!rateLimitCheck.allowed) {
    console.warn(`🚫 Rate limit blocked message with media to ${to}:`, rateLimitCheck.reason);
    console.warn('   This is a safety mechanism to prevent spam and protect your WhatsApp account.');
    // Log warning but don't crash - return null instead of throwing
    return null;
  }
  
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
    
    // Record successful send (for rate limiting)
    recordMessageSent(to);
    
    console.log('✅ WhatsApp message with media sent:', result.sid);
    return result;
  } catch (error) {
    console.error('❌ Error sending WhatsApp message with media:', error);
    throw error;
  }
}

