/**
 * Hybrid registration flow definition
 * Step A: Name collection (template)
 * Step B: Four questions at once (template)
 * Step C: Gemini extraction (AI)
 * Step D: Confirmation & warnings (template)
 */

export function getRegistrationFlow() {
  return {
    // Step A: Get name
    nameQuestion: 'Hello! Welcome to SuperMatch 🎉\n\nFirst, could you please tell me your name?',
    
    // Step B: Four questions split into 2 messages (after name is collected)
    fourQuestions: (name) => {
      return [
        `Love that name, ${name}! ✨ To find your perfect match, I have 4 quick questions for you:`,
        `1. Which language do you want to talk in? 🗣️\n` +
        `2. What is your level in that language? (Beginner, Intermediate, or Advanced)\n` +
        `3. What is your native language? 🌏\n` +
        `4. Tell us about yourself! (Your hobbies, job, or why you're here) 🎨\n\n` +
        `Feel free to answer all at once! The more you tell us, the better the match!`
      ];
    },
    
    // Step C: Gemini extraction (AI) - triggered after four questions
    geminiExtractionPrompt: `Extract the following information from the user's response to the 4 questions. Even if the response is brief, infer as much as possible:

1. Target language (target_language): Which language they want to practice/talk in
2. User level (user_level): Their level in the TARGET LANGUAGE. Must be one of: Beginner, Intermediate, Advanced, or Native
3. Native language (native_language): Their native language (the language they speak fluently)
4. Interests (interests): Extract hobbies, interests, or activities mentioned (as an array of strings)
5. Job title (job_title): Extract their job title or profession if mentioned (as a string, or null)
6. Matching goal (matching_goal): Extract why they're here - business, travel, casual conversation, etc. (as a string)
7. Preferences (preferences): A JSON object with any mentioned preferences:
   - gender: "Male", "Female", "Either", or null
   - age: age range string or null
   - business_focused: true if mentioned, false otherwise
   - native_speakers_only: true if mentioned, false otherwise
   - other: any other preferences mentioned

IMPORTANT: 
- user_level must be their proficiency in the TARGET LANGUAGE (the language they want to practice)
- Extract all information even from brief responses
- If information is missing, use reasonable defaults (e.g., "Intermediate" for level, "English" for native if not specified)
- interests should be an array, even if empty: []

Respond ONLY with valid JSON, no additional text:
{
  "target_language": "language name",
  "user_level": "Beginner/Intermediate/Advanced/Native",
  "native_language": "language name",
  "interests": ["hobby1", "hobby2"],
  "job_title": "job title or null",
  "matching_goal": "why they're here",
  "preferences": {
    "gender": "Male/Female/Either/null",
    "age": "age range or null",
    "business_focused": true/false,
    "native_speakers_only": true/false
  }
}

User's response: `,
    
    // Step D: Confirmation and calendar prompt
    confirmation: (nativeLanguage, targetLanguage) => {
      return `Got it! You're all set. 100pt/session. To start matching, please connect your Google Calendar so we can find a time that works for you!`;
    },
    
    calendarLink: (phoneNumber) => {
      return `${process.env.APP_BASE_URL || 'http://localhost:3000'}/api/calendar/connect?phone=${phoneNumber}`;
    },
    
    // Phase 2: Optional voice message prompt
    voicePrompt: (targetLanguage) => {
      return `✨ Bonus: If you're up for it, send me a 1-minute voice message in ${targetLanguage} about your day! I can analyze your pronunciation to find you an even better partner.`;
    },
    
    noShowWarning: `⚠️ Important: No-shows or cancellations may result in points being forfeited or being blacklisted.`,
    
    // Final completion message
    completionMessage: (phoneNumber) => {
      return `Registration completed! 🎉\n\n` +
        `To connect your Google Calendar, please click the link below:\n` +
        `${process.env.APP_BASE_URL || 'http://localhost:3000'}/api/calendar/connect?phone=${phoneNumber}\n\n` +
        `To start matching, type "match".`;
    }
  };
}
