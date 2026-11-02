
// Purpose: Load the backend's environment variables.
require('dotenv').config();

// Purpose: Import Express, CORS, and the PostgreSQL pool.
const express = require('express');
const cors = require('cors');
const pool = require('./db');




// Purpose: Load the registration, login, and profile endpoints.
const authRoutes = require('./routes/auth');

// Purpose: Import the book and chapter endpoints.
const bookRoutes = require('./routes/books');

// Purpose: Import the newsfeed endpoints.
const postRoutes = require('./routes/posts');

// Purpose: Import the comments, likes, and library endpoints.
const interactionRoutes = require('./routes/interactions');

// Purpose: Import administrator-only endpoints.
const adminRoutes = require('./routes/admin');




// Purpose: Create the Express application.
const app = express();

// Purpose: Allow the Ionic frontend to call the API during development.
app.use(cors());

// Purpose: Allow Express to read JSON request bodies.
app.use(express.json());

// Purpose: Mount the interaction endpoints under /api.
app.use('/api', interactionRoutes);

// Purpose: Mount administrator endpoints under /api/admin.
app.use('/api/admin', adminRoutes);



// Purpose: Mount authentication endpoints under /api/auth.
app.use('/api/auth', authRoutes);

// Purpose: Make book endpoints available at /api/books.
app.use('/api/books', bookRoutes);

// Purpose: Mount the newsfeed endpoints under /api/posts.
app.use('/api/posts', postRoutes);



// Purpose: Provide a simple endpoint to check whether the API is running.
app.get('/', (req, res) => {
  res.json({ message: 'BookNest API is running!' });
});

// Purpose: Test the actual PostgreSQL connection through the API.
app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT current_database() AS database_name, NOW() AS checked_at'
    );

    // Purpose: Return success only after PostgreSQL answers the query.
    res.json({
      status: 'success',
      message: 'Database connection successful',
      database: result.rows[0].database_name,
      checkedAt: result.rows[0].checked_at,
    });
  } catch (error) {
    // Purpose: Report a server error without exposing database credentials.
    console.error('Health check failed:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Database connection failed',
    });
  }
});

// Purpose: Start the API only after confirming the database is reachable.
const PORT = Number(process.env.PORT || 3000);

async function startServer() {
  try {
    await pool.query('SELECT 1');

    app.listen(PORT, () => {
      console.log(`BookNest API running at http://localhost:${PORT}`);
      console.log('PostgreSQL connection successful.');
    });
  } catch (error) {
    console.error('Could not connect to PostgreSQL:', error.message);
    process.exit(1);
  }
}

// Purpose: Run the startup procedure.
startServer();
