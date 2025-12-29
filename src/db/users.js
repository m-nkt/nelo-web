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
 * Get user state
 */
export async function getUserState(phoneNumber) {
  checkDatabase();
  try {
    // Normalize phone number to ensure consistency
    const normalizedPhone = normalizePhoneNumber(phoneNumber);
    const { data, error } = await getSupabase()
      .from('user_states')
      .select('*')
      .eq('phone_number', normalizedPhone)
      .single();
    
    if (error) {
      // PGRST116 = not found (this is okay, user is new)
      if (error.code === 'PGRST116') {
        return null;
      }
      // PGRST205 = table doesn't exist (this is okay for new setups)
      if (error.code === 'PGRST205') {
        console.warn('⚠️ user_states table does not exist yet. User will be treated as new.');
        return null;
      }
      throw error;
    }
    
    return data || null;
  } catch (error) {
    console.error('Error getting user state:', error);
    // If table doesn't exist, return null (treat as new user)
    if (error.code === 'PGRST205') {
      return null;
    }
    throw error;
  }
}

/**
 * Update user state
 */
export async function updateUserState(phoneNumber, state) {
  checkDatabase();
  try {
    // Normalize phone number to ensure consistency
    const normalizedPhone = normalizePhoneNumber(phoneNumber);
    const { data, error } = await getSupabase()
      .from('user_states')
      .upsert({
        phone_number: normalizedPhone,
        state: state,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'phone_number'
      });
    
    if (error) {
      // PGRST205 = table doesn't exist (create it or skip)
      if (error.code === 'PGRST205') {
        console.warn('⚠️ user_states table does not exist. State will be stored in users table instead.');
        // Fallback: store state in users table
        await updateUser(phoneNumber, { state: state.step || 'registration' });
        return { phone_number: normalizedPhone, state: state };
      }
      throw error;
    }
    return data;
  } catch (error) {
    console.error('Error updating user state:', error);
    // If table doesn't exist, try to store in users table as fallback
    if (error.code === 'PGRST205') {
      try {
        await updateUser(phoneNumber, { state: state.step || 'registration' });
        return { phone_number: normalizePhoneNumber(phoneNumber), state: state };
      } catch (fallbackError) {
        console.error('Error in fallback state storage:', fallbackError);
      }
    }
    throw error;
  }
}

/**
 * Save user data (after registration)
 */
export async function saveUserData(phoneNumber, registrationData) {
  checkDatabase();
  try {
    // Normalize phone number to ensure consistency
    const normalizedPhone = normalizePhoneNumber(phoneNumber);
    const { data, error } = await getSupabase()
      .from('users')
      .upsert({
        phone_number: normalizedPhone,
        // New fields
        target_language: registrationData.target_language || registrationData.language_learning,
        native_language: registrationData.native_language || registrationData.language_teaching,
        user_level: registrationData.user_level || registrationData.level,
        interests: registrationData.interests || [],
        job_title: registrationData.job_title || null,
        matching_goal: registrationData.matching_goal || null,
        preferences: registrationData.preferences || {},
        // Legacy fields (for backward compatibility)
        language_learning: registrationData.target_language || registrationData.language_learning,
        language_teaching: registrationData.native_language || registrationData.language_teaching,
        level: registrationData.user_level || registrationData.level,
        preferred_time: registrationData.preferred_time || null,
        gender: registrationData.gender || (registrationData.preferences?.gender || null),
        age_range: registrationData.age_range || (registrationData.preferences?.age || null),
        video_call_ok: registrationData.video_call_ok === '1' || registrationData.video_call_ok === true,
        points_balance: registrationData.points_balance || 0,
        points: registrationData.points || registrationData.points_balance || 0,
        trust_score: 100,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'phone_number'
      });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error saving user data:', error);
    throw error;
  }
}

/**
 * Get user by phone number
 */
