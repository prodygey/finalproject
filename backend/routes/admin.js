
/*
Purpose:
- Provide administrator-only lists of users, books, and posts.
- Allow an administrator to remove inappropriate posts.
*/
const express = require('express');
const pool = require('../db');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Purpose: Protect every endpoint in this router with authentication and admin checks.
router.use(authenticateToken, requireAdmin);

// Purpose: Show account information for moderation.
router.get('/users', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, username, email, role, created_at
       FROM users ORDER BY created_at DESC`
    );

    res.json({ users: result.rows });
  } catch (error) {
    console.error('Admin users error:', error.message);
    res.status(500).json({ message: 'Could not load users.' });
  }
});

// Purpose: List all books, including drafts, for moderation.
router.get('/books', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT b.id, b.title, b.status, b.created_at,
              u.username AS author
       FROM books b
       JOIN users u ON u.id = b.author_id
       ORDER BY b.created_at DESC`
    );

    res.json({ books: result.rows });
  } catch (error) {
    console.error('Admin books error:', error.message);
    res.status(500).json({ message: 'Could not load books.' });
  }
});

// Purpose: List posts for content moderation.
router.get('/posts', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.id, p.content, p.created_at, u.username
       FROM posts p
       JOIN users u ON u.id = p.user_id
       ORDER BY p.created_at DESC`
    );

    res.json({ posts: result.rows });
  } catch (error) {
    console.error('Admin posts error:', error.message);
    res.status(500).json({ message: 'Could not load posts.' });
  }
});

// Purpose: Allow an administrator to remove a moderated post.
router.delete('/posts/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM posts WHERE id = $1 RETURNING id',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    res.json({ message: 'Post removed by administrator.' });
  } catch (error) {
    console.error('Admin delete post error:', error.message);
    res.status(500).json({ message: 'Could not remove post.' });
  }
});

// Purpose: Export the administrator endpoints.
module.exports = router;
