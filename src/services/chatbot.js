import { GoogleGenerativeAI } from '@google/generative-ai';
import { getUserState, updateUserState, saveUserData, getUser, updateUser, deleteUserData } from '../db/users.js';
import { getRegistrationFlow } from '../flows/registration.js';
import { logMessage, hasExceededDailyLimit, getTodayAICount, incrementAICount } from '../db/message-logs.js';
import { sendWhatsAppMessage } from '../utils/twilio.js';
import { sendMultipleMessages, sendWithFollowUps, sendConsolidatedMessage, consolidateMessages } from '../utils/message-sender.js';

// Initialize Gemini only if API key is provided
const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

// Get Gemini model (1.5 Flash - better free tier limits)
const getGeminiModel = () => {
  if (!genAI) return null;
  try {
    return genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  } catch (error) {
    console.error('Gemini model initialization failed:', error);
    return null;
  }
};

// Get Gemini model with fallback
const getGeminiModelWithFallback = () => {
  if (!genAI) return null;
  try {
    return genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  } catch (error) {
    console.error('Gemini model initialization failed:', error);
    return null;
  }
};

/**
 * Check if message is a greeting or registration request
 */
function isGreetingOrRegistration(message) {
  const lowerMessage = message.toLowerCase().trim();
  const greetings = [
    'hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening',
    'nice to meet you', 'pleased to meet you'
  ];
  const registration = [
    'register', 'signup', 'sign up', 'start', 'join', 'begin'
  ];

  return greetings.some(g => lowerMessage.includes(g)) ||
    registration.some(r => lowerMessage.includes(r));
}

/**
 * Get greeting response (no AI call) - Step A
 */
function getGreetingResponse() {
  const flow = getRegistrationFlow();
  return flow.nameQuestion;
}

/**
 * Process user message with hybrid chatbot flow
 */
export async function processUserMessage(phoneNumber, message) {
  try {
    // Handle superreset command FIRST (before any other processing)
    const lowerMessage = message.toLowerCase().trim();
    if (lowerMessage === 'superreset' || lowerMessage === 'reset') {
      console.log('🔄 Processing superreset command for:', phoneNumber);

      try {
        // Delete all user data (user_states, users table fields, message_logs)
        await deleteUserData(phoneNumber);
        console.log('✅ User data deleted successfully');

        // Send confirmation message
        await sendWhatsAppMessage(phoneNumber, 'All data reset! Send \'hi\' to start over. ✨');

        // CRITICAL: Return empty string to prevent any further processing
        // This ensures the message doesn't fall through to handleRegistrationFlow
        return '';
      } catch (resetError) {
        console.error('❌ Error during superreset:', resetError);
        await sendWhatsAppMessage(phoneNumber, 'Error resetting data. Please try again later.');
        return '';
      }
    }

    // Log message (without AI usage flag yet) - don't fail if logging fails
    try {
      await logMessage(phoneNumber, message, false);
    } catch (logError) {
      console.warn('⚠️ Failed to log message (continuing anyway):', logError);
    }

    // Get user's current state from DB
    let user = await getUser(phoneNumber);
    let userState = await getUserState(phoneNumber);

    // Debug logging
    console.log('📱 Processing message:', {
      phoneNumber,
      message,
      userState: userState?.state,
      userStateFull: userState,
      user: user
    });

    const currentState = user?.state || (userState?.state?.step || 'new');

    console.log('🔍 Current state:', currentState, 'userState exists:', !!userState);

    // Step A: New user - greeting/registration (template, no AI)
    if (currentState === 'new' || !userState) {
      console.log('✅ New user detected, checking greeting...');
      if (isGreetingOrRegistration(message)) {
        console.log('✅ Greeting detected, returning greeting response');
        // Don't log again - already logged above
        const greetingResponse = getGreetingResponse();
        // Send greeting and return empty to prevent double messaging
        await sendWhatsAppMessage(phoneNumber, greetingResponse);
        return ''; // Return empty to prevent whatsapp.js from sending again
      }
      // Not a greeting - assume user is providing their NAME
      console.log('✅ Not a greeting, treating as name and starting registration');
      const name = message.trim();
      if (name && name.length > 0) {
        // Create user state and save name immediately
        const initialState = {
          phoneNumber,
          step: 'registration',
          currentStep: 'three_questions', // Skip name step, go straight to questions
          data: { name: name }
        };
        await updateUserState(phoneNumber, initialState);
        await updateUser(phoneNumber, { state: 'registration' });
        await logMessage(phoneNumber, message, false);

        // Send 2-bubble response: name reaction + 4 questions
        const flow = getRegistrationFlow();
        const nameReaction = flow.nameReaction(name);
        const questions = flow.fourQuestions();

        // Send name reaction first
        await sendWhatsAppMessage(phoneNumber, nameReaction);

        // Then send questions in separate bubbles with delay
        if (Array.isArray(questions)) {
          await sendMultipleMessages(phoneNumber, questions, 800);
        } else {
          await sendWhatsAppMessage(phoneNumber, questions);
        }

        // Return empty to prevent double messaging
        return '';
      }
      // Empty name - ask for name
      return getGreetingResponse();
    }

    // Step A: Template questions (no AI)
    if (currentState === 'registration') {
      // userState is { phone_number, state: {...}, ... }, so we need to pass state.state
      const stateData = userState?.state || userState;
      return await handleRegistrationFlow(phoneNumber, message, stateData);
    }

    // Step B: Gemini extraction (AI) - after template steps
    if (currentState === 'profile_extraction') {
      const stateData = userState?.state || userState;
      return await handleGeminiExtraction(phoneNumber, message, stateData);
    }

    // Step D: Confirmation (after Gemini extraction)
    if (currentState === 'confirmation') {
      const stateData = userState?.state || userState;
      return await handleConfirmation(phoneNumber, message, stateData);
    }

    // Step E: Lifestyle questions (after calendar sync)
    if (currentState === 'lifestyle_questions') {
      return await handleLifestyleQuestions(phoneNumber, message, userState);
    }

    // Legacy: Handle old 'warning' state (for backward compatibility)
    if (currentState === 'warning') {
      const stateData = userState?.state || userState;
      return await handleConfirmation(phoneNumber, message, stateData);
    }

    // Handle suggestion response (Level 2)
    if (currentState === 'reviewing_suggestions') {
      const { handleSuggestionResponse } = await import('./matchingService.js');
      return await handleSuggestionResponse(phoneNumber, message);
    }

    // Registered user - normal conversation (includes 'matching' and 'waiting' states)
    if (currentState === 'registered' || currentState === 'matching' || currentState === 'waiting') {
      // Check daily AI limit (10 times per day)
      const aiCount = await getTodayAICount(phoneNumber);
      if (aiCount >= 10) {
        await logMessage(phoneNumber, message, false);
        const limitMsg = 'You used AI 10 times today.\n\n' +
          'Pay to use AI more.\n\n' +
          'You can still use:\n' +
          '- match\n' +
          '- points\n' +
          '- appointments\n\n' +
          'To buy points, type "buy points".';
        await sendWhatsAppMessage(phoneNumber, limitMsg);
        return ''; // Return empty to prevent double messaging
      }
      return await handleNormalConversation(phoneNumber, message, userState);
    }

    // Fallback
    return await handleRegistrationFlow(phoneNumber, message, userState);

  } catch (error) {
    console.error('Error processing user message:', error);
    return 'Sorry, I have a problem. Please try again.';
  }
}

