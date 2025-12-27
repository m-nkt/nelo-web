# Phone Number Normalization

## Overview

All phone numbers in the system are normalized to remove the `whatsapp:` prefix before storing in the database. This ensures consistency across all database operations.

## Format

- **Database format**: `+818051898924` (E.164 format, no prefix)
- **Twilio API format**: `whatsapp:+818051898924` (with prefix)

## Implementation

### Utility Functions (`src/utils/phone-number.js`)

- `normalizePhoneNumber(phoneNumber)` - Removes `whatsapp:` prefix
- `addWhatsAppPrefix(phoneNumber)` - Adds `whatsapp:` prefix for Twilio API
- `ensureNormalized(phoneNumber)` - Ensures phone number is normalized

### Normalization Points

1. **Input (Twilio webhook)**: `src/services/whatsapp.js`
   - Normalizes phone number when receiving messages from Twilio

2. **Database operations**: All functions in `src/db/` normalize phone numbers:
   - `getUser()`
   - `updateUser()`
   - `saveUserData()`
   - `getUserState()`
   - `updateUserState()`
   - `logMessage()`
   - `getTodayMessageCount()`
   - `getTodayAICount()`
   - `incrementAICount()`
   - `getUserAppointments()`
   - `createAppointmentRecord()`

3. **Output (Twilio API)**: `src/utils/twilio.js`
   - Adds `whatsapp:` prefix when sending messages via Twilio

## Benefits

- **Consistency**: All phone numbers in the database use the same format
- **Reliability**: `getUser()` and other queries will always find the correct user
- **Maintainability**: Single source of truth for phone number format

## Migration

If you have existing data with `whatsapp:` prefix in the database, run this SQL:

```sql
-- Remove whatsapp: prefix from all phone numbers
UPDATE users SET phone_number = REPLACE(phone_number, 'whatsapp:', '') WHERE phone_number LIKE 'whatsapp:%';
UPDATE user_states SET phone_number = REPLACE(phone_number, 'whatsapp:', '') WHERE phone_number LIKE 'whatsapp:%';
UPDATE message_logs SET phone_number = REPLACE(phone_number, 'whatsapp:', '') WHERE phone_number LIKE 'whatsapp:%';
UPDATE appointments SET user1_phone = REPLACE(user1_phone, 'whatsapp:', '') WHERE user1_phone LIKE 'whatsapp:%';
UPDATE appointments SET user2_phone = REPLACE(user2_phone, 'whatsapp:', '') WHERE user2_phone LIKE 'whatsapp:%';
```

