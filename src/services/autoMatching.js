import { getAllUsers, getUser } from '../db/users.js';
import { findMatches } from './matching.js';
import { getFreeTimeSlots } from './calendar.js';
import { sendWhatsAppMessage } from '../utils/twilio.js';
import { createAppointmentRecord } from '../db/appointments.js';
import { updateUserPoints } from '../db/users.js';

/**
 * Automatically find and propose matches for all users
 */
export async function autoMatchAllUsers() {
  try {
    console.log('🔄 Starting automatic matching...');
    
    const allUsers = await getAllUsers();
    const matchedPairs = new Set(); // Track already matched pairs
    
    for (const user of allUsers) {
      // Skip if user doesn't have calendar connected
      if (!user.calendar_access_token) {
        continue;
      }
      
      // Skip if user has insufficient points
      if (user.points_balance < 100) {
        continue;
      }
      
      // Find potential matches
      const matches = await findMatches(user.phone_number);
      
      for (const match of matches) {
        // Create unique pair key to avoid duplicate matches
        const pairKey = [user.phone_number, match.phoneNumber].sort().join('-');
        
        if (matchedPairs.has(pairKey)) {
          continue; // Already matched this pair
        }
        
        // Check if match has calendar connected and enough points
        const matchUser = await getUser(match.phoneNumber);
        if (!matchUser || !matchUser.calendar_access_token || matchUser.points_balance < 100) {
          continue;
        }
        
        // Try to find common available time slots
        const commonTime = await findCommonTimeSlot(user.phone_number, match.phoneNumber);
        
        if (commonTime) {
          // Propose match via WhatsApp
          await proposeMatch(user.phone_number, match.phoneNumber, commonTime);
          matchedPairs.add(pairKey);
        }
      }
    }
    
    console.log('✅ Automatic matching completed');
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
    
    // Send proposal to user1
    await sendWhatsAppMessage(
      user1Phone,
      `🎯 Matching candidate found!\n\n` +
      `Partner: ${user2Phone}\n` +
      `Learning: ${user2.language_learning}\n` +
      `Teaching: ${user2.language_teaching}\n` +
      `Level: ${user2.level}\n` +
      `Trust Score: ${user2.trust_score}/100\n\n` +
      `Proposed Time: ${formattedTime}\n` +
      `Duration: 15 minutes\n\n` +
      `Would you like to confirm this match?\n` +
      `Please reply with "yes" or "no".\n\n` +
      `Note: Confirming requires 100 points.`
    );
    
    // Send proposal to user2
    await sendWhatsAppMessage(
      user2Phone,
      `🎯 Matching candidate found!\n\n` +
      `Partner: ${user1Phone}\n` +
      `Learning: ${user1.language_learning}\n` +
      `Teaching: ${user1.language_teaching}\n` +
      `Level: ${user1.level}\n` +
      `Trust Score: ${user1.trust_score}/100\n\n` +
      `Proposed Time: ${formattedTime}\n` +
      `Duration: 15 minutes\n\n` +
      `Would you like to confirm this match?\n` +
      `Please reply with "yes" or "no".\n\n` +
      `Note: Confirming requires 100 points.`
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

