import { processUserMessage } from './chatbot.js';
import { sendWhatsAppMessage } from '../utils/twilio.js';

/**
 * Handle incoming WhatsApp message
 */
export async function handleWhatsAppMessage(from, body) {
  try {
    // Remove 'whatsapp:' prefix from phone number
    const phoneNumber = from.replace('whatsapp:', '');
    
    // Process message with AI chatbot
    const response = await processUserMessage(phoneNumber, body);
    
    // Send response back via WhatsApp
    await sendWhatsAppMessage(phoneNumber, response);
    
  } catch (error) {
    console.error('Error handling WhatsApp message:', error);
    // Send error message to user
    await sendWhatsAppMessage(
      from.replace('whatsapp:', ''),
      '申し訳ございません。エラーが発生しました。しばらくしてから再度お試しください。'
    );
  }
}

/**
 * Send WhatsApp message
 */
export async function sendNotification(phoneNumber, message) {
  return await sendWhatsAppMessage(phoneNumber, message);
}

