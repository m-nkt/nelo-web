/**
 * Test script for matching functionality
 * Run with: node scripts/test-matching.js
 */

import dotenv from 'dotenv';
import { findMatches } from '../src/services/matching.js';

dotenv.config();

async function testMatching() {
  try {
    const testPhoneNumber = process.env.TEST_PHONE_NUMBER || '+1234567890';
    
    console.log('🔍 Testing matching functionality...');
    console.log(`For user: ${testPhoneNumber}`);
    
    const matches = await findMatches(testPhoneNumber);
    
    console.log(`✅ Found ${matches.length} matches`);
    
    if (matches.length > 0) {
      console.log('\nMatches:');
      matches.forEach((match, index) => {
        console.log(`${index + 1}. ${match.phoneNumber}`);
        console.log(`   Learning: ${match.languageLearning}`);
        console.log(`   Teaching: ${match.languageTeaching}`);
        console.log(`   Level: ${match.level}`);
        console.log(`   Trust Score: ${match.trustScore}`);
      });
    } else {
      console.log('No matches found. Make sure you have users in the database.');
    }
  } catch (error) {
    console.error('❌ Error testing matching:', error);
    process.exit(1);
  }
}

testMatching();