/**
 * Handle registration flow - Step A: Get name, Step B: Three questions
 */
async function handleRegistrationFlow(phoneNumber, message, currentState = null) {
  const flow = getRegistrationFlow();

  if (!currentState) {
    // This should not happen anymore (handled in processUserMessage)
    // But keep as fallback: Start new registration - ask for name
    const initialState = {
      phoneNumber,
      step: 'registration',
      currentStep: 'name',
      data: {}
    };
    await updateUserState(phoneNumber, initialState);
    await updateUser(phoneNumber, { state: 'registration' });
    await logMessage(phoneNumber, message, false);
    const nameQuestion = flow.nameQuestion;
    // Send message and return empty to prevent double messaging
    await sendWhatsAppMessage(phoneNumber, nameQuestion);
    return ''; // Return empty to prevent whatsapp.js from sending again
  }

  // Handle case where currentState might be wrapped in userState object
  const state = currentState?.state || currentState;

  // Step 1: Collect name
  if (state.currentStep === 'name') {
    const name = message.trim();
    if (!name || name.length < 1) {
      await logMessage(phoneNumber, message, false);
      const errorMsg = 'Please tell me your name! 😊';
      await sendWhatsAppMessage(phoneNumber, errorMsg);
      return ''; // Return empty to prevent double messaging
    }

    // Save name and move to four questions
    state.data = state.data || {};
    state.data.name = name;
    state.currentStep = 'three_questions'; // Keep same step name for backward compatibility
    await updateUserState(phoneNumber, state);
    await logMessage(phoneNumber, message, false);

    // Send name reaction and four questions as separate bubbles (natural chat rhythm)
    const nameReaction = flow.nameReaction(name);
    const questions = flow.fourQuestions();

    // Send name reaction first
    await sendWhatsAppMessage(phoneNumber, nameReaction);

    // Then send questions in separate bubbles with delay
    if (Array.isArray(questions)) {
      await sendMultipleMessages(phoneNumber, questions, 800);
    } else {
      await sendWhatsAppMessage(phoneNumber, questions);
    }

    // Return empty to prevent double messaging
    return '';
  }

  // Step 2: User answered three questions, move to Gemini extraction
  if (state.currentStep === 'three_questions') {
    // Check if message is off-topic (not answering the 4 questions)
    const isOffTopic = await checkIfOffTopic(message, state);

    if (isOffTopic) {
      // Smart off-topic handling: Reply first, then pivot back
      const offTopicResponse = await generateOffTopicResponse(message);
      const pivotMessage = generatePivotMessage(state);

      // Send two bubbles: reaction + pivot
      await sendWhatsAppMessage(phoneNumber, offTopicResponse);
      setTimeout(async () => {
        await sendWhatsAppMessage(phoneNumber, pivotMessage);
      }, 1000);

      return offTopicResponse; // Return first message for immediate response
    }

    // Save the raw response
    state.data = state.data || {};
    state.data.threeQuestionsResponse = message.trim();

    // Move to Gemini extraction phase
    await updateUser(phoneNumber, { state: 'profile_extraction' });
    state.step = 'profile_extraction';
    state.currentStep = 0;
    await updateUserState(phoneNumber, state);
    await logMessage(phoneNumber, message, false);

    // Trigger extraction (this will be handled in handleGeminiExtraction)
    return await handleGeminiExtraction(phoneNumber, message, state);
  }

  // Fallback
  await logMessage(phoneNumber, message, false);
  return flow.nameQuestion;
}

/**
 * Handle Gemini extraction - Step B: AI extraction
 */
