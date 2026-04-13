# AI SQL Optimizer 🚀

> An intelligent Node.js library and CLI tool that leverages Groq and Llama 3 to analyze, refactor, and index your SQL queries at lightning speed.

`ai-sql-optimizer` acts as your personal AI Database Administrator. By integrating seamlessly into your CLI or directly into your Node.js application, it detects anti-patterns, suggests intelligent schema indexes, and rewrites your raw SQL queries for maximum performance.

## 🌟 Features

- **CLI Support**: Seamlessly optimize query strings instantly via your terminal.
- **Node.js Integration**: Built as a standard CommonJS module so you can script query performance testing programmatically.
- **Groq Powered**: Uses the official `openai` SDK pointing to Groq's API for blazing-fast inference using the `llama-3.1-8b-instant` model.
- **Strict Formatting**: Automatically breaks down outputs into the optimized query, safe index suggestions, and exact technical explanations using strictly enforced valid JSON.

## 📦 Installation

To use the package globally as a CLI tool:
```bash
npm install -g ai-sql-optimizer
```

Or install it locally as a dependency in your own Node.js project:
```bash
npm install ai-sql-optimizer
```

## ⚙️ Configuration

To run this tool, you will need to provide your Groq API key using environment variables. This project uses the `dotenv` package to securely load variables from a `.env` file into Node.js.

1. In the root of your project, clone the example env:
   ```bash
   cp .env.example .env
   ```
2. Open the newly created `.env` file and configure your API key:
   ```env
   GROQ_API_KEY=gsk_your-real-api-key-here
   ```

### Using `dotenv` in Node.js

We make API authentication a breeze. The `dotenv` package is automatically initialized at the top of our module via `require('dotenv').config()`. 

This reads your `.env` file and securely binds your authentication key to Node's `process.env.GROQ_API_KEY`. Behind the scenes, the OpenAI compatibility client natively uses this variable to hit the Groq infrastructure, eliminating any need to hardcode tokens.

## 💻 Usage

### 1. Command Line Interface (CLI)

Once installed globally, you can pass any raw SQL query directly to the `ai-sql-opt` command:

```bash
ai-sql-opt "SELECT * FROM users u LEFT JOIN orders o ON u.id = o.user_id WHERE o.status = 'PENDING';"
```

### 2. Programmatic Usage (Node.js)

You can pull the library directly into your own codebase using standard CommonJS modules:

```javascript
require('dotenv').config(); // Load your project's local env
const { optimize } = require('ai-sql-optimizer');

async function testPerformance() {
    const rawSql = "SELECT name, email FROM accounts WHERE id IN (SELECT account_id FROM subscriptions);";
    
    // Call the asynchronous optimize method
    const output = await optimize(rawSql);
    console.log(output);
}

testPerformance();
```

## 📊 Example Input/Output

### Input
```bash
ai-sql-opt "SELECT * FROM Customers"
```

### Output
```text
--- Original Query ---
SELECT * FROM Customers

Optimizing...

{
  "optimizedQuery": "SELECT id, name, email FROM Customers",
  "suggestions": [
     "[Static Rule] Detected 'SELECT *'. Avoid this in production as it increases network IO; always specify exact columns.",
     "Consider adding a WHERE clause before indexing for better performance tuning",
     "Consider indexing columns that are frequently used in WHERE or JOIN conditions"
  ],
  "explanation": "Replacing 'SELECT *' with explicit columns prevents over-fetching. We avoided suggesting exact index columns since the query lacks WHERE or JOIN predicates."
}
```

## 🔮 Future Improvements

- [ ] Provide configurable Groq models and temperature settings via CLI flags.
- [ ] Introduce schema integrations so the AI can analyze database layouts and exact types, not just the raw SQL.
- [ ] Integrate with popular ORM logging tools natively.

## 📄 License

This project is licensed under the MIT License.
