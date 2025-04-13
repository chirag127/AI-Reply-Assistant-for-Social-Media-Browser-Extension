Here’s a detailed **Product Requirements Document (PRD)** for the **AI Reply Assistant for Social Media** browser extension.

---

# 🧠 AI Reply Assistant for Social Media – PRD

### 📌 Product Name
**AI Reply Assistant**

### 🧭 Purpose
Enable users to generate smart, context-aware, tone-adjusted replies to comments/posts on Twitter, LinkedIn, Reddit, etc., directly within the browser using AI.

---

## 🔍 Key Features

### 1. **Context-Aware Reply Suggestions**
- Detect the selected post/comment on social platforms.
- Send its text to the backend.
- Receive AI-generated reply suggestions.

### 2. **Tone Adjustment Options**
- User selects tone (e.g., Friendly, Professional, Witty, Supportive, Sarcastic).
- AI adjusts the response accordingly.

### 3. **Inline UI Integration**
- Show a small “💬 AI Reply” button next to posts/comments.
- Clicking it shows tone selector + generated suggestions (3 max).

### 4. **One-Click Reply**
- Clicking a suggestion pastes it into the reply box of the platform (Twitter, Reddit, etc.).

### 5. **Prompt Customization (Optional - Phase 2)**
- Let users tweak the AI prompt for deeper personalization.

---

## 🎯 Target Platforms
- **Twitter (X)**
- **LinkedIn**
- **Reddit**
- (Scalable to others like Facebook, YouTube)

---

## 🛠 Tech Stack

### 🧩 Frontend (Browser Extension)
- **Manifest V3**
- **HTML, CSS, JavaScript**
- Web scraping + DOM injection per platform
- Communicates with backend using `fetch` and `chrome.runtime`

### 🤖 Backend (AI Service)
- **Express.js (Node.js)**
- Routes: `/generate-reply`
- Uses **Gemini 2.0 Flash Lite API** for AI generation
- Tone handling via dynamic prompting

---

## 📂 Modular Project Structure

```
ai-reply-assistant/
├── extension/
│   ├── assets/                   # Icons, logos
│   ├── content-scripts/         # Per-platform injection logic
│   │   ├── x.js
│   │   ├── linkedin.js
│   │   └── reddit.js
│   ├── ui/
│   │   ├── tone-selector.html   # Tone dropdown
│   │   └── suggestion-box.html  # Reply options popup
│   ├── styles/
│   │   └── popup.css
│   ├── scripts/
│   │   └── popup.js             # Handles tone selection + reply rendering
│   ├── manifest.json
│   └── background.js            # Message handling, context bridge
│make the Project Structure as modular as possible.

├── backend/
│   ├── routes/
│   │   └── generateReply.js     # Handles AI reply generation
│   ├── services/
│   │   └── geminiService.js     # Gemini 2.0 API wrapper
│   ├── utils/
│   │   └── promptBuilder.js     # Builds prompts based on tone and platform
│   ├── config/
│   │   └── env.js               # API keys, environment vars
│   ├── app.js                   # Express app entry
│   └── package.json
│make the Project Structure as modular as possible.

└── README.md
```

---

## 🧪 AI Prompt Format

```txt
You are an assistant helping users respond to social media posts.
Generate a reply in a [TONE] tone to the following [PLATFORM] post:

[POST TEXT]

Reply:
```

---

## 📈 Milestones

| Milestone                        | Status  |
|----------------------------------|---------|
| Platform DOM Injection (Twitter, Reddit, LinkedIn) | ✅ |
| Tone Selector UI                 | ✅ |
| Gemini 2.0 API Setup             | ✅ |
| Reply Generation Backend         | ✅ |
| One-Click Paste into Reply Field | ⏳ |
| Chrome Web Store Submission      | ⏳ |

---

## 🧪 Testing Plan
- Use dev social media accounts.
- Test DOM selectors for posts/comments.
- Mock Gemini API responses.
- Ensure tone adjustment reflects different output styles.

---

## 🔐 Privacy & Security
- No user data stored.
- Backend is stateless and only relays post content + tone to Gemini API.
- Optionally inform users of this in a non-intrusive way.

---

## 🧠 Stretch Features (Phase 2+)
- Tone Training Mode (learn your tone from past tweets)
- Sentiment Matching (match tone of original post)
- Summary before reply
- “Roast” mode (fun use only, with disclaimers)
