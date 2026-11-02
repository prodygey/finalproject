
/*
Purpose:
- List published books.
- View one published book and its chapters.
- Let authenticated users create books and chapters.
- Let the book's owner edit or delete their own books.
*/
const express = require('express');
const pool = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Purpose: List published books, newest first, with author details.
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT b.id, b.title, b.description, b.cover_url, b.genre,
             b.created_at, u.username AS author
      FROM books b
      JOIN users u ON u.id = b.author_id
      WHERE b.status = 'published'
      ORDER BY b.created_at DESC
    `);

    res.json({ books: result.rows });
  } catch (error) {
    console.error('List books error:', error.message);
    res.status(500).json({ message: 'Could not load books.' });
  }
});

// Purpose: Get one published book and its chapter list.
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT b.id, b.author_id, b.title, b.description, b.cover_url,
              b.genre, b.status, b.created_at, u.username AS author
       FROM books b
       JOIN users u ON u.id = b.author_id
       WHERE b.id = $1 AND b.status = 'published'`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Published book not found.' });
    }

    // Purpose: Fetch the chapters in reading order.
    const chapters = await pool.query(
      `SELECT id, chapter_number, title
       FROM chapters
       WHERE book_id = $1
       ORDER BY chapter_number`,
      [req.params.id]
    );

    res.json({ book: result.rows[0], chapters: chapters.rows });
  } catch (error) {
    console.error('Get book error:', error.message);
    res.status(500).json({ message: 'Could not load book.' });
  }
});

// Purpose: Create a draft or publish a book for the logged-in user.
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, description = '', cover_url = null, genre = null, status = 'draft' } = req.body;

    // Purpose: Validate required fields and the allowed publication state.
    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Book title is required.' });
    }

    if (!['draft', 'published'].includes(status)) {
      return res.status(400).json({ message: 'Invalid book status.' });
    }

    // Purpose: Save the book under the authenticated user's account.
    const result = await pool.query(
      `INSERT INTO books (author_id, title, description, cover_url, genre, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        req.user.id,
        title.trim(),
        description,
        cover_url,
        genre,
        status,
      ]
    );

    res.status(201).json({
      message: 'Book created successfully.',
      book: result.rows[0],
    });
  } catch (error) {
    console.error('Create book error:', error.message);
    res.status(500).json({ message: 'Could not create book.' });
  }
});

// Purpose: Update a book only when the logged-in user owns it.
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { title, description, cover_url, genre, status } = req.body;

    if (status !== undefined && !['draft', 'published'].includes(status)) {
      return res.status(400).json({ message: 'Invalid book status.' });
    }

    const result = await pool.query(
      `UPDATE books
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           cover_url = COALESCE($3, cover_url),
           genre = COALESCE($4, genre),
           status = COALESCE($5, status),
           updated_at = NOW()
       WHERE id = $6 AND author_id = $7
       RETURNING *`,
      [
        title === undefined ? null : title,
        description === undefined ? null : description,
        cover_url === undefined ? null : cover_url,
        genre === undefined ? null : genre,
        status === undefined ? null : status,
        req.params.id,
        req.user.id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Book not found or you do not own it.',
      });
    }

    res.json({ message: 'Book updated successfully.', book: result.rows[0] });
  } catch (error) {
    console.error('Update book error:', error.message);
    res.status(500).json({ message: 'Could not update book.' });
  }
});

// Purpose: Delete a book only when the logged-in user owns it.
// Its chapters are deleted automatically by the database cascade.
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `DELETE FROM books
       WHERE id = $1 AND author_id = $2
       RETURNING id`,
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Book not found or you do not own it.',
      });
    }

    res.json({ message: 'Book deleted successfully.' });
  } catch (error) {
    console.error('Delete book error:', error.message);
    res.status(500).json({ message: 'Could not delete book.' });
  }
});

// Purpose: Add a chapter to a book owned by the logged-in user.
router.post('/:id/chapters', authenticateToken, async (req, res) => {
  const client = await pool.connect();

  try {
    const { chapter_number, title, content } = req.body;

    // Purpose: Validate the chapter data before writing to PostgreSQL.
    if (
      !Number.isInteger(Number(chapter_number)) ||
      Number(chapter_number) < 1 ||
      !title?.trim() ||
      !content?.trim()
    ) {
      return res.status(400).json({
        message: 'A positive chapter number, title, and content are required.',
      });
    }

    await client.query('BEGIN');

    // Purpose: Confirm that the current user owns the target book.
    const book = await client.query(
      'SELECT id FROM books WHERE id = $1 AND author_id = $2 FOR UPDATE',
      [req.params.id, req.user.id]
    );

    if (book.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        message: 'Book not found or you do not own it.',
      });
    }

    // Purpose: Save the chapter; the database prevents duplicate chapter numbers.
    const result = await client.query(
      `INSERT INTO chapters (book_id, chapter_number, title, content)
       VALUES ($1, $2, $3, $4)
       RETURNING id, book_id, chapter_number, title, created_at`,
      [req.params.id, Number(chapter_number), title.trim(), content]
    );

    await client.query('COMMIT');

    res.status(201).json({
      message: 'Chapter created successfully.',
      chapter: result.rows[0],
    });
  } catch (error) {
    await client.query('ROLLBACK');

    if (error.code === '23505') {
      return res.status(409).json({
        message: 'That chapter number already exists for this book.',
      });
    }

    console.error('Create chapter error:', error.message);
    res.status(500).json({ message: 'Could not create chapter.' });
  } finally {
    // Purpose: Return the database connection to the pool.
    client.release();
  }
});

// Purpose: Read a chapter only if its book is published.
router.get('/:bookId/chapters/:chapterId', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.id, c.book_id, c.chapter_number, c.title, c.content
       FROM chapters c
       JOIN books b ON b.id = c.book_id
       WHERE c.book_id = $1 AND c.id = $2 AND b.status = 'published'`,
      [req.params.bookId, req.params.chapterId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Chapter not found.' });
    }

    res.json({ chapter: result.rows[0] });
  } catch (error) {
    console.error('Read chapter error:', error.message);
    res.status(500).json({ message: 'Could not load chapter.' });
  }
});

// Purpose: Export all book-related API endpoints.
module.exports = router;
