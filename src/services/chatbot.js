import OpenAI from 'openai';
import { getUserState, updateUserState, saveUserData } from '../db/users.js';
import { getRegistrationFlow } from '../flows/registration.js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Process user message with AI chatbot
 */
export async function processUserMessage(phoneNumber, message) {
  try {
    // Get user's current state
    let userState = await getUserState(phoneNumber);
    
    // If user is new, start registration flow
    if (!userState || userState.step === 'new') {
      return await handleRegistrationFlow(phoneNumber, message);
    }
    
    // If user is registered, handle normal conversation
    if (userState.step === 'registered') {
      return await handleNormalConversation(phoneNumber, message, userState);
    }
    
    // Continue registration flow
    return await handleRegistrationFlow(phoneNumber, message, userState);
    
  } catch (error) {
    console.error('Error processing user message:', error);
    return '申し訳ございません。エラーが発生しました。しばらくしてから再度お試しください。';
  }
}

/**
 * Handle registration flow
 */
async function handleRegistrationFlow(phoneNumber, message, currentState = null) {
  const flow = getRegistrationFlow();
  
  if (!currentState) {
    // Start new registration
    const initialState = {
      phoneNumber,
      step: 'registration',
      currentStep: 0,
      data: {}
    };
    await updateUserState(phoneNumber, initialState);
    return flow.steps[0].question;
  }
  
  // Process current step
  const currentStepIndex = currentState.currentStep;
  const currentStep = flow.steps[currentStepIndex];
  
  // Validate and save answer
  const answer = message.trim();
  currentState.data[currentStep.key] = answer;
  
  // Move to next step
  currentState.currentStep += 1;
  
  // Check if registration is complete
  if (currentState.currentStep >= flow.steps.length) {
    // Save user data
    await saveUserData(phoneNumber, currentState.data);
    
    // Update state to registered
    currentState.step = 'registered';
    currentState.currentStep = 0;
    await updateUserState(phoneNumber, currentState);
    
    return `登録が完了しました！🎉\n\nGoogleカレンダーと連携するには、以下のリンクをクリックしてください：\n${process.env.APP_BASE_URL}/api/calendar/connect?phone=${phoneNumber}`;
  }
  
  // Ask next question
  await updateUserState(phoneNumber, currentState);
  return flow.steps[currentState.currentStep].question;
}

/**
 * Handle normal conversation (after registration)
 */
async function handleNormalConversation(phoneNumber, message, userState) {
  // Use AI to handle general queries
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "あなたは言語マッチングサービスのアシスタントです。ユーザーの質問に親切に答えてください。"
        },
        {
          role: "user",
          content: message
        }
      ],
      max_tokens: 200
    });
    
    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Error with OpenAI:', error);
    return '申し訳ございません。現在お答えできません。';
  }
}

