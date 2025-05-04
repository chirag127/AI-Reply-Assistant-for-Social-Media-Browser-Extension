# AI Reply Assistant - Extension

A browser extension that enables users to generate smart, context-aware, tone-adjusted replies to comments/posts on Twitter, LinkedIn, and Reddit using AI.

## Features

- **Context-Aware Reply Suggestions**: Generate relevant replies based on the content of posts/comments
- **Tone Adjustment**: Choose from multiple tones (Friendly, Professional, Witty, Supportive, Sarcastic)
- **Inline UI Integration**: Seamlessly integrates with social media platforms
- **One-Click Reply**: Easily paste suggested replies into comment fields
- **Multi-Platform Support**: Works with Twitter (X), LinkedIn, and Reddit

## Installation

1. Open Chrome/Edge and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top-right corner
3. Click "Load unpacked" and select this directory
4. The extension should now be installed and visible in your browser toolbar

## Usage

1. Navigate to Twitter, LinkedIn, or Reddit
2. Find a post or comment you want to reply to
3. Click the "💬 AI Reply" button that appears in the post's action bar
4. Select your preferred tone from the dropdown
5. Choose one of the suggested replies
6. The selected reply will be automatically pasted into the comment field

## Project Structure

```
extension/
├── assets/          # Icons, logos
├── content-scripts/ # Platform-specific scripts
├── ui/              # UI components
├── styles/          # CSS styles
├── scripts/         # JS scripts
├── manifest.json    # Extension manifest
└── background.js    # Background script
```

## Development

### Content Scripts

The extension uses content scripts to inject the "AI Reply" button into the DOM of supported platforms:

- `twitter.js`: Handles Twitter/X integration
- `linkedin.js`: Handles LinkedIn integration
- `reddit.js`: Handles Reddit integration

Each content script is responsible for:
1. Identifying posts/comments
2. Injecting the "AI Reply" button
3. Extracting post text
4. Displaying the tone selector
5. Displaying reply suggestions
6. Pasting the selected reply into the comment field

### Background Script

The background script (`background.js`) handles communication between content scripts and the backend API. It:

1. Receives messages from content scripts
2. Makes API calls to the backend
3. Returns the generated replies to the content scripts

### UI Components

The extension includes several UI components:
- `popup.html`: The main popup that appears when clicking the extension icon
- `tone-selector.html`: The tone selection UI
- `suggestion-box.html`: The UI for displaying generated reply suggestions

## Configuration

The extension can be configured to use a different backend API endpoint by setting the `apiBaseUrl` in chrome.storage.local.

## Author

Chirag Singhal
