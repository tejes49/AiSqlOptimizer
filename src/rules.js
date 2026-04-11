/**
 * Runs basic static analysis rules on a SQL query.
 * @param {string} query - The original SQL query.
 * @returns {string[]} An array of suggestion strings.
 */
function runRuleBasedOptimization(query) {
    const suggestions = [];
    const upperQuery = query.toUpperCase();

    if (upperQuery.includes('SELECT *')) {
        suggestions.push("Detected 'SELECT *'. Avoid this in production as it increases network IO; always specify exact columns.");
    }

    const isModificationOrSelect = upperQuery.includes('UPDATE') || upperQuery.includes('DELETE') || upperQuery.includes('SELECT');
    if (isModificationOrSelect && !upperQuery.includes('WHERE')) {
        suggestions.push("Suspicious query: Missing 'WHERE' clause. This could result in a full table scan, update, or deletion.");
    }

    const whereMatch = query.match(/WHERE\s+([a-zA-Z0-9_\.]+)/i);
    if (whereMatch) {
         suggestions.push(`Make sure to evaluate indexing on the column detected in the WHERE clause: '${whereMatch[1]}'.`);
    }

    const joinMatch = query.match(/JOIN\s+[a-zA-Z0-9_\.]+\s+(?:AS\s+[a-zA-Z0-9_]+\s+)?ON\s+([a-zA-Z0-9_\.]+)/i);
    if (joinMatch) {
         suggestions.push(`Make sure to evaluate indexing on the column used in the JOIN condition: '${joinMatch[1]}'.`);
    }

    return suggestions;
}

module.exports = {
    runRuleBasedOptimization
};
