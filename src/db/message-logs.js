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
  if (!supabase) {
    throw new Error('Database is not configured');
  }
}

/**
 * Log a message
 */
export async function logMessage(phoneNumber, messageText, aiUsed = false) {
  const client = getSupabase();
  if (!client) {
    // If database is not configured, just return (silent fail for rate limiting)
    return null;
  }
  
  try {
    // Normalize phone number to ensure consistency
    const normalizedPhone = normalizePhoneNumber(phoneNumber);
    const { data, error } = await client
      .from('message_logs')
      .insert({
        phone_number: normalizedPhone,
        message_text: messageText,
        ai_used: aiUsed,
        created_at: new Date().toISOString()
      });
    
    if (error) {
      console.error('Error logging message:', error);
    }
    
    return data;
  } catch (error) {
    console.error('Error logging message:', error);
    return null;
  }
}

/**
 * Get message count for a user today
 */
export async function getTodayMessageCount(phoneNumber) {
  const client = getSupabase();
  if (!client) {
    // If database is not configured, return 0 (allow messages)
    return 0;
  }
  
  try {
    // Normalize phone number to ensure consistency
    const normalizedPhone = normalizePhoneNumber(phoneNumber);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();
    
    const { count, error } = await client
      .from('message_logs')
      .select('*', { count: 'exact', head: true })
      .eq('phone_number', normalizedPhone)
      .gte('created_at', todayISO);
    
    if (error) {
      console.error('Error getting message count:', error);
      return 0; // Allow messages if error
    }
    
    return count || 0;
  } catch (error) {
    console.error('Error getting message count:', error);
    return 0; // Allow messages if error
  }
}

/**
 * Check if user has exceeded daily message limit
 */
export async function hasExceededDailyLimit(phoneNumber, limit = 10) {
  const count = await getTodayMessageCount(phoneNumber);
  return count >= limit;
}

/**
 * Get today's AI usage count for a user
 */
export async function getTodayAICount(phoneNumber) {
  const client = getSupabase();
  if (!client) {
    return 0;
  }
  
  try {
    // Normalize phone number to ensure consistency
    const normalizedPhone = normalizePhoneNumber(phoneNumber);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();
    
    const { count, error } = await client
      .from('message_logs')
      .select('*', { count: 'exact', head: true })
      .eq('phone_number', normalizedPhone)
      .eq('ai_used', true)
      .gte('created_at', todayISO);
    
    if (error) {
      console.error('Error getting AI count:', error);
      return 0;
    }
    
    return count || 0;
  } catch (error) {
    console.error('Error getting AI count:', error);
    return 0;
  }
}

/**
 * Increment AI count for a user (update daily_chat_count in users table)
 */
export async function incrementAICount(phoneNumber) {
  const client = getSupabase();
  if (!client) {
    return;
  }
  
  try {
    // Normalize phone number to ensure consistency
    const normalizedPhone = normalizePhoneNumber(phoneNumber);
    // Get current user
    const { data: user, error: userError } = await client
      .from('users')
      .select('daily_chat_count')
      .eq('phone_number', normalizedPhone)
      .single();
    
    if (userError && userError.code !== 'PGRST116') {
      console.error('Error getting user for AI count:', userError);
      return;
    }
    
    const currentCount = user?.daily_chat_count || 0;
    const today = new Date();
    const lastUpdate = user?.updated_at ? new Date(user.updated_at) : null;
    
    // Reset count if it's a new day
    let newCount = currentCount;
    if (!lastUpdate || lastUpdate.toDateString() !== today.toDateString()) {
      newCount = 1;
    } else {
      newCount = currentCount + 1;
    }
    
    // Update daily_chat_count
    const { error: updateError } = await client
      .from('users')
      .update({
        daily_chat_count: newCount,
        updated_at: new Date().toISOString()
      })
      .eq('phone_number', normalizedPhone);
    
    if (updateError) {
      console.error('Error updating AI count:', updateError);
    }
  } catch (error) {
    console.error('Error incrementing AI count:', error);
  }
}

