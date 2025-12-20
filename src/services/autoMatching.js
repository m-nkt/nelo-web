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
    
    const formattedTime = new Date(suggestedTime).toLocaleString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    // Send proposal to user1
    await sendWhatsAppMessage(
      user1Phone,
      `🎯 マッチング候補が見つかりました！\n\n` +
      `相手: ${user2Phone}\n` +
      `学びたい言語: ${user2.language_learning}\n` +
      `教えられる言語: ${user2.language_teaching}\n` +
      `レベル: ${user2.level}\n` +
      `信頼度スコア: ${user2.trust_score}/100\n\n` +
      `提案日時: ${formattedTime}\n` +
      `時間: 15分\n\n` +
      `このマッチングを確定しますか？\n` +
      `「はい」または「いいえ」で返信してください。\n\n` +
      `※ 確定には100ポイント必要です。`
    );
    
    // Send proposal to user2
    await sendWhatsAppMessage(
      user2Phone,
      `🎯 マッチング候補が見つかりました！\n\n` +
      `相手: ${user1Phone}\n` +
      `学びたい言語: ${user1.language_learning}\n` +
      `教えられる言語: ${user1.language_teaching}\n` +
      `レベル: ${user1.level}\n` +
      `信頼度スコア: ${user1.trust_score}/100\n\n` +
      `提案日時: ${formattedTime}\n` +
      `時間: 15分\n\n` +
      `このマッチングを確定しますか？\n` +
      `「はい」または「いいえ」で返信してください。\n\n` +
      `※ 確定には100ポイント必要です。`
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
    if (response.toLowerCase().includes('はい') || response.toLowerCase().includes('yes')) {
      // Both users need to accept - for now, we'll create a pending appointment
      // In a full implementation, you'd check if both users accepted
      const user = await getUser(phoneNumber);
      const otherUser = await getUser(otherUserPhone);
      
      if (!user || !otherUser) {
        return 'エラー: ユーザーが見つかりません。';
      }
      
      if (user.points_balance < 100 || otherUser.points_balance < 100) {
        return 'ポイントが不足しています。ポイントを購入してから再度お試しください。';
      }
      
      // Create appointment (you may want to make this async and wait for both confirmations)
      // For now, we'll just send a confirmation
      await sendWhatsAppMessage(
        phoneNumber,
        `✅ マッチング提案を受け付けました！\n\n` +
        `相手の確認を待っています。\n` +
        `両方が承認すると、アポイントメントが確定します。`
      );
      
      return 'マッチング提案を受け付けました。相手の確認を待っています。';
    } else {
      return 'マッチング提案をキャンセルしました。';
    }
  } catch (error) {
    console.error('Error handling match proposal response:', error);
    return 'エラーが発生しました。';
  }
}

