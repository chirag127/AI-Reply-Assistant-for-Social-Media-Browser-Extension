# AI Reply Assistant for Social Media Browser Extension

![AI Reply Assistant Logo](extension/assets/icon128.png)

A browser extension that enables users to generate smart, context-aware, tone-adjusted replies to comments/posts on Twitter, LinkedIn, Reddit, and other social media platforms using AI.

## Features

-   **Context-Aware Reply Suggestions**: Generate relevant replies based on the content of posts/comments
-   **Tone Adjustment**: Choose from multiple tones (Friendly, Professional, Witty, Supportive, Sarcastic)
-   **Inline UI Integration**: Seamlessly integrates with social media platforms
-   **One-Click Reply**: Easily paste suggested replies into comment fields
-   **Multi-Platform Support**: Works with Twitter (X), LinkedIn, and Reddit

## Installation

### Prerequisites

-   Node.js and npm for the backend server
-   Chrome/Edge browser for the extension

### Backend Setup

1. Navigate to the backend directory:

    ```
    cd backend
    ```

2. Install dependencies:

    ```
    npm install
    ```

3. Create a `.env` file based on `.env.example` and add your Gemini API key:

    ```
    PORT=3000
    GEMINI_API_KEY=your_gemini_api_key_here
    ```

4. Start the server:
    ```
    npm start
    ```

### Extension Setup

1. Open Chrome/Edge and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top-right corner
3. Click "Load unpacked" and select the `extension` directory
4. The extension should now be installed and visible in your browser toolbar

## Usage

1. Navigate to Twitter, LinkedIn, or Reddit
2. Find a post or comment you want to reply to
3. Click the "💬 AI Reply" button that appears in the post's action bar
4. Select your preferred tone from the dropdown
5. Choose one of the suggested replies
6. The selected reply will be automatically pasted into the comment field

## Development

### Project Structure

```
ai-reply-assistant/
├── extension/           # Browser extension
│   ├── assets/          # Icons, logos
│   ├── content-scripts/ # Platform-specific scripts
│   ├── ui/              # UI components
│   ├── styles/          # CSS styles
│   ├── scripts/         # JS scripts
│   ├── manifest.json    # Extension manifest
│   └── background.js    # Background script
│
├── backend/            # Node.js backend
│   ├── routes/         # API routes
│   ├── services/       # Services (Gemini API)
│   ├── utils/          # Utilities
│   ├── config/         # Configuration
│   ├── app.js          # Express app
│   └── package.json    # Dependencies
```

## License

MIT

## Author

Chirag Singhal
