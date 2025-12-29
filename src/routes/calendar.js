import express from 'express';
import { google } from 'googleapis';
import { getUser, updateUserCalendar } from '../db/users.js';
import { isServiceConfigured } from '../utils/env-check.js';
import { sendWhatsAppMessage } from '../utils/twilio.js';
import { getRegistrationFlow } from '../flows/registration.js';

const router = express.Router();

// OAuth2 client (only if configured)
// Use BASE_URL for redirect_uri to ensure it matches the domain (https://nelo.so)
const getRedirectUri = () => {
  // If GOOGLE_REDIRECT_URI is explicitly set and doesn't contain localhost, use it
  if (process.env.GOOGLE_REDIRECT_URI && !process.env.GOOGLE_REDIRECT_URI.includes('localhost')) {
    return process.env.GOOGLE_REDIRECT_URI;
  }
  // Otherwise, use BASE_URL (https://nelo.so) - DO NOT use localhost fallback
  const baseUrl = process.env.BASE_URL || process.env.APP_URL || process.env.APP_BASE_URL;
  if (!baseUrl) {
    console.error('⚠️ BASE_URL is not set in .env file! Please set BASE_URL=https://nelo.so');
    throw new Error('BASE_URL is required for Google Calendar OAuth');
  }
  const redirectUri = `${baseUrl}/api/calendar/callback`;
  console.log('📋 Using redirect URI:', redirectUri);
  return redirectUri;
};

const oauth2Client = process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
  ? new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      getRedirectUri()
    )
  : null;

/**
 * Initiate Google Calendar OAuth flow
 */
router.get('/connect', async (req, res) => {
  if (!oauth2Client) {
    return res.status(503).send('Google Calendar API is not configured');
  }
  
  try {
    const { phone } = req.query;
    
    if (!phone) {
      return res.status(400).send('Phone number is required');
    }
    
    // Check if user exists
    const user = await getUser(phone);
    if (!user) {
      return res.status(404).send('User not found. Please complete registration first.');
    }
    
    // Generate auth URL
    const scopes = [
      'https://www.googleapis.com/auth/calendar.readonly',
      'https://www.googleapis.com/auth/calendar.events'
    ];
    
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      state: phone, // Pass phone number in state
      prompt: 'consent'
    });
    
    // Redirect to Google OAuth
    res.redirect(authUrl);
  } catch (error) {
    console.error('❌ Error initiating OAuth:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      redirectUri: getRedirectUri()
    });
    res.status(500).send('Error connecting calendar');
  }
});

/**
 * OAuth callback
 */
router.get('/callback', async (req, res) => {
  if (!oauth2Client) {
    return res.status(503).send('Google Calendar API is not configured');
  }
  
  try {
    const { code, state, error: oauthError } = req.query;
    const phoneNumber = state;
    
    // Check for OAuth errors from Google
    if (oauthError) {
      console.error('❌ Google Auth Error:', oauthError);
      console.error('Error details from Google:', req.query);
      return res.status(400).send(`OAuth error: ${oauthError}`);
    }
    
    if (!code) {
      console.error('❌ No authorization code received');
      console.error('Query params:', req.query);
      return res.status(400).send('Authorization code is required');
    }
    
    console.log('✅ Received authorization code, exchanging for tokens...');
    console.log('📋 Redirect URI used:', getRedirectUri());
    
    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    
    // Get calendar ID
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    const calendarList = await calendar.calendarList.list();
    const primaryCalendar = calendarList.data.items.find(cal => cal.primary) || calendarList.data.items[0];
    
    // Save tokens and calendar ID
    // Convert expiry_date to ISO string to avoid "date/time field value out of range" error
    const expiresAt = tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : null;
    await updateUserCalendar(phoneNumber, {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      calendar_id: primaryCalendar.id,
      expires_at: expiresAt
    });
    
    // Send confirmation message and lifestyle questions via WhatsApp
    try {
      const flow = getRegistrationFlow();
      const confirmationMsg = flow.calendarConnectedMessage();
      const lifestyleQuestions = flow.lifestyleQuestions();
      
      // Send confirmation first
      await sendWhatsAppMessage(phoneNumber, confirmationMsg);
      
      // Wait a moment, then send lifestyle questions
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Send lifestyle questions as separate bubbles
      for (const question of lifestyleQuestions) {
        await sendWhatsAppMessage(phoneNumber, question);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // Update user state to 'lifestyle_questions' to capture responses
      const { updateUser, getUserState, updateUserState } = await import('../db/users.js');
      const userState = await getUserState(phoneNumber);
      if (userState) {
        userState.state = {
          ...userState.state,
          step: 'lifestyle_questions',
          data: userState.state?.data || {}
        };
        await updateUserState(phoneNumber, userState.state);
      }
      await updateUser(phoneNumber, { state: 'lifestyle_questions' });
    } catch (whatsappError) {
      console.error('Error sending WhatsApp confirmation:', whatsappError);
      // Continue even if WhatsApp message fails
    }
    
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Calendar Connected - Nelo</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              background: #f5f5f5;
              padding: 20px;
            }
            .card {
              background: white;
              padding: 48px 40px;
              border-radius: 24px;
              box-shadow: 0 2px 16px rgba(0, 0, 0, 0.08);
              text-align: center;
              max-width: 420px;
              width: 100%;
            }
            .checkmark {
              font-size: 64px;
              margin-bottom: 24px;
              display: block;
            }
            h1 {
              font-size: 28px;
              font-weight: 700;
              color: #1a1a1a;
              margin-bottom: 12px;
              line-height: 1.2;
            }
            .subtext {
              font-size: 16px;
              color: #666;
              margin-bottom: 32px;
              line-height: 1.5;
            }
            .button {
              display: inline-block;
              background: #007bff;
              color: white;
              padding: 14px 28px;
              border-radius: 12px;
              text-decoration: none;
              font-size: 16px;
              font-weight: 600;
              transition: background 0.2s ease;
              border: none;
              cursor: pointer;
            }
            .button:hover {
              background: #0056b3;
            }
            .button:active {
              transform: scale(0.98);
            }
          </style>
        </head>
        <body>
          <div class="card">
            <span class="checkmark">✅</span>
            <h1>Calendar Connected!</h1>
            <p class="subtext">You're all set. You can close this window now.</p>
            <a href="https://wa.me/" class="button" onclick="window.close(); return false;">Return to WhatsApp</a>
          </div>
          <script>
            // Optional: Auto-close after 5 seconds
            setTimeout(() => {
              window.close();
            }, 5000);
          </script>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('❌ Google Auth Error in callback:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      response: error.response?.data,
      redirectUri: getRedirectUri()
    });
    res.status(500).send('Error connecting calendar');
  }
});

export default router;