async function handleGeminiExtraction(phoneNumber, message, userState) {
  // Initialize flow and model at the top of the function
  const flow = getRegistrationFlow();
  const model = getGeminiModel();

  if (!model) {
    // If Gemini is not configured, skip extraction and move to warnings
    await updateUser(phoneNumber, { state: 'warning', goal: 'Not specified' });
    userState.step = 'warning';
    await updateUserState(phoneNumber, userState);
    await logMessage(phoneNumber, message, false);
    return await getWarningMessages();
  }

  try {
    // Check daily AI limit
    const aiCount = await getTodayAICount(phoneNumber);
    if (aiCount >= 10) {
      await logMessage(phoneNumber, message, false);
      return 'You used AI 10 times today.\n\n' +
        'Pay to use AI more.\n\n' +
        'To buy points, type "buy points".';
    }

    // Call Gemini API for extraction with personality-enhanced prompt
    const systemPrompt = flow.geminiSystemPrompt || '';
    const extractionPrompt = flow.geminiExtractionPrompt + message;
    const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${extractionPrompt}` : extractionPrompt;

    let result;
    let response;
    let text;

    try {
      result = await model.generateContent(fullPrompt);
      response = result.response;
      text = response.text();
    } catch (modelError) {
      // Handle rate limit (429) or other errors - skip AI and proceed
      if (modelError.message && (
        modelError.message.includes('429') || 
        modelError.message.includes('Too Many Requests') ||
        modelError.message.includes('quota') ||
        modelError.message.includes('rate limit')
      )) {
        console.log('⚠️ Gemini rate limit exceeded, skipping AI extraction and proceeding');
        // Fallback: proceed without AI extraction
        throw new Error('RATE_LIMIT_EXCEEDED');
      } else {
        console.error('Gemini extraction error:', modelError);
        throw modelError; // Re-throw other errors
      }
    }

    // Parse JSON response
    let extractedData;
    try {
      // Remove markdown code blocks if present
      const jsonText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      extractedData = JSON.parse(jsonText);
    } catch (parseError) {
      console.error('Error parsing Gemini response:', parseError);
      // Fallback: try to extract basic info from message
      const messageLower = message.toLowerCase();
      extractedData = {
        target_language: extractLanguage(message) || 'English',
        native_language: extractLanguage(message, true) || 'Unknown',
        user_level: extractLevel(message) || 'Intermediate',
        interests: [],
        job_title: null,
        matching_goal: null,
        preferences: {}
      };
    }

    // Ensure all required fields are present
    // Declare variables once at the top of the try block
    const extractedTargetLanguage = extractedData.target_language || 'English';
    const extractedNativeLanguage = extractedData.native_language || 'Unknown';
    const extractedUserLevel = extractedData.user_level || 'Intermediate';
    const extractedInterests = extractedData.interests || [];
    const extractedJobTitle = extractedData.job_title || null;
    const extractedMatchingGoal = extractedData.matching_goal || null;
    const extractedPreferences = extractedData.preferences || {};

    console.log('📊 Extracted data:', {
      targetLanguage: extractedTargetLanguage,
      nativeLanguage: extractedNativeLanguage,
      userLevel: extractedUserLevel,
      interests: extractedInterests,
      jobTitle: extractedJobTitle,
      matchingGoal: extractedMatchingGoal,
      preferences: extractedPreferences
    });

    // Save extracted data to user
    const userData = {
      ...userState.data,
      target_language: extractedTargetLanguage,
      native_language: extractedNativeLanguage,
      user_level: extractedUserLevel,
      interests: extractedInterests,
      job_title: extractedJobTitle,
      matching_goal: extractedMatchingGoal,
      preferences: extractedPreferences,
      // Keep legacy fields for backward compatibility
      language_learning: extractedTargetLanguage,
      language_teaching: extractedNativeLanguage,
      level: extractedUserLevel
    };

    await saveUserData(phoneNumber, userData);
    await updateUser(phoneNumber, {
      state: 'confirmation',
      target_language: extractedTargetLanguage,
      native_language: extractedNativeLanguage,
      user_level: extractedUserLevel,
      interests: extractedInterests,
      job_title: extractedJobTitle,
      matching_goal: extractedMatchingGoal,
      preferences: extractedPreferences
    });

    // Log AI usage
    await logMessage(phoneNumber, message, true);
    await incrementAICount(phoneNumber);

    // Move to confirmation phase
    userState.step = 'confirmation';
    userState.data = userData;
    await updateUserState(phoneNumber, userState);

    // Send confirmation and calendar link as separate bubbles (natural chat rhythm)
    const confirmationMsg = flow.confirmation(extractedNativeLanguage, extractedTargetLanguage);
    const calendarLinkMsg = flow.calendarLinkMessage(phoneNumber);

    // Send confirmation first
    await sendWhatsAppMessage(phoneNumber, confirmationMsg);

    // Then send calendar link with a small delay (separate bubble)
    await new Promise(resolve => setTimeout(resolve, 1000));
    await sendWhatsAppMessage(phoneNumber, calendarLinkMsg);

    // Return empty to prevent double messaging
    return '';

  } catch (error) {
    // Handle rate limit explicitly
    if (error.message === 'RATE_LIMIT_EXCEEDED') {
      console.log('⚠️ Rate limit exceeded, proceeding without AI extraction');
    } else {
      console.error('Error with Gemini extraction:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.status
      });
    }

    // CRITICAL: Even if extraction fails, send calendar link so user isn't stuck
    const baseUrl = 'https://nelo.so';
    const calendarLink = `${baseUrl}/api/calendar/connect?phone=${encodeURIComponent(phoneNumber)}`;

    // Try to extract basic info as fallback
    const fallbackTargetLanguage = extractLanguage(message) || 'English';
    const fallbackNativeLanguage = extractLanguage(message, true) || 'Unknown';
    const userData = {
      ...userState.data,
      target_language: fallbackTargetLanguage,
      native_language: fallbackNativeLanguage,
      user_level: extractLevel(message) || 'Intermediate',
      preferences: {}
    };

    // Save what we can extract
    try {
      await saveUserData(phoneNumber, userData);
      await updateUser(phoneNumber, { state: 'confirmation', target_language: fallbackTargetLanguage });
      userState.step = 'confirmation';
      userState.data = userData;
      await updateUserState(phoneNumber, userState);
    } catch (saveError) {
      console.error('Error saving fallback data:', saveError);
    }

    await logMessage(phoneNumber, message, false);

    // ONLY send error message if Gemini extraction actually failed
    // This is the catch block, so extraction definitely failed
    // Use friendly, casual messaging
    const errorMessage = `Got it! I'm already thinking of some great people for you. 🔍🤝\n\nTo make sure I only suggest times when you're actually free, could you quickly sync your Google Calendar? It only takes 10 seconds! 😊🙌\n\n📅 Connect your Google Calendar here:\n${calendarLink}\n\nOr just let me know when you're usually free! (like 'weekends' or 'after 7pm') 😊`;

    try {
      await sendWhatsAppMessage(phoneNumber, errorMessage);
    } catch (sendError) {
      console.error('Error sending WhatsApp message:', sendError);
    }

    // Return empty to prevent double messaging
    return '';
  }
}

