
// Purpose: Load environment variables from the backend .env file.
require('dotenv').config();

// Purpose: Import PostgreSQL's connection-pool class.
const { Pool } = require('pg');

// Purpose: Create a reusable pool using the database settings.
const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// Purpose: Print connection errors so they are visible in the terminal.
pool.on('error', (error) => {
  console.error('Unexpected PostgreSQL pool error:', error.message);
});

// Purpose: Export the pool so API routes can execute SQL queries.
module.exports = pool;
