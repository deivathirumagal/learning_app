import React, { useState } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';

export const EditCourseModal = ({
  course,
  isOpen,
  onClose,
  onSave,
  isSaving,
  error
}) => {
  if (!isOpen || !course) return null;

  const [formData, setFormData] = useState({
    title: course.title || '',
    description: course.description || '',
    category: course.category || 'Web Development',
    difficulty: course.difficulty || 'Beginner',
    instructor: course.instructor || '',
    duration: course.duration || '',
    rating: course.rating ?? 4.5,
    thumbnail: course.thumbnail || ''
  });

  const [validationError, setValidationError] = useState('');

  const categories = [
    'Web Development',
    'Computer Science',
    'Database',
    'Cloud & DevOps',
    'Artificial Intelligence',
    'Security'
  ];

  const difficulties = ['Beginner', 'Intermediate', 'Advanced'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    if (validationError) setValidationError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setValidationError('Course title is required.');
      return;
    }
    if (!formData.instructor.trim()) {
      setValidationError('Instructor name is required.');
      return;
    }
    if (!formData.duration.trim()) {
      setValidationError('Duration is required.');
      return;
    }

    onSave(course.id, {
      ...formData,
      rating: parseFloat(formData.rating) || 4.5
    });
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-meta">
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
              Edit Course Details
            </h3>
            <span className="badge badge-outline">ID: {course.id}</span>
          </div>
          <button className="btn-close-modal" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ maxHeight: '72vh', overflowY: 'auto' }}>
            {(validationError || error) && (
              <div style={{
                background: '#fef2f2',
                border: '1px solid #fca5a5',
                color: '#991b1b',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.875rem'
              }}>
                <AlertCircle size={16} />
                <span>{validationError || error}</span>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="filter-label" style={{ display: 'block', marginBottom: '0.35rem' }}>
                  Course Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>

              <div>
                <label className="filter-label" style={{ display: 'block', marginBottom: '0.35rem' }}>
                  Course Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="form-input"
                  rows={3}
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="filter-label" style={{ display: 'block', marginBottom: '0.35rem' }}>
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="form-select"
                    style={{ width: '100%' }}
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="filter-label" style={{ display: 'block', marginBottom: '0.35rem' }}>
                    Difficulty Level
                  </label>
                  <select
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleChange}
                    className="form-select"
                    style={{ width: '100%' }}
                  >
                    {difficulties.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="filter-label" style={{ display: 'block', marginBottom: '0.35rem' }}>
                    Instructor *
                  </label>
                  <input
                    type="text"
                    name="instructor"
                    value={formData.instructor}
                    onChange={handleChange}
                    className="form-input"
                    required
                  />
                </div>

                <div>
                  <label className="filter-label" style={{ display: 'block', marginBottom: '0.35rem' }}>
                    Duration (e.g., 6 Weeks) *
                  </label>
                  <input
                    type="text"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
                <div>
                  <label className="filter-label" style={{ display: 'block', marginBottom: '0.35rem' }}>
                    Rating (0 - 5.0)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    name="rating"
                    value={formData.rating}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>

                <div>
                  <label className="filter-label" style={{ display: 'block', marginBottom: '0.35rem' }}>
                    Thumbnail Image URL
                  </label>
                  <input
                    type="url"
                    name="thumbnail"
                    value={formData.thumbnail}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={isSaving}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSaving}>
              <Save size={16} />
              <span>{isSaving ? 'Saving Changes...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
