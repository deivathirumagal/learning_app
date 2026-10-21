import React, { useState } from 'react';

export const AssignmentComponent = ({
  assignments = [],
  submittedAssignments = {},
  onSubmitAssignment,
  isSubmitting = false
}) => {
  const [submissionTexts, setSubmissionTexts] = useState({});
  const [validationError, setValidationError] = useState('');

  const handleTextChange = (assignmentId, text) => {
    setSubmissionTexts(prev => ({ ...prev, [assignmentId]: text }));
    if (validationError) setValidationError('');
  };

  const handleSubmit = (assignmentId) => {
    const text = submissionTexts[assignmentId]?.trim();
    if (!text) {
      setValidationError('Please provide your assignment response or repository URL.');
      return;
    }

    if (onSubmitAssignment) {
      onSubmitAssignment(assignmentId, text);
    }
  };

  if (!assignments || assignments.length === 0) {
    return (
      <div className="empty-box" data-testid="no-assignments">
        <p>No practical assignments assigned for this course.</p>
      </div>
    );
  }

  return (
    <div className="assignment-container" data-testid="assignment-container">
      {validationError && (
        <div 
          className="error-box" 
          role="alert" 
          style={{ padding: '0.65rem 1rem', marginBottom: '1rem', fontSize: '0.85rem' }}
        >
          {validationError}
        </div>
      )}

      {assignments.map((a) => {
        const submitted = submittedAssignments?.[a.id];

        return (
          <div key={a.id} className="assignment-card-box" data-testid={`assignment-card-${a.id}`}>
            <div className="assign-header">
              <h4>{a.title}</h4>
              <span className="badge badge-outline">Max Marks: {a.maxMarks || 100}</span>
            </div>
            <p className="assign-sub">Deadline: {a.deadline || 'End of Week'}</p>

            {submitted ? (
              <div className="assignment-feedback-box">
                <div className="feedback-row">
                  <span className="grade-badge">Grade: {submitted.grade || 'A+ (95/100)'}</span>
                  <span className="status-tag">Status: {submitted.status || 'Graded'}</span>
                </div>
                <p className="submission-content">
                  <strong>Your Submission:</strong> {submitted.content}
                </p>
                <span className="timestamp-note">
                  Submitted on: {new Date(submitted.submittedAt || Date.now()).toLocaleString()}
                </span>
              </div>
            ) : (
              <div className="assignment-form">
                <label className="filter-label">Solution Details / Repository Link:</label>
                <textarea
                  className="form-input"
                  rows={4}
                  placeholder="e.g., https://github.com/student/assignment or write solution notes..."
                  value={submissionTexts[a.id] || ''}
                  onChange={(e) => handleTextChange(a.id, e.target.value)}
                  aria-label={`Solution for ${a.title}`}
                />
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                  onClick={() => handleSubmit(a.id)}
                  style={{ marginTop: '0.75rem' }}
                >
                  {isSubmitting ? 'Uploading...' : 'Submit Assignment'}
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
