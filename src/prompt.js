/**
 * Generates an AI prompt for the given SQL query.
 * @param {string} query - The original SQL query.
 * @returns {string} - The structured AI prompt.
 */
function buildPrompt(query) {
    return `You are a SQL performance expert and database administrator.
Please review the following SQL query and perform the following tasks:
1. Optimize the query for maximum performance.
2. Suggest any necessary indexes to improve query execution.
3. Detect and explain any bad practices in the original query.
4. Explain the improvements made to the query.

CRITICAL OPTIMIZATION RULES:
- Do NOT return "SELECT *". Never use it.
- If the original query uses "SELECT *", replace it with realistic explicit column examples (e.g., SELECT id, name, email FROM users).
- Ensure the optimization is structurally meaningful, not just aliasing tables.
- INDEXING RULES: Do NOT suggest creating specific indexes based on assumed uses of columns (like email). Only suggest specific indexes IF the query actually contains a WHERE clause (suggest index on filtered column) or a JOIN condition (suggest index on join keys). If the query lacks BOTH a WHERE clause and a JOIN condition, you MUST suggest the EXACT phrase: "Consider indexing columns that are frequently used in WHERE or JOIN conditions" as well as the phrase: "Consider adding a WHERE clause before indexing for better performance tuning".

SQL Query:
\`\`\`sql
${query}
\`\`\`

You MUST respond strictly in valid JSON format matching the following schema:
{
  "optimizedQuery": "[Your optimized SQL here]",
  "suggestions": [
    "[Your first index suggestion or bad practice detection here]",
    "[Your second suggestion here]"
  ],
  "explanation": "[Your explanation of improvements here]"
}`;
}

module.exports = {
    buildPrompt
};
