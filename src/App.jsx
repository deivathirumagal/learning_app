import React, { useState, lazy, Suspense } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navbar } from './components/Navbar';
import { LoadingSpinner } from './components/StatusAlerts';
import { logout } from './features/authentication/authSlice';
import { fetchCoursesAsync, fetchCourseDetailAsync } from './features/courses/coursesSlice';
import { enrollCourseAsync } from './features/learning/learningSlice';
import './App.css';

// Lazy loaded page components for code splitting & performance optimization
const HomePage = lazy(() => import('./pages/HomePage').then(m => ({ default: m.HomePage })));
const CoursesCatalogPage = lazy(() => import('./pages/CoursesCatalogPage').then(m => ({ default: m.CoursesCatalogPage })));
const LearningDashboardPage = lazy(() => import('./pages/LearningDashboardPage').then(m => ({ default: m.LearningDashboardPage })));
const CertificatesPage = lazy(() => import('./pages/CertificatesPage').then(m => ({ default: m.CertificatesPage })));
const LoginPage = lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })));
const ExperimentsGuidePage = lazy(() => import('./pages/ExperimentsGuidePage').then(m => ({ default: m.ExperimentsGuidePage })));

// Lazy loaded modals
const StoreInspectorModal = lazy(() => import('./components/StoreInspectorModal').then(m => ({ default: m.StoreInspectorModal })));
const CourseDetailsModal = lazy(() => import('./components/CourseDetailsModal').then(m => ({ default: m.CourseDetailsModal })));

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, user, token } = useSelector((state) => state.auth);
  const { courses, selectedCourse, detailLoading, detailError } = useSelector((state) => state.courses);
  const { enrollments, operationLoading } = useSelector((state) => state.learning);
  
  // Navigation state: unauthenticated users ALWAYS land on 'login', logged-in users start on 'home'
  const [activeTab, setActiveTab] = useState(() => (isAuthenticated ? 'home' : 'login'));
  // Store originally requested protected page for post-login redirection
  const [redirectPath, setRedirectPath] = useState(null);
  const [showDebugModal, setShowDebugModal] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Navigate to login while remembering intended protected destination
  const handleNavigateToLogin = (intendedDestination = 'home') => {
    setRedirectPath(intendedDestination);
    setActiveTab('login');
  };

  const handleLoginSuccess = () => {
    // Show Home page immediately after successful authentication (or requested path)
    const nextDestination = redirectPath || 'home';
    setActiveTab(nextDestination);
    setRedirectPath(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    setRedirectPath(null);
    setActiveTab('login');
  };

  // Safe navigation handler that protects application pages
  const handleSelectTab = (tab) => {
    const protectedTabs = ['home', 'courses', 'dashboard', 'certificates', 'experiments'];
    if (!isAuthenticated && protectedTabs.includes(tab)) {
      handleNavigateToLogin(tab);
      return;
    }
    setActiveTab(tab);
  };

  // Quick enroll handler
  const handleEnrollCourse = (courseId) => {
    if (!isAuthenticated) {
      handleNavigateToLogin('courses');
      return;
    }
    dispatch(enrollCourseAsync({
      courseId,
      studentInfo: user,
      token
    }));
  };

  const handleSelectCourseDetail = (courseId) => {
    setIsDetailModalOpen(true);
    dispatch(fetchCourseDetailAsync(courseId));
  };

  // Enforce authentication gate: if unauthenticated, current tab MUST be 'login'
  const effectiveTab = !isAuthenticated ? 'login' : activeTab;

  return (
    <div className="app-root">
      {/* Navigation Bar with clean tabs & student status */}
      <Navbar 
        activeTab={effectiveTab}
        setActiveTab={handleSelectTab}
        user={user}
        isAuthenticated={isAuthenticated}
        onLogout={handleLogout}
        showDebugModal={showDebugModal}
        setShowDebugModal={setShowDebugModal}
      />

      {/* Main Pages with Route-Level Code Splitting */}
      <main className="main-content-area" role="main">
        <Suspense fallback={<LoadingSpinner message="Loading application module..." />}>
          {effectiveTab === 'home' && (
            <HomePage 
              user={user}
              courses={courses}
              enrollments={enrollments}
              onNavigateToCourses={() => handleSelectTab('courses')}
              onNavigateToDashboard={() => handleSelectTab('dashboard')}
              onNavigateToCertificates={() => handleSelectTab('certificates')}
              onSelectCourse={handleSelectCourseDetail}
              onEnroll={handleEnrollCourse}
              isEnrolling={operationLoading}
            />
          )}

          {effectiveTab === 'courses' && (
            <CoursesCatalogPage 
              onNavigateToLogin={() => handleNavigateToLogin('courses')}
              onNavigateToDashboard={() => handleSelectTab('dashboard')}
            />
          )}

          {effectiveTab === 'dashboard' && (
            <LearningDashboardPage 
              onNavigateToCourses={() => handleSelectTab('courses')}
              onNavigateToLogin={() => handleNavigateToLogin('dashboard')}
            />
          )}

          {effectiveTab === 'certificates' && (
            <CertificatesPage 
              enrollments={enrollments}
              user={user}
              onNavigateToCourses={() => handleSelectTab('courses')}
              onNavigateToDashboard={() => handleSelectTab('dashboard')}
            />
          )}

          {effectiveTab === 'login' && (
            <LoginPage 
              onLoginSuccess={handleLoginSuccess}
              onNavigateToCourses={() => handleSelectTab('home')}
              redirectPath={redirectPath}
            />
          )}

          {effectiveTab === 'experiments' && (
            <ExperimentsGuidePage />
          )}

          {/* Global Course Details Modal */}
          {isDetailModalOpen && (
            <CourseDetailsModal 
              course={selectedCourse}
              loading={detailLoading}
              error={detailError}
              onClose={() => setIsDetailModalOpen(false)}
              onEnroll={handleEnrollCourse}
              isEnrolled={selectedCourse ? enrollments.some(e => e.courseId === selectedCourse.id) : false}
              isEnrolling={operationLoading}
              onGoToDashboard={() => {
                setIsDetailModalOpen(false);
                handleSelectTab('dashboard');
              }}
              onRetry={() => selectedCourse?.id && dispatch(fetchCourseDetailAsync(selectedCourse.id))}
            />
          )}

          {/* Store Inspector Modal (Middleware logs, Caching state, Error simulation for Viva) */}
          {showDebugModal && (
            <StoreInspectorModal 
              isOpen={showDebugModal}
              onClose={() => setShowDebugModal(false)}
            />
          )}
        </Suspense>
      </main>

      {/* Professional Footer */}
      <footer className="site-footer">
        <div className="footer-content">
          <div className="footer-branding">
            <h4 className="footer-title">EduPortal E-Learning Platform</h4>
            <p className="footer-description">
              Empowering university students with interactive computer science curricula, real-time progress tracking, and verifiable certifications.
            </p>
          </div>
          <div className="footer-links">
            <button className="footer-link-btn" onClick={() => handleSelectTab('home')}>Home</button>
            <span className="footer-divider">•</span>
            <button className="footer-link-btn" onClick={() => handleSelectTab('courses')}>Courses</button>
            <span className="footer-divider">•</span>
            <button className="footer-link-btn" onClick={() => handleSelectTab('dashboard')}>Dashboard</button>
            <span className="footer-divider">•</span>
            <button className="footer-link-btn" onClick={() => handleSelectTab('certificates')}>Certificates</button>
            <span className="footer-divider">•</span>
            <button className="footer-link-btn" onClick={() => handleSelectTab('experiments')}>Experiments</button>
            <span className="footer-divider">•</span>
            <button className="footer-link-btn" onClick={() => setShowDebugModal(true)}>Store Inspector</button>
          </div>
          <div className="footer-copyright">
            © {new Date().getFullYear()} EduPortal Learning Management System. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;

