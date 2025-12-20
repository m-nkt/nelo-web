import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

/**
 * Create appointment record
 */
export async function createAppointmentRecord(appointmentData) {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .insert({
        user1_phone: appointmentData.user1_phone,
        user2_phone: appointmentData.user2_phone,
        scheduled_at: appointmentData.scheduled_at,
        duration_minutes: appointmentData.duration_minutes,
        google_meet_link: appointmentData.google_meet_link,
        points_used: appointmentData.points_used,
        status: appointmentData.status || 'pending',
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating appointment:', error);
    throw error;
  }
}

/**
 * Get appointments for a user
 */
export async function getUserAppointments(phoneNumber) {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .or(`user1_phone.eq.${phoneNumber},user2_phone.eq.${phoneNumber}`)
      .order('scheduled_at', { ascending: true });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting user appointments:', error);
    throw error;
  }
}

/**
 * Update appointment status
 */
export async function updateAppointmentStatus(appointmentId, status) {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', appointmentId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating appointment status:', error);
    throw error;
  }
}

