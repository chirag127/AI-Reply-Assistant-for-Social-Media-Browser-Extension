// Load environment variables from .env file
require('dotenv').config();

// Export configuration
module.exports = {
  // Server configuration
  port: process.env.PORT || 3000,
  
  // Gemini API configuration
  geminiApiKey: process.env.GEMINI_API_KEY,
  
  // CORS configuration
  corsOptions: {
    origin: ['chrome-extension://*'],
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }
};
