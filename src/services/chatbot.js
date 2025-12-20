import OpenAI from 'openai';
import { getUserState, updateUserState, saveUserData } from '../db/users.js';
import { getRegistrationFlow } from '../flows/registration.js';

// Initialize OpenAI only if API key is provided
const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })
  : null;

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
  const lowerMessage = message.toLowerCase().trim();
  
  // Handle specific commands
  if (lowerMessage.includes('マッチング') || lowerMessage.includes('探す') || lowerMessage.includes('相手')) {
    return await handleMatchRequest(phoneNumber);
  }
  
  if (lowerMessage.includes('ポイント') || lowerMessage.includes('残高')) {
    return await handlePointsQuery(phoneNumber);
  }
  
  if (lowerMessage.includes('アポ') || lowerMessage.includes('予定') || lowerMessage.includes('スケジュール')) {
    return await handleAppointmentQuery(phoneNumber);
  }
  
  // Use AI to handle general queries (if OpenAI is configured)
  if (!openai) {
    return '申し訳ございません。AI機能は現在利用できません。\n\n以下のコマンドが使えます：\n- マッチング\n- ポイント\n- アポ';
  }
  
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "あなたは言語マッチングサービスのアシスタントです。ユーザーの質問に親切に答えてください。簡潔に答えてください。"
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

/**
 * Handle match request
 */
async function handleMatchRequest(phoneNumber) {
  try {
    const { findMatches } = await import('./matching.js');
    const matches = await findMatches(phoneNumber);
    
    if (matches.length === 0) {
      return '現在、マッチング候補が見つかりませんでした。\n\nしばらくしてから再度お試しください。\n自動マッチングも実行中ですので、候補が見つかり次第お知らせします。';
    }
    
    let response = `マッチング候補が${matches.length}件見つかりました：\n\n`;
    
    matches.slice(0, 5).forEach((match, index) => {
      response += `${index + 1}. ${match.phoneNumber}\n`;
      response += `   学びたい: ${match.languageLearning}\n`;
      response += `   教えられる: ${match.languageTeaching}\n`;
      response += `   レベル: ${match.level}\n`;
      response += `   信頼度: ${match.trustScore}/100\n\n`;
    });
    
    response += '自動マッチングが実行され次第、詳細をお知らせします。';
    
    return response;
  } catch (error) {
    console.error('Error handling match request:', error);
    return 'マッチング検索中にエラーが発生しました。';
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
      return 'ユーザー情報が見つかりませんでした。';
    }
    
    return `現在のポイント残高: ${user.points_balance}ポイント\n\n` +
      `1アポイントメント = 100ポイント\n` +
      `ポイントを購入するには、「ポイント購入」と入力してください。`;
  } catch (error) {
    console.error('Error handling points query:', error);
    return 'ポイント情報の取得中にエラーが発生しました。';
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
      return '現在、予定されているアポイントメントはありません。\n\nマッチング候補を探すには、「マッチング」と入力してください。';
    }
    
    let response = `予定されているアポイントメント（${upcomingAppointments.length}件）：\n\n`;
    
    upcomingAppointments.forEach((apt, index) => {
      const time = new Date(apt.scheduled_at).toLocaleString('ja-JP');
      const otherUser = apt.user1_phone === phoneNumber ? apt.user2_phone : apt.user1_phone;
      
      response += `${index + 1}. ${time}\n`;
      response += `   相手: ${otherUser}\n`;
      response += `   時間: ${apt.duration_minutes}分\n`;
      response += `   Meet: ${apt.google_meet_link}\n\n`;
    });
    
    return response;
  } catch (error) {
    console.error('Error handling appointment query:', error);
    return 'アポイントメント情報の取得中にエラーが発生しました。';
  }
}

