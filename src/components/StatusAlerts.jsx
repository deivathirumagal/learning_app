import React from 'react';
import { Loader2, RefreshCw, AlertCircle, CheckCircle, Info } from 'lucide-react';

export const LoadingSpinner = ({ message = 'Loading course data...' }) => (
  <div className="state-box loading-box">
    <Loader2 className="spinner-icon spin" size={32} />
    <p>{message}</p>
  </div>
);

export const ErrorAlert = ({ message, onRetry }) => (
  <div className="state-box error-box">
    <div className="error-content">
      <AlertCircle className="error-icon" size={24} />
      <span className="error-text">{message || 'An unexpected error occurred.'}</span>
    </div>
    {onRetry && (
      <button className="btn btn-retry" onClick={onRetry}>
        <RefreshCw size={16} /> Retry Request
      </button>
    )}
  </div>
);

export const SuccessAlert = ({ message, onClose }) => {
  if (!message) return null;
  return (
    <div className="state-box success-box">
      <div className="success-content">
        <CheckCircle className="success-icon" size={20} />
        <span>{message}</span>
      </div>
      {onClose && (
        <button className="btn-close" onClick={onClose}>×</button>
      )}
    </div>
  );
};

export const EmptyState = ({ title = 'No Courses Found', description = 'Try adjusting your search query or filters.' }) => (
  <div className="state-box empty-box">
    <Info size={40} className="empty-icon" />
    <h3>{title}</h3>
    <p>{description}</p>
  </div>
);
