/**
 * 24-hour reminder service for users stuck in registration
 * Sends friendly nudges to users who haven't responded within 23 hours
 */

import { getAllUsers, updateUser } from '../db/users.js';
import { sendWhatsAppMessage } from '../utils/twilio.js';
import { normalizePhoneNumber } from '../utils/phone-number.js';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import '../config/env.js';

// Initialize Gemini for dynamic reminders
const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

const getGeminiModel = () => {
  if (!genAI) return null;
  return genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
};

/**
 * Generate a dynamic, humorous reminder message using Gemini
 */
async function generateDynamicReminder(userName) {
  const model = getGeminiModel();
  if (!model) {
    // Fallback if Gemini not available
    return `Hey ${userName}! Just checking in. Are you still interested in finding a language partner? Let's finish your profile! ✨`;
  }
  
  try {
    const prompt = `You are a charming, witty language coach. Generate a friendly, humorous reminder message for a user named "${userName}" who hasn't completed their registration in 23+ hours.

Requirements:
- Keep it SHORT (1-2 sentences max)
- Be playful and fun, not robotic
- Use emojis naturally
- Examples:
  - "Are you still there? My matching brain is getting lonely without your answers! 🧠💔"
  - "Hey ${userName}! Your perfect language partner is waiting... but I need your help to find them! 😊"
  - "${userName}, are you ghosting me? 😅 Let's finish your profile so we can find you a match!"

Generate ONE reminder message (just the message, no quotes or extra text):`;
    
    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text().trim().replace(/^["']|["']$/g, ''); // Remove quotes if present
  } catch (error) {
    console.error('Error generating dynamic reminder:', error);
    // Fallback
    return `Hey ${userName}! Just checking in. Are you still interested in finding a language partner? Let's finish your profile! ✨`;
  }
}

// Get Supabase client
function getSupabase() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    return null;
  }
  
  return createClient(supabaseUrl, supabaseKey);
}

/**
 * Get the last bot message time for a user
 * Returns null if no bot messages found
 * We check message_logs for the last message that was NOT from the user
 * (Bot messages are logged with ai_used=false when they're sent)
 */
async function getLastBotMessageTime(phoneNumber) {
  const supabase = getSupabase();
  if (!supabase) return null;
  
  try {
    const normalizedPhone = normalizePhoneNumber(phoneNumber);
    // Get the most recent message from message_logs
    // In practice, we log all messages, so we'll check the last logged message
    // For a more accurate approach, we could add a 'sender' field, but for now
    // we'll use the last message timestamp as a proxy
    const { data, error } = await supabase
      .from('message_logs')
      .select('created_at')
      .eq('phone_number', normalizedPhone)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error || !data) return null;
    return new Date(data.created_at);
  } catch (error) {
    console.error('Error getting last bot message time:', error);
    return null;
  }
}

/**
 * Send 24-hour reminder to users stuck in registration
 */
export async function sendRegistrationReminders() {
  try {
    console.log('🔔 Checking for 24-hour registration reminders...');
    
    // Get all users in registration state
    const users = await getAllUsers();
    const registrationUsers = users.filter(user => user.state === 'registration');
    
    if (registrationUsers.length === 0) {
      console.log('✅ No users in registration state');
      return;
    }
    
    const now = new Date();
    const reminderThreshold = 23 * 60 * 60 * 1000; // 23 hours in milliseconds
    let remindersSent = 0;
    
    for (const user of registrationUsers) {
      try {
        // Get last bot message time
        const lastBotMessage = await getLastBotMessageTime(user.phone_number);
        if (!lastBotMessage) {
          // No bot messages found, skip
          continue;
        }
        
        // Check if 23 hours have passed
        const timeSinceLastMessage = now - lastBotMessage;
        if (timeSinceLastMessage < reminderThreshold) {
          // Not yet 23 hours, skip
          continue;
        }
        
        // Check reminder count by counting previous reminder messages
        const normalizedPhone = normalizePhoneNumber(user.phone_number);
        const supabaseClient = getSupabase();
        if (!supabaseClient) continue;
        
        const { count: reminderCount, error: countError } = await supabaseClient
          .from('message_logs')
          .select('*', { count: 'exact', head: true })
          .eq('phone_number', normalizedPhone)
          .like('message_text', '%[REMINDER_SENT]%');
        
        const currentReminderCount = (countError ? 0 : (reminderCount || 0));
        
        if (currentReminderCount >= 2) {
          // Already sent 2 reminders, skip
          console.log(`⏭️  User ${user.phone_number} already received 2 reminders, skipping`);
          continue;
        }
        
        // Get user's name from state or user data
        const { getUserState } = await import('../db/users.js');
        const userState = await getUserState(user.phone_number);
        const userName = userState?.state?.data?.name || user.name || 'there';
        
        // Generate dynamic reminder with Gemini (humor & variation)
        const reminderMessage = await generateDynamicReminder(userName);
        
        await sendWhatsAppMessage(user.phone_number, reminderMessage);
        
        // Log the reminder to track count
        const { logMessage } = await import('../db/message-logs.js');
        await logMessage(user.phone_number, `[REMINDER_SENT]`, false);
        
        remindersSent++;
        console.log(`✅ Sent reminder to ${user.phone_number} (reminder #${reminderCount + 1})`);
        
      } catch (error) {
        console.error(`❌ Error sending reminder to ${user.phone_number}:`, error);
        // Continue with next user
      }
    }
    
    console.log(`✅ Registration reminders completed. Sent ${remindersSent} reminders.`);
    
  } catch (error) {
    console.error('❌ Error in registration reminders:', error);
  }
}

