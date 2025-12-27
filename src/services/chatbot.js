import { GoogleGenerativeAI } from '@google/generative-ai';
import { getUserState, updateUserState, saveUserData, getUser, updateUser } from '../db/users.js';
import { getRegistrationFlow } from '../flows/registration.js';
import { logMessage, hasExceededDailyLimit, getTodayAICount, incrementAICount } from '../db/message-logs.js';
import { sendWhatsAppMessage } from '../utils/twilio.js';
import { sendMultipleMessages, sendWithFollowUps } from '../utils/message-sender.js';

// Initialize Gemini only if API key is provided
const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

// Get Gemini model (1.5 Flash)
const getGeminiModel = () => {
  if (!genAI) return null;
  // Use gemini-1.5-flash (strict model name as per SDK requirements)
  return genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
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
        try {
          await logMessage(phoneNumber, message, false);
        } catch (logError) {
          console.warn('⚠️ Failed to log message (continuing anyway):', logError);
        }
        return getGreetingResponse();
      }
      console.log('✅ Not a greeting, starting registration flow');
      return await handleRegistrationFlow(phoneNumber, message, null);
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
    
    // Legacy: Handle old 'warning' state (for backward compatibility)
    if (currentState === 'warning') {
      const stateData = userState?.state || userState;
      return await handleConfirmation(phoneNumber, message, stateData);
    }
    
    // Registered user - normal conversation
    if (currentState === 'registered') {
      // Check daily AI limit (10 times per day)
      const aiCount = await getTodayAICount(phoneNumber);
      if (aiCount >= 10) {
        await logMessage(phoneNumber, message, false);
        return 'You have reached today\'s AI usage limit (10 times).\n\n' +
          'Upgrade to a paid plan to use AI features unlimited.\n\n' +
          'The following commands are still available:\n' +
          '- match\n' +
          '- points\n' +
          '- appointments\n\n' +
          'To purchase points, type "buy points".';
      }
      return await handleNormalConversation(phoneNumber, message, userState);
    }
    
    // Fallback
    return await handleRegistrationFlow(phoneNumber, message, userState);
    
  } catch (error) {
    console.error('Error processing user message:', error);
    return 'Sorry, an error occurred. Please try again later.';
  }
}

/**
 * Handle registration flow - Step A: Get name, Step B: Three questions
 */
async function handleRegistrationFlow(phoneNumber, message, currentState = null) {
  const flow = getRegistrationFlow();
  
  if (!currentState) {
    // Start new registration - ask for name
    const initialState = {
      phoneNumber,
      step: 'registration',
      currentStep: 'name',
      data: {}
    };
    await updateUserState(phoneNumber, initialState);
    await updateUser(phoneNumber, { state: 'registration' });
    await logMessage(phoneNumber, message, false);
    return flow.nameQuestion;
  }
  
  // Handle case where currentState might be wrapped in userState object
  const state = currentState?.state || currentState;
  
  // Step 1: Collect name
  if (state.currentStep === 'name') {
    const name = message.trim();
    if (!name || name.length < 1) {
      await logMessage(phoneNumber, message, false);
      return 'Please tell me your name! 😊';
    }
    
    // Save name and move to four questions
    state.data = state.data || {};
    state.data.name = name;
    state.currentStep = 'three_questions'; // Keep same step name for backward compatibility
    await updateUserState(phoneNumber, state);
    await logMessage(phoneNumber, message, false);
    
    // Send the four questions as multiple messages
    const questions = flow.fourQuestions(name);
    if (Array.isArray(questions)) {
      // Send multiple messages asynchronously
      sendMultipleMessages(phoneNumber, questions, 1000);
      // Return first message for immediate response
      return questions[0];
    }
    return questions;
  }
  
  // Step 2: User answered three questions, move to Gemini extraction
  if (state.currentStep === 'three_questions') {
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
      return 'You have reached today\'s AI usage limit (10 times).\n\n' +
        'Upgrade to a paid plan to use AI features unlimited.\n\n' +
        'To purchase points, type "buy points".';
    }
    
    // Call Gemini API for extraction
    const flow = getRegistrationFlow();
    const prompt = flow.geminiExtractionPrompt + message;
    
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
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
    const targetLanguage = extractedData.target_language || 'English';
    const nativeLanguage = extractedData.native_language || 'Unknown';
    const userLevel = extractedData.user_level || 'Intermediate';
    const interests = extractedData.interests || [];
    const jobTitle = extractedData.job_title || null;
    const matchingGoal = extractedData.matching_goal || null;
    const preferences = extractedData.preferences || {};
    
    console.log('📊 Extracted data:', { 
      targetLanguage, 
      nativeLanguage, 
      userLevel, 
      interests, 
      jobTitle, 
      matchingGoal, 
      preferences 
    });
    
    // Save extracted data to user
    const userData = {
      ...userState.data,
      target_language: targetLanguage,
      native_language: nativeLanguage,
      user_level: userLevel,
      interests: interests,
      job_title: jobTitle,
      matching_goal: matchingGoal,
      preferences: preferences,
      // Keep legacy fields for backward compatibility
      language_learning: targetLanguage,
      language_teaching: nativeLanguage,
      level: userLevel
    };
    
    await saveUserData(phoneNumber, userData);
    await updateUser(phoneNumber, {
      state: 'confirmation',
      target_language: targetLanguage,
      native_language: nativeLanguage,
      user_level: userLevel,
      interests: interests,
      job_title: jobTitle,
      matching_goal: matchingGoal,
      preferences: preferences
    });
    
    // Log AI usage
    await logMessage(phoneNumber, message, true);
    await incrementAICount(phoneNumber);
    
    // Move to confirmation phase
    userState.step = 'confirmation';
    userState.data = userData;
    await updateUserState(phoneNumber, userState);
    
    // Send confirmation message and calendar link
    const confirmationMsg = flow.confirmation(nativeLanguage, targetLanguage);
    const calendarLink = flow.calendarLink(phoneNumber);
    const voicePrompt = flow.voicePrompt(targetLanguage);
    
    // Send messages in sequence: confirmation, calendar link, voice prompt (optional)
    sendWithFollowUps(
      phoneNumber,
      confirmationMsg,
      [
        `🔗 Connect Calendar: ${calendarLink}`,
        voicePrompt
      ],
      1500
    );
    
    return confirmationMsg;
    
  } catch (error) {
    console.error('Error with Gemini extraction:', error);
    // Fallback: try to extract basic info
    const targetLanguage = extractLanguage(message) || 'English';
    const userData = {
      ...userState.data,
      target_language: targetLanguage,
      native_language: extractLanguage(message, true) || 'Unknown',
      user_level: extractLevel(message) || 'Intermediate',
      preferences: {}
    };
    
    await saveUserData(phoneNumber, userData);
    await updateUser(phoneNumber, { state: 'confirmation', target_language: targetLanguage });
    userState.step = 'confirmation';
    userState.data = userData;
    await updateUserState(phoneNumber, userState);
    await logMessage(phoneNumber, message, false);
    
    const flow = getRegistrationFlow();
    const nativeLanguage = extractLanguage(message, true) || 'Unknown';
    return flow.confirmation(nativeLanguage, targetLanguage);
  }
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
    return flow.completionMessage(phoneNumber);
  }
  
  // If not confirmed, show warning and ask again
  await logMessage(phoneNumber, message, false);
  const targetLanguage = userState.data.target_language || 'the target language';
  const targetLanguage = userState.data.target_language || 'the target language';
  const nativeLanguage = userState.data.native_language || 'Unknown';
  return flow.confirmation(nativeLanguage, targetLanguage) + '\n\n' + flow.noShowWarning + '\n\n' +
    'Type "OK" or "confirm" to complete registration.';
}

