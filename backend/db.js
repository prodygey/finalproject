
// Purpose: Load environment variables from backend/.env.
require("dotenv").config();

// Purpose: Import PostgreSQL connection pool.
const { Pool } = require("pg");

// Purpose: Connect to Neon using its secure connection string.
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// Purpose: Display unexpected database connection errors.
pool.on("error", (error) => {
    console.error("Unexpected PostgreSQL pool error:", error.message);
});

// Purpose: Export the pool for API routes.
module.exports = pool;
