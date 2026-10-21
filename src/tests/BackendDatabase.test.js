import { describe, it, expect, beforeAll } from 'vitest';
import { db, initDatabase } from '../../backend/db.js';

describe('Unit 4 Backend Database & LibSQL Integration Tests', () => {
  beforeAll(async () => {
    await initDatabase();
  });

  it('initializes courses table with default seed courses', async () => {
    const courses = await db.all('SELECT id, title, rating FROM courses');
    expect(courses.length).toBeGreaterThanOrEqual(1);
    const sample = courses.find(c => c.id === 'cs101');
    expect(sample).toBeDefined();
    expect(sample.title).toContain('React');
  });

  it('has pre-seeded student users with password hashes', async () => {
    const student = await db.get('SELECT * FROM users WHERE email = ?', 'student@college.edu');
    expect(student).toBeDefined();
    expect(student.name).toBe('Aarav Patel');
    expect(student.password_hash).toBeDefined();
    expect(student.password_hash.startsWith('$2')).toBe(true);
  });

  it('supports course CRUD operations via database client', async () => {
    const testCourseId = 'test_cs999';
    // Insert
    await db.run(
      `INSERT INTO courses (id, title, description, category, difficulty, instructor, duration, rating, thumbnail, materials_json, quizzes_json, assignments_json)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      testCourseId,
      'Test Automated Course',
      'Course for testing database CRUD',
      'Computer Science',
      'Beginner',
      'Tester',
      '1 Week',
      5.0,
      'https://example.com/thumb.jpg',
      '[]',
      '[]',
      '[]'
    );

    const fetched = await db.get('SELECT * FROM courses WHERE id = ?', testCourseId);
    expect(fetched).toBeDefined();
    expect(fetched.title).toBe('Test Automated Course');

    // Update
    await db.run('UPDATE courses SET title = ? WHERE id = ?', 'Updated Test Course', testCourseId);
    const updated = await db.get('SELECT title FROM courses WHERE id = ?', testCourseId);
    expect(updated.title).toBe('Updated Test Course');

    // Delete
    await db.run('DELETE FROM courses WHERE id = ?', testCourseId);
    const deleted = await db.get('SELECT * FROM courses WHERE id = ?', testCourseId);
    expect(deleted).toBeNull();
  });

  it('manages sessions table for user authentication tokens', async () => {
    const testToken = 'abcd1234abcd1234abcd1234abcd1234';
    const expiresAt = new Date(Date.now() + 86400000).toISOString();
    
    await db.run('INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)', testToken, 1, expiresAt);
    const session = await db.get('SELECT * FROM sessions WHERE token = ?', testToken);
    expect(session).toBeDefined();
    expect(session.token).toBe(testToken);

    await db.run('DELETE FROM sessions WHERE token = ?', testToken);
    const deletedSession = await db.get('SELECT * FROM sessions WHERE token = ?', testToken);
    expect(deletedSession).toBeNull();
  });
});
