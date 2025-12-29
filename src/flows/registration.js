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
    nameQuestion: 'Hey! Welcome to Nelo. I\'m here to help you make new friends through language! What\'s your name? 😊',
    
    // Step B: Four questions in separate bubbles for natural chat rhythm
    nameReaction: (name) => {
      // Generate a warm, natural reaction to the name
      const reactions = [
        `Nice to meet you, ${name}! 😊`,
        `${name}! Love that name. 😊`,
        `Hey ${name}! So glad you're here! ✨`,
        `${name}! Awesome name. Let's find you someone great! 🎉`
      ];
      return reactions[Math.floor(Math.random() * reactions.length)];
    },
    
    fourQuestions: () => {
      // Return as array for separate bubbles
      return [
        `Quick question! I just need a few things to find your perfect match. You ready? 😊`,
        `1. Which language do you want to practice? 🗣️\n` +
        `2. What's your level? (Beginner, Intermediate, or Advanced)\n` +
        `3. What's your native language? 🌏\n` +
        `4. Who do you want to meet? 🤝 (like interests, age, or just someone who's into the same stuff)\n\n` +
        `You can answer all at once! The more you tell me, the better I can match you!`
      ];
    },
    
    // Step C: Gemini extraction (AI) - triggered after four questions
    geminiExtractionPrompt: `IMPORTANT CONTEXT: 
1. During initial registration, if a user sends a single word (like "masa", "john", "sarah"), treat it as their NAME, not as an answer to the questions below.
2. When asking for free times, provide natural, human-like examples like "Free on weekdays 18:00-21:00 in New York time" or "Weekends all day JST".

Extract the following information from the user's response to the 4 questions. Even if the response is brief, infer as much as possible:

1. Target language (target_language): Which language they want to practice/talk in
2. User level (user_level): Their level in the TARGET LANGUAGE. Must be one of: Beginner, Intermediate, Advanced, or Native
3. Native language (native_language): Their native language (the language they speak fluently)
4. Interests (interests): Extract hobbies, interests, or activities mentioned (as an array of strings). Look for keywords like "surfing", "music", "cooking", etc.
5. Job title (job_title): Extract their job title or profession if mentioned (as a string, or null)
6. Matching goal (matching_goal): Extract why they're here - business, travel, casual conversation, etc. (as a string)
7. Preferences (preferences): A JSON object with partner preferences from question 4:
   - gender: "Male", "Female", "Either", or null (look for keywords like "female", "male", "woman", "man")
   - age: age range string or null (e.g., "20-30", "30s", "young", "middle-aged")
   - business_focused: true if mentioned keywords like "business", "professional", "work", false otherwise
   - native_speakers_only: true if mentioned keywords like "native", "native speaker", "fluent", false otherwise
   - interests_match: Extract any specific interests/hobbies they want in a partner (as an array, e.g., ["surfing", "music"])
   - other: any other preferences mentioned

IMPORTANT: 
- user_level must be their proficiency in the TARGET LANGUAGE (the language they want to practice)
- Extract all information even from brief responses
- For question 4, focus on PARTNER PREFERENCES (who they want to meet), not their own profile
- Look for keywords: "business", "native", "female/male", "surfing", "music", age ranges, etc.
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
    "native_speakers_only": true/false,
    "interests_match": ["interest1", "interest2"]
  }
}

User's response: `,
    
    // Step D: Unified final response (confirmation + calendar link + manual time entry)
    confirmation: (nativeLanguage, targetLanguage) => {
      return `Got it! I am looking for someone who speaks ${targetLanguage}.`;
    },
    
    // Unified final message with calendar link and manual time entry option
    finalRegistrationMessage: (phoneNumber, targetLanguage) => {
      const baseUrl = 'https://nelo.so';
      const link = `${baseUrl}/api/calendar/connect?phone=${encodeURIComponent(phoneNumber)}`;
      return `Got it! I am looking for someone who speaks ${targetLanguage}.\n\n` +
        `Got it! I'm already thinking of some great people for you. 🔍🤝\n\nTo make sure I only suggest times when you're actually free, could you quickly sync your Google Calendar? It only takes 10 seconds! 😊🙌\n\n📅 Connect your Google Calendar here:\n${link}\n\nOr just let me know when you're usually free! (like 'weekends' or 'after 7pm') 😊`;
    },
    
    // Calendar connection link message (casual, friendly tone)
    calendarLinkMessage: (phoneNumber) => {
      // Use BASE_URL, APP_URL, or APP_BASE_URL (in that order), fallback to nelo.so
      const baseUrl = 'https://nelo.so';
      const link = `${baseUrl}/api/calendar/connect?phone=${encodeURIComponent(phoneNumber)}`;
      // Link on new line to trigger WhatsApp link preview
      return `Got it! I'm already thinking of some great people for you. 🔍🤝\n\nTo make sure I only suggest times when you're actually free, could you quickly sync your Google Calendar? It only takes 10 seconds! 😊🙌\n\n📅 Connect your Google Calendar here:\n${link}\n\nOr just let me know when you're usually free! (like 'weekends' or 'after 7pm') 😊`;
    },
    
    // Calendar connected confirmation
    calendarConnectedMessage: () => {
      return `✅ Calendar synced! Great! Now let's get to know you better. 😊`;
    },
    
    // Lifestyle questions after calendar sync
    lifestyleQuestions: () => {
      return [
        `To find your perfect partner, I need to know your rhythm! 🕒`,
        `- Are you mostly free on weekdays (day/night?) or weekends?\n- If I find a great match in the US/Europe, are you okay with a late-night or early-morning 15-min chat? 🌎`,
        `All sessions are 15 minutes! It's short, fun, and easy to fit in your day. ⚡`,
        `Tell me more about yourself and who you want to meet. (Age range, gender preference, or just the vibe like 'business-minded' or 'chill'). The more you tell me, the better the match! 😊`
      ];
    },
    
    calendarLink: (phoneNumber) => {
      const baseUrl = 'https://nelo.so';
      return `${baseUrl}/api/calendar/connect?phone=${phoneNumber}`;
    },
    
    // Phase 2: Optional voice message prompt
    voicePrompt: (targetLanguage) => {
      return `✨ Bonus: Send me a 1-minute voice message in ${targetLanguage} about your day! I can check how you talk to find a better person for you.`;
    },
    
    noShowWarning: `⚠️ Important: If you do not come, you can lose points or be blocked.`,
    
    // Final completion message
        completionMessage: (phoneNumber) => {
          const baseUrl = 'https://nelo.so';
          const link = `${baseUrl}/api/calendar/connect?phone=${phoneNumber}`;
          return `Done! 🎉\n\n` +
            `Got it! I'm already thinking of some great people for you. 🔍🤝\n\nTo make sure I only suggest times when you're actually free, could you quickly sync your Google Calendar? It only takes 10 seconds! 😊🙌\n\n📅 Connect your Google Calendar here:\n${link}\n\nOr just let me know when you're usually free! (like 'weekends' or 'after 7pm') 😊\n\nTo find people, type "match".`;
        }
  };
}
