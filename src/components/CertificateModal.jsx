import React from 'react';
import { Award, CheckCircle2, Download, Calendar } from 'lucide-react';

export const CertificateModal = ({ enrollment, studentName, onClose }) => {
  if (!enrollment) return null;

  const certNumber = `CERT-EDU-${enrollment.enrollmentId.replace('enr_', '')}`;
  const formattedDate = enrollment.enrolledAt 
    ? new Date(enrollment.enrolledAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'October 2026';

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card certificate-card-modal" onClick={(e) => e.stopPropagation()}>
        <div className="certificate-border">
          <div className="certificate-inner">
            <div className="cert-header">
              <Award size={48} className="cert-badge-gold" />
              <h2 className="cert-main-title">Certificate of Completion</h2>
              <span className="cert-subtitle">EduPortal Academic Excellence Program</span>
            </div>

            <p className="cert-body-intro">This is proudly presented to</p>
            <h3 className="cert-recipient-name">{studentName || enrollment.studentName || 'Student'}</h3>
            <p className="cert-body-text">
              for successfully completing all curriculum modules, quizzes, and practical assignments for the course:
            </p>
            <h4 className="cert-course-name">"{enrollment.courseTitle}"</h4>

            <div className="cert-meta-footer">
              <div className="cert-meta-item">
                <span className="meta-label">Completion Status</span>
                <span className="meta-val meta-green"><CheckCircle2 size={15} /> 100% Completed</span>
              </div>
              <div className="cert-meta-item">
                <span className="meta-label">Certificate ID</span>
                <span className="meta-val">{certNumber}</span>
              </div>
              <div className="cert-meta-item">
                <span className="meta-label">Date Issued</span>
                <span className="meta-val"><Calendar size={14} /> {formattedDate}</span>
              </div>
            </div>

            <div className="cert-signatures">
              <div className="sig-block">
                <div className="sig-line">Dr. Ananya Sharma</div>
                <span>Course Director</span>
              </div>
              <div className="sig-block">
                <div className="sig-line">EduPortal Academic Dean</div>
                <span>Verified Credential</span>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer" style={{ justifyContent: 'center', gap: '1rem' }}>
          <button className="btn btn-primary" onClick={() => window.print()}>
            <Download size={16} /> Print / Save PDF
          </button>
          <button className="btn btn-outline" onClick={onClose}>
            Close Certificate
          </button>
        </div>
      </div>
    </div>
  );
};
