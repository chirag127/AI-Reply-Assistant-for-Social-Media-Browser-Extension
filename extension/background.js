// AI Reply Assistant - Background Script
// Handles message passing between content scripts and the backend API

// Configuration
const API_ENDPOINT = 'http://localhost:3000/generate-reply';

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'generateReply') {
    generateReply(message.postText, message.platform, message.tone)
      .then(suggestions => {
        sendResponse({ success: true, suggestions });
      })
      .catch(error => {
        console.error('Error generating reply:', error);
        sendResponse({ success: false, error: error.message });
      });
    
    // Return true to indicate we'll respond asynchronously
    return true;
  }
});

// Function to call the backend API for reply generation
async function generateReply(postText, platform, tone) {
  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        postText,
        platform,
        tone
      }),
    });

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();
    return data.suggestions;
  } catch (error) {
    console.error('Error calling API:', error);
    throw error;
  }
}

// Log when the extension is installed or updated
chrome.runtime.onInstalled.addListener(() => {
  console.log('AI Reply Assistant installed/updated');
});
