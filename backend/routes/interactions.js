
/*
Purpose:
- Add and read post comments.
- Like and unlike posts.
- Save and remove books from a user's library.
*/
const express = require('express');
const pool = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Purpose: Get the comments for a specific post.
router.get('/posts/:postId/comments', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.id, c.content, c.created_at, u.id AS user_id, u.username
       FROM comments c
       JOIN users u ON u.id = c.user_id
       WHERE c.post_id = $1
       ORDER BY c.created_at ASC`,
      [req.params.postId]
    );

    res.json({ comments: result.rows });
  } catch (error) {
    console.error('Load comments error:', error.message);
    res.status(500).json({ message: 'Could not load comments.' });
  }
});

// Purpose: Add a comment to a post using the authenticated account.
router.post('/posts/:postId/comments', authenticateToken, async (req, res) => {
  try {
    const { content } = req.body;

    if (!content?.trim() || content.trim().length > 2000) {
      return res.status(400).json({
        message: 'Comment must contain 1–2000 characters.',
      });
    }

    const result = await pool.query(
      `INSERT INTO comments (post_id, user_id, content)
       VALUES ($1, $2, $3)
       RETURNING id, post_id, user_id, content, created_at`,
      [req.params.postId, req.user.id, content.trim()]
    );

    res.status(201).json({
      message: 'Comment added.',
      comment: result.rows[0],
    });
  } catch (error) {
    if (error.code === '23503') {
      return res.status(404).json({ message: 'Post not found.' });
    }

    console.error('Add comment error:', error.message);
    res.status(500).json({ message: 'Could not add comment.' });
  }
});

// Purpose: Like a post; the composite key prevents repeated likes.
router.post('/posts/:postId/like', authenticateToken, async (req, res) => {
  try {
    await pool.query(
      `INSERT INTO post_likes (post_id, user_id)
       VALUES ($1, $2)
       ON CONFLICT (post_id, user_id) DO NOTHING`,
      [req.params.postId, req.user.id]
    );

    res.json({ message: 'Post liked.' });
  } catch (error) {
    if (error.code === '23503') {
      return res.status(404).json({ message: 'Post not found.' });
    }

    console.error('Like error:', error.message);
    res.status(500).json({ message: 'Could not like post.' });
  }
});

// Purpose: Remove the current user's like from a post.
router.delete('/posts/:postId/like', authenticateToken, async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM post_likes WHERE post_id = $1 AND user_id = $2',
      [req.params.postId, req.user.id]
    );

    res.json({ message: 'Post unliked.' });
  } catch (error) {
    console.error('Unlike error:', error.message);
    res.status(500).json({ message: 'Could not unlike post.' });
  }
});

// Purpose: Save a published book to the logged-in user's library.
router.post('/library/:bookId', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `INSERT INTO user_library (user_id, book_id)
       SELECT $1, id FROM books
       WHERE id = $2 AND status = 'published'
       ON CONFLICT (user_id, book_id) DO NOTHING
       RETURNING user_id, book_id`,
      [req.user.id, req.params.bookId]
    );

    if (result.rows.length === 0) {
      const book = await pool.query(
        `SELECT id FROM books WHERE id = $1 AND status = 'published'`,
        [req.params.bookId]
      );

      if (book.rows.length === 0) {
        return res.status(404).json({ message: 'Published book not found.' });
      }
    }

    res.json({ message: 'Book saved to library.' });
  } catch (error) {
    console.error('Save book error:', error.message);
    res.status(500).json({ message: 'Could not save book.' });
  }
});

// Purpose: Remove a book from the user's library.
router.delete('/library/:bookId', authenticateToken, async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM user_library WHERE user_id = $1 AND book_id = $2',
      [req.user.id, req.params.bookId]
    );

    res.json({ message: 'Book removed from library.' });
  } catch (error) {
    console.error('Remove library book error:', error.message);
    res.status(500).json({ message: 'Could not remove book.' });
  }
});

// Purpose: List the authenticated user's saved books.
router.get('/library', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT b.id, b.title, b.description, b.cover_url, b.genre,
              u.username AS author, ul.saved_at
       FROM user_library ul
       JOIN books b ON b.id = ul.book_id
       JOIN users u ON u.id = b.author_id
       WHERE ul.user_id = $1
       ORDER BY ul.saved_at DESC`,
      [req.user.id]
    );

    res.json({ books: result.rows });
  } catch (error) {
    console.error('Load library error:', error.message);
    res.status(500).json({ message: 'Could not load library.' });
  }
});

// Purpose: Export interaction endpoints to the Express application.
module.exports = router;