export async function getUser(phoneNumber) {
  checkDatabase();
  try {
    // Normalize phone number to ensure consistency
    const normalizedPhone = normalizePhoneNumber(phoneNumber);
    const { data, error } = await getSupabase()
      .from('users')
      .select('*')
      .eq('phone_number', normalizedPhone)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    
    return data || null;
  } catch (error) {
    console.error('Error getting user:', error);
    throw error;
  }
}

/**
 * Get all users
 */
export async function getAllUsers() {
  checkDatabase();
  try {
    const { data, error } = await getSupabase()
      .from('users')
      .select('*');
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting all users:', error);
    throw error;
  }
}

/**
 * Update user calendar credentials
 */
export async function updateUserCalendar(phoneNumber, calendarData) {
  checkDatabase();
  try {
    // Normalize phone number to ensure consistency
    const normalizedPhone = normalizePhoneNumber(phoneNumber);
    const { data, error } = await getSupabase()
      .from('users')
      .update({
        calendar_access_token: calendarData.access_token,
        calendar_refresh_token: calendarData.refresh_token,
        calendar_id: calendarData.calendar_id,
        calendar_expires_at: calendarData.expires_at,
        updated_at: new Date().toISOString()
      })
      .eq('phone_number', normalizedPhone)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating user calendar:', error);
    throw error;
  }
}

/**
 * Update user points
 */
export async function updateUserPoints(phoneNumber, pointsDelta) {
  checkDatabase();
  try {
    // Normalize phone number to ensure consistency
    const normalizedPhone = normalizePhoneNumber(phoneNumber);
    // Get current user
    const user = await getUser(normalizedPhone);
    if (!user) {
      throw new Error('User not found');
    }
    
    const newBalance = (user.points_balance || user.points || 0) + pointsDelta;
    
    const { data, error } = await getSupabase()
      .from('users')
      .update({
        points_balance: newBalance,
        points: newBalance, // Also update points column
        updated_at: new Date().toISOString()
      })
      .eq('phone_number', normalizedPhone)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating user points:', error);
    throw error;
  }
}

/**
 * Update user (generic update function)
 */
export async function updateUser(phoneNumber, updates) {
  checkDatabase();
  try {
    // Normalize phone number to ensure consistency
    const normalizedPhone = normalizePhoneNumber(phoneNumber);
    // Use upsert instead of update to handle cases where user doesn't exist yet
    const { data, error } = await getSupabase()
      .from('users')
      .upsert({
        phone_number: normalizedPhone,
        ...updates,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'phone_number'
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}

/**
 * Delete user data (for testing/reset)
 */
export async function deleteUserData(phoneNumber) {
  checkDatabase();
  try {
    // Normalize phone number to ensure consistency
    const normalizedPhone = normalizePhoneNumber(phoneNumber);
    
    // Delete from all related tables
    const supabase = getSupabase();
    
    // Delete message logs (ignore errors if table doesn't exist)
    try {
      await supabase
        .from('message_logs')
        .delete()
        .eq('phone_number', normalizedPhone);
    } catch (error) {
      console.warn('⚠️ Could not delete message_logs (table may not exist):', error.message);
    }
    
    // Delete user states (ignore errors if table doesn't exist)
    try {
      await supabase
        .from('user_states')
        .delete()
        .eq('phone_number', normalizedPhone);
    } catch (error) {
      console.warn('⚠️ Could not delete user_states (table may not exist):', error.message);
    }
    
    // Delete user (this is the most important one)
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('phone_number', normalizedPhone);
    
    if (error) {
      // If user doesn't exist, that's okay - consider it a success
      if (error.code === 'PGRST116') {
        console.log(`ℹ️ User ${normalizedPhone} doesn't exist (already deleted or never existed)`);
        return true;
      }
      throw error;
    }
    
    console.log(`✅ User data deleted for ${normalizedPhone}`);
    return true;
  } catch (error) {
    console.error('Error deleting user data:', error);
    throw error;
  }
}
