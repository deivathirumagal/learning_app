import React, { useState } from 'react';
import { 
  Award, 
  Calendar, 
  Download, 
  CheckCircle2, 
  ExternalLink, 
  BookOpen, 
  GraduationCap, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { CertificateModal } from '../components/CertificateModal';

export const CertificatesPage = ({ 
  enrollments = [], 
  user, 
  onNavigateToCourses, 
  onNavigateToDashboard 
}) => {
  const [selectedCert, setSelectedCert] = useState(null);

  // Filter completed enrollments
  const completedEnrollments = enrollments.filter(e => e.progressPercentage >= 100);
  const inProgressEnrollments = enrollments.filter(e => e.progressPercentage < 100);

  return (
    <div className="page-container">
      <div className="catalog-hero">
        <h2 className="page-heading">Verified Academic Credentials & Certificates</h2>
        <p className="page-subheading">
          Official certificates issued upon 100% completion of course syllabus modules, quizzes, and laboratory assignments.
        </p>
      </div>

      {completedEnrollments.length === 0 ? (
        <div className="state-box empty-box certificate-empty-state">
          <Award size={56} className="empty-icon text-amber" />
          <h3>No Certificates Earned Yet</h3>
          <p>
            You haven't completed any courses to 100% yet. Finish all learning modules, quizzes, and practical assignments to unlock your official verified certificate.
          </p>
          {inProgressEnrollments.length > 0 ? (
            <div className="in-progress-nudge">
              <p>You have <strong>{inProgressEnrollments.length}</strong> course(s) currently in progress:</p>
              <div className="mini-progress-list">
                {inProgressEnrollments.map(enr => (
                  <div key={enr.enrollmentId} className="mini-progress-card">
                    <span className="mini-title">{enr.courseTitle}</span>
                    <div className="progress-track" style={{ height: '8px', margin: '0.4rem 0' }}>
                      <div className="progress-fill" style={{ width: `${enr.progressPercentage}%` }}></div>
                    </div>
                    <span className="mini-percent">{enr.progressPercentage}% Completed</span>
                  </div>
                ))}
              </div>
              <button 
                className="btn btn-primary" 
                onClick={onNavigateToDashboard}
                style={{ marginTop: '1rem' }}
              >
                Go to Learning Dashboard <ArrowRight size={16} />
              </button>
            </div>
          ) : (
            <button 
              className="btn btn-primary" 
              onClick={onNavigateToCourses}
              style={{ marginTop: '1rem' }}
            >
              <BookOpen size={16} /> Browse Course Catalog & Enroll
            </button>
          )}
        </div>
      ) : (
        <div className="certificates-grid">
          {completedEnrollments.map((enr) => {
            const certId = `CERT-EDU-${enr.enrollmentId.replace('enr_', '')}`;
            const issueDate = enr.enrolledAt 
              ? new Date(enr.enrolledAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
              : 'October 2026';

            return (
              <div key={enr.enrollmentId} className="certificate-item-card">
                <div className="cert-card-header">
                  <div className="cert-badge-wrap">
                    <Award size={36} className="cert-gold-icon" />
                  </div>
                  <div>
                    <span className="badge badge-success">
                      <CheckCircle2 size={13} /> 100% Completed
                    </span>
                    <h3 className="cert-card-course">{enr.courseTitle}</h3>
                    <span className="cert-id-tag">ID: <code>{certId}</code></span>
                  </div>
                </div>

                <div className="cert-card-body">
                  <div className="cert-info-row">
                    <span className="info-label">Recipient:</span>
                    <strong>{user?.name || enr.studentName || 'Student'}</strong>
                  </div>
                  <div className="cert-info-row">
                    <span className="info-label">Issued On:</span>
                    <span><Calendar size={13} /> {issueDate}</span>
                  </div>
                  <div className="cert-info-row">
                    <span className="info-label">Department:</span>
                    <span>{user?.department || 'Computer Science & Engineering'}</span>
                  </div>
                </div>

                <div className="cert-card-actions">
                  <button 
                    className="btn btn-primary btn-block"
                    onClick={() => setSelectedCert(enr)}
                  >
                    <Award size={16} /> View & Print Certificate
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reusable Certificate Modal */}
      {selectedCert && (
        <CertificateModal 
          enrollment={selectedCert}
          studentName={user?.name}
          onClose={() => setSelectedCert(null)}
        />
      )}
    </div>
  );
};
