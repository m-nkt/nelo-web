import { getAllUsers, getUser, updateUser } from '../db/users.js';
import { getFreeTimeSlots, createCalendarEvent } from './calendar.js';
import { sendWhatsAppMessage } from '../utils/twilio.js';
import { createAppointmentRecord } from '../db/appointments.js';
import { updateUserPoints } from '../db/users.js';
import { calculateMatchScore, isGreatMatch } from './matching.js';

/**
 * Get user's timezone (default to Asia/Tokyo if not specified)
 */
function getUserTimezone(user) {
  // Try to get timezone from preferences or default to Asia/Tokyo
  return user.preferences?.timezone || 
         user.timezone || 
         'Asia/Tokyo'; // Default timezone
}

/**
 * Calculate timezone offset in hours
 */
function getTimezoneOffset(timezone) {
  // Simplified timezone offsets (you may want to use a library like moment-timezone)
  const offsets = {
    'Asia/Tokyo': 9,
    'America/New_York': -5,
    'America/Los_Angeles': -8,
    'Europe/London': 0,
    'Europe/Paris': 1,
    'America/Chicago': -6,
    'America/Denver': -7,
    'America/Phoenix': -7,
    'America/Anchorage': -9,
    'Pacific/Honolulu': -10
  };
  return offsets[timezone] || 0;
}

/**
 * Find overlapping time slots between two users considering timezones
 */
async function findOverlappingTimeSlots(user1, user2, daysAhead = 7) {
  try {
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + daysAhead);
    
    // Get free time slots for both users
    const user1Slots = await getFreeTimeSlots(
      user1.phone_number,
      startDate.toISOString(),
      endDate.toISOString()
    );
    
    const user2Slots = await getFreeTimeSlots(
      user2.phone_number,
      startDate.toISOString(),
      endDate.toISOString()
    );
    
    // Get timezones
    const user1Timezone = getUserTimezone(user1);
    const user2Timezone = getUserTimezone(user2);
    
    // Calculate timezone difference
    const timezoneDiff = getTimezoneOffset(user1Timezone) - getTimezoneOffset(user2Timezone);
    
    // Find overlapping slots (simplified - you may want to improve this)
    // For now, we'll suggest tomorrow at 20:00 in user1's timezone
    const suggestedTime = new Date();
    suggestedTime.setDate(suggestedTime.getDate() + 1);
    suggestedTime.setHours(20, 0, 0, 0);
    suggestedTime.setMinutes(0, 0, 0);
    
    // Convert to user2's timezone
    const user2Time = new Date(suggestedTime);
    user2Time.setHours(user2Time.getHours() - timezoneDiff);
    
    // Check if both users are available (simplified check)
    // In a real implementation, you'd check against busy times
    return {
      user1Time: suggestedTime.toISOString(),
      user2Time: user2Time.toISOString(),
      commonTime: suggestedTime.toISOString(), // Use user1's timezone as reference
      timezoneDiff: timezoneDiff
    };
  } catch (error) {
    console.error('Error finding overlapping time slots:', error);
    return null;
  }
}

/**
 * Check if match meets Level 1 criteria (perfect match)
 */
function isLevel1Match(user1, user2, matchScore) {
  // Must-have conditions:
  // 1. Language complementarity (user1 wants to learn user2's native, and vice versa)
  const languageMatch = 
    (user1.target_language || user1.language_learning) === (user2.native_language || user2.language_teaching) &&
    (user1.native_language || user1.language_teaching) === (user2.target_language || user2.language_learning);
  
  if (!languageMatch) return false;
  
  // 2. Level compatibility (at least one native or both intermediate+)
  const user1Level = user1.user_level || user1.level || 'Intermediate';
  const user2Level = user2.user_level || user2.level || 'Intermediate';
  const levelMatch = 
    user1Level === 'Native' || 
    user2Level === 'Native' ||
    (user1Level === 'Intermediate' && user2Level === 'Intermediate') ||
    (user1Level === 'Advanced' && user2Level === 'Advanced');
  
  if (!levelMatch) return false;
  
  // 3. High AI score (>= 80)
  if (matchScore.score < 80) return false;
  
  // 4. Both users have calendar connected and enough points
  if (!user1.calendar_access_token || !user2.calendar_access_token) return false;
  if (user1.points_balance < 100 || user2.points_balance < 100) return false;
  
  return true;
}

/**
 * Generate trade-off reason for Level 2 matches
 */
