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
    const formattedTime = appointmentTime.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    const message = `🔔 Reminder\n\n` +
      `You have an appointment tomorrow at ${formattedTime}.\n\n` +
      `Partner: ${appointment.user1_phone === appointment.user1_phone ? appointment.user2_phone : appointment.user1_phone}\n` +
      `Duration: ${appointment.duration_minutes} minutes\n` +
      `Google Meet: ${appointment.google_meet_link}\n\n` +
      `Please join via the Meet link when it's time.\n` +
      `Enjoy your conversation!`;
    
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
    const formattedTime = appointmentTime.toLocaleString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
    
    const message = `⏰ 1 Hour Reminder\n\n` +
      `You have an appointment at ${formattedTime}.\n\n` +
      `Google Meet: ${appointment.google_meet_link}\n\n` +
      `Are you ready?\n` +
      `Please join via the Meet link when it's time!`;
    
    // Send to both users
    await sendWhatsAppMessage(appointment.user1_phone, message);
    await sendWhatsAppMessage(appointment.user2_phone, message);
    
    console.log(`✅ 1-hour reminder sent for appointment ${appointment.id}`);
  } catch (error) {
    console.error('Error sending 1-hour reminder:', error);
  }
}

/**
 * Auto-cancel appointments with no response within 24 hours before start time
 * 仕様: 開始24時間前までに「OK」の返信がない場合は自動キャンセル
 */
export async function autoCancelNoResponse() {
  try {
    console.log('🔄 Checking for appointments with no response (24 hours before start)...');
    
    const now = new Date();
    const oneDayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    
    // Get all confirmed appointments
    const allAppointments = await getUserAppointments(null);
    
    for (const appointment of allAppointments) {
      if (appointment.status !== 'confirmed') {
        continue;
      }
      
      const scheduledAt = new Date(appointment.scheduled_at);
      
      // Check if appointment is within 24 hours and no confirmation received
      // For now, we check if it's exactly 24 hours before (with 1 hour window)
      const timeUntilAppointment = scheduledAt.getTime() - now.getTime();
      const hoursUntilAppointment = timeUntilAppointment / (1000 * 60 * 60);
      
      // If appointment is between 23-25 hours away and no confirmation flag
      // (In a real implementation, you'd check a confirmation_received flag)
      if (hoursUntilAppointment > 23 && hoursUntilAppointment < 25) {
        // Check if user confirmed (you'd need to add a confirmation_received field)
        // For now, we'll check if reminder was sent but no response
        if (!appointment.confirmation_received) {
          await cancelAppointmentNoResponse(appointment);
        }
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
    const message = `❌ Appointment Auto-Cancelled\n\n` +
      `The appointment was automatically cancelled because there was no response within 24 hours.\n` +
      `Your points have been refunded.\n\n` +
      `If you would like to match again, please let us know.`;
    
    await sendWhatsAppMessage(appointment.user1_phone, message);
    await sendWhatsAppMessage(appointment.user2_phone, message);
    
    console.log(`✅ Auto-cancelled appointment ${appointment.id}`);
  } catch (error) {
    console.error('Error cancelling appointment:', error);
  }
}