/**
 * Check if user message is off-topic (not answering the 4 questions)
 * Uses Gemini to intelligently detect if the message is relevant to registration
 */
async function checkIfOffTopic(message, state) {
  const model = getGeminiModel();
  if (!model) {
    // Fallback: simple keyword-based check if Gemini not available
    const lowerMessage = message.toLowerCase().trim();
    const answerKeywords = [
      'english', 'spanish', 'french', 'japanese', 'chinese', 'korean', 'german', 'italian',
      'beginner', 'intermediate', 'advanced', 'native',
      'male', 'female', 'business', 'surfing', 'music', 'cooking', 'travel',
      '20', '30', '40', 'age', 'years old'
    ];
    const offTopicKeywords = [
      'how are you', 'what are you', 'who are you', 'tell me about',
      'weather', 'today', 'tomorrow', 'thanks', 'thank you', 'bye', 'goodbye'
    ];
    const hasAnswerKeywords = answerKeywords.some(keyword => lowerMessage.includes(keyword));
    const hasOffTopicKeywords = offTopicKeywords.some(keyword => lowerMessage.includes(keyword));
    return hasOffTopicKeywords && !hasAnswerKeywords;
  }

  try {
    const prompt = `You are analyzing a user's message during a language partner registration process. The user is supposed to answer 4 questions:
1. Which language do they want to talk in?
2. What is their level in that language?
3. What is their native language?
4. Who do they want to meet?

User's message: "${message}"

Determine if this message is:
- ON-TOPIC: Contains answers to the registration questions (mentions languages, levels, preferences, etc.)
- OFF-TOPIC: Small talk, greetings, unrelated questions, or general conversation

Respond with ONLY one word: "ON_TOPIC" or "OFF_TOPIC" (no quotes, no explanation).`;

    let result;
    let response;
    let text;

    try {
      result = await model.generateContent(prompt);
      response = result.response;
      text = response.text().trim().toUpperCase();
    } catch (modelError) {
      // Handle rate limit (429) or other errors - skip AI and assume on-topic
      if (modelError.message && (
        modelError.message.includes('429') || 
        modelError.message.includes('Too Many Requests') ||
        modelError.message.includes('quota') ||
        modelError.message.includes('rate limit')
      )) {
        console.log('⚠️ Gemini rate limit exceeded in checkIfOffTopic, assuming on-topic');
        // Fallback: assume on-topic if rate limited
        return false;
      } else {
        console.error('Error in checkIfOffTopic:', modelError);
        // Fallback: assume on-topic if Gemini fails
        return false;
      }
    }

    return text.includes('OFF_TOPIC');
  } catch (error) {
    console.error('Error checking if message is off-topic:', error);
    // Fallback: assume on-topic if Gemini fails
    return false;
  }
}

/**
 * Generate a friendly response to off-topic message using Gemini
 */
async function generateOffTopicResponse(message) {
  const model = getGeminiModel();
  if (!model) {
    // Fallback if Gemini not available
    return 'Haha, I love that! 😊';
  }

  try {
    const prompt = `You are a charming, witty language coach and friend. A user just sent you this message during registration: "${message}". 
    
Respond naturally and warmly (like a friend would), but keep it SHORT (1-2 sentences max). Use emojis. Don't be formal.

Example responses:
- "Haha, I love that! 😊"
- "That's so cool! ✨"
- "Nice! I'm glad you shared that! 😄"

Your response:`;

    let result;
    let response;

    try {
      result = await model.generateContent(prompt);
      response = result.response;
      return response.text().trim();
    } catch (modelError) {
      // Handle rate limit (429) or other errors - use fallback response
      if (modelError.message && (
        modelError.message.includes('429') || 
        modelError.message.includes('Too Many Requests') ||
        modelError.message.includes('quota') ||
        modelError.message.includes('rate limit')
      )) {
        console.log('⚠️ Gemini rate limit exceeded in generateOffTopicResponse, using fallback');
        return 'Haha, I love that! 😊';
      } else {
        console.error('Error in generateOffTopicResponse:', modelError);
        return 'Haha, I love that! 😊';
      }
    }
  } catch (error) {
    console.error('Error generating off-topic response:', error);
    return 'Haha, I love that! 😊';
  }
}

/**
 * Generate a pivot message to steer user back to registration
 */
function generatePivotMessage(state) {
  const missingInfo = [];

  // Check what info is still missing
  if (!state.data?.target_language) missingInfo.push('target language');
  if (!state.data?.native_language) missingInfo.push('native language');
  if (!state.data?.user_level) missingInfo.push('your level');
  if (!state.data?.preferences) missingInfo.push('who you want to meet');

  const missingText = missingInfo.length > 0
    ? missingInfo.join(', ')
    : 'more info';

  return `Anyway, let's get back to finding you a partner! I still need to know your ${missingText}! 😉`;
}

/**
 * Helper: Extract language from message
 */
function extractLanguage(message, isNative = false) {
  const languages = ['english', 'japanese', 'spanish', 'french', 'german', 'chinese', 'korean', 'portuguese', 'italian'];
  const messageLower = message.toLowerCase();

  for (const lang of languages) {
    if (messageLower.includes(lang)) {
      return lang.charAt(0).toUpperCase() + lang.slice(1);
    }
  }
  return null;
}

/**
 * Helper: Extract level from message
 */
