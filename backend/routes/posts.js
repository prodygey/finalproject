
/*
Purpose:
- Display the newest posts.
- Let logged-in users publish posts about books.
- Let users delete their own posts.
*/
const express = require('express');
const pool = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Purpose: Return posts with their author's username and optional book details.
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.id, p.content, p.created_at,
             u.id AS user_id, u.username,
             b.id AS book_id, b.title AS book_title,
             (SELECT COUNT(*) FROM post_likes pl
              WHERE pl.post_id = p.id) AS like_count,
             (SELECT COUNT(*) FROM comments c
              WHERE c.post_id = p.id) AS comment_count
      FROM posts p
      JOIN users u ON u.id = p.user_id
      LEFT JOIN books b ON b.id = p.book_id
      ORDER BY p.created_at DESC
    `);

    res.json({ posts: result.rows });
  } catch (error) {
    console.error('Feed error:', error.message);
    res.status(500).json({ message: 'Could not load the feed.' });
  }
});

// Purpose: Publish a post from the currently authenticated user.
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { content, book_id = null } = req.body;

    // Purpose: Prevent empty posts and excessively long post content.
    if (!content?.trim() || content.trim().length > 5000) {
      return res.status(400).json({
        message: 'Post content must contain 1–5000 characters.',
      });
    }

    // Purpose: If a book is attached, require it to be published.
    if (book_id !== null) {
      const book = await pool.query(
        `SELECT id FROM books WHERE id = $1 AND status = 'published'`,
        [book_id]
      );

      if (book.rows.length === 0) {
        return res.status(400).json({
          message: 'The linked book does not exist or is not published.',
        });
      }
    }

    // Purpose: Save the post under the logged-in user's ID.
    const result = await pool.query(
      `INSERT INTO posts (user_id, book_id, content)
       VALUES ($1, $2, $3)
       RETURNING id, user_id, book_id, content, created_at`,
      [req.user.id, book_id, content.trim()]
    );

    res.status(201).json({
      message: 'Post published successfully.',
      post: result.rows[0],
    });
  } catch (error) {
    console.error('Create post error:', error.message);
    res.status(500).json({ message: 'Could not publish post.' });
  }
});

// Purpose: Allow users to delete only their own posts.
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `DELETE FROM posts
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Post not found or you do not own it.',
      });
    }

    res.json({ message: 'Post deleted successfully.' });
  } catch (error) {
    console.error('Delete post error:', error.message);
    res.status(500).json({ message: 'Could not delete post.' });
  }
});

// Purpose: Export the feed endpoints.
module.exports = router;
