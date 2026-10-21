import express from 'express';
import { db } from '../db.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Helper to format enrollment + progress row into the structure expected by the frontend
function formatEnrollment(row) {
  if (!row) return null;
  return {
    enrollmentId: `enr_${row.enrollment_id}`,
    rawEnrollmentId: row.enrollment_id,
    courseId: row.course_id,
    courseTitle: row.course_title,
    category: row.category,
    studentEmail: row.student_email,
    studentName: row.student_name,
    enrolledAt: row.enrolled_at,
    progressPercentage: row.progress_percent || 0,
    completedMaterials: row.completed_materials_json ? JSON.parse(row.completed_materials_json) : [],
    quizScores: row.quiz_scores_json ? JSON.parse(row.quiz_scores_json) : {},
    assignments: row.assignments_json ? JSON.parse(row.assignments_json) : {},
    certificateIssued: Boolean(row.certificate_issued)
  };
}

// GET /api/enrollments - Retrieve enrolled courses for currently authenticated user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const rows = await db.all(`
      SELECT 
        e.id AS enrollment_id,
        e.course_id,
        e.enrolled_at,
        c.title AS course_title,
        c.category,
        u.email AS student_email,
        u.name AS student_name,
        p.progress_percent,
        p.completed_materials_json,
        p.quiz_scores_json,
        p.assignments_json,
        p.certificate_issued
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      JOIN users u ON e.user_id = u.id
      LEFT JOIN progress p ON p.user_id = e.user_id AND p.course_id = e.course_id
      WHERE e.user_id = ?
      ORDER BY e.enrolled_at DESC
    `, userId);

    const enrollments = rows.map(formatEnrollment);
    return res.json(enrollments);
  } catch (err) {
    console.error('Fetch enrollments error:', err);
    return res.status(500).json({ error: 'Failed to retrieve enrollments.' });
  }
});

// POST /api/enrollments - Enroll in a course (Protected, duplicate check)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({ error: 'courseId is required.' });
    }

    // Verify course exists
    const course = await db.get('SELECT id, title, category FROM courses WHERE id = ?', courseId);
    if (!course) {
      return res.status(404).json({ error: `Course '${courseId}' not found.` });
    }

    // Check duplicate enrollment for the same user and course
    const existing = await db.get('SELECT id FROM enrollments WHERE user_id = ? AND course_id = ?', userId, courseId);
    if (existing) {
      return res.status(400).json({ error: 'Duplicate Enrollment: You are already enrolled in this course.' });
    }

    // Insert into enrollments
    const enrResult = await db.run(`
      INSERT INTO enrollments (user_id, course_id, enrolled_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
    `, userId, courseId);

    // Initialize corresponding progress record
    await db.run(`
      INSERT INTO progress (user_id, course_id, progress_percent, completed_materials_json, quiz_scores_json, assignments_json, certificate_issued)
      VALUES (?, ?, 10, '[]', '{}', '{}', 0)
    `, userId, courseId);

    // Fetch the newly created record
    const newRow = await db.get(`
      SELECT 
        e.id AS enrollment_id,
        e.course_id,
        e.enrolled_at,
        c.title AS course_title,
        c.category,
        u.email AS student_email,
        u.name AS student_name,
        p.progress_percent,
        p.completed_materials_json,
        p.quiz_scores_json,
        p.assignments_json,
        p.certificate_issued
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      JOIN users u ON e.user_id = u.id
      LEFT JOIN progress p ON p.user_id = e.user_id AND p.course_id = e.course_id
      WHERE e.id = ?
    `, enrResult.lastInsertRowid);

    return res.status(201).json(formatEnrollment(newRow));
  } catch (err) {
    console.error('Create enrollment error:', err);
    return res.status(500).json({ error: 'Failed to create enrollment.' });
  }
});

export default router;