function extractLevel(message) {
  const messageLower = message.toLowerCase();
  if (messageLower.includes('beginner')) return 'Beginner';
  if (messageLower.includes('intermediate')) return 'Intermediate';
  if (messageLower.includes('advanced')) return 'Advanced';
  if (messageLower.includes('native')) return 'Native';
  return 'Intermediate';
}

/**
 * Handle lifestyle questions - Step E: After calendar sync
 */
async function handleLifestyleQuestions(phoneNumber, message, userState) {
  const model = getGeminiModel();
  const currentUser = await getUser(phoneNumber);
  
  await logMessage(phoneNumber, message, false);
  
  try {
    // Use Gemini to parse lifestyle preferences from user's response
    const prompt = `Extract lifestyle and preference information from this user message. Look for:
- Availability: weekdays (day/night?), weekends, specific times
- Timezone flexibility: okay with late-night or early-morning chats for US/Europe matches
- Age range preference
- Gender preference
- Vibe/type preference (e.g., "business-minded", "chill", "entrepreneurs", "tech people")
- Any other matching preferences

Respond with ONLY valid JSON (no additional text):
{
  "availability": "weekdays/night, weekends, etc.",
  "timezone_flexible": true/false,
  "age_range": "e.g., 25-35 or null",
  "gender_preference": "male/female/any or null",
  "vibe_preference": "e.g., business-minded, chill, etc. or null",
  "other_preferences": {}
}

If no relevant info found, return: {"availability": null, "timezone_flexible": false, "age_range": null, "gender_preference": null, "vibe_preference": null, "other_preferences": {}}

User message: "${message}"`;

    let extractedPreferences = {};
    
    if (model) {
      try {
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text().trim();
        const jsonText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        extractedPreferences = JSON.parse(jsonText);
        
        // Log AI usage
        await logMessage(phoneNumber, message, true);
        await incrementAICount(phoneNumber);
      } catch (modelError) {
        // Handle rate limit or other errors - use fallback
        if (modelError.message && (
          modelError.message.includes('429') || 
          modelError.message.includes('Too Many Requests') ||
          modelError.message.includes('quota') ||
          modelError.message.includes('rate limit')
        )) {
          console.log('⚠️ Gemini rate limit exceeded in handleLifestyleQuestions, using fallback');
        } else {
          console.error('Error parsing lifestyle preferences:', modelError);
        }
        // Fallback: save raw message as preference
        extractedPreferences = {
          availability: null,
          timezone_flexible: false,
          age_range: null,
          gender_preference: null,
          vibe_preference: null,
          other_preferences: { raw_text: message.substring(0, 200) }
        };
      }
    } else {
      // No Gemini available - save raw text
      extractedPreferences = {
        availability: null,
        timezone_flexible: false,
        age_range: null,
        gender_preference: null,
        vibe_preference: null,
        other_preferences: { raw_text: message.substring(0, 200) }
      };
    }
    
    // Merge with existing preferences
    const currentPreferences = currentUser?.preferences || {};
    const mergedPreferences = {
      ...currentPreferences,
      ...extractedPreferences,
      // Merge other_preferences if both exist
      other_preferences: {
        ...(currentPreferences.other_preferences || {}),
        ...(extractedPreferences.other_preferences || {})
      }
    };
    
    // Update user with merged preferences
    await updateUser(phoneNumber, { 
      preferences: mergedPreferences,
      state: 'waiting' // Move to waiting state for matching
    });
    
    // Update user state
    if (userState) {
      userState.step = 'waiting';
      userState.data = {
        ...userState.data,
        preferences: mergedPreferences
      };
      await updateUserState(phoneNumber, userState);
    }
    
    // Send acknowledgment
    await sendWhatsAppMessage(phoneNumber, "Got it! I'll use this to find your perfect match. 🎯✨");
    
    // Wait a moment, then send matching message
    await new Promise(resolve => setTimeout(resolve, 1500));
    await sendWhatsAppMessage(phoneNumber, "I'm now searching for someone perfect for you. I'll text you when I find them! 🔍🤝");
    
    return '';
  } catch (error) {
    console.error('Error handling lifestyle questions:', error);
    // Still move to waiting state even if parsing fails
    await updateUser(phoneNumber, { state: 'waiting' });
    await sendWhatsAppMessage(phoneNumber, "Got it! I'll start looking for matches. 🔍✨");
    return '';
  }
}

/**
 * Handle confirmation - Step D: After Gemini extraction
 */
async function handleConfirmation(phoneNumber, message, userState) {
  const flow = getRegistrationFlow();
  const lowerMessage = message.toLowerCase().trim();

  // Check if user is confirming (moving to completion)
  if (lowerMessage.includes('ok') || lowerMessage.includes('yes') ||
    lowerMessage.includes('continue') || lowerMessage.includes('next') ||
    lowerMessage.includes('done') || lowerMessage.includes('complete') ||
    lowerMessage.includes('confirm') || lowerMessage.includes('got it')) {

    // Save user data and mark as registered
    await saveUserData(phoneNumber, userState.data);
    await updateUser(phoneNumber, { state: 'registered' });
    userState.step = 'registered';
    await updateUserState(phoneNumber, userState);

    await logMessage(phoneNumber, message, false);

    // Send optimized 2-bubble engaging response (close friend tone)
    const bubble1 = "Got it! I'm already looking for someone perfect for you. 🕵️‍♂️✨ I'll text you when I find them!";
    const bubble2 = "The more you tell me, the better I can match you! 🚀\n\nJust share:\n- Who you are and what you like\n- Who you want to meet\n\nYou can even copy-paste from ChatGPT if you want! 😉";

    await sendWhatsAppMessage(phoneNumber, bubble1);
    await new Promise(resolve => setTimeout(resolve, 1000));
    await sendWhatsAppMessage(phoneNumber, bubble2);

    // Update state to 'matching' for info-dump processing
    await updateUser(phoneNumber, { state: 'matching' });
    userState.step = 'matching';
    await updateUserState(phoneNumber, userState);

    // Return empty to prevent double messaging
    return '';
  }

  // If not confirmed, show warning and ask again
  await logMessage(phoneNumber, message, false);
  const confirmationTargetLanguage = userState.data.target_language || 'the target language';
  const confirmationNativeLanguage = userState.data.native_language || 'Unknown';
  const reminderMsg = flow.confirmation(confirmationNativeLanguage, confirmationTargetLanguage) + '\n\n' + flow.noShowWarning + '\n\n' +
    'Type "OK" to finish.';
  await sendWhatsAppMessage(phoneNumber, reminderMsg);
  return ''; // Return empty to prevent double messaging
}

