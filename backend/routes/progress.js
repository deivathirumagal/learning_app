import express from 'express';
import { db } from '../db.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Helper to format full progress record matching frontend structure
function formatProgress(row) {
  if (!row) return null;
  return {
    enrollmentId: `enr_${row.enrollment_id}`,
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

// GET /api/progress - Retrieve all progress records for authenticated user
router.get('/', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    const rows = db.prepare(`
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
      FROM progress p
      JOIN enrollments e ON p.user_id = e.user_id AND p.course_id = e.course_id
      JOIN courses c ON p.course_id = c.id
      JOIN users u ON p.user_id = u.id
      WHERE p.user_id = ?
    `).all(userId);

    return res.json(rows.map(formatProgress));
  } catch (err) {
    console.error('Fetch progress error:', err);
    return res.status(500).json({ error: 'Failed to retrieve progress.' });
  }
});

// PUT /api/progress/quiz - Submit quiz score and update progress
router.put('/quiz', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    const { enrollmentId, courseId, quizId, score } = req.body;

    let targetCourseId = courseId;
    if (!targetCourseId && enrollmentId) {
      const numericId = parseInt(String(enrollmentId).replace('enr_', ''), 10);
      const enr = db.prepare('SELECT course_id FROM enrollments WHERE id = ? AND user_id = ?').get(numericId, userId);
      if (enr) targetCourseId = enr.course_id;
    }

    if (!targetCourseId || !quizId) {
      return res.status(400).json({ error: 'courseId (or enrollmentId) and quizId are required.' });
    }

    const rec = db.prepare('SELECT * FROM progress WHERE user_id = ? AND course_id = ?').get(userId, targetCourseId);
    if (!rec) {
      return res.status(404).json({ error: 'Progress record not found. Please ensure you are enrolled.' });
    }

    const quizScores = rec.quiz_scores_json ? JSON.parse(rec.quiz_scores_json) : {};
    quizScores[quizId] = {
      score: typeof score === 'number' ? score : 100,
      total: 100,
      submittedAt: new Date().toISOString()
    };

    const newPercent = Math.min(100, Math.max(rec.progress_percent, (rec.progress_percent || 0) + 20));
    const certIssued = newPercent >= 100 ? 1 : rec.certificate_issued;

    db.prepare(`
      UPDATE progress 
      SET progress_percent = ?, quiz_scores_json = ?, certificate_issued = ?, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ? AND course_id = ?
    `).run(newPercent, JSON.stringify(quizScores), certIssued, userId, targetCourseId);

    const updatedRow = db.prepare(`
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
      FROM progress p
      JOIN enrollments e ON p.user_id = e.user_id AND p.course_id = e.course_id
      JOIN courses c ON p.course_id = c.id
      JOIN users u ON p.user_id = u.id
      WHERE p.user_id = ? AND p.course_id = ?
    `).get(userId, targetCourseId);

    return res.json(formatProgress(updatedRow));
  } catch (err) {
    console.error('Quiz submit progress error:', err);
    return res.status(500).json({ error: 'Failed to record quiz submission.' });
  }
});

// PUT /api/progress/assignment - Submit assignment and update progress
router.put('/assignment', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    const { enrollmentId, courseId, assignmentId, submissionText } = req.body;

    let targetCourseId = courseId;
    if (!targetCourseId && enrollmentId) {
      const numericId = parseInt(String(enrollmentId).replace('enr_', ''), 10);
      const enr = db.prepare('SELECT course_id FROM enrollments WHERE id = ? AND user_id = ?').get(numericId, userId);
      if (enr) targetCourseId = enr.course_id;
    }

    if (!targetCourseId || !assignmentId) {
      return res.status(400).json({ error: 'courseId (or enrollmentId) and assignmentId are required.' });
    }

    const rec = db.prepare('SELECT * FROM progress WHERE user_id = ? AND course_id = ?').get(userId, targetCourseId);
    if (!rec) {
      return res.status(404).json({ error: 'Progress record not found. Please ensure you are enrolled.' });
    }

    const assignments = rec.assignments_json ? JSON.parse(rec.assignments_json) : {};
    assignments[assignmentId] = {
      status: 'Submitted',
      submittedAt: new Date().toISOString(),
      content: submissionText || 'Online Submission',
      grade: 'A (92/100)'
    };

    const newPercent = Math.min(100, Math.max(rec.progress_percent, (rec.progress_percent || 0) + 25));
    const certIssued = newPercent >= 100 ? 1 : rec.certificate_issued;

    db.prepare(`
      UPDATE progress 
      SET progress_percent = ?, assignments_json = ?, certificate_issued = ?, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ? AND course_id = ?
    `).run(newPercent, JSON.stringify(assignments), certIssued, userId, targetCourseId);

    const updatedRow = db.prepare(`
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
      FROM progress p
      JOIN enrollments e ON p.user_id = e.user_id AND p.course_id = e.course_id
      JOIN courses c ON p.course_id = c.id
      JOIN users u ON p.user_id = u.id
      WHERE p.user_id = ? AND p.course_id = ?
    `).get(userId, targetCourseId);

    return res.json(formatProgress(updatedRow));
  } catch (err) {
    console.error('Assignment submit progress error:', err);
    return res.status(500).json({ error: 'Failed to record assignment submission.' });
  }
});

// PUT /api/progress/:courseId - Update general progress and completed materials
router.put('/:courseId', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    let { courseId } = req.params;
    const { progressPercentage, completedMaterialId } = req.body;

    // Check if courseId is an enrollment ID ('enr_123' or numeric)
    if (courseId.startsWith('enr_') || !isNaN(Number(courseId))) {
      const numericId = parseInt(courseId.replace('enr_', ''), 10);
      const enr = db.prepare('SELECT course_id FROM enrollments WHERE id = ? AND user_id = ?').get(numericId, userId);
      if (enr) {
        courseId = enr.course_id;
      }
    }

    const rec = db.prepare('SELECT * FROM progress WHERE user_id = ? AND course_id = ?').get(userId, courseId);
    if (!rec) {
      return res.status(404).json({ error: 'Progress record not found. Please ensure you are enrolled in this course.' });
    }

    const completed = rec.completed_materials_json ? JSON.parse(rec.completed_materials_json) : [];
    if (completedMaterialId && !completed.includes(completedMaterialId)) {
      completed.push(completedMaterialId);
    }

    let newPercent = rec.progress_percent;
    if (typeof progressPercentage === 'number') {
      newPercent = Math.min(100, Math.max(0, progressPercentage));
    }

    const certIssued = newPercent >= 100 ? 1 : rec.certificate_issued;

    db.prepare(`
      UPDATE progress 
      SET progress_percent = ?, completed_materials_json = ?, certificate_issued = ?, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ? AND course_id = ?
    `).run(newPercent, JSON.stringify(completed), certIssued, userId, courseId);

    const updatedRow = db.prepare(`
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
      FROM progress p
      JOIN enrollments e ON p.user_id = e.user_id AND p.course_id = e.course_id
      JOIN courses c ON p.course_id = c.id
      JOIN users u ON p.user_id = u.id
      WHERE p.user_id = ? AND p.course_id = ?
    `).get(userId, courseId);

    return res.json(formatProgress(updatedRow));
  } catch (err) {
    console.error('Update progress error:', err);
    return res.status(500).json({ error: 'Failed to update progress.' });
  }
});

// PATCH /api/progress/:courseId alias for PUT
router.patch('/:courseId', (req, res, next) => {
  router.handle(req, res, next);
});

export default router;
