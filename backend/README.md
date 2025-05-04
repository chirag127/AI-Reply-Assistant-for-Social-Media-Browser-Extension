# AI Reply Assistant - Backend

Node.js/Express.js backend service for the AI Reply Assistant browser extension. This service handles requests from the extension, interacts with the Gemini API, and returns AI-generated reply suggestions.

## Features

- **Express.js API**: RESTful API for generating reply suggestions
- **Gemini Integration**: Uses Google's Gemini 2.5 Flash Preview model for AI-powered reply generation
- **Context-Aware Replies**: Generates replies based on post content, platform, and selected tone
- **Stateless Design**: No user accounts or persistent storage of user data/post content
- **Error Handling**: Robust error handling for API failures and invalid requests

## Installation

### Prerequisites

- Node.js and npm

### Setup

1. Clone the repository
2. Navigate to the backend directory:
   ```
   cd backend
   ```
3. Install dependencies:
   ```
   npm install
   ```
4. Create a `.env` file based on `.env.example` and add your Gemini API key:
   ```
   PORT=3000
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
5. Start the server:
   ```
   npm start
   ```
   
For development with auto-restart:
```
npm run dev
```

## API Endpoints

### `GET /health`

Health check endpoint to verify the API is running.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-08-01T12:00:00.000Z",
  "service": "AI Reply Assistant Backend"
}
```

### `POST /generate-reply`

Generate AI reply suggestions for a social media post.

**Request Body:**
```json
{
  "postText": "I just launched my new product and I'm really excited about it!",
  "platform": "Twitter",
  "tone": "Professional"
}
```

**Response:**
```json
{
  "success": true,
  "suggestions": [
    "Congratulations on your product launch! Wishing you great success with this new venture.",
    "This is an exciting milestone. Looking forward to seeing how your product evolves in the market.",
    "A product launch is a significant achievement. Best wishes for continued innovation and growth."
  ]
}
```

## Project Structure

```
backend/
├── config/         # Configuration files
├── routes/         # API routes
├── services/       # Services (Gemini API)
├── utils/          # Utilities
├── app.js          # Express app
├── test.js         # Test script
└── package.json    # Dependencies
```

## Testing

Run the test script to verify the API is working correctly:
```
npm test
```

This will test the health endpoint and the generate-reply endpoint with a sample post.

## Error Handling

The API includes robust error handling for:
- Invalid requests (missing parameters)
- Gemini API failures
- Server errors

## Author

Chirag Singhal
