import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

/**
 * Get user state
 */
export async function getUserState(phoneNumber) {
  try {
    const { data, error } = await supabase
      .from('user_states')
      .select('*')
      .eq('phone_number', phoneNumber)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = not found
      throw error;
    }
    
    return data || null;
  } catch (error) {
    console.error('Error getting user state:', error);
    throw error;
  }
}

/**
 * Update user state
 */
export async function updateUserState(phoneNumber, state) {
  try {
    const { data, error } = await supabase
      .from('user_states')
      .upsert({
        phone_number: phoneNumber,
        state: state,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'phone_number'
      });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating user state:', error);
    throw error;
  }
}

/**
 * Save user data (after registration)
 */
export async function saveUserData(phoneNumber, registrationData) {
  try {
    const { data, error } = await supabase
      .from('users')
      .upsert({
        phone_number: phoneNumber,
        language_learning: registrationData.language_learning,
        language_teaching: registrationData.language_teaching,
        level: registrationData.level,
        preferred_time: registrationData.preferred_time,
        gender: registrationData.gender || null,
        age_range: registrationData.age_range || null,
        video_call_ok: registrationData.video_call_ok === '1',
        points_balance: 0,
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
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('phone_number', phoneNumber)
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
  try {
    const { data, error } = await supabase
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
  try {
    const { data, error } = await supabase
      .from('users')
      .update({
        calendar_access_token: calendarData.access_token,
        calendar_refresh_token: calendarData.refresh_token,
        calendar_id: calendarData.calendar_id,
        calendar_expires_at: calendarData.expires_at,
        updated_at: new Date().toISOString()
      })
      .eq('phone_number', phoneNumber)
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
  try {
    // Get current user
    const user = await getUser(phoneNumber);
    if (!user) {
      throw new Error('User not found');
    }
    
    const newBalance = (user.points_balance || 0) + pointsDelta;
    
    const { data, error } = await supabase
      .from('users')
      .update({
        points_balance: newBalance,
        updated_at: new Date().toISOString()
      })
      .eq('phone_number', phoneNumber)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating user points:', error);
    throw error;
  }
}

