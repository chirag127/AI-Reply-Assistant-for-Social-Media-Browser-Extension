// Health Check Route
const express = require('express');
const router = express.Router();

/**
 * GET /health
 * Health check endpoint for the API
 */
router.get('/', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'AI Reply Assistant Backend'
  });
});

module.exports = router;
