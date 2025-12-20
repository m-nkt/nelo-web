import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const FROM_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER;

/**
 * Send WhatsApp message via Twilio
 */
export async function sendWhatsAppMessage(to, message) {
  try {
    const result = await client.messages.create({
      from: FROM_NUMBER,
      to: `whatsapp:${to}`,
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
  try {
    const result = await client.messages.create({
      from: FROM_NUMBER,
      to: `whatsapp:${to}`,
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

