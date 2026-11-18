
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

// Purpose: Export the pool for database queries.
module.exports = pool;
