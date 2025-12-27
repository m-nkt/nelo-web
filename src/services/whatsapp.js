import { processUserMessage } from './chatbot.js';
import { sendWhatsAppMessage } from '../utils/twilio.js';
import { normalizePhoneNumber } from '../utils/phone-number.js';

/**
 * Handle incoming WhatsApp message
 */
export async function handleWhatsAppMessage(from, body) {
  try {
    // Normalize phone number (remove 'whatsapp:' prefix)
    const phoneNumber = normalizePhoneNumber(from);
    
    // Process message with AI chatbot
    const response = await processUserMessage(phoneNumber, body);
    
    // Send response back via WhatsApp
    await sendWhatsAppMessage(phoneNumber, response);
    
  } catch (error) {
    console.error('Error handling WhatsApp message:', error);
    // Send error message to user
    const phoneNumber = normalizePhoneNumber(from);
    await sendWhatsAppMessage(
      phoneNumber,
      'Sorry, an error occurred. Please try again later.'
    );
  }
}

/**
 * Send WhatsApp message
 */
export async function sendNotification(phoneNumber, message) {
  return await sendWhatsAppMessage(phoneNumber, message);
}

