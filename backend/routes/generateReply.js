// Generate Reply Route
const express = require('express');
const router = express.Router();
const geminiService = require('../services/geminiService');
const promptBuilder = require('../utils/promptBuilder');

/**
 * POST /generate-reply
 * Generate AI reply suggestions for a social media post
 */
router.post('/', async (req, res) => {
  try {
    // Extract request data
    const { postText, platform, tone } = req.body;
    
    // Validate request data
    if (!postText) {
      return res.status(400).json({ 
        success: false, 
        error: 'Post text is required' 
      });
    }
    
    if (!platform) {
      return res.status(400).json({ 
        success: false, 
        error: 'Platform is required' 
      });
    }
    
    if (!tone) {
      return res.status(400).json({ 
        success: false, 
        error: 'Tone is required' 
      });
    }
    
    // Build the prompt
    const prompt = promptBuilder.buildReplyPrompt(postText, platform, tone);
    
    // Generate reply suggestions
    const suggestions = await geminiService.generateReplySuggestions(prompt);
    
    // Return the suggestions
    res.json({
      success: true,
      suggestions
    });
  } catch (error) {
    console.error('Error generating reply:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate reply suggestions'
    });
  }
});

module.exports = router;