function generateTradeOffReason(user1, user2, matchScore, timeSlot) {
  const reasons = [];
  
  // Check timezone difference
  const user1Timezone = getUserTimezone(user1);
  const user2Timezone = getUserTimezone(user2);
  const timezoneDiff = getTimezoneOffset(user1Timezone) - getTimezoneOffset(user2Timezone);
  
  if (Math.abs(timezoneDiff) >= 8) {
    const timeStr = timeSlot.user2Time ? new Date(timeSlot.user2Time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'late night';
    reasons.push(`This person is in ${user2Timezone} but only free at ${timeStr} your time`);
  }
  
  // Check level difference
  const user1Level = user1.user_level || user1.level || 'Intermediate';
  const user2Level = user2.user_level || user2.level || 'Intermediate';
  
  if (user1Level === 'Native' && user2Level !== 'Native') {
    reasons.push(`This person is not a native speaker but is ${user2Level}`);
  } else if (user2Level === 'Native' && user1Level !== 'Native') {
    reasons.push(`This person is a native speaker (you are ${user1Level})`);
  }
  
  // Check interests match
  const user1Interests = user1.interests || [];
  const user2Interests = user2.interests || [];
  const commonInterests = user1Interests.filter(i => user2Interests.includes(i));
  
  if (commonInterests.length > 0) {
    reasons.push(`Shares your interest in ${commonInterests.slice(0, 2).join(' and ')}`);
  }
  
  // Use AI reason if available
  if (matchScore.reason) {
    reasons.push(matchScore.reason);
  }
  
  return reasons.join('. ') || 'This person could be a good match for you.';
}

/**
 * Level 1: Instant Match - Auto-book and notify
 */
async function handleLevel1Match(user1, user2, timeSlot) {
  try {
    console.log(`🚀 Level 1 Instant Match: ${user1.phone_number} <-> ${user2.phone_number}`);
    
    // Create calendar events for both users
    const meetLink1 = await createCalendarEvent(
      user1.phone_number,
      timeSlot.user1Time,
      15,
      user2.phone_number
    );
    
    const meetLink2 = await createCalendarEvent(
      user2.phone_number,
      timeSlot.user2Time,
      15,
      user1.phone_number
    );
    
    const meetLink = meetLink1 || meetLink2;
    
    // Create appointment record
    const appointment = await createAppointmentRecord({
      user1_phone: user1.phone_number,
      user2_phone: user2.phone_number,
      scheduled_at: timeSlot.commonTime,
      duration_minutes: 15,
      google_meet_link: meetLink,
      points_used: 100,
      status: 'confirmed'
    });
    
    // Deduct points
    await updateUserPoints(user1.phone_number, -100);
    await updateUserPoints(user2.phone_number, -100);
    
    // Calculate match score for notification
    const matchScore = await calculateMatchScore(user1, user2);
    
    // Format time for display
    const formattedTime1 = new Date(timeSlot.user1Time).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: getUserTimezone(user1)
    });
    
    const formattedTime2 = new Date(timeSlot.user2Time).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: getUserTimezone(user2)
    });
    
    // Notify user1
    await sendWhatsAppMessage(
      user1.phone_number,
      `🎉 Perfect match found!\n\n` +
      `I found someone perfect for you and booked your session!\n\n` +
      `📅 Date & Time: ${formattedTime1}\n` +
      `⏱️ Duration: 15 minutes\n` +
      `🔗 Google Meet: ${meetLink}\n\n` +
      `💬 ${matchScore.reason}\n\n` +
      `💡 First question: "${matchScore.icebreaker}"\n\n` +
      `See you there! ✨`
    );
    
    // Notify user2
    await sendWhatsAppMessage(
      user2.phone_number,
      `🎉 Perfect match found!\n\n` +
      `I found someone perfect for you and booked your session!\n\n` +
      `📅 Date & Time: ${formattedTime2}\n` +
      `⏱️ Duration: 15 minutes\n` +
      `🔗 Google Meet: ${meetLink}\n\n` +
      `💬 ${matchScore.reason}\n\n` +
      `💡 First question: "${matchScore.icebreaker}"\n\n` +
      `See you there! ✨`
    );
    
    // Update user states
    await updateUser(user1.phone_number, { state: 'matched' });
    await updateUser(user2.phone_number, { state: 'matched' });
    
    return appointment;
  } catch (error) {
    console.error('Error in Level 1 match:', error);
    throw error;
  }
}

/**
 * Level 2: Curated Suggestions - Present 3 options
 */
async function handleLevel2Suggestions(user1, candidates) {
  try {
    console.log(`💡 Level 2 Curated Suggestions for ${user1.phone_number}`);
    
    // Get top 3 candidates
    const top3 = candidates.slice(0, 3);
    
    if (top3.length === 0) {
      await sendWhatsAppMessage(
        user1.phone_number,
        `I'm still looking for your perfect match. I'll keep searching and let you know when I find someone! 🔍✨`
      );
      return;
    }
    
    // Build suggestion message
    let message = `I found ${top3.length} great options for you! 🎯\n\n`;
    
    for (let i = 0; i < top3.length; i++) {
      const candidate = top3[i];
      const candidateUser = await getUser(candidate.phoneNumber);
      if (!candidateUser) continue;
      
      // Find time slot
      const timeSlot = await findOverlappingTimeSlots(user1, candidateUser);
      const tradeOffReason = generateTradeOffReason(user1, candidateUser, candidate, timeSlot);
      
      const formattedTime = timeSlot ? new Date(timeSlot.user1Time).toLocaleString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }) : 'TBD';
      
      message += `${i + 1}. ${candidateUser.target_language || candidateUser.language_learning} learner, ${candidateUser.native_language || candidateUser.language_teaching} native\n`;
      message += `   ${tradeOffReason}\n`;
      message += `   📅 Suggested time: ${formattedTime}\n\n`;
    }
    
    message += `Reply with the number (1, 2, or 3) to accept, or "skip" to wait for more options.`;
    
    await sendWhatsAppMessage(user1.phone_number, message);
    
    // Update user state to wait for response
    await updateUser(user1.phone_number, { state: 'reviewing_suggestions' });
    
    // Store suggestions in user state for later retrieval
    // You may want to store this in a separate table or user state
    return top3;
  } catch (error) {
    console.error('Error in Level 2 suggestions:', error);
    throw error;
  }
}

