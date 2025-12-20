import { getAllUsers, getUser, updateUserPoints } from '../db/users.js';
import { getFreeTimeSlots, createCalendarEvent } from './calendar.js';
import { sendWhatsAppMessage } from '../utils/twilio.js';
import { createAppointmentRecord } from '../db/appointments.js';

/**
 * Find potential matches for a user
 */
export async function findMatches(phoneNumber) {
  try {
    const user = await getUser(phoneNumber);
    if (!user) {
      throw new Error('User not found');
    }
    
    // Get all other users
    const allUsers = await getAllUsers();
    
    // Filter potential matches
    const matches = allUsers
      .filter(otherUser => {
        // Don't match with self
        if (otherUser.phone_number === phoneNumber) return false;
        
        // Language match: user wants to learn what other user teaches
        const languageMatch = 
          user.language_learning === otherUser.language_teaching &&
          user.language_teaching === otherUser.language_learning;
        
        if (!languageMatch) return false;
        
        // Level match: at least one should be native or both intermediate+
        const levelMatch = 
          user.level === 'ネイティブ' || 
          otherUser.level === 'ネイティブ' ||
          (user.level === '中級以上' && otherUser.level === '中級以上');
        
        return levelMatch;
      })
      .map(otherUser => ({
        phoneNumber: otherUser.phone_number,
        languageLearning: otherUser.language_learning,
        languageTeaching: otherUser.language_teaching,
        level: otherUser.level,
        trustScore: otherUser.trust_score
      }));
    
    return matches;
  } catch (error) {
    console.error('Error finding matches:', error);
    throw error;
  }
}

/**
 * Create appointment between two users
 */
export async function createAppointment(user1Phone, user2Phone, scheduledAt, duration = 15) {
  try {
    const user1 = await getUser(user1Phone);
    const user2 = await getUser(user2Phone);
    
    if (!user1 || !user2) {
      throw new Error('One or both users not found');
    }
    
    // Check if users have enough points
    const pointsRequired = 100; // 1 appointment = 100 points
    
    if (user1.points_balance < pointsRequired || user2.points_balance < pointsRequired) {
      throw new Error('Insufficient points');
    }
    
    // Create Google Calendar event for both users
    const meetLink1 = await createCalendarEvent(user1Phone, scheduledAt, duration, user2Phone);
    const meetLink2 = await createCalendarEvent(user2Phone, scheduledAt, duration, user1Phone);
    
    // Use the same Meet link (should be the same)
    const meetLink = meetLink1 || meetLink2;
    
    // Create appointment record
    const appointment = await createAppointmentRecord({
      user1_phone: user1Phone,
      user2_phone: user2Phone,
      scheduled_at: scheduledAt,
      duration_minutes: duration,
      google_meet_link: meetLink,
      points_used: pointsRequired,
      status: 'confirmed'
    });
    
    // Deduct points
    await updateUserPoints(user1Phone, -pointsRequired);
    await updateUserPoints(user2Phone, -pointsRequired);
    
    // Send notifications
    await sendWhatsAppMessage(
      user1Phone,
      `✅ アポイントメントが確定しました！\n\n` +
      `相手: ${user2Phone}\n` +
      `日時: ${new Date(scheduledAt).toLocaleString('ja-JP')}\n` +
      `時間: ${duration}分\n` +
      `Google Meet: ${meetLink}\n\n` +
      `楽しんでください！`
    );
    
    await sendWhatsAppMessage(
      user2Phone,
      `✅ アポイントメントが確定しました！\n\n` +
      `相手: ${user1Phone}\n` +
      `日時: ${new Date(scheduledAt).toLocaleString('ja-JP')}\n` +
      `時間: ${duration}分\n` +
      `Google Meet: ${meetLink}\n\n` +
      `楽しんでください！`
    );
    
    return appointment;
  } catch (error) {
    console.error('Error creating appointment:', error);
    throw error;
  }
}

