/**
 * Validation utilities
 */

/**
 * Validate phone number format
 */
export function validatePhoneNumber(phone) {
  // Remove non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Check if it's a valid phone number (at least 10 digits)
  if (cleaned.length < 10) {
    return false;
  }
  
  return true;
}

/**
 * Validate email format
 */
export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate date format
 */
export function validateDate(dateString) {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

/**
 * Validate language code
 */
export function validateLanguage(language) {
  const validLanguages = [
    '英語', '日本語', '中国語', 'スペイン語', 'フランス語',
    'ドイツ語', 'イタリア語', 'ポルトガル語', 'ロシア語', '韓国語'
  ];
  
  return validLanguages.includes(language);
}

/**
 * Sanitize user input
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') {
    return input;
  }
  
  // Remove potentially dangerous characters
  return input
    .trim()
    .replace(/[<>]/g, '')
    .substring(0, 1000); // Limit length
}

