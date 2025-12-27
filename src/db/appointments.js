import { createClient } from '@supabase/supabase-js';
import '../config/env.js'; // Ensure environment variables are loaded
import { normalizePhoneNumber } from '../utils/phone-number.js';

// Lazy initialization: Get Supabase client dynamically
function getSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    return null;
  }
  
  return createClient(supabaseUrl, supabaseKey);
}

// Cache the client instance
let supabase = null;

/**
 * Get or create Supabase client
 */
function getSupabase() {
  // Always check environment variables fresh (in case they were loaded later)
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY;
  
  // If we have a cached client but env vars are missing, clear cache
  if (supabase && (!supabaseUrl || !supabaseKey)) {
    supabase = null;
  }
  
  // If we don't have a client or env vars changed, create new one
  if (!supabase && supabaseUrl && supabaseKey) {
    supabase = getSupabaseClient();
  }
  
  return supabase;
}

/**
 * Check if database is configured
 */
function checkDatabase() {
  const client = getSupabase();
  if (!client) {
    throw new Error('Database is not configured');
  }
}

/**
 * Create appointment record
 */
export async function createAppointmentRecord(appointmentData) {
  checkDatabase();
  try {
    // Normalize phone numbers to ensure consistency
    const user1Phone = normalizePhoneNumber(appointmentData.user1_phone);
    const user2Phone = normalizePhoneNumber(appointmentData.user2_phone);
    const { data, error } = await getSupabase()
      .from('appointments')
      .insert({
        user1_phone: user1Phone,
        user2_phone: user2Phone,
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
    // Normalize phone number to ensure consistency
    const normalizedPhone = phoneNumber ? normalizePhoneNumber(phoneNumber) : null;
    let query = getSupabase()
      .from('appointments')
      .select('*');
    
    if (normalizedPhone) {
      query = query.or(`user1_phone.eq.${normalizedPhone},user2_phone.eq.${normalizedPhone}`);
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
    const { data, error } = await getSupabase()
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

