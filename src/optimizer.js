require('dotenv').config();
const OpenAI = require("openai");
const { buildPrompt } = require('./prompt');
const { runRuleBasedOptimization } = require('./rules');

let client; // Lazy initialization

/**
 * Cleans the AI response string by removing markdown blocks and trimming.
 * @param {string} text - Raw response text.
 * @returns {string} - Cleaned text.
 */
function cleanAIResponse(text) {
    if (!text) return '';
    let curr = text.trim();
    if (curr.startsWith('```json')) {
        curr = curr.substring(7);
    } else if (curr.startsWith('```')) {
        curr = curr.substring(3);
    }
    if (curr.endsWith('```')) {
        curr = curr.substring(0, curr.length - 3);
    }
    return curr.trim();
}

/**
 * Returns a properly initialized OpenAI client configured for Groq.
 * @returns {Object} - The configured OpenAI client.
 */
function getOpenAIClient() {
    if (!client) {
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            throw new Error('Error: Missing credentials. Please set the GROQ_API_KEY environment variable in a .env file or system environment variables.');
        }
        client = new OpenAI({
            apiKey: apiKey,
            baseURL: "https://api.groq.com/openai/v1"
        });
    }
    return client;
}

/**
 * Optimizes the given SQL query using a hybrid rule-based and AI approach.
 * @param {string} query - The original SQL query.
 * @returns {Promise<Object>} - The JSON formatting response containing optimizedQuery, suggestions, and explanation.
 */
async function optimizeQuery(query) {
    if (!query || typeof query !== 'string' || query.trim() === '') {
        throw new Error('Invalid query input. Please provide a valid SQL query string.');
    }

    // 1. Run static rules
    const ruleSuggestions = runRuleBasedOptimization(query);

    // 2. Run AI generation
    const promptText = buildPrompt(query);

    try {
        const openaiClient = getOpenAIClient();
        const response = await openaiClient.chat.completions.create({
            model: "llama-3.1-8b-instant",
            messages: [
                {
                    role: "system",
                    content: "You are a SQL optimization expert. Return only valid JSON."
                },
                {
                    role: "user",
                    content: promptText
                }
            ],
            temperature: 0.2
        });
        
        const aiResponseText = response.choices[0]?.message?.content;
        
        if (!aiResponseText) {
            throw new Error('Empty response returned from the Groq API.');
        }

        const cleanedText = cleanAIResponse(aiResponseText);
        
        const aiParsed = JSON.parse(cleanedText);
        
        // 3. Merge outputs transparently 
        if (ruleSuggestions.length > 0) {
            if (!aiParsed || !Array.isArray(aiParsed.suggestions)) {
                aiParsed = aiParsed || {};
                aiParsed.suggestions = [];
            }
            aiParsed.suggestions = [...ruleSuggestions.map(msg => `[Static Rule] ${msg}`), ...aiParsed.suggestions];
        }

        return {
            optimizedQuery: aiParsed?.optimizedQuery || query,
            suggestions: Array.isArray(aiParsed?.suggestions) ? aiParsed.suggestions : [],
            explanation: aiParsed?.explanation || "No explanation provided."
        };
    } catch (error) {
        console.warn(`Optimization API Error: ${error.message || 'Unknown error occurred'}. Falling back to rule-based optimization.`);
        return {
            optimizedQuery: query,
            suggestions: ruleSuggestions,
            explanation: "Using rule-based optimization (AI unavailable)"
        };
    }
}

module.exports = {
    optimizeQuery,
    cleanAIResponse,
    getOpenAIClient
};
