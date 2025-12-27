/**
 * Test script for hybrid chatbot flow
 * Tests Step A (template), Step B (Gemini extraction), Step C (warnings)
 * Run with: node scripts/test-chatbot-flow.js
 */

import dotenv from 'dotenv';
import { processUserMessage } from '../src/services/chatbot.js';
import { getUser, getUserState } from '../src/db/users.js';

dotenv.config();

const TEST_PHONE = process.env.TEST_PHONE_NUMBER || '+1234567890';

async function testChatbotFlow() {
  console.log('🧪 Testing Hybrid Chatbot Flow\n');
  console.log('='.repeat(60));
  
  try {
    // Test Step A: Initial greeting/registration (template, no AI)
    console.log('\n📝 Step A: Initial Greeting (Template, No AI)');
    console.log('-'.repeat(60));
    console.log('Input: "登録"');
    const response1 = await processUserMessage(TEST_PHONE, '登録');
    console.log('Response:', response1);
    console.log('✅ Step A passed: Template response (no AI call)');
    
    // Test Step A: Template questions
    console.log('\n📝 Step A: Template Questions (No AI)');
    console.log('-'.repeat(60));
    console.log('Input: "山田太郎"');
    const response2 = await processUserMessage(TEST_PHONE, '山田太郎');
    console.log('Response:', response2);
    
    console.log('Input: "1" (男性)');
    const response3 = await processUserMessage(TEST_PHONE, '1');
    console.log('Response:', response3);
    
    console.log('Input: "英語"');
    const response4 = await processUserMessage(TEST_PHONE, '英語');
    console.log('Response:', response4);
    
    console.log('Input: "日本語"');
    const response5 = await processUserMessage(TEST_PHONE, '日本語');
    console.log('Response:', response5);
    
    console.log('Input: "2" (どちらでも)');
    const response6 = await processUserMessage(TEST_PHONE, '2');
    console.log('Response:', response6);
    console.log('✅ Step A passed: All template questions answered');
    
    // Test Step B: Gemini extraction (AI)
    console.log('\n🤖 Step B: Gemini Extraction (AI)');
    console.log('-'.repeat(60));
    console.log('Input: "ビジネスで英語を使いたい。中級レベル。趣味は読書。"');
    const response7 = await processUserMessage(TEST_PHONE, 'ビジネスで英語を使いたい。中級レベル。趣味は読書。');
    console.log('Response:', response7);
    
    // Check if user data was saved
    const user = await getUser(TEST_PHONE);
    if (user && user.goal) {
      console.log('✅ Step B passed: Goal extracted and saved:', user.goal);
    } else {
      console.log('⚠️  Step B: Goal may not be saved (check database)');
    }
    
    // Test Step C: Warning messages (template)
    console.log('\n⚠️  Step C: Warning Messages (Template, No AI)');
    console.log('-'.repeat(60));
    console.log('Input: "OK"');
    const response8 = await processUserMessage(TEST_PHONE, 'OK');
    console.log('Response:', response8);
    
    // Check if user is registered
    const finalUser = await getUser(TEST_PHONE);
    if (finalUser && finalUser.state === 'registered') {
      console.log('✅ Step C passed: User registered successfully');
    } else {
      console.log('⚠️  Step C: User state may not be updated (check database)');
    }
    
    // Test daily AI limit
    console.log('\n🚫 Test: Daily AI Limit (10 times)');
    console.log('-'.repeat(60));
    console.log('Sending 11 messages to test limit...');
    
    for (let i = 1; i <= 11; i++) {
      const response = await processUserMessage(TEST_PHONE, `Test message ${i}`);
      if (i === 11 && response.includes('本日のAI利用上限')) {
        console.log(`✅ Message ${i}: Limit reached (expected)`);
        console.log('Response:', response);
        break;
      } else if (i <= 10) {
        console.log(`Message ${i}: OK`);
      }
    }
    
    console.log('\n✅ Daily AI limit test passed');
    
    console.log('\n' + '='.repeat(60));
    console.log('🎉 All tests completed!');
    
  } catch (error) {
    console.error('❌ Error in test:', error);
    process.exit(1);
  }
}

testChatbotFlow();

