const { optimize } = require('./src/index');

async function runLocalTest() {
    // A deliberately sub-optimal query to trigger multiple static rules and AI suggestions
    // Missing WHERE, using SELECT *, and lacking explicit JOIN indexing validations
    const sampleQuery = "SELECT * FROM customers c JOIN orders o ON c.id = o.customer_id";

    console.log("🚀 Running local test for ai-sql-optimizer...\n");
    console.log(`--- Input Query ---\n${sampleQuery}\n`);
    console.log("Optimizing...\n");

    try {
        const resultJSON = await optimize(sampleQuery);
        
        console.log("✅ Optimization Complete!\n");
        console.log("--- Formatted Output ---");
        console.log(JSON.stringify(resultJSON, null, 2));
    } catch (error) {
        console.error("\n❌ Test failed with error:");
        console.error(error.message);
    }
}

runLocalTest();