/**
 * Handle normal conversation (after registration)
 */
async function handleNormalConversation(phoneNumber, message, userState) {
  const lowerMessage = message.toLowerCase().trim();
  
  // Handle specific commands (no AI needed)
  if (lowerMessage.includes('match') || lowerMessage.includes('find') || lowerMessage.includes('partner') || lowerMessage.includes('search')) {
    await logMessage(phoneNumber, message, false);
    return await handleMatchRequest(phoneNumber);
  }
  
  if (lowerMessage.includes('point') || lowerMessage.includes('balance') || lowerMessage.includes('buy')) {
    await logMessage(phoneNumber, message, false);
    return await handlePointsQuery(phoneNumber);
  }
  
  if (lowerMessage.includes('appointment') || lowerMessage.includes('schedule') || lowerMessage.includes('apt')) {
    await logMessage(phoneNumber, message, false);
    return await handleAppointmentQuery(phoneNumber);
  }
  
  // Use AI to handle general queries (if Gemini is configured)
  const model = getGeminiModel();
  if (!model) {
    await logMessage(phoneNumber, message, false);
    return 'Sorry, AI features are currently unavailable.\n\nThe following commands are available:\n- match\n- points\n- appointments';
  }
  
  try {
    // Check daily AI limit again (before AI call)
    const aiCount = await getTodayAICount(phoneNumber);
    if (aiCount >= 10) {
      await logMessage(phoneNumber, message, false);
      return 'You have reached today\'s AI usage limit (10 times).\n\n' +
        'Upgrade to a paid plan to use AI features unlimited.\n\nThe following commands are still available:\n' +
        '- match\n- points\n- appointments\n\n' +
        'To purchase points, type "buy points".';
    }
    
    // Call Gemini API
    const prompt = `You are an assistant for a language matching service. Please answer the user's questions kindly and concisely (within 200 characters). Respond in English.\n\nUser: ${message}`;
    
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    // Log message with AI usage flag
    await logMessage(phoneNumber, message, true);
    await incrementAICount(phoneNumber);
    
    return text;
  } catch (error) {
    console.error('Error with Gemini:', error);
    await logMessage(phoneNumber, message, false);
    return 'Sorry, I cannot answer right now.';
  }
}

/**
 * Handle match request
 */
async function handleMatchRequest(phoneNumber) {
  try {
    const { findMatches } = await import('./matching.js');
    const matches = await findMatches(phoneNumber);
    
    if (matches.length === 0) {
      return 'No matching candidates found at the moment.\n\nPlease try again later.\nAutomatic matching is running, and we will notify you when candidates are found.';
    }
    
    let response = `Found ${matches.length} matching candidate(s):\n\n`;
    
    matches.slice(0, 5).forEach((match, index) => {
      response += `${index + 1}. ${match.phoneNumber}\n`;
      response += `   Learning: ${match.languageLearning}\n`;
      response += `   Teaching: ${match.languageTeaching}\n`;
      response += `   Level: ${match.level}\n`;
      response += `   Trust Score: ${match.trustScore}/100\n\n`;
    });
    
    response += 'We will notify you with details once automatic matching is executed.';
    
    return response;
  } catch (error) {
    console.error('Error handling match request:', error);
    return 'An error occurred while searching for matches.';
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
      `To purchase points, type "buy points".`;
  } catch (error) {
    console.error('Error handling points query:', error);
    return 'An error occurred while retrieving points information.';
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
      return 'You have no scheduled appointments at the moment.\n\nTo find matching candidates, type "match".';
    }
    
    let response = `Scheduled appointments (${upcomingAppointments.length}):\n\n`;
    
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
    return 'An error occurred while retrieving appointment information.';
  }
}
