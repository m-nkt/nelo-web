import { google } from 'googleapis';
import { getUser } from '../db/users.js';

/**
 * Get free time slots for a user
 */
export async function getFreeTimeSlots(phoneNumber, startDate, endDate) {
  try {
    const user = await getUser(phoneNumber);
    if (!user || !user.calendar_access_token) {
      throw new Error('User calendar not connected');
    }
    
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
    
    oauth2Client.setCredentials({
      access_token: user.calendar_access_token,
      refresh_token: user.calendar_refresh_token
    });
    
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    
    // Get busy times
    const freebusy = await calendar.freebusy.query({
      requestBody: {
        timeMin: startDate,
        timeMax: endDate,
        items: [{ id: user.calendar_id || 'primary' }]
      }
    });
    
    // Calculate free slots (simplified - you may want to improve this)
    const busyTimes = freebusy.data.calendars[user.calendar_id || 'primary'].busy || [];
    
    // Return available time slots (this is simplified - you'll want to implement proper logic)
    return {
      busy: busyTimes,
      available: [] // Implement logic to find available slots
    };
  } catch (error) {
    console.error('Error getting free time slots:', error);
    throw error;
  }
}

/**
 * Create Google Calendar event with Meet link
 */
export async function createCalendarEvent(phoneNumber, startTime, duration, otherUserPhone) {
  try {
    const user = await getUser(phoneNumber);
    if (!user || !user.calendar_access_token) {
      throw new Error('User calendar not connected');
    }
    
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
    
    oauth2Client.setCredentials({
      access_token: user.calendar_access_token,
      refresh_token: user.calendar_refresh_token
    });
    
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    
    const endTime = new Date(new Date(startTime).getTime() + duration * 60000);
    
    // Create event with Meet link
    const event = await calendar.events.insert({
      calendarId: user.calendar_id || 'primary',
      conferenceDataVersion: 1,
      requestBody: {
        summary: `言語交換: ${otherUserPhone}`,
        description: '言語マッチングサービスのアポイントメント',
        start: {
          dateTime: new Date(startTime).toISOString(),
          timeZone: 'Asia/Tokyo'
        },
        end: {
          dateTime: endTime.toISOString(),
          timeZone: 'Asia/Tokyo'
        },
        conferenceData: {
          createRequest: {
            requestId: `meet-${Date.now()}`,
            conferenceSolutionKey: {
              type: 'hangoutsMeet'
            }
          }
        }
      }
    });
    
    // Extract Meet link
    const meetLink = event.data.hangoutLink || event.data.conferenceData?.entryPoints?.[0]?.uri;
    
    return meetLink;
  } catch (error) {
    console.error('Error creating calendar event:', error);
    throw error;
  }
}

