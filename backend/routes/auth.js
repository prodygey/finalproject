
// Purpose: Import Express, password hashing, token signing, and the database.
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const { authenticateToken } = require('../middleware/auth');

// Purpose: Create a router for authentication endpoints.
const router = express.Router();

// Purpose: Register a new normal user account.
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Purpose: Reject incomplete registration requests.
    if (!username || !email || !password) {
      return res.status(400).json({
        message: 'Username, email, and password are required.',
      });
    }

    // Purpose: Enforce basic input rules before saving data.
    if (
      username.trim().length < 3 ||
      username.trim().length > 30 ||
      !/^[a-zA-Z0-9_]+$/.test(username.trim()) ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
      password.length < 8
    ) {
      return res.status(400).json({
        message: 'Use a 3–30 character username with letters, numbers, or underscores, a valid email, and a password of at least 8 characters.',
      });
    }

    // Purpose: Hash the password so the original password is not stored.
    const passwordHash = await bcrypt.hash(password, 12);

    // Purpose: Save a new user with the default role of "user".
    const result = await pool.query(
      `INSERT INTO users (username, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, username, email, role, created_at`,
      [username.trim(), email.trim().toLowerCase(), passwordHash]
    );

    // Purpose: Return the created account without exposing its password hash.
    res.status(201).json({
      message: 'Account created successfully.',
      user: result.rows[0],
    });
  } catch (error) {
    // Purpose: Translate duplicate usernames or emails into a clear response.
    if (error.code === '23505') {
      return res.status(409).json({
        message: 'Username or email already exists.',
      });
    }

    console.error('Registration error:', error.message);
    res.status(500).json({ message: 'Could not register account.' });
  }
});

// Purpose: Authenticate a user using their email and password.
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Purpose: Ensure both login fields are present.
    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required.',
      });
    }

    // Purpose: Find the account by email using a parameterized SQL query.
    const result = await pool.query(
      `SELECT id, username, email, password_hash, role
       FROM users
       WHERE email = $1`,
      [email.trim().toLowerCase()]
    );

    const user = result.rows[0];

    // Purpose: Reject an unknown email or incorrect password.
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({
        message: 'Invalid email or password.',
      });
    }

    // Purpose: Issue a token that identifies the authenticated account.
    const token = jwt.sign(
      { id: user.id.toString(), username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    // Purpose: Return the token and safe account details to the client.
    res.json({
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ message: 'Could not log in.' });
  }
});

// Purpose: Return the profile belonging to the current login token.
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, username, email, role, bio, created_at
       FROM users
       WHERE id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Profile error:', error.message);
    res.status(500).json({ message: 'Could not load profile.' });
  }
});

// Purpose: Make these authentication routes available to Express.
module.exports = router;
