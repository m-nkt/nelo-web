import { createClient } from '@supabase/supabase-js';

// Create Supabase client only if URL is provided
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY;

const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null;

/**
 * Create appointment record
 */
export async function createAppointmentRecord(appointmentData) {
  checkDatabase();
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
 * If phoneNumber is null, returns all appointments
 */
export async function getUserAppointments(phoneNumber) {
  checkDatabase();
  try {
    let query = supabase
      .from('appointments')
      .select('*');
    
    if (phoneNumber) {
      query = query.or(`user1_phone.eq.${phoneNumber},user2_phone.eq.${phoneNumber}`);
    }
    
    query = query.order('scheduled_at', { ascending: true });
    
    const { data, error } = await query;
    
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
  checkDatabase();
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

