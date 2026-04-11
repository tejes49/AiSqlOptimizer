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
