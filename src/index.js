const { optimizeQuery } = require('./optimizer');

/**
 * Optimizes the given SQL query programmatically.
 * @param {string} sql - The SQL query to be optimized.
 * @returns {Promise<Object>} - The AI formatted JSON object with optimization suggestions.
 */
async function optimize(sql) {
    return await optimizeQuery(sql);
}

module.exports = {
    optimize,
    optimizeQuery // Export underlying alias for explicit module consumption
};
