import React from 'react';
import { 
  X, 
  Clock, 
  Star, 
  User, 
  FileText, 
  Video, 
  Award, 
  CheckCircle, 
  HelpCircle,
  FileCode,
  ArrowRight,
  Trash2,
  Edit3
} from 'lucide-react';

export const CourseDetailsModal = ({ 
  course, 
  loading, 
  error, 
  onClose, 
  onEnroll, 
  isEnrolled,
  isEnrolling,
  onGoToDashboard,
  onRetry,
  onDeleteCourse,
  isDeleting,
  onEditCourse
}) => {
  if (!course && !loading && !error) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-meta">
            <span className="badge badge-primary">{course?.category}</span>
            <span className="badge badge-outline">{course?.difficulty} Level</span>
          </div>
          <button className="btn-close-modal" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {loading ? (
          <div className="modal-body modal-loading">
            <div className="spinner-icon spin" style={{ width: 36, height: 36, border: '3px solid #3b82f6', borderTopColor: 'transparent', borderRadius: '50%' }}></div>
            <p>Fetching dynamic course details & materials via REST API...</p>
          </div>
        ) : error ? (
          <div className="modal-body modal-error">
            <p>{error}</p>
            {onRetry && (
              <button className="btn btn-retry" onClick={onRetry}>
                Retry Fetching Details
              </button>
            )}
          </div>
        ) : course ? (
          <div className="modal-body">
            <div className="detail-banner">
              <img 
                src={course.thumbnail} 
                alt={course.title} 
                className="detail-img"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80';
                }}
              />
              <div className="detail-info-pane">
                <h2 className="detail-title">{course.title}</h2>
                <div className="detail-row">
                  <span><User size={15} /> <strong>Instructor:</strong> {course.instructor}</span>
                  <span><Clock size={15} /> <strong>Duration:</strong> {course.duration}</span>
                  <span><Star size={15} fill="#f59e0b" color="#f59e0b" /> <strong>Rating:</strong> {course.rating}/5.0</span>
                </div>
                <p className="detail-description">{course.description}</p>
                
                <div className="detail-enroll-status">
                  {isEnrolled ? (
                    <div className="already-enrolled-banner">
                      <CheckCircle size={18} color="#10b981" />
                      <span>You are enrolled in this course!</span>
                      <button className="btn btn-sm btn-dashboard" onClick={onGoToDashboard}>
                        Open in Dashboard <ArrowRight size={14} />
                      </button>
                    </div>
                  ) : (
                    <button 
                      className="btn btn-primary btn-lg"
                      disabled={isEnrolling}
                      onClick={() => onEnroll(course.id)}
                    >
                      {isEnrolling ? 'Processing Enrollment...' : 'Enroll in this Course'}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Curriculum and Learning Materials */}
            <div className="detail-section">
              <h3 className="section-subtitle">
                <FileText size={18} /> Course Learning Materials & Syllabus
              </h3>
              
              <div className="materials-grid">
                {course.materials?.map((m) => (
                  <div key={m.id} className="material-item-card">
                    <div className="material-icon-wrap">
                      {m.type.includes('Video') ? <Video size={20} /> : <FileCode size={20} />}
                    </div>
                    <div className="material-details">
                      <h4>{m.title}</h4>
                      <div className="material-meta">
                        <span className="material-type-tag">{m.type}</span>
                        <span>Estimated: {m.duration}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quizzes & Assessments */}
            <div className="detail-section">
              <h3 className="section-subtitle">
                <HelpCircle size={18} /> Assessments & Final Certificate
              </h3>
              <div className="assessment-overview">
                <div className="assessment-chip">
                  <strong>{course.quizzes?.length || 0}</strong> Interactive Quizzes
                </div>
                <div className="assessment-chip">
                  <strong>{course.assignments?.length || 0}</strong> Practical Assignment
                </div>
                <div className="assessment-chip highlight">
                  <Award size={16} /> Course Completion Certificate Included
                </div>
              </div>
            </div>
          </div>
        ) : null}

        <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {onEditCourse && course && (
              <button 
                className="btn btn-outline" 
                style={{ color: '#2563eb', borderColor: '#bfdbfe' }}
                onClick={() => onEditCourse(course)}
              >
                <Edit3 size={16} />
                <span>Edit Course</span>
              </button>
            )}
            {onDeleteCourse && course && (
              <button 
                className="btn btn-outline" 
                style={{ color: '#dc2626', borderColor: '#fca5a5' }}
                onClick={() => onDeleteCourse(course.id, course.title)}
                disabled={isDeleting}
              >
                <Trash2 size={16} />
                <span>{isDeleting ? 'Deleting Course...' : 'Delete Course'}</span>
              </button>
            )}
          </div>
          <button className="btn btn-outline" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};
