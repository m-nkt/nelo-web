import { getAllUsers, getUser, updateUserPoints } from '../db/users.js';
import { getFreeTimeSlots, createCalendarEvent } from './calendar.js';
import { sendWhatsAppMessage } from '../utils/twilio.js';
import { createAppointmentRecord } from '../db/appointments.js';

/**
 * Calculate AI-powered match score between two users
 * Returns { score: 0-100, reason: string, icebreaker: string }
 */
export async function calculateMatchScore(userA, userB) {
  const model = getGeminiModel();
  if (!model) {
    // Fallback: basic score without AI
    return {
      score: 50,
      reason: 'You both want to learn each other\'s language.',
      icebreaker: 'Hello! How are you?'
    };
  }
  
  try {
    const prompt = `You are a matchmaking AI for a language learning platform. Analyze these two user profiles and calculate a compatibility score.

User A Profile:
- Target Language: ${userA.target_language || userA.language_learning || 'Unknown'}
- Native Language: ${userA.native_language || userA.language_teaching || 'Unknown'}
- Level: ${userA.user_level || userA.level || 'Unknown'}
- Interests: ${JSON.stringify(userA.interests || [])}
- Job Title: ${userA.job_title || 'Not specified'}
- Matching Goal: ${userA.matching_goal || 'Not specified'}
- Preferences: ${JSON.stringify(userA.preferences || {})}

User B Profile:
- Target Language: ${userB.target_language || userB.language_learning || 'Unknown'}
- Native Language: ${userB.native_language || userB.language_teaching || 'Unknown'}
- Level: ${userB.user_level || userB.level || 'Unknown'}
- Interests: ${JSON.stringify(userB.interests || [])}
- Job Title: ${userB.job_title || 'Not specified'}
- Matching Goal: ${userB.matching_goal || 'Not specified'}
- Preferences: ${JSON.stringify(userB.preferences || {})}

Calculate a compatibility score (0-100) based on:
1. Language complementarity (they should want to learn each other's native language)
2. Shared interests and hobbies
3. Complementary goals (e.g., business-focused with business-focused)
4. Personality fit based on their descriptions

Respond with ONLY valid JSON (no additional text):
{
  "score": 0-100,
  "reason": "Why they are good together (1-2 short sentences, simple words)",
  "icebreaker": "A simple first question they can ask (use easy words)"
}

Example response:
{
  "score": 85,
  "reason": "Both like AI and surfing. Both want to learn for work.",
  "icebreaker": "What do you like about AI? Tell me!"
}`;
    
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text().trim();
    
    // Parse JSON
    const jsonText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const matchData = JSON.parse(jsonText);
    
    return {
      score: Math.min(100, Math.max(0, matchData.score || 50)),
      reason: matchData.reason || 'You both want to learn each other\'s language.',
      icebreaker: matchData.icebreaker || 'Hello! How are you?'
    };
  } catch (error) {
    console.error('Error calculating match score:', error);
    // Fallback
    return {
      score: 50,
      reason: 'You both want to learn each other\'s language.',
      icebreaker: 'Hello! How are you?'
    };
  }
}

/**
 * Find potential matches for a user with AI scoring
 */
export async function findMatches(phoneNumber) {
  try {
    const user = await getUser(phoneNumber);
    if (!user) {
      throw new Error('User not found');
    }
    
    // Get all other users
    const allUsers = await getAllUsers();
    
    // Step 1: Filter by essential criteria (language pair and basic availability)
    const basicMatches = allUsers
      .filter(otherUser => {
        // Don't match with self
        if (otherUser.phone_number === phoneNumber) return false;
        
        // Language match: user wants to learn what other user teaches
        const languageMatch = 
          (user.target_language || user.language_learning) === (otherUser.native_language || otherUser.language_teaching) &&
          (user.native_language || user.language_teaching) === (otherUser.target_language || otherUser.language_learning);
        
        if (!languageMatch) return false;
        
        // Level match: at least one should be native or both intermediate+
        const userLevel = user.user_level || user.level || 'Intermediate';
        const otherLevel = otherUser.user_level || otherUser.level || 'Intermediate';
        const levelMatch = 
          userLevel === 'Native' || 
          otherLevel === 'Native' ||
          (userLevel === 'Intermediate' && otherLevel === 'Intermediate') ||
          (userLevel === 'Advanced' && otherLevel === 'Advanced');
        
        return levelMatch;
      });
    
    // Step 2: Get top 5 candidates for AI scoring (to save API costs)
    const topCandidates = basicMatches.slice(0, 5);
    
    // Step 3: Calculate AI scores for top candidates
    const scoredMatches = await Promise.all(
      topCandidates.map(async (otherUser) => {
        const matchScore = await calculateMatchScore(user, otherUser);
        return {
          phoneNumber: otherUser.phone_number,
          languageLearning: otherUser.target_language || otherUser.language_learning,
          languageTeaching: otherUser.native_language || otherUser.language_teaching,
          level: otherUser.user_level || otherUser.level,
          trustScore: otherUser.trust_score || 50,
          aiScore: matchScore.score,
          reason: matchScore.reason,
          icebreaker: matchScore.icebreaker
        };
      })
    );
    
    // Sort by AI score (highest first)
    scoredMatches.sort((a, b) => b.aiScore - a.aiScore);
    
    return scoredMatches;
  } catch (error) {
    console.error('Error finding matches:', error);
    throw error;
  }
}

/**
 * Check if a match is a "Great Match" (score >= 80)
 */
export function isGreatMatch(match) {
  return match.aiScore >= 80;
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
      `✅ Appointment confirmed!\n\n` +
      `Partner: ${user2Phone}\n` +
      `Date & Time: ${new Date(scheduledAt).toLocaleString('en-US')}\n` +
      `Duration: ${duration} minutes\n` +
      `Google Meet: ${meetLink}\n\n` +
      `Enjoy your conversation!`
    );
    
    await sendWhatsAppMessage(
      user2Phone,
      `✅ Appointment confirmed!\n\n` +
      `Partner: ${user1Phone}\n` +
      `Date & Time: ${new Date(scheduledAt).toLocaleString('en-US')}\n` +
      `Duration: ${duration} minutes\n` +
      `Google Meet: ${meetLink}\n\n` +
      `Enjoy your conversation!`
    );
    
    return appointment;
  } catch (error) {
    console.error('Error creating appointment:', error);
    throw error;
  }
}

