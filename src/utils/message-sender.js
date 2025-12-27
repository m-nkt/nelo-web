import { sendWhatsAppMessage } from './twilio.js';

/**
 * Send multiple messages in sequence with delays
 * @param {string} phoneNumber - Normalized phone number
 * @param {string[]} messages - Array of messages to send
 * @param {number} delayMs - Delay between messages in milliseconds (default: 1000ms)
 */
export async function sendMultipleMessages(phoneNumber, messages, delayMs = 1000) {
  if (!messages || messages.length === 0) return;
  
  for (let i = 0; i < messages.length; i++) {
    if (i > 0) {
      // Wait before sending next message
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
    try {
      await sendWhatsAppMessage(phoneNumber, messages[i]);
    } catch (error) {
      console.error(`Error sending message ${i + 1}/${messages.length}:`, error);
      // Continue with next message even if one fails
    }
  }
}

/**
 * Send a message and then send follow-up messages asynchronously
 * @param {string} phoneNumber - Normalized phone number
 * @param {string} immediateMessage - Message to send immediately
 * @param {string[]} followUpMessages - Messages to send after delay
 * @param {number} delayMs - Delay before follow-up messages (default: 1500ms)
 */
export async function sendWithFollowUps(phoneNumber, immediateMessage, followUpMessages = [], delayMs = 1500) {
  // Send immediate message
  if (immediateMessage) {
    await sendWhatsAppMessage(phoneNumber, immediateMessage);
  }
  
  // Send follow-up messages after delay
  if (followUpMessages.length > 0) {
    setTimeout(async () => {
      await sendMultipleMessages(phoneNumber, followUpMessages, delayMs);
    }, delayMs);
  }
}

