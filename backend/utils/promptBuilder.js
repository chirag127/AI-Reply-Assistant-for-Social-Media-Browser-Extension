/**
 * Utility for building prompts for the Gemini API
 */

/**
 * Build a prompt for generating a reply to a social media post
 * @param {string} postText - The text of the post to reply to
 * @param {string} platform - The platform (Twitter, LinkedIn, Reddit)
 * @param {string} tone - The desired tone for the reply
 * @returns {string} - The formatted prompt
 */
function buildReplyPrompt(postText, platform, tone) {
    // Base prompt template
    const basePrompt = `You are an assistant helping users respond to social media posts.
Generate 3 distinct replies in a ${tone} tone to the following ${platform} post:

${postText}

Replies:
1.
2.
3. `;

    // Add platform-specific instructions
    let platformInstructions = "";

    switch (platform) {
        case "Twitter":
            platformInstructions = `
Keep the reply concise and under 280 characters.
Be engaging and conversational.`;
            break;
        case "LinkedIn":
            platformInstructions = `
Keep the reply professional and thoughtful.
Use appropriate business language.`;
            break;
        case "Reddit":
            platformInstructions = `
Match the style of typical Reddit comments.
Be conversational and authentic.`;
            break;
        default:
            // No specific instructions for other platforms
            break;
    }

    // Add tone-specific instructions
    let toneInstructions = "";

    switch (tone) {
        case "Friendly":
            toneInstructions = `
Be warm, approachable, and positive.
Use casual language and show genuine interest.`;
            break;
        case "Professional":
            toneInstructions = `
Be formal, respectful, and articulate.
Use proper grammar and avoid slang.`;
            break;
        case "Witty":
            toneInstructions = `
Be clever, humorous, and playful.
Use wordplay or light humor where appropriate.`;
            break;
        case "Supportive":
            toneInstructions = `
Be empathetic, encouraging, and understanding.
Validate the person's perspective and offer positive reinforcement.`;
            break;
        case "Sarcastic":
            toneInstructions = `
Use irony and dry humor.
Be playful but not mean-spirited.`;
            break;
        default:
            // Default to friendly if tone is not recognized
            toneInstructions = `
Be warm, approachable, and positive.
Use casual language and show genuine interest.`;
            break;
    }

    // Combine all instructions
    return `${basePrompt}${platformInstructions}${toneInstructions}`;
}

module.exports = {
    buildReplyPrompt,
};
