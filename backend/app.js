// AI Reply Assistant Backend
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const config = require('./config/env');

// Import routes
const generateReplyRoute = require('./routes/generateReply');
const healthRoute = require('./routes/health');

// Initialize Express app
const app = express();

// Middleware
app.use(morgan('dev')); // Logging
app.use(cors()); // CORS for browser extension
app.use(express.json()); // Parse JSON request bodies

// Routes
app.use('/generate-reply', generateReplyRoute);
app.use('/health', healthRoute);

// Root route
app.get('/', (req, res) => {
  res.json({
    name: 'AI Reply Assistant API',
    version: '1.0.0',
    status: 'running'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Internal Server Error'
  });
});

// Start the server
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Generate reply endpoint: http://localhost:${PORT}/generate-reply`);
});
