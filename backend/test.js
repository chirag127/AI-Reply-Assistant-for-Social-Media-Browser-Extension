// Test script for the AI Reply Assistant backend
const fetch = require('node-fetch');

// Configuration
const API_URL = 'http://localhost:3000';
const TEST_POST = 'I just launched my new product and I\'m really excited about it!';
const TEST_PLATFORM = 'Twitter';
const TEST_TONE = 'Professional';

// Test the generate-reply endpoint
async function testGenerateReply() {
  try {
    console.log('Testing generate-reply endpoint...');
    console.log(`Post: "${TEST_POST}"`);
    console.log(`Platform: ${TEST_PLATFORM}`);
    console.log(`Tone: ${TEST_TONE}`);
    console.log('Sending request...');
    
    const response = await fetch(`${API_URL}/generate-reply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        postText: TEST_POST,
        platform: TEST_PLATFORM,
        tone: TEST_TONE
      }),
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('\nSuccess! Generated suggestions:');
      data.suggestions.forEach((suggestion, index) => {
        console.log(`\n[${index + 1}] ${suggestion}`);
      });
    } else {
      console.error('\nError:', data.error);
    }
  } catch (error) {
    console.error('\nFailed to test API:', error.message);
    console.log('Make sure the backend server is running on http://localhost:3000');
  }
}

// Test the health endpoint
async function testHealthEndpoint() {
  try {
    console.log('\nTesting health endpoint...');
    
    const response = await fetch(`${API_URL}/health`);
    const data = await response.json();
    
    console.log('Health check response:', data);
  } catch (error) {
    console.error('\nFailed to test health endpoint:', error.message);
  }
}

// Run the tests
async function runTests() {
  console.log('=== AI Reply Assistant API Tests ===\n');
  
  await testHealthEndpoint();
  console.log('\n-----------------------------------\n');
  await testGenerateReply();
  
  console.log('\n=== Tests completed ===');
}

runTests();
