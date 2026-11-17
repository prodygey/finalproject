
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


// Purpose: Get all comments and replies for a specific post,
// including the username of the comment's direct parent.
router.get('/posts/:postId/comments', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
          c.id,
          c.post_id,
          c.user_id,
          c.parent_comment_id,
          c.content,
          c.created_at,
          u.username,
          parent_user.username AS parent_username
       FROM comments c
       JOIN users u ON u.id = c.user_id
       LEFT JOIN comments parent_comment
          ON parent_comment.id = c.parent_comment_id
       LEFT JOIN users parent_user
          ON parent_user.id = parent_comment.user_id
       WHERE c.post_id = $1
       ORDER BY c.created_at ASC`,
      [req.params.postId]
    );

    res.json({ comments: result.rows });
  } catch (error) {
    console.error('Load comments error:', error.message);
    res.status(500).json({
      message: 'Could not load comments.',
    });
  }
});

// Purpose: Add a comment to a post using the authenticated account.
// Purpose: Add a regular comment or a reply to an existing comment.
// Purpose: Add a regular comment or a reply and notify
// everyone currently viewing this post.
router.post(
  '/posts/:postId/comments',
  authenticateToken,
  async (req, res) => {
    try {
      const { content, parent_comment_id } = req.body;
      const trimmedContent = content?.trim();

      // Validate comment content.
      if (!trimmedContent || trimmedContent.length > 2000) {
        return res.status(400).json({
          message: 'Comment must contain 1–2000 characters.',
        });
      }

      // A missing parent ID means this is a regular comment.
      const parentCommentId = parent_comment_id ?? null;

      // Validate the parent if this is a reply.
      if (parentCommentId !== null) {
        if (!/^\d+$/.test(String(parentCommentId))) {
          return res.status(400).json({
            message: 'Invalid parent comment ID.',
          });
        }

        const parent = await pool.query(
          `SELECT id
           FROM comments
           WHERE id = $1
             AND post_id = $2`,
          [parentCommentId, req.params.postId]
        );

        if (parent.rows.length === 0) {
          return res.status(404).json({
            message: 'Parent comment not found.',
          });
        }
      }

      // Save the comment or reply in PostgreSQL.
      const result = await pool.query(
        `INSERT INTO comments
          (post_id, user_id, content, parent_comment_id)
         VALUES ($1, $2, $3, $4)
         RETURNING
           id,
           post_id,
           user_id,
           content,
           parent_comment_id,
           created_at`,
        [
          req.params.postId,
          req.user.id,
          trimmedContent,
          parentCommentId,
        ]
      );

      // Retrieve the username of the newly created comment.
      const commentResult = await pool.query(
        `SELECT
            c.id,
            c.post_id,
            c.user_id,
            c.parent_comment_id,
            c.content,
            c.created_at,
            u.username,
            parent_user.username AS parent_username
         FROM comments c
         JOIN users u ON u.id = c.user_id
         LEFT JOIN comments parent_comment
            ON parent_comment.id = c.parent_comment_id
         LEFT JOIN users parent_user
            ON parent_user.id = parent_comment.user_id
         WHERE c.id = $1`,
        [result.rows[0].id]
      );

      const newComment = commentResult.rows[0];

      // Count comments and replies for the post.
      const countResult = await pool.query(
        `SELECT COUNT(*) AS comment_count
         FROM comments
         WHERE post_id = $1`,
        [req.params.postId]
      );

      // Notify other users viewing this post.
      const io = req.app.get('io');

      if (io) {
        io.to(`post-${req.params.postId}`).emit('comment-created', {
          postId: Number(req.params.postId),
          comment: newComment,
          comment_count: Number(countResult.rows[0].comment_count),
        });
      }

      // Return the saved comment to the person who submitted it.
      res.status(201).json({
        message: parentCommentId
          ? 'Reply added.'
          : 'Comment added.',
        comment: newComment,
        comment_count: Number(countResult.rows[0].comment_count),
      });

    } catch (error) {
      if (error.code === '23503') {
        return res.status(404).json({
          message: 'Post or parent comment not found.',
        });
      }

      console.error('Add comment error:', error.message);

      res.status(500).json({
        message: 'Could not add comment.',
      });
    }
  }
);

// Purpose: Like a post; the composite key prevents repeated likes.
// Purpose: Like a post and broadcast its updated like count.
router.post(
  '/posts/:postId/like',
  authenticateToken,
  async (req, res) => {
    try {
      await pool.query(
        `INSERT INTO post_likes (post_id, user_id)
         VALUES ($1, $2)
         ON CONFLICT (post_id, user_id) DO NOTHING`,
        [req.params.postId, req.user.id]
      );

      // Get the latest like count.
      const countResult = await pool.query(
        `SELECT COUNT(*) AS like_count
         FROM post_likes
         WHERE post_id = $1`,
        [req.params.postId]
      );

      const likeCount = Number(countResult.rows[0].like_count);

      // Notify users viewing this post.
      const io = req.app.get('io');

      if (io) {
        io.to(`post-${req.params.postId}`).emit('reaction-updated', {
          postId: Number(req.params.postId),
          like_count: likeCount,
        });
      }

      res.json({
        message: 'Post liked.',
        like_count: likeCount,
        is_liked: true,
      });

    } catch (error) {
      if (error.code === '23503') {
        return res.status(404).json({
          message: 'Post not found.',
        });
      }

      console.error('Like error:', error.message);

      res.status(500).json({
        message: 'Could not like post.',
      });
    }
  }
);

// Purpose: Remove the current user's like from a post.
// Purpose: Unlike a post and broadcast its updated like count.
router.delete(
  '/posts/:postId/like',
  authenticateToken,
  async (req, res) => {
    try {
      await pool.query(
        `DELETE FROM post_likes
         WHERE post_id = $1
           AND user_id = $2`,
        [req.params.postId, req.user.id]
      );

      // Get the latest like count.
      const countResult = await pool.query(
        `SELECT COUNT(*) AS like_count
         FROM post_likes
         WHERE post_id = $1`,
        [req.params.postId]
      );

      const likeCount = Number(countResult.rows[0].like_count);

      // Notify users viewing this post.
      const io = req.app.get('io');

      if (io) {
        io.to(`post-${req.params.postId}`).emit('reaction-updated', {
          postId: Number(req.params.postId),
          like_count: likeCount,
        });
      }

      res.json({
        message: 'Post unliked.',
        like_count: likeCount,
        is_liked: false,
      });

    } catch (error) {
      console.error('Unlike error:', error.message);

      res.status(500).json({
        message: 'Could not unlike post.',
      });
    }
  }
);

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
