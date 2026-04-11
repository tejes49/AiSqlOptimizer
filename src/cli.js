#!/usr/bin/env node

const { optimize } = require('./index');

/**
 * Handles the Command Line Interface execution for ai-sql-optimizer.
 */
async function runCli() {
    const args = process.argv.slice(2);

    if (args.length === 0) {
        console.error('Error: No SQL query provided.');
        console.error('Usage: ai-sql-opt "<sql_query>"');
        console.error('Example: ai-sql-opt "SELECT * FROM users"');
        process.exit(1);
    }

    const query = args[0];

    try {
        console.log('--- Original Query ---');
        console.log(query);
        console.log('\nOptimizing...\n');
        
        const resultJSON = await optimize(query);
        
        // Output nicely formatted JSON to the console
        console.log(JSON.stringify(resultJSON, null, 2));
    } catch (error) {
        console.error('\nAn error occurred during optimization:');
        console.error(error.message);
        process.exit(1);
    }
}

runCli();
