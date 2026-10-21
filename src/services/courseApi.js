import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const STORAGE_KEYS = {
  FAIL_NEXT: 'elearn_simulate_api_error' // to test error & retry functionality
};

// Helper to configure authorization header
const getAuthHeaders = (token) => {
  const t = token || localStorage.getItem('eduportal_token');
  return t ? { Authorization: `Bearer ${t}` } : {};
};

export const courseApiService = {
  // Toggle simulated failure for demonstration
  toggleSimulatedFailure: (shouldFail) => {
    localStorage.setItem(STORAGE_KEYS.FAIL_NEXT, shouldFail ? 'true' : 'false');
  },
  
  isSimulatedFailureActive: () => {
    return localStorage.getItem(STORAGE_KEYS.FAIL_NEXT) === 'true';
  },

  // Experiment 1 & 3: GET All Courses with optional search & filter
  getAllCourses: async ({ search = '', category = 'All', difficulty = 'All' } = {}) => {
    if (localStorage.getItem(STORAGE_KEYS.FAIL_NEXT) === 'true') {
      throw new Error("HTTP 500: Simulated Server Connection Failure. Click Retry to reload.");
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/courses`, {
        params: { search, category, difficulty }
      });
      return response.data;
    } catch (err) {
      const message = err.response?.data?.error || err.message || 'Failed to fetch courses.';
      throw new Error(message);
    }
  },

  // Experiment 1 & 3: GET Course By ID
  getCourseById: async (courseId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/courses/${courseId}`);
      return response.data;
    } catch (err) {
      const message = err.response?.data?.error || err.message || `Course with ID ${courseId} not found.`;
      throw new Error(message);
    }
  },

  // PUT/PATCH Update Course (Protected)
  updateCourse: async (courseId, updatedData, token) => {
    const activeToken = token || localStorage.getItem('eduportal_token');
    if (!activeToken) {
      const err = new Error("HTTP 401 Unauthorized: Valid authentication token required to edit course.");
      err.status = 401;
      throw err;
    }

    try {
      const response = await axios.put(`${API_BASE_URL}/courses/${courseId}`, updatedData, {
        headers: getAuthHeaders(activeToken)
      });
      return response.data;
    } catch (err) {
      const message = err.response?.data?.error || err.message || 'Failed to update course.';
      const error = new Error(message);
      error.status = err.response?.status || 500;
      throw error;
    }
  },

  // DELETE Course By ID (Protected)
  deleteCourse: async (courseId, token) => {
    const activeToken = token || localStorage.getItem('eduportal_token');
    if (!activeToken) {
      const err = new Error("HTTP 401 Unauthorized: Valid authentication token required to delete course.");
      err.status = 401;
      throw err;
    }

    try {
      const response = await axios.delete(`${API_BASE_URL}/courses/${courseId}`, {
        headers: getAuthHeaders(activeToken)
      });
      return response.data;
    } catch (err) {
      const message = err.response?.data?.error || err.message || 'Failed to delete course.';
      const error = new Error(message);
      error.status = err.response?.status || 500;
      throw error;
    }
  },

  // Experiment 3: POST Create Course Enrollment (Protected)
  enrollCourse: async (courseId, studentInfo, token) => {
    // Check artificially expired token simulation
    const activeToken = token || localStorage.getItem('eduportal_token');
    if (!activeToken) {
      const err = new Error("HTTP 401 Unauthorized: Valid Student Token required to enroll.");
      err.status = 401;
      throw err;
    }
    if (activeToken === 'EXPIRED_TOKEN') {
      const err = new Error("HTTP 401 Unauthorized: Token has expired. Please re-login.");
      err.status = 401;
      throw err;
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/enrollments`,
        { courseId },
        { headers: getAuthHeaders(activeToken) }
      );
      return response.data;
    } catch (err) {
      const message = err.response?.data?.error || err.message || 'Enrollment failed.';
      const error = new Error(message);
      error.status = err.response?.status || 500;
      throw error;
    }
  },

  // Experiment 3: GET Enrolled Courses / Learning History
  getLearningHistory: async (studentEmail, token) => {
    const activeToken = token || localStorage.getItem('eduportal_token');
    if (!activeToken) {
      const err = new Error("HTTP 401 Unauthorized: Please login to access your learning dashboard.");
      err.status = 401;
      throw err;
    }
    if (activeToken === 'EXPIRED_TOKEN') {
      const err = new Error("HTTP 401 Unauthorized: Token has expired. Please re-login.");
      err.status = 401;
      throw err;
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/enrollments`, {
        headers: getAuthHeaders(activeToken)
      });
      return response.data;
    } catch (err) {
      const message = err.response?.data?.error || err.message || 'Failed to retrieve learning history.';
      const error = new Error(message);
      error.status = err.response?.status || 500;
      throw error;
    }
  },

  // Experiment 3: PATCH/PUT Update Learning Progress
  updateProgress: async (enrollmentId, { progressPercentage, completedMaterialId }, token) => {
    const activeToken = token || localStorage.getItem('eduportal_token');
    if (!activeToken || activeToken === 'EXPIRED_TOKEN') {
      const err = new Error("HTTP 401 Unauthorized: Token required for updating progress.");
      err.status = 401;
      throw err;
    }

    try {
      const response = await axios.put(
        `${API_BASE_URL}/progress/${enrollmentId}`,
        { progressPercentage, completedMaterialId },
        { headers: getAuthHeaders(activeToken) }
      );
      return response.data;
    } catch (err) {
      const message = err.response?.data?.error || err.message || 'Failed to update progress.';
      const error = new Error(message);
      error.status = err.response?.status || 500;
      throw error;
    }
  },

  // Experiment 3: POST/PUT Submit Quiz
  submitQuizScore: async (enrollmentId, quizId, score, answers, token) => {
    const activeToken = token || localStorage.getItem('eduportal_token');
    if (!activeToken || activeToken === 'EXPIRED_TOKEN') {
      const err = new Error("HTTP 401 Unauthorized: Token missing for quiz submission.");
      err.status = 401;
      throw err;
    }

    try {
      const response = await axios.put(
        `${API_BASE_URL}/progress/quiz`,
        { enrollmentId, quizId, score },
        { headers: getAuthHeaders(activeToken) }
      );
      return response.data;
    } catch (err) {
      const message = err.response?.data?.error || err.message || 'Failed to submit quiz score.';
      const error = new Error(message);
      error.status = err.response?.status || 500;
      throw error;
    }
  },

  // Experiment 3: POST/PUT Submit Assignment
  submitAssignment: async (enrollmentId, assignmentId, submissionText, token) => {
    const activeToken = token || localStorage.getItem('eduportal_token');
    if (!activeToken || activeToken === 'EXPIRED_TOKEN') {
      const err = new Error("HTTP 401 Unauthorized: Token missing for assignment submission.");
      err.status = 401;
      throw err;
    }

    try {
      const response = await axios.put(
        `${API_BASE_URL}/progress/assignment`,
        { enrollmentId, assignmentId, submissionText },
        { headers: getAuthHeaders(activeToken) }
      );
      return response.data;
    } catch (err) {
      const message = err.response?.data?.error || err.message || 'Failed to submit assignment.';
      const error = new Error(message);
      error.status = err.response?.status || 500;
      throw error;
    }
  }
};
