// Gemini API Service
const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../config/env');

// Initialize the Gemini API client
const genAI = new GoogleGenerativeAI(config.geminiApiKey);

// Get the Gemini model (using Flash Lite for quick responses)
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });

/**
 * Generate reply suggestions using Gemini API
 * @param {string} prompt - The prompt to send to Gemini
 * @param {number} numSuggestions - Number of suggestions to generate
 * @returns {Promise<string[]>} - Array of reply suggestions
 */
async function generateReplySuggestions(prompt, numSuggestions = 3) {
  try {
    // Generate multiple suggestions
    const suggestions = [];
    
    // Generate each suggestion separately to ensure diversity
    for (let i = 0; i < numSuggestions; i++) {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim();
      
      // Add to suggestions if not empty and not a duplicate
      if (text && !suggestions.includes(text)) {
        suggestions.push(text);
      }
    }
    
    // If we couldn't generate enough unique suggestions, fill with defaults
    while (suggestions.length < numSuggestions) {
      suggestions.push(`I appreciate your perspective. Thanks for sharing!`);
    }
    
    return suggestions;
  } catch (error) {
    console.error('Error generating reply with Gemini:', error);
    throw new Error('Failed to generate reply suggestions');
  }
}

module.exports = {
  generateReplySuggestions
};