/**
 * Handle normal conversation (after registration)
 */
async function handleNormalConversation(phoneNumber, message, userState) {
  const lowerMessage = message.toLowerCase().trim();

  // Handle specific commands (no AI needed)
  if (lowerMessage.includes('match') || lowerMessage.includes('find') || lowerMessage.includes('partner') || lowerMessage.includes('search')) {
    await logMessage(phoneNumber, message, false);
    // handleMatchRequest now sends messages internally and returns empty string
    return await handleMatchRequest(phoneNumber);
  }

  if (lowerMessage.includes('point') || lowerMessage.includes('balance') || lowerMessage.includes('buy')) {
    await logMessage(phoneNumber, message, false);
    const response = await handlePointsQuery(phoneNumber);
    await sendWhatsAppMessage(phoneNumber, response);
    return ''; // Return empty to prevent double messaging
  }

  if (lowerMessage.includes('appointment') || lowerMessage.includes('schedule') || lowerMessage.includes('apt')) {
    await logMessage(phoneNumber, message, false);
    const response = await handleAppointmentQuery(phoneNumber);
    await sendWhatsAppMessage(phoneNumber, response);
    return ''; // Return empty to prevent double messaging
  }

  // Use AI to handle general queries and extract user info (continuous learning)
  const model = getGeminiModel();
  if (!model) {
    await logMessage(phoneNumber, message, false);
    const errorMsg = 'Sorry, AI is not working now.\n\nYou can use:\n- match\n- points\n- appointments';
    await sendWhatsAppMessage(phoneNumber, errorMsg);
    return ''; // Return empty to prevent double messaging
  }

  try {
    // Check daily AI limit again (before AI call)
    const aiCount = await getTodayAICount(phoneNumber);
    if (aiCount >= 10) {
      await logMessage(phoneNumber, message, false);
      const limitMsg = 'You used AI 10 times today.\n\n' +
        'Pay to use AI more.\n\nYou can still use:\n' +
        '- match\n- points\n- appointments\n\n' +
        'To buy points, type "buy points".';
      await sendWhatsAppMessage(phoneNumber, limitMsg);
      return ''; // Return empty to prevent double messaging
    }

    // Continuous Learning: Extract user info from message and update database
    const extractedInfo = await extractAndUpdateUserInfo(phoneNumber, message, userState);

    // If user shared preferences/interests, acknowledge first before responding
    if (extractedInfo && (extractedInfo.interests?.length > 0 || extractedInfo.matching_goal || extractedInfo.job_title)) {
      const acknowledgment = await generatePreferenceAcknowledgment(extractedInfo);
      await sendWhatsAppMessage(phoneNumber, acknowledgment);

      // Wait a moment, then send calendar sync request
      await new Promise(resolve => setTimeout(resolve, 1500));

      const baseUrl = 'https://nelo.so';
      const calendarLink = `${baseUrl}/api/calendar/connect?phone=${encodeURIComponent(phoneNumber)}`;

      // Build interests text for the message
      const interests = extractedInfo.interests || [];
      const interestsText = interests.length > 0 ? interests.slice(0, 2).join(' and ') : 'those interests';

      const calendarMessage = `Got it! I'm already thinking of some great people for you. 🔍🤝\n\nTo make sure I only suggest times when you're actually free, could you quickly sync your Google Calendar? It only takes 10 seconds! 😊🙌\n\n📅 Connect your Google Calendar here:\n${calendarLink}\n\nOr just let me know when you're usually free! (like 'weekends' or 'after 7pm') 😊`;

      await sendWhatsAppMessage(phoneNumber, calendarMessage);

      // Log message but don't use AI for this interaction
      await logMessage(phoneNumber, message, false);
      return ''; // Return empty to prevent double messaging
    }

    // Call Gemini API for response (for general questions)
    const prompt = `You are a close friend helping with a language matching service called Nelo. You're a native English speaker. Keep your responses:
- Short and casual (under 150 characters)
- Friendly and warm, like talking to a friend
- Use simple, natural English
- Don't be formal or use lists
- Use emojis naturally (1-2 max)

User: ${message}`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Log message with AI usage flag
    await logMessage(phoneNumber, message, true);
    await incrementAICount(phoneNumber);

    await sendWhatsAppMessage(phoneNumber, text);
    return ''; // Return empty to prevent double messaging
  } catch (error) {
    // Handle rate limit (429) or other errors - use fallback response
    if (error.message && (
      error.message.includes('429') || 
      error.message.includes('Too Many Requests') ||
      error.message.includes('quota') ||
      error.message.includes('rate limit')
    )) {
      console.log('⚠️ Gemini rate limit exceeded in handleNormalConversation, using fallback');
      await logMessage(phoneNumber, message, false);
      const errorMsg = 'I\'m getting a lot of messages right now. Can you try again in a moment? 😊';
      await sendWhatsAppMessage(phoneNumber, errorMsg);
      return '';
    } else {
      console.error('Error with Gemini:', error);
      await logMessage(phoneNumber, message, false);
      const errorMsg = 'Sorry, I cannot answer right now.';
      await sendWhatsAppMessage(phoneNumber, errorMsg);
      return ''; // Return empty to prevent double messaging
    }
  }
}

