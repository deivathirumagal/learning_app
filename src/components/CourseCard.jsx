import React from 'react';
import { Star, Clock, User, ArrowRight, CheckCircle2, Trash2, Edit3 } from 'lucide-react';

export const CourseCard = ({ 
  course, 
  isEnrolled, 
  onSelectCourse, 
  onEnroll, 
  isEnrolling,
  onDeleteCourse,
  isDeleting,
  onEditCourse
}) => {
  const getDifficultyBadgeClass = (diff) => {
    switch (diff?.toLowerCase()) {
      case 'beginner': return 'badge-beginner';
      case 'intermediate': return 'badge-intermediate';
      case 'advanced': return 'badge-advanced';
      default: return 'badge-default';
    }
  };

  return (
    <article className="course-card" aria-labelledby={`course-title-${course.id}`}>
      <div className="card-image-wrap">
        <img 
          src={course.thumbnail} 
          alt={`Thumbnail for ${course.title}`} 
          className="card-img"
          loading="lazy"
          decoding="async"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80';
          }}
        />
        <span className={`badge ${getDifficultyBadgeClass(course.difficulty)}`} aria-label={`Difficulty level: ${course.difficulty}`}>
          {course.difficulty}
        </span>
        <span className="category-pill" aria-label={`Category: ${course.category}`}>{course.category}</span>
      </div>

      <div className="card-content">
        <div className="card-meta-top">
          <span className="rating-badge">
            <Star size={14} fill="#f59e0b" color="#f59e0b" /> {course.rating}
          </span>
          <span className="duration-badge">
            <Clock size={14} /> {course.duration}
          </span>
        </div>

        <h3 className="course-title" title={course.title}>
          {course.title}
        </h3>

        <p className="course-desc">
          {course.description.length > 95 
            ? `${course.description.substring(0, 95)}...` 
            : course.description}
        </p>

        <div className="instructor-row">
          <User size={15} />
          <span>{course.instructor}</span>
        </div>

        <div className="card-actions">
          <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <button 
              className="btn btn-outline" 
              onClick={() => onSelectCourse(course.id)}
              title="View Course Details"
              style={{ padding: '0.45rem 0.65rem' }}
            >
              Details <ArrowRight size={14} />
            </button>

            {onEditCourse && (
              <button
                className="btn btn-outline"
                style={{ 
                  color: '#2563eb', 
                  borderColor: '#bfdbfe', 
                  padding: '0.45rem 0.65rem' 
                }}
                onClick={() => onEditCourse(course)}
                title="Edit Course"
              >
                <Edit3 size={15} />
                <span>Edit</span>
              </button>
            )}

            {onDeleteCourse && (
              <button
                className="btn btn-outline"
                style={{ 
                  color: '#dc2626', 
                  borderColor: '#fca5a5', 
                  padding: '0.45rem 0.65rem' 
                }}
                onClick={() => onDeleteCourse(course.id, course.title)}
                disabled={isDeleting}
                title="Delete Course"
              >
                <Trash2 size={15} />
                <span>Delete</span>
              </button>
            )}
          </div>

          {isEnrolled ? (
            <span className="enrolled-indicator">
              <CheckCircle2 size={16} /> Enrolled
            </span>
          ) : (
            <button 
              className="btn btn-primary"
              disabled={isEnrolling}
              onClick={() => onEnroll(course.id)}
            >
              {isEnrolling ? 'Enrolling...' : 'Enroll Now'}
            </button>
          )}
        </div>
      </div>
    </article>
  );
};
