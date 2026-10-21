import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AUTH_STORAGE_KEY = 'eduportal_token';
const USER_STORAGE_KEY = 'elearn_auth_user_v1';

// Demo student credentials to autofill for practical demo / viva
const DEMO_USERS = [
  {
    email: 'student@college.edu',
    password: 'password123',
    name: 'Aarav Patel',
    rollNo: 'CS2026-084',
    department: 'Computer Science & Engineering',
    role: 'Student'
  },
  {
    email: 'rohit@college.edu',
    password: 'password123',
    name: 'Rohit Sharma',
    rollNo: 'IT2026-042',
    department: 'Information Technology',
    role: 'Student'
  }
];

export const authService = {
  // Login with backend API
  login: async (email, password) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email: email.trim(),
        password
      });

      const { token, user } = response.data;
      localStorage.setItem(AUTH_STORAGE_KEY, token);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));

      return { token, user };
    } catch (err) {
      const message = err.response?.data?.error || err.response?.data?.message || err.message || 'Login failed.';
      const error = new Error(message);
      error.status = err.response?.status || 500;
      throw error;
    }
  },

  // Register new student account
  register: async ({ name, email, password, rollNo, department }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, {
        name,
        email,
        password,
        rollNo,
        department
      });

      const { token, user } = response.data;
      localStorage.setItem(AUTH_STORAGE_KEY, token);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));

      return { token, user };
    } catch (err) {
      const message = err.response?.data?.error || err.response?.data?.message || err.message || 'Registration failed.';
      const error = new Error(message);
      error.status = err.response?.status || 500;
      throw error;
    }
  },

  // Verify current token and fetch fresh profile from backend
  verifyMe: async (token) => {
    const activeToken = token || localStorage.getItem(AUTH_STORAGE_KEY);
    if (!activeToken) return null;

    try {
      const response = await axios.get(`${API_BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${activeToken}` }
      });
      return response.data.user;
    } catch {
      authService.logout();
      return null;
    }
  },

  // Get current active token
  getToken: () => {
    return localStorage.getItem(AUTH_STORAGE_KEY) || null;
  },

  // Get current active user
  getCurrentUser: () => {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  // Logout and purge tokens
  logout: () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    try {
      axios.post(`${API_BASE_URL}/auth/logout`).catch(() => {});
    } catch {
      // ignore
    }
  },

  // Simulate token expiration to test 401 handling
  simulateTokenExpiry: () => {
    localStorage.setItem(AUTH_STORAGE_KEY, 'EXPIRED_TOKEN');
  },

  // List of demo accounts for quick testing in Viva/Demo
  getDemoCredentials: () => {
    return DEMO_USERS.map(u => ({ email: u.email, password: u.password, name: u.name }));
  }
};
