// Gemini API Service
// Using the exact implementation provided
const { GoogleGenAI } = require("@google/genai");
const mime = require("mime");
const config = require("../config/env");

/**
 * Generate reply suggestions using Gemini API
 * @param {string} prompt - The prompt to send to Gemini
 * @returns {Promise<string[]>} - Array of reply suggestions
 */
async function generateReplySuggestions(prompt) {
    try {
        // Initialize the Gemini API client
        const ai = new GoogleGenAI({
            apiKey: config.geminiApiKey,
        });

        // Configuration for the model
        const modelConfig = {
            responseMimeType: "text/plain",
        };

        // Model name
        const modelName = "gemini-2.5-flash-preview-04-17";

        // Prepare the contents with the prompt
        const contents = [
            {
                role: "user",
                parts: [
                    {
                        text: prompt,
                    },
                ],
            },
        ];

        // Generate content stream
        const response = await ai.models.generateContentStream({
            model: modelName,
            config: modelConfig,
            contents,
        });

        // Collect all text chunks
        let fullText = "";
        for await (const chunk of response) {
            fullText += chunk.text;
        }

        // Parse the response to extract the 3 distinct replies
        // Expected format:
        // 1. [Reply 1]
        // 2. [Reply 2]
        // 3. [Reply 3]
        const suggestions = [];

        // Use regex to extract numbered replies
        const replyRegex = /\d+\.\s+(.*?)(?=\n\d+\.|\n*$)/gs;
        let match;

        while ((match = replyRegex.exec(fullText)) !== null) {
            if (match[1].trim()) {
                suggestions.push(match[1].trim());
            }
        }

        // If we couldn't extract exactly 3 suggestions, handle the response differently
        if (suggestions.length !== 3) {
            // Try splitting by newlines if the regex didn't work
            const lines = fullText.split("\n").filter((line) => line.trim());

            if (lines.length >= 3) {
                // Take the first 3 non-empty lines
                for (
                    let i = 0;
                    i < lines.length && suggestions.length < 3;
                    i++
                ) {
                    const line = lines[i].trim();
                    if (line && !line.match(/^\d+\.$/)) {
                        // Remove any numbering at the beginning
                        const cleanLine = line.replace(/^\d+\.\s*/, "");
                        if (cleanLine && !suggestions.includes(cleanLine)) {
                            suggestions.push(cleanLine);
                        }
                    }
                }
            }
        }

        // If we still don't have 3 suggestions, use the whole response as one suggestion
        // and add default suggestions for the remaining slots
        if (suggestions.length === 0) {
            if (fullText) {
                suggestions.push(fullText.trim());
            }
        }

        // Fill with defaults if needed
        while (suggestions.length < 3) {
            const defaultSuggestions = [
                "I appreciate your perspective. Thanks for sharing!",
                "That's an interesting point. I'd love to hear more about it.",
                "Thanks for your post. I found it quite insightful.",
            ];

            // Add default suggestions that aren't already in the list
            for (const defaultSuggestion of defaultSuggestions) {
                if (!suggestions.includes(defaultSuggestion)) {
                    suggestions.push(defaultSuggestion);
                    if (suggestions.length === 3) break;
                }
            }
        }

        // Limit to 3 suggestions
        return suggestions.slice(0, 3);
    } catch (error) {
        console.error("Error generating reply with Gemini:", error);
        throw new Error("Failed to generate reply suggestions");
    }
}

module.exports = {
    generateReplySuggestions,
};
