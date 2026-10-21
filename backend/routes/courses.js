import express from 'express';
import { db } from '../db.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Helper to format course record for client
function formatCourse(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    difficulty: row.difficulty,
    instructor: row.instructor,
    duration: row.duration,
    rating: row.rating,
    thumbnail: row.thumbnail,
    materials: row.materials_json ? JSON.parse(row.materials_json) : [],
    quizzes: row.quizzes_json ? JSON.parse(row.quizzes_json) : [],
    assignments: row.assignments_json ? JSON.parse(row.assignments_json) : []
  };
}

// GET /api/courses with search and category/difficulty filtering (Experiment 1)
router.get('/', (req, res) => {
  try {
    const { search = '', category = 'All', difficulty = 'All' } = req.query;

    let query = 'SELECT * FROM courses WHERE 1=1';
    const params = [];

    if (search && search.trim()) {
      query += ' AND (LOWER(title) LIKE ? OR LOWER(description) LIKE ? OR LOWER(instructor) LIKE ?)';
      const term = `%${search.trim().toLowerCase()}%`;
      params.push(term, term, term);
    }

    if (category && category !== 'All') {
      query += ' AND category = ?';
      params.push(category);
    }

    if (difficulty && difficulty !== 'All') {
      query += ' AND difficulty = ?';
      params.push(difficulty);
    }

    query += ' ORDER BY title ASC';

    const rows = db.prepare(query).all(...params);
    const courses = rows.map(formatCourse);
    return res.json(courses);
  } catch (err) {
    console.error('Fetch courses error:', err);
    return res.status(500).json({ error: 'Failed to retrieve courses from database.' });
  }
});

// GET /api/courses/:id
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const row = db.prepare('SELECT * FROM courses WHERE id = ?').get(id);

    if (!row) {
      return res.status(404).json({ error: `Course with ID '${id}' not found.` });
    }

    return res.json(formatCourse(row));
  } catch (err) {
    console.error('Fetch course detail error:', err);
    return res.status(500).json({ error: 'Failed to retrieve course details.' });
  }
});

// PUT /api/courses/:id - Update existing course details (Protected)
router.put('/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      category,
      difficulty,
      instructor,
      duration,
      rating,
      thumbnail
    } = req.body;

    const existing = db.prepare('SELECT * FROM courses WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: `Course with ID '${id}' not found.` });
    }

    // Role check: Admin, Instructor, or authenticated Student (same policy as delete)
    if (req.user && req.user.role && req.user.role !== 'Admin' && req.user.role !== 'Instructor' && req.user.role !== 'Student') {
      return res.status(403).json({ error: 'You are not authorized to update courses.' });
    }

    const updatedTitle = title !== undefined ? title.trim() : existing.title;
    const updatedDescription = description !== undefined ? description.trim() : existing.description;
    const updatedCategory = category !== undefined ? category : existing.category;
    const updatedDifficulty = difficulty !== undefined ? difficulty : existing.difficulty;
    const updatedInstructor = instructor !== undefined ? instructor.trim() : existing.instructor;
    const updatedDuration = duration !== undefined ? duration.trim() : existing.duration;
    const updatedRating = rating !== undefined ? Number(rating) : existing.rating;
    const updatedThumbnail = thumbnail !== undefined ? thumbnail.trim() : existing.thumbnail;

    if (!updatedTitle) {
      return res.status(400).json({ error: 'Course title is required.' });
    }

    db.prepare(`
      UPDATE courses 
      SET title = ?, description = ?, category = ?, difficulty = ?, instructor = ?, duration = ?, rating = ?, thumbnail = ?
      WHERE id = ?
    `).run(
      updatedTitle,
      updatedDescription,
      updatedCategory,
      updatedDifficulty,
      updatedInstructor,
      updatedDuration,
      updatedRating,
      updatedThumbnail,
      id
    );

    const updatedRow = db.prepare('SELECT * FROM courses WHERE id = ?').get(id);

    return res.json({
      success: true,
      message: `Course '${updatedTitle}' updated successfully.`,
      course: formatCourse(updatedRow)
    });
  } catch (err) {
    console.error('Update course error:', err);
    return res.status(500).json({ error: 'Failed to update course in database.' });
  }
});

// DELETE /api/courses/:id - Delete course from database (Foreign keys cascade to enrollments & progress)
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;

    // Check if course exists
    const existing = db.prepare('SELECT id, title FROM courses WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: `Course with ID '${id}' not found.` });
    }

    // Role check if user has admin/instructor role (or any authenticated user if standard)
    if (req.user && req.user.role && req.user.role !== 'Admin' && req.user.role !== 'Instructor' && req.user.role !== 'Student') {
      return res.status(403).json({ error: 'You are not authorized to delete courses.' });
    }

    // Delete course (SQLite foreign_keys=ON ensures enrollments and progress cascade)
    db.prepare('DELETE FROM courses WHERE id = ?').run(id);

    return res.json({
      success: true,
      message: `Course '${existing.title}' deleted successfully.`,
      deletedCourseId: id
    });
  } catch (err) {
    console.error('Delete course error:', err);
    return res.status(500).json({ error: 'Failed to delete course from database.' });
  }
});

export default router;
