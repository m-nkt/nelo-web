import { getAllUsers, getUser } from '../db/users.js';
import { findMatches } from './matching.js';
import { getFreeTimeSlots } from './calendar.js';
import { sendWhatsAppMessage } from '../utils/twilio.js';
import { createAppointmentRecord } from '../db/appointments.js';
import { updateUserPoints } from '../db/users.js';
import { executeMatchingStrategy } from './matchingService.js';

/**
 * Automatically find and propose matches for all users
 * Now uses the new matching strategy (Level 1 & Level 2)
 */
export async function autoMatchAllUsers() {
  try {
    // Use the new matching strategy
    await executeMatchingStrategy();
  } catch (error) {
    console.error('❌ Error in automatic matching:', error);
  }
}

/**
 * Find common available time slot between two users
 */
async function findCommonTimeSlot(user1Phone, user2Phone) {
  try {
    // Get available time slots for next 7 days
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 7);
    
    const user1Slots = await getFreeTimeSlots(
      user1Phone,
      startDate.toISOString(),
      endDate.toISOString()
    );
    
    const user2Slots = await getFreeTimeSlots(
      user2Phone,
      startDate.toISOString(),
      endDate.toISOString()
    );
    
    // Find overlapping time slots (simplified - you may want to improve this)
    // For now, suggest tomorrow at 20:00 as a default
    const suggestedTime = new Date();
    suggestedTime.setDate(suggestedTime.getDate() + 1);
    suggestedTime.setHours(20, 0, 0, 0);
    
    return suggestedTime.toISOString();
  } catch (error) {
    console.error('Error finding common time slot:', error);
    return null;
  }
}

/**
 * Propose match to both users via WhatsApp
 */
async function proposeMatch(user1Phone, user2Phone, suggestedTime) {
  // Create a pending match record with 24-hour expiration
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24);
  try {
    const user1 = await getUser(user1Phone);
    const user2 = await getUser(user2Phone);
    
    if (!user1 || !user2) {
      return;
    }
    
    const formattedTime = new Date(suggestedTime).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    // Calculate AI match score
    const { calculateMatchScore, isGreatMatch } = await import('./matching.js');
    const matchScore = await calculateMatchScore(user1, user2);
    
    // Only send if it's a "Great Match" (score >= 80)
    if (!isGreatMatch({ aiScore: matchScore.score })) {
      console.log(`⏭️  Match score ${matchScore.score} is below 80, skipping proposal`);
      return;
    }
    
    // Create brief description of partner
    const user2Description = `${user2.target_language || user2.language_learning} learner, ${user2.native_language || user2.language_teaching} native, ${user2.user_level || user2.level} level`;
    const user1Description = `${user1.target_language || user1.language_learning} learner, ${user1.native_language || user1.language_teaching} native, ${user1.user_level || user1.level} level`;
    
    // Send proposal to user1 with AI-generated reason and icebreaker
    await sendWhatsAppMessage(
      user1Phone,
      `I found someone for you! 🌟\n\nThey are ${user2Description}.\n\n${matchScore.reason}\n\n💬 First question: "${matchScore.icebreaker}"\n\nDo you want to meet them?\n\n⚠️ You have 24 hours. If you do not answer, I will cancel it.`
    );
    
    // Send proposal to user2 with AI-generated reason and icebreaker
    await sendWhatsAppMessage(
      user2Phone,
      `Found a great match for you! 🌟\n\nThey are ${user1Description}.\n\n${matchScore.reason}\n\n💬 Icebreaker: "${matchScore.icebreaker}"\n\nWould you like to meet them?\n\n⚠️ This offer expires in 24 hours. If I don't hear back, it'll be automatically canceled to keep things fair.`
    );
    
    // Save proposal to database (you may want to create a proposals table)
    console.log(`✅ Match proposed: ${user1Phone} <-> ${user2Phone} at ${formattedTime}`);
  } catch (error) {
    console.error('Error proposing match:', error);
  }
}

/**
 * Handle match proposal response
 */
export async function handleMatchProposalResponse(phoneNumber, response, otherUserPhone, proposedTime) {
  try {
    if (response.toLowerCase().includes('yes') || response.toLowerCase().includes('ok') || response.toLowerCase().includes('confirm')) {
      // Both users need to accept - for now, we'll create a pending appointment
      // In a full implementation, you'd check if both users accepted
      const user = await getUser(phoneNumber);
      const otherUser = await getUser(otherUserPhone);
      
      if (!user || !otherUser) {
        return 'Error: User not found.';
      }
      
      if (user.points_balance < 100 || otherUser.points_balance < 100) {
        return 'Insufficient points. Please purchase points and try again.';
      }
      
      // Create appointment (you may want to make this async and wait for both confirmations)
      // For now, we'll just send a confirmation
      await sendWhatsAppMessage(
        phoneNumber,
        `✅ Match proposal accepted!\n\n` +
        `Waiting for the other party's confirmation.\n` +
        `The appointment will be confirmed once both parties accept.`
      );
      
      return 'Match proposal accepted. Waiting for the other party\'s confirmation.';
    } else {
      return 'Match proposal cancelled.';
    }
  } catch (error) {
    console.error('Error handling match proposal response:', error);
    return 'An error occurred.';
  }
}

