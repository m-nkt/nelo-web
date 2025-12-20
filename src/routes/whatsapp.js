import express from 'express';
import { handleWhatsAppMessage } from '../services/whatsapp.js';
import { verifyTwilioSignature } from '../middleware/twilio.js';

const router = express.Router();

// Webhook endpoint for Twilio WhatsApp
router.post('/webhook', express.urlencoded({ extended: true }), async (req, res) => {
  try {
    const { From, Body, MessageSid } = req.body;
    
    console.log('📨 Received WhatsApp message:', {
      from: From,
      body: Body,
      messageId: MessageSid
    });

    // Handle the message
    await handleWhatsAppMessage(From, Body);

    // Send Twilio response
    res.status(200).send('OK');
  } catch (error) {
    console.error('Error handling WhatsApp message:', error);
    res.status(500).send('Error');
  }
});

// Status callback (optional)
router.post('/status', (req, res) => {
  console.log('📊 Message status:', req.body);
  res.status(200).send('OK');
});

export default router;

