-- Reset user data for testing
-- Replace '+818051898924' with your phone number

-- Delete all user-related data
DELETE FROM message_logs WHERE phone_number = '+818051898924';
DELETE FROM user_states WHERE phone_number = '+818051898924';
DELETE FROM users WHERE phone_number = '+818051898924';

-- Verify deletion (should return 0 rows)
SELECT COUNT(*) as remaining_users FROM users WHERE phone_number = '+818051898924';
SELECT COUNT(*) as remaining_states FROM user_states WHERE phone_number = '+818051898924';
SELECT COUNT(*) as remaining_logs FROM message_logs WHERE phone_number = '+818051898924';

