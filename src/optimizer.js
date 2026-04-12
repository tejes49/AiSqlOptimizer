require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { buildPrompt } = require('./prompt');
const { runRuleBasedOptimization } = require('./rules');

let genAI; // Lazy initialization

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
 * Returns a properly initialized Gemini model with given name.
 * @param {string} modelName - The model identifier to use.
 * @returns {Object} - The configured Gemini model.
 */
function getGeminiModel(modelName = 'gemini-1.5-flash') {
    if (!genAI) {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error('Error: Missing credentials. Please set the GEMINI_API_KEY environment variable in a .env file or system environment variables.');
        }
        genAI = new GoogleGenerativeAI(apiKey);
    }
    const systemInstruction = 'You are an advanced SQL database AI assistant. You output valid JSON only.';
    return genAI.getGenerativeModel({ model: modelName, systemInstruction });
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

    const fallbackModelName = 'gemini-1.5-pro';
    const modelsToTry = ['gemini-1.5-flash', fallbackModelName];
    
    let aiParsed = null;
    let lastError = null;
    let success = false;

    for (let currentModel of modelsToTry) {
        try {
            const model = getGeminiModel(currentModel);
            const result = await model.generateContent(promptText);
            const aiResponseText = result.response.text();
            
            if (!aiResponseText) {
                throw new Error('Empty response returned from the Gemini API.');
            }

            const cleanedText = cleanAIResponse(aiResponseText);
            
            aiParsed = JSON.parse(cleanedText);
            
            success = true;
            break; // Succeeded, exit loop
        } catch (error) {
            lastError = error;
            // Check if it's a 404 or empty response error implicitly caught here, let it retry with fallback.
            // Specific string matching isn't strictly necessary since we fallback on any fatal error like parsing or 404.
            const isModelNotFoundError = error.message && error.message.includes('404');
            const isEmptyResponse = error.message && error.message.includes('Empty response');
            
            // If it's the last standard model fallback iteration, or an explicitly un-recoverable error, we could break.
            // But for safety and maximum robustness against changing model availability, we log and retry the next model.
        }
    }

    if (!success) {
        throw new Error(`Optimization Error after retries: ${lastError?.message || 'Unknown error occurred'}`);
    }

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
}

module.exports = {
    optimizeQuery,
    cleanAIResponse,
    getGeminiModel
};