/**
 * Handle user's response to Level 2 suggestions
 */
export async function handleSuggestionResponse(phoneNumber, response) {
  try {
    const user = await getUser(phoneNumber);
    if (!user || user.state !== 'reviewing_suggestions') {
      return 'No suggestions to respond to.';
    }
    
    const lowerResponse = response.toLowerCase().trim();
    
    if (lowerResponse === 'skip' || lowerResponse.includes('skip')) {
      await updateUser(phoneNumber, { state: 'waiting' });
      await sendWhatsAppMessage(phoneNumber, `Got it! I'll keep looking for more options. 🔍✨`);
      return '';
    }
    
    // Parse number (1, 2, or 3)
    const choice = parseInt(lowerResponse);
    if (isNaN(choice) || choice < 1 || choice > 3) {
      await sendWhatsAppMessage(phoneNumber, `Please reply with 1, 2, or 3 to accept a suggestion, or "skip" to wait for more options.`);
      return '';
    }
    
    // TODO: Retrieve the stored suggestions and create appointment for the chosen one
    // For now, we'll need to re-find matches and select the chosen candidate
    // This is a simplified version - you may want to store suggestions in a database
    
    await updateUser(phoneNumber, { state: 'waiting' });
    await sendWhatsAppMessage(phoneNumber, `I'll book that match for you! Give me a moment... ⏳`);
    
    return '';
  } catch (error) {
    console.error('Error handling suggestion response:', error);
    throw error;
  }
}

/**
 * Main matching strategy function
 */
export async function executeMatchingStrategy() {
  try {
    console.log('🔄 Executing matching strategy...');
    
    const allUsers = await getAllUsers();
    
    // Get active users (calendar connected, enough points, in waiting/matching state)
    const activeUsers = allUsers.filter(user => 
      user.calendar_access_token && 
      user.points_balance >= 100 &&
      (user.state === 'waiting' || user.state === 'matching' || !user.state)
    );
    
    if (activeUsers.length < 2) {
      console.log(`⏭️  Skipping matching: Only ${activeUsers.length} active user(s) available (need at least 2)`);
      return;
    }
    
    const matchedPairs = new Set();
    
    for (const user1 of activeUsers) {
      if (user1.state !== 'waiting' && user1.state !== 'matching' && user1.state) {
        continue;
      }
      
      // Find potential matches
      const { findMatches } = await import('./matching.js');
      const matches = await findMatches(user1.phone_number);
      
      // Sort by AI score
      matches.sort((a, b) => b.aiScore - a.aiScore);
      
      let level1MatchFound = false;
      const level2Candidates = [];
      
      for (const match of matches) {
        const pairKey = [user1.phone_number, match.phoneNumber].sort().join('-');
        
        if (matchedPairs.has(pairKey)) {
          continue;
        }
        
        const user2 = await getUser(match.phoneNumber);
        if (!user2 || !user2.calendar_access_token || user2.points_balance < 100) {
          continue;
        }
        
        // Check if user2 is also in waiting/matching state
        if (user2.state !== 'waiting' && user2.state !== 'matching' && user2.state) {
          continue;
        }
        
        // Calculate match score
        const matchScore = await calculateMatchScore(user1, user2);
        
        // Check for Level 1 match
        if (isLevel1Match(user1, user2, matchScore)) {
          const timeSlot = await findOverlappingTimeSlots(user1, user2);
          
          if (timeSlot) {
            await handleLevel1Match(user1, user2, timeSlot);
            matchedPairs.add(pairKey);
            level1MatchFound = true;
            break; // Stop after first Level 1 match
          }
        } else {
          // Collect Level 2 candidates
          if (matchScore.score >= 60) { // Minimum score for Level 2
            level2Candidates.push({
              ...match,
              phoneNumber: match.phoneNumber,
              user: user2
            });
          }
        }
      }
      
      // If no Level 1 match, present Level 2 suggestions
      if (!level1MatchFound && level2Candidates.length > 0) {
        await handleLevel2Suggestions(user1, level2Candidates);
      }
    }
    
    console.log('✅ Matching strategy completed');
  } catch (error) {
    console.error('❌ Error in matching strategy:', error);
    throw error;
  }
}

