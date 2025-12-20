import { getUserAppointments, updateAppointmentStatus } from '../db/appointments.js';
import { sendWhatsAppMessage } from '../utils/twilio.js';
import { updateUserPoints } from '../db/users.js';

/**
 * Send reminders for upcoming appointments
 */
export async function sendReminders() {
  try {
    console.log('🔔 Starting reminder process...');
    
    const now = new Date();
    const oneDayLater = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour
    
    // Get all confirmed appointments
    const allAppointments = await getUserAppointments(null); // Get all appointments
    
    for (const appointment of allAppointments) {
      if (appointment.status !== 'confirmed') {
        continue;
      }
      
      const appointmentTime = new Date(appointment.scheduled_at);
      
      // Check if reminder should be sent (24 hours before)
      const timeUntilAppointment = appointmentTime.getTime() - now.getTime();
      const hoursUntilAppointment = timeUntilAppointment / (1000 * 60 * 60);
      
      // Send 24-hour reminder
      if (hoursUntilAppointment > 23 && hoursUntilAppointment < 25 && !appointment.reminder_24h_sent) {
        await send24HourReminder(appointment);
      }
      
      // Send 1-hour reminder
      if (hoursUntilAppointment > 0.9 && hoursUntilAppointment < 1.1 && !appointment.reminder_1h_sent) {
        await send1HourReminder(appointment);
      }
    }
    
    console.log('✅ Reminder process completed');
  } catch (error) {
    console.error('❌ Error in reminder process:', error);
  }
}

/**
 * Send 24-hour reminder
 */
async function send24HourReminder(appointment) {
  try {
    const appointmentTime = new Date(appointment.scheduled_at);
    const formattedTime = appointmentTime.toLocaleString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    const message = `🔔 リマインド\n\n` +
      `明日の${formattedTime}にアポイントメントがあります。\n\n` +
      `相手: ${appointment.user1_phone === appointment.user1_phone ? appointment.user2_phone : appointment.user1_phone}\n` +
      `時間: ${appointment.duration_minutes}分\n` +
      `Google Meet: ${appointment.google_meet_link}\n\n` +
      `お時間になりましたら、Meetリンクから参加してください。\n` +
      `楽しんでください！`;
    
    // Send to both users
    await sendWhatsAppMessage(appointment.user1_phone, message);
    await sendWhatsAppMessage(appointment.user2_phone, message);
    
    // Mark reminder as sent (you'll need to add these fields to the appointments table)
    // For now, we'll just log it
    console.log(`✅ 24-hour reminder sent for appointment ${appointment.id}`);
  } catch (error) {
    console.error('Error sending 24-hour reminder:', error);
  }
}

/**
 * Send 1-hour reminder
 */
async function send1HourReminder(appointment) {
  try {
    const appointmentTime = new Date(appointment.scheduled_at);
    const formattedTime = appointmentTime.toLocaleString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit'
    });
    
    const message = `⏰ 1時間前リマインド\n\n` +
      `${formattedTime}にアポイントメントがあります。\n\n` +
      `Google Meet: ${appointment.google_meet_link}\n\n` +
      `準備はできていますか？\n` +
      `お時間になりましたら、Meetリンクから参加してください！`;
    
    // Send to both users
    await sendWhatsAppMessage(appointment.user1_phone, message);
    await sendWhatsAppMessage(appointment.user2_phone, message);
    
    console.log(`✅ 1-hour reminder sent for appointment ${appointment.id}`);
  } catch (error) {
    console.error('Error sending 1-hour reminder:', error);
  }
}

/**
 * Auto-cancel appointments with no response within 24 hours
 */
export async function autoCancelNoResponse() {
  try {
    console.log('🔄 Checking for appointments with no response...');
    
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    // Get all pending appointments created more than 24 hours ago
    const allAppointments = await getUserAppointments(null);
    
    for (const appointment of allAppointments) {
      if (appointment.status !== 'pending') {
        continue;
      }
      
      const createdAt = new Date(appointment.created_at);
      
      if (createdAt < oneDayAgo) {
        // Auto-cancel and refund points
        await cancelAppointmentNoResponse(appointment);
      }
    }
    
    console.log('✅ Auto-cancel check completed');
  } catch (error) {
    console.error('❌ Error in auto-cancel process:', error);
  }
}

/**
 * Cancel appointment due to no response
 */
async function cancelAppointmentNoResponse(appointment) {
  try {
    // Update status
    await updateAppointmentStatus(appointment.id, 'cancelled');
    
    // Refund points
    await updateUserPoints(appointment.user1_phone, appointment.points_used);
    await updateUserPoints(appointment.user2_phone, appointment.points_used);
    
    // Notify users
    const message = `❌ アポイントメントが自動キャンセルされました\n\n` +
      `24時間以内に反応がなかったため、自動的にキャンセルされました。\n` +
      `ポイントは返却されました。\n\n` +
      `再度マッチングを希望する場合は、お知らせください。`;
    
    await sendWhatsAppMessage(appointment.user1_phone, message);
    await sendWhatsAppMessage(appointment.user2_phone, message);
    
    console.log(`✅ Auto-cancelled appointment ${appointment.id}`);
  } catch (error) {
    console.error('Error cancelling appointment:', error);
  }
}

