import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  Key, 
  AlertCircle, 
  CheckCircle, 
  UserCheck,
  Loader2,
  ArrowRight,
  UserPlus,
  BookOpen,
  User,
  GraduationCap
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { loginAsync, registerAsync, clearAuthError } from '../features/authentication/authSlice';

export const LoginPage = ({ onLoginSuccess, onNavigateToCourses, redirectPath }) => {
  const dispatch = useDispatch();
  const { loading, error, statusMessage, isAuthenticated, user } = useSelector((state) => state.auth);

  // Form mode: 'login' | 'register'
  const [mode, setMode] = useState('login');

  // Login form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Register form fields
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRollNo, setRegRollNo] = useState('');
  const [regDepartment, setRegDepartment] = useState('Computer Science & Engineering');

  const [validationError, setValidationError] = useState('');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');
    dispatch(clearAuthError());

    // Validation for empty or whitespace fields
    if (!email.trim() && !password.trim()) {
      setValidationError('Please enter your student email and password.');
      return;
    }
    if (!email.trim()) {
      setValidationError('Student Email or ID is required.');
      return;
    }
    if (!password.trim()) {
      setValidationError('Password is required.');
      return;
    }

    const result = await dispatch(loginAsync({ email: email.trim(), password }));
    if (loginAsync.fulfilled.match(result)) {
      if (onLoginSuccess) {
        onLoginSuccess();
      }
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');
    dispatch(clearAuthError());

    if (!regName.trim()) {
      setValidationError('Full Name is required.');
      return;
    }
    if (!regEmail.trim()) {
      setValidationError('Student Email is required.');
      return;
    }
    if (!regPassword || regPassword.length < 6) {
      setValidationError('Password must be at least 6 characters long.');
      return;
    }

    const result = await dispatch(registerAsync({
      name: regName.trim(),
      email: regEmail.trim(),
      password: regPassword,
      rollNo: regRollNo.trim() || `STU-${Date.now().toString().slice(-4)}`,
      department: regDepartment
    }));

    if (registerAsync.fulfilled.match(result)) {
      if (onLoginSuccess) {
        onLoginSuccess();
      }
    }
  };

  const destinationLabel = redirectPath === 'dashboard' 
    ? 'Learning Dashboard' 
    : 'Course Catalog';

  return (
    <div className="page-container auth-page">
      <div className="auth-card">
        <div className="auth-card-header">
          <div className="auth-badge-icon">
            <GraduationCap size={32} />
          </div>
          <h2 className="auth-title">
            {mode === 'login' ? 'Student Login' : 'Create Student Account'}
          </h2>
          <span className="auth-subtitle">
            {mode === 'login' 
              ? 'Enter your credentials to access course catalog, quizzes, and certificates' 
              : 'Register your details to create an account and begin learning'}
          </span>
        </div>

        {/* Tab switch between Login and Register */}
        {!isAuthenticated && (
          <div className="auth-mode-switch">
            <button
              type="button"
              className={`auth-tab-btn ${mode === 'login' ? 'active' : ''}`}
              onClick={() => {
                setMode('login');
                setValidationError('');
                dispatch(clearAuthError());
              }}
            >
              <Lock size={15} /> Student Login
            </button>
            <button
              type="button"
              className={`auth-tab-btn ${mode === 'register' ? 'active' : ''}`}
              onClick={() => {
                setMode('register');
                setValidationError('');
                dispatch(clearAuthError());
              }}
            >
              <UserPlus size={15} /> Register Account
            </button>
          </div>
        )}

        {/* Client-side form validation error */}
        {validationError && (
          <div className="state-box error-box" style={{ margin: '1rem 0' }}>
            <div className="error-content">
              <AlertCircle size={20} className="error-icon" />
              <span>{validationError}</span>
            </div>
            <button className="btn-close" onClick={() => setValidationError('')}>×</button>
          </div>
        )}

        {/* Server/API authentication error */}
        {error && (
          <div className="state-box error-box" style={{ margin: '1rem 0' }}>
            <div className="error-content">
              <AlertCircle size={20} className="error-icon" />
              <span>{error}</span>
            </div>
            <button className="btn-close" onClick={() => dispatch(clearAuthError())}>×</button>
          </div>
        )}

        {/* Authentication success banner */}
        {statusMessage && (
          <div className="state-box success-box" style={{ margin: '1rem 0' }}>
            <CheckCircle size={18} className="success-icon" />
            <span>{statusMessage}</span>
          </div>
        )}

        {isAuthenticated ? (
          <div className="authenticated-ready-box">
            <UserCheck size={44} color="#10b981" />
            <div>
              <h3>Currently Signed In</h3>
              <p>Welcome back, <strong>{user?.name}</strong> ({user?.email})</p>
              <span className="badge badge-success">Role: {user?.role || 'Student'}</span>
            </div>
            <button 
              className="btn btn-primary btn-block btn-lg" 
              onClick={onLoginSuccess}
              style={{ marginTop: '1.25rem' }}
            >
              Enter {destinationLabel} <ArrowRight size={16} />
            </button>
          </div>
        ) : mode === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="student-id" className="form-label">
                <Mail size={16} /> Student Email or ID
              </label>
              <input 
                id="student-id"
                type="email" 
                className="form-input"
                placeholder="Enter your student email (e.g. name@college.edu)"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (validationError) setValidationError('');
                }}
                disabled={loading}
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="student-pass" className="form-label">
                <Key size={16} /> Password
              </label>
              <input 
                id="student-pass"
                type="password" 
                className="form-input"
                placeholder="Enter password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (validationError) setValidationError('');
                }}
                disabled={loading}
                autoComplete="current-password"
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-block btn-lg"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="spin" /> Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </button>

            <div className="auth-toggle-helper">
              <span>Don't have an account? </span>
              <button 
                type="button" 
                className="btn-link"
                onClick={() => {
                  setMode('register');
                  setValidationError('');
                  dispatch(clearAuthError());
                }}
              >
                Register / Create Account
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="reg-name" className="form-label">
                <User size={16} /> Full Name
              </label>
              <input 
                id="reg-name"
                type="text" 
                className="form-input"
                placeholder="e.g. Priya Sharma"
                value={regName}
                onChange={(e) => {
                  setRegName(e.target.value);
                  if (validationError) setValidationError('');
                }}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="reg-email" className="form-label">
                <Mail size={16} /> Student Email
              </label>
              <input 
                id="reg-email"
                type="email" 
                className="form-input"
                placeholder="e.g. priya@college.edu"
                value={regEmail}
                onChange={(e) => {
                  setRegEmail(e.target.value);
                  if (validationError) setValidationError('');
                }}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="reg-pass" className="form-label">
                <Key size={16} /> Password (min 6 characters)
              </label>
              <input 
                id="reg-pass"
                type="password" 
                className="form-input"
                placeholder="Create password"
                value={regPassword}
                onChange={(e) => {
                  setRegPassword(e.target.value);
                  if (validationError) setValidationError('');
                }}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="reg-roll" className="form-label">
                <GraduationCap size={16} /> Roll Number / Student ID
              </label>
              <input 
                id="reg-roll"
                type="text" 
                className="form-input"
                placeholder="e.g. CS2026-105"
                value={regRollNo}
                onChange={(e) => setRegRollNo(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="reg-dept" className="form-label">
                <BookOpen size={16} /> Academic Department
              </label>
              <select
                id="reg-dept"
                className="form-select"
                value={regDepartment}
                onChange={(e) => setRegDepartment(e.target.value)}
                disabled={loading}
              >
                <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Artificial Intelligence & Data Science">Artificial Intelligence & Data Science</option>
                <option value="Electronics & Communication">Electronics & Communication</option>
                <option value="Software Engineering">Software Engineering</option>
              </select>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-block btn-lg"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="spin" /> Creating Account...
                </>
              ) : (
                'Create Account & Sign In'
              )}
            </button>

            <div className="auth-toggle-helper">
              <span>Already have an account? </span>
              <button 
                type="button" 
                className="btn-link"
                onClick={() => {
                  setMode('login');
                  setValidationError('');
                  dispatch(clearAuthError());
                }}
              >
                Sign In
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
