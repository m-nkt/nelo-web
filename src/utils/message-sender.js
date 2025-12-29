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

/**
 * Consolidate multiple messages into a single message (cost-saving)
 * Joins messages with double newlines to stay within 24-hour session
 * @param {string[]} messages - Array of messages to consolidate
 * @returns {string} Consolidated message
 */
export function consolidateMessages(messages) {
  if (!messages || messages.length === 0) return '';
  if (messages.length === 1) return messages[0];
  
  // Filter out empty messages and join with double newlines
  return messages
    .filter(msg => msg && msg.trim().length > 0)
    .join('\n\n');
}

/**
 * Send consolidated message (cost-saving alternative to sendMultipleMessages)
 * @param {string} phoneNumber - Normalized phone number
 * @param {string[]} messages - Array of messages to consolidate and send
 */
export async function sendConsolidatedMessage(phoneNumber, messages) {
  if (!messages || messages.length === 0) return;
  
  const consolidated = consolidateMessages(messages);
  if (consolidated) {
    try {
      await sendWhatsAppMessage(phoneNumber, consolidated);
    } catch (error) {
      console.error('Error sending consolidated message:', error);
      throw error;
    }
  }
}

