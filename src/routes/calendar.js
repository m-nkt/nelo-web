import express from 'express';
import { google } from 'googleapis';
import { getUser, updateUserCalendar } from '../db/users.js';
import { isServiceConfigured } from '../utils/env-check.js';

const router = express.Router();

// OAuth2 client (only if configured)
const oauth2Client = process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
  ? new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
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
    
    res.redirect(authUrl);
  } catch (error) {
    console.error('Error initiating OAuth:', error);
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
    const { code, state } = req.query;
    const phoneNumber = state;
    
    if (!code) {
      return res.status(400).send('Authorization code is required');
    }
    
    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    
    // Get calendar ID
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    const calendarList = await calendar.calendarList.list();
    const primaryCalendar = calendarList.data.items.find(cal => cal.primary) || calendarList.data.items[0];
    
    // Save tokens and calendar ID
    await updateUserCalendar(phoneNumber, {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      calendar_id: primaryCalendar.id,
      expires_at: tokens.expiry_date
    });
    
    res.send(`
      <html>
        <body>
          <h1>✅ カレンダー連携が完了しました！</h1>
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
    console.error('Error in OAuth callback:', error);
    res.status(500).send('Error connecting calendar');
  }
});

export default router;

