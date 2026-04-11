require('dotenv').config();
const { OpenAI } = require('openai');
const { buildPrompt } = require('./prompt');
const { runRuleBasedOptimization } = require('./rules');

// Initialize the OpenAI client
const openai = new OpenAI();

/**
 * Optimizes the given SQL query using a hybrid rule-based and AI approach.
 * @param {string} query - The original SQL query.
 * @returns {Promise<Object>} - The JSON formatting response containing optimizedQuery, suggestions, and explanation.
 */
async function optimizeQuery(query) {
    if (!query || typeof query !== 'string' || query.trim() === '') {
        throw new Error('Invalid query input. Please provide a valid SQL query string.');
    }

    try {
        // 1. Run static rules
        const ruleSuggestions = runRuleBasedOptimization(query);

        // 2. Run AI generation
        const promptText = buildPrompt(query);

        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            response_format: { type: "json_object" }, // Enforce JSON Output via API
            messages: [
                { role: 'system', content: 'You are an advanced SQL database AI assistant. You output valid JSON only.' },
                { role: 'user', content: promptText }
            ],
            temperature: 0.1, 
        });

        if (!response.choices || response.choices.length === 0 || !response.choices[0].message) {
            throw new Error('Invalid or empty response returned from the OpenAI API.');
        }

        const aiResponseText = response.choices[0].message.content;
        
        let aiParsed;
        try {
            aiParsed = JSON.parse(aiResponseText);
        } catch (parseError) {
            throw new Error(`Failed to parse AI response as JSON: ${parseError.message}`);
        }

        // 3. Merge outputs transparently 
        // We prepend the local static rule checks to the AI's suggestions array
        if (ruleSuggestions.length > 0) {
            if (!Array.isArray(aiParsed.suggestions)) {
                aiParsed.suggestions = [];
            }
            aiParsed.suggestions = [...ruleSuggestions.map(msg => `[Static Rule] ${msg}`), ...aiParsed.suggestions];
        }

        // Enforce the data format matches the requested schema fully
        return {
            optimizedQuery: aiParsed.optimizedQuery || query,
            suggestions: Array.isArray(aiParsed.suggestions) ? aiParsed.suggestions : [],
            explanation: aiParsed.explanation || "No explanation provided."
        };

    } catch (error) {
        if (error instanceof OpenAI.APIError) {
            throw new Error(`OpenAI API Error (${error.status}): ${error.message}`);
        } else {
            throw new Error(`Optimization Error: ${error.message}`);
        }
    }
}

module.exports = {
    optimizeQuery
};