/**
 * Extract user info from message and update database (continuous learning)
 * Enhanced: Catches all information, saves raw text if Gemini fails
 * Returns extracted info for acknowledgment message
 */
async function extractAndUpdateUserInfo(phoneNumber, message, userState) {
  const model = getGeminiModel();
  const currentUser = await getUser(phoneNumber);

  // If Gemini is not available, save raw text to interests as fallback
  if (!model) {
    console.log('⚠️ Gemini not available, saving raw text to interests');
    const currentInterests = currentUser?.interests || [];
    const rawTextInterest = `[Raw text: ${message.substring(0, 200)}]`; // Limit to 200 chars
    const mergedInterests = [...new Set([...currentInterests, rawTextInterest])];
    await updateUser(phoneNumber, { interests: mergedInterests });
    return null; // Return null if no extraction possible
  }

  try {
    const prompt = `Extract user information from this message. Look for:
- Interests/hobbies (e.g., "I like movies", "I'm a developer", "I love surfing", "spanish", "tech")
- Job title or profession
- Matching goals or preferences (e.g., "I want to talk to entrepreneurs in New York between 18:00 and 21:00 on weekdays", "I'm looking for business partners")
- Language preferences (e.g., "spanish", "japanese", "middle level")
- Personality traits or characteristics
- Time preferences (e.g., "weekdays 18:00-21:00", "weekends all day")
- Location preferences (e.g., "in New York", "JST", "EST")
- Any other relevant profile information

Respond with ONLY valid JSON (no additional text):
{
  "interests": ["interest1", "interest2"],
  "job_title": "job title or null",
  "matching_goal": "goal or null",
  "preferences": {}
}

If no relevant info found, return: {"interests": [], "job_title": null, "matching_goal": null, "preferences": {}}

User message: "${message}"`;

    let result;
    let response;
    let text;

    try {
      result = await model.generateContent(prompt);
      response = result.response;
      text = response.text().trim();
    } catch (modelError) {
      // Handle rate limit (429) or other errors - save raw text as fallback
      if (modelError.message && (
        modelError.message.includes('429') || 
        modelError.message.includes('Too Many Requests') ||
        modelError.message.includes('quota') ||
        modelError.message.includes('rate limit')
      )) {
        console.log('⚠️ Gemini rate limit exceeded in extractAndUpdateUserInfo, saving raw text to interests');
        const currentInterests = currentUser?.interests || [];
        const rawTextInterest = `[Raw text: ${message.substring(0, 200)}]`;
        const mergedInterests = [...new Set([...currentInterests, rawTextInterest])];
        await updateUser(phoneNumber, { interests: mergedInterests });
        return null;
      } else if (modelError.message && (modelError.message.includes('404') || modelError.message.includes('not found'))) {
        console.log('⚠️ Gemini 404 error, saving raw text to interests');
        const currentInterests = currentUser?.interests || [];
        const rawTextInterest = `[Raw text: ${message.substring(0, 200)}]`;
        const mergedInterests = [...new Set([...currentInterests, rawTextInterest])];
        await updateUser(phoneNumber, { interests: mergedInterests });
        return null;
      }
      console.error('Error in extractAndUpdateUserInfo:', modelError);
      // Fallback: save raw text
      const currentInterests = currentUser?.interests || [];
      const rawTextInterest = `[Raw text: ${message.substring(0, 200)}]`;
      const mergedInterests = [...new Set([...currentInterests, rawTextInterest])];
      await updateUser(phoneNumber, { interests: mergedInterests });
      return null;
    }

    // Parse JSON
    const jsonText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const extractedInfo = JSON.parse(jsonText);

    // Update user data if new info found
    const currentInterests = currentUser?.interests || [];
    const mergedInterests = extractedInfo.interests && extractedInfo.interests.length > 0
      ? [...new Set([...currentInterests, ...extractedInfo.interests])]
      : currentInterests;

    // Check if we found meaningful new information
    const hasNewInfo = mergedInterests.length > currentInterests.length ||
      extractedInfo.job_title ||
      extractedInfo.matching_goal;

    if (hasNewInfo) {
      await updateUser(phoneNumber, {
        interests: mergedInterests,
        job_title: extractedInfo.job_title || currentUser?.job_title,
        matching_goal: extractedInfo.matching_goal || currentUser?.matching_goal
      });

      console.log('✅ Updated user info from message:', extractedInfo);
      return extractedInfo; // Return extracted info for acknowledgment
    }

    return null; // No new info found
  } catch (error) {
    // If all else fails, save raw text to interests so no data is lost
    console.log('⚠️ Could not extract user info, saving raw text (non-critical):', error.message);
    try {
      const currentInterests = currentUser?.interests || [];
      const rawTextInterest = `[Raw text: ${message.substring(0, 200)}]`;
      const mergedInterests = [...new Set([...currentInterests, rawTextInterest])];
      await updateUser(phoneNumber, { interests: mergedInterests });
      console.log('✅ Saved raw text to interests as fallback');
    } catch (saveError) {
      console.error('❌ Failed to save raw text:', saveError);
    }
    return null;
  }
}

/**
 * Generate friendly acknowledgment message based on extracted preferences
 * Sounds like a close friend reacting warmly
 */
