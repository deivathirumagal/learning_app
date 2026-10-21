import React from 'react';
import { 
  GraduationCap, 
  BookOpen, 
  Award, 
  CheckCircle, 
  ArrowRight, 
  Layers, 
  Star, 
  Clock, 
  Sparkles,
  ShieldCheck,
  TrendingUp,
  LayoutDashboard
} from 'lucide-react';
import { CourseCard } from '../components/CourseCard';

export const HomePage = ({ 
  user, 
  courses = [], 
  enrollments = [], 
  onNavigateToCourses, 
  onNavigateToDashboard, 
  onNavigateToCertificates,
  onSelectCourse,
  onEnroll,
  isEnrolling 
}) => {
  // Top 3 featured courses for the hero/featured section
  const featuredCourses = courses.slice(0, 3);
  const completedCount = enrollments.filter(e => e.progressPercentage >= 100).length;

  return (
    <div className="home-page-container">
      {/* Hero Section */}
      <section className="home-hero-section">
        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge-dot"></span>
            <Sparkles size={14} className="hero-sparkle" />
            <span>Welcome, {user?.name || 'Student'} • Academic Session 2026</span>
          </div>

          <h1 className="hero-title">
            Master Advanced Computer Science with Interactive <span className="text-gradient">E-Learning Curricula</span>
          </h1>

          <p className="hero-description">
            EduPortal connects university-accredited course modules, hands-on laboratory guides, real-time assessment quizzes, and instant verifiable academic certificates.
          </p>

          <div className="hero-actions">
            <button 
              className="btn btn-primary btn-lg" 
              onClick={onNavigateToCourses}
            >
              <BookOpen size={18} /> Browse Course Catalog
            </button>
            <button 
              className="btn btn-outline btn-lg" 
              onClick={onNavigateToDashboard}
            >
              <LayoutDashboard size={18} /> My Learning Dashboard
            </button>
            {completedCount > 0 && (
              <button 
                className="btn btn-cert-open btn-lg" 
                onClick={onNavigateToCertificates}
              >
                <Award size={18} /> View Certificates ({completedCount})
              </button>
            )}
          </div>

          <div className="hero-stats-bar">
            <div className="h-stat-item">
              <strong>{courses.length}+</strong>
              <span>Academic Courses</span>
            </div>
            <div className="h-stat-item">
              <strong>{enrollments.length}</strong>
              <span>Enrolled Courses</span>
            </div>
            <div className="h-stat-item">
              <strong>{completedCount}</strong>
              <span>Completed & Certified</span>
            </div>
            <div className="h-stat-item">
              <strong>100%</strong>
              <span>Full-Stack Verified</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses Showcase */}
      <section className="featured-courses-section">
        <div className="section-header-row">
          <div>
            <span className="section-eyebrow">CURATED UNIVERSITY CURRICULUM</span>
            <h2 className="section-heading-main">Featured Academic Courses</h2>
          </div>
          <button 
            className="btn btn-link view-all-btn" 
            onClick={onNavigateToCourses}
          >
            View All Courses <ArrowRight size={16} />
          </button>
        </div>

        <div className="course-grid">
          {featuredCourses.map((course) => {
            const isEnrolled = enrollments.some(e => e.courseId === course.id);
            return (
              <CourseCard 
                key={course.id}
                course={course}
                isEnrolled={isEnrolled}
                onSelectCourse={onSelectCourse}
                onEnroll={onEnroll}
                isEnrolling={isEnrolling}
              />
            );
          })}
        </div>
      </section>

      {/* Academic Highlights Banner */}
      <section className="academic-features-grid">
        <div className="feature-highlight-card">
          <div className="feature-icon-box blue">
            <BookOpen size={24} />
          </div>
          <h3>Modular Curriculum</h3>
          <p>Structured video lectures, PDF notes, and lab guides designed for semester exams and viva preparation.</p>
        </div>

        <div className="feature-highlight-card">
          <div className="feature-icon-box emerald">
            <TrendingUp size={24} />
          </div>
          <h3>Real-time Progress Tracking</h3>
          <p>Automated completion percentage calculations synced with the persistent SQLite database.</p>
        </div>

        <div className="feature-highlight-card">
          <div className="feature-icon-box amber">
            <Award size={24} />
          </div>
          <h3>Verifiable Certificates</h3>
          <p>Earn cryptographic completion certificates with unique verification IDs once curriculum hits 100%.</p>
        </div>
      </section>
    </div>
  );
};
