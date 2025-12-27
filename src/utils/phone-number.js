/**
 * Phone number normalization utilities
 * All phone numbers are stored in DB without 'whatsapp:' prefix
 * Format: +818051898924 (E.164 format)
 */

/**
 * Normalize phone number by removing 'whatsapp:' prefix
 * @param {string} phoneNumber - Phone number with or without 'whatsapp:' prefix
 * @returns {string} Normalized phone number without prefix
 */
export function normalizePhoneNumber(phoneNumber) {
  if (!phoneNumber) return phoneNumber;
  // Remove 'whatsapp:' prefix if present
  return phoneNumber.replace(/^whatsapp:/i, '');
}

/**
 * Add 'whatsapp:' prefix for Twilio API
 * @param {string} phoneNumber - Normalized phone number (without prefix)
 * @returns {string} Phone number with 'whatsapp:' prefix
 */
export function addWhatsAppPrefix(phoneNumber) {
  if (!phoneNumber) return phoneNumber;
  // Add prefix if not already present
  if (phoneNumber.startsWith('whatsapp:')) {
    return phoneNumber;
  }
  return `whatsapp:${phoneNumber}`;
}

/**
 * Ensure phone number is normalized (remove prefix if present)
 * Use this function whenever receiving phone numbers from external sources
 * @param {string} phoneNumber - Phone number from any source
 * @returns {string} Normalized phone number
 */
export function ensureNormalized(phoneNumber) {
  return normalizePhoneNumber(phoneNumber);
}