async function generatePreferenceAcknowledgment(extractedInfo) {
  const model = getGeminiModel();
  if (!model) {
    // Fallback simple acknowledgment - warm and casual
    const interests = extractedInfo.interests || [];
    if (interests.length > 0) {
      const interestText = interests.slice(0, 2).join(' and ');
      return `Oh, ${interestText}? That's such a cool combo! 🎬✨ I'd love to find someone like that for you.`;
    }
    return `Oh, that sounds awesome! 🎬✨ I'd love to find someone like that for you.`;
  }

  try {
    const interests = extractedInfo.interests || [];
    const jobTitle = extractedInfo.job_title || '';
    const matchingGoal = extractedInfo.matching_goal || '';

    const prompt = `The user just shared what kind of person they want to meet. Here's what they said:
- Interests: ${interests.join(', ') || 'not specified'}
- Job/Profession: ${jobTitle || 'not specified'}
- What they're looking for: ${matchingGoal || 'not specified'}

Generate a warm, casual reaction message like a close friend would respond. Keep it:
- Short and natural (under 120 characters)
- Warm and enthusiastic, like you're genuinely excited
- Use 1-2 emojis max
- Don't be formal or list things
- React to their specific interests/preferences with enthusiasm
- Sound like you're talking to a friend, not a customer
- Start with "Got it!" to acknowledge what they said naturally

Example: "Got it! Spanish and tech sounds like a fun combo. 🎬✨ Let me see who I can find for you."

Just return the message, nothing else. No quotes, no extra text.`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text().trim();

    // Clean up any quotes or extra formatting
    return text.replace(/^["']|["']$/g, '').trim();
  } catch (error) {
    // Handle rate limit (429) or other errors - use fallback response
    if (error.message && (
      error.message.includes('429') || 
      error.message.includes('Too Many Requests') ||
      error.message.includes('quota') ||
      error.message.includes('rate limit')
    )) {
      console.log('⚠️ Gemini rate limit exceeded in generatePreferenceAcknowledgment, using fallback');
    } else {
      console.error('Error generating acknowledgment:', error);
    }
    // Fallback - warm and casual
    const interests = extractedInfo.interests || [];
    if (interests.length > 0) {
      const interestText = interests.slice(0, 2).join(' and ');
      return `Got it! ${interestText} sounds like a fun combo. 🎬✨ Let me see who I can find for you.`;
    }
    return `Got it! That sounds awesome! 🎬✨ Let me see who I can find for you.`;
  }
}

/**
 * Handle match request
 */
async function handleMatchRequest(phoneNumber) {
  try {
    const { findMatches, isGreatMatch } = await import('./matching.js');
    const matches = await findMatches(phoneNumber);

    if (matches.length === 0) {
      const noMatchMsg = 'I did not find anyone right now.\n\nPlease try again later.\nI am looking for people. I will text you when I find someone.';
      await sendWhatsAppMessage(phoneNumber, noMatchMsg);
      return ''; // Return empty to prevent double messaging
    }

    // Filter for "Great Matches" (score >= 80)
    const greatMatches = matches.filter(m => isGreatMatch(m));

    if (greatMatches.length > 0) {
      let response = `I found ${greatMatches.length} good person(s) for you! 🌟\n\n`;

      greatMatches.slice(0, 3).forEach((match, index) => {
        response += `${index + 1}. ${match.phoneNumber}\n`;
        response += `   Match Score: ${match.aiScore}/100\n`;
        response += `   ${match.reason}\n`;
        response += `   💬 "${match.icebreaker}"\n\n`;
      });

      response += 'I will text you when I find someone.';
      await sendWhatsAppMessage(phoneNumber, response);
      return ''; // Return empty to prevent double messaging
    } else {
      // Show all matches if no "Great Matches"
      let response = `I found ${matches.length} person(s) for you:\n\n`;

      matches.slice(0, 5).forEach((match, index) => {
        response += `${index + 1}. ${match.phoneNumber}\n`;
        response += `   Learning: ${match.languageLearning}\n`;
        response += `   Teaching: ${match.languageTeaching}\n`;
        response += `   Level: ${match.level}\n`;
        response += `   Match Score: ${match.aiScore || 'N/A'}/100\n\n`;
      });

      response += 'I will text you when I find someone.';
      await sendWhatsAppMessage(phoneNumber, response);
      return ''; // Return empty to prevent double messaging
    }
  } catch (error) {
    console.error('Error handling match request:', error);
    const errorMsg = 'I have a problem finding matches. Please try again.';
    await sendWhatsAppMessage(phoneNumber, errorMsg);
    return ''; // Return empty to prevent double messaging
  }
}

/**
 * Handle points query
 */
async function handlePointsQuery(phoneNumber) {
  try {
    const { getUser } = await import('../db/users.js');
    const user = await getUser(phoneNumber);

    if (!user) {
      return 'User information not found.';
    }

    const points = user.points || user.points_balance || 0;

    return `Current points balance: ${points} points\n\n` +
      `1 appointment (15 minutes) = 100 points\n\n` +
      `Pricing plans:\n` +
      `- $10/month (200 points = 2 sessions)\n` +
      `- $20/month (400 points = 4 sessions)\n` +
      `- $100/month (3000 points = 30 sessions)\n\n` +
      `To buy points, type "buy points".`;
  } catch (error) {
    console.error('Error handling points query:', error);
    return 'I have a problem getting your points. Please try again.';
  }
}

/**
 * Handle appointment query
 */
async function handleAppointmentQuery(phoneNumber) {
  try {
    const { getUserAppointments } = await import('../db/appointments.js');
    const appointments = await getUserAppointments(phoneNumber);

    const upcomingAppointments = appointments
      .filter(apt => apt.status === 'confirmed' && new Date(apt.scheduled_at) > new Date())
      .slice(0, 5);

    if (upcomingAppointments.length === 0) {
      return 'You have no appointments now.\n\nTo find people, type "match".';
    }

    let response = `Your appointments (${upcomingAppointments.length}):\n\n`;

    upcomingAppointments.forEach((apt, index) => {
      const time = new Date(apt.scheduled_at).toLocaleString('en-US');
      const otherUser = apt.user1_phone === phoneNumber ? apt.user2_phone : apt.user1_phone;

      response += `${index + 1}. ${time}\n`;
      response += `   Partner: ${otherUser}\n`;
      response += `   Duration: ${apt.duration_minutes} minutes\n`;
      response += `   Meet: ${apt.google_meet_link}\n\n`;
    });

    return response;
  } catch (error) {
    console.error('Error handling appointment query:', error);
    return 'I have a problem getting your appointments. Please try again.';
  }
}
