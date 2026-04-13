require('dotenv').config();
const { getOpenAIClient } = require('./src/optimizer');

async function testConnection() {
    console.log("=== Groq API Connection Test ===");
    
    // Verify Environment Setup
    const apiKey = process.env.GROQ_API_KEY;
    if (apiKey) {
        console.log("✅ GROQ_API_KEY is loaded (length: " + apiKey.length + ")");
    } else {
        console.log("❌ GROQ_API_KEY is missing! The API call will fail.");
    }

    try {
        // Verify Client Initialization
        const client = getOpenAIClient();
        console.log("✅ OpenAI client initialized correctly (targeting Groq).");

        // Verify API Call
        console.log("⏳ Sending request to 'llama-3.1-8b-instant' model...");
        const response = await client.chat.completions.create({
            model: "llama-3.1-8b-instant",
            messages: [{ role: "user", content: "Say hello" }]
        });

        console.log("\n✅ Response Received:");
        console.log("--------------------------");
        console.log(response.choices[0].message.content);
        console.log("--------------------------\n");

    } catch (error) {
        console.log("\n❌ Request Failed:");
        console.error(error.message);
    }
}

testConnection();
