
// Purpose: Load the backend environment variables.
require('dotenv').config();

// Purpose: Import the required packages.
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const pool = require('./db');

// Purpose: Import the application routes.
const authRoutes = require('./routes/auth');
const bookRoutes = require('./routes/books');
const postRoutes = require('./routes/posts');
const interactionRoutes = require('./routes/interactions');
const adminRoutes = require('./routes/admin');

// Purpose: Create the Express application.
const app = express();

// Purpose: Create an HTTP server that Socket.IO and Express can share.
const server = http.createServer(app);

// Purpose: Configure Socket.IO.
const io = new Server(server, {
  cors: {
    origin: '*', // Development setting. Restrict this for production.
    methods: ['GET', 'POST', 'DELETE'],
  },
});

// Purpose: Make Socket.IO accessible inside Express route handlers.
app.set('io', io);

// Purpose: Serve uploaded files.
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Purpose: Allow frontend requests during development.
app.use(cors());

// Purpose: Read JSON request bodies.
app.use(express.json());

// Purpose: Mount existing API routes.
app.use('/api', interactionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/posts', postRoutes);

// Purpose: Check whether the API is running.
app.get('/', (req, res) => {
  res.json({
    message: 'BookNest API is running!',
  });
});

// Purpose: Check the PostgreSQL connection.
app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT current_database() AS database_name, NOW() AS checked_at'
    );

    res.json({
      status: 'success',
      message: 'Database connection successful',
      database: result.rows[0].database_name,
      checkedAt: result.rows[0].checked_at,
    });
  } catch (error) {
    console.error('Health check failed:', error.message);

    res.status(500).json({
      status: 'error',
      message: 'Database connection failed',
    });
  }
});

// Purpose: Handle Socket.IO client connections.
io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);

  // Purpose: Allow a client to join a room for a particular post.
  socket.on('join-post', (postId) => {
    if (!postId) return;

    const room = `post-${postId}`;
    socket.join(room);

    console.log(`Socket ${socket.id} joined ${room}`);
  });

  // Purpose: Remove a client from a post room.
  socket.on('leave-post', (postId) => {
    if (!postId) return;

    const room = `post-${postId}`;
    socket.leave(room);

    console.log(`Socket ${socket.id} left ${room}`);
  });

  // Purpose: Log when a client disconnects.
  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id);
  });
});

// Purpose: Start the API after confirming PostgreSQL is reachable.

// Purpose: Start the API after confirming PostgreSQL is reachable.
const PORT = Number(process.env.PORT || 3000);

async function startServer() {
  try {
    await pool.query('SELECT 1');

    // Listen on all network interfaces so Android devices can connect.
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`BookNest API running at http://192.168.1.5:${PORT}`);
      console.log('PostgreSQL connection successful.');
      console.log('Socket.IO server is ready.');
    });
  } catch (error) {
    console.error('Could not connect to PostgreSQL:', error.message);
    process.exit(1);
  }
}

// Purpose: Run the startup procedure.
startServer();


