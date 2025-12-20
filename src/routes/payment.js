import express from 'express';
import Stripe from 'stripe';
import { getUser, updateUserPoints } from '../db/users.js';
import { sendWhatsAppMessage } from '../utils/twilio.js';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * Create Stripe checkout session
 */
router.post('/create-checkout', async (req, res) => {
  try {
    const { phoneNumber, points, amount } = req.body;
    
    if (!phoneNumber || !points || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${points} Points`,
              description: 'Language Matching Service Points'
            },
            unit_amount: amount * 100 // Convert to cents
          },
          quantity: 1
        }
      ],
      mode: 'payment',
      success_url: `${process.env.APP_BASE_URL}/api/payment/success?phone=${phoneNumber}&points=${points}`,
      cancel_url: `${process.env.APP_BASE_URL}/api/payment/cancel`,
      metadata: {
        phone_number: phoneNumber,
        points: points
      }
    });
    
    res.json({ checkoutUrl: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: 'Error creating checkout session' });
  }
});

/**
 * Payment success callback
 */
router.get('/success', async (req, res) => {
  try {
    const { phone, points } = req.query;
    
    // Add points to user account
    await updateUserPoints(phone, parseInt(points));
    
    // Send confirmation via WhatsApp
    await sendWhatsAppMessage(
      phone,
      `✅ 決済が完了しました！\n\n${points}ポイントが追加されました。\n\nありがとうございます！`
    );
    
    res.send(`
      <html>
        <body>
          <h1>✅ 決済が完了しました！</h1>
          <p>${points}ポイントが追加されました。</p>
          <p>このページを閉じて、WhatsAppに戻ってください。</p>
          <script>
            setTimeout(() => {
              window.close();
            }, 3000);
          </script>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('Error in payment success:', error);
    res.status(500).send('Error processing payment');
  }
});

/**
 * Stripe webhook
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  
  let event;
  
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  
  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      const phoneNumber = session.metadata.phone_number;
      const points = parseInt(session.metadata.points);
      
      // Add points to user account
      await updateUserPoints(phoneNumber, points);
      
      // Send confirmation via WhatsApp
      await sendWhatsAppMessage(
        phoneNumber,
        `✅ 決済が完了しました！\n\n${points}ポイントが追加されました。`
      );
      break;
    
    default:
      console.log(`Unhandled event type ${event.type}`);
  }
  
  res.json({ received: true });
});

export default router;

