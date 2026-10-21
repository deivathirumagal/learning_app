import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  CheckCircle, 
  Award, 
  BookOpen, 
  FileText, 
  ChevronRight, 
  Check, 
  Send, 
  HelpCircle,
  GraduationCap
} from 'lucide-react';
import { 
  fetchLearningHistoryAsync, 
  updateProgressAsync, 
  submitQuizAsync, 
  submitAssignmentAsync, 
  clearLearningMessages 
} from '../features/learning/learningSlice';
import { LoadingSpinner, ErrorAlert, SuccessAlert, EmptyState } from '../components/StatusAlerts';
import { CertificateModal } from '../components/CertificateModal';
import { QuizComponent } from '../components/QuizComponent';
import { AssignmentComponent } from '../components/AssignmentComponent';

export const LearningDashboardPage = ({ onNavigateToCourses, onNavigateToLogin }) => {
  const dispatch = useDispatch();
  const { enrollments, loading, operationLoading, error, successMessage } = useSelector((state) => state.learning);
  const { user, token, isAuthenticated } = useSelector((state) => state.auth);
  const { courses } = useSelector((state) => state.courses);

  const [selectedEnrollmentId, setSelectedEnrollmentId] = useState(null);
  const [activeTab, setActiveTab] = useState('materials'); // 'materials' | 'quiz' | 'assignment'
  const [selectedQuizAnswers, setSelectedQuizAnswers] = useState({});
  const [assignmentText, setAssignmentText] = useState('');
  const [showCertModal, setShowCertModal] = useState(false);
  const [activeCertEnrollment, setActiveCertEnrollment] = useState(null);

  useEffect(() => {
    if (isAuthenticated && token) {
      dispatch(fetchLearningHistoryAsync({ email: user?.email, token }));
    }
  }, [dispatch, isAuthenticated, token, user?.email]);

  const activeId = selectedEnrollmentId || (enrollments.length > 0 ? enrollments[0].enrollmentId : null);

  if (!isAuthenticated) {
    return (
      <div className="page-container">
        <div className="state-box empty-box auth-restricted-box">
          <GraduationCap size={48} className="empty-icon" />
          <h3>Authentication Required</h3>
          <p>The Learning Dashboard tracks enrolled courses, interactive quiz scores, and certificate issuance for authenticated students only.</p>
          <button className="btn btn-primary" onClick={onNavigateToLogin}>
            Go to Student Login
          </button>
        </div>
      </div>
    );
  }

  const currentEnrollment = enrollments.find(e => e.enrollmentId === activeId);
  const currentCourse = courses.find(c => c.id === currentEnrollment?.courseId);

  // Handle Mark Module Complete (PUT/PATCH progress update)
  const handleMarkMaterialComplete = (materialId) => {
    if (!currentEnrollment) return;
    const isAlreadyDone = currentEnrollment.completedMaterials?.includes(materialId);
    if (isAlreadyDone) return;

    const totalMaterials = currentCourse?.materials?.length || 3;
    const completedCount = (currentEnrollment.completedMaterials?.length || 0) + 1;
    const calculatedProgress = Math.min(100, Math.round((completedCount / totalMaterials) * 70));

    dispatch(updateProgressAsync({
      enrollmentId: currentEnrollment.enrollmentId,
      progressPercentage: Math.max(currentEnrollment.progressPercentage, calculatedProgress),
      completedMaterialId: materialId,
      token
    }));
  };

  // Handle Quiz Submission
  const handleSubmitQuiz = (quiz) => {
    const selected = selectedQuizAnswers[quiz.id];
    if (!selected) {
      alert("Please choose an answer option before submitting.");
      return;
    }
    const isCorrect = selected === quiz.answer;
    const score = isCorrect ? 100 : 50;

    dispatch(submitQuizAsync({
      enrollmentId: currentEnrollment.enrollmentId,
      quizId: quiz.id,
      selectedOption: selected,
      score,
      token
    }));
  };

  // Handle Assignment Submission
  const handleSubmitAssignment = (assignmentId) => {
    if (!assignmentText.trim()) {
      alert("Please write your solution or repository link before submitting.");
      return;
    }

    dispatch(submitAssignmentAsync({
      enrollmentId: currentEnrollment.enrollmentId,
      assignmentId,
      submissionText: assignmentText,
      token
    }));
    setAssignmentText('');
  };

  // Open Certificate Modal
  const handleViewCertificate = (enr) => {
    setActiveCertEnrollment(enr);
    setShowCertModal(true);
  };

  return (
    <div className="page-container">
      <div className="catalog-hero">
        <h2 className="page-heading">Student Learning Dashboard</h2>
        <p className="page-subheading">
          Manage enrolled curriculum, track learning progress, submit online quizzes and laboratory assignments.
        </p>
      </div>

      {successMessage && (
        <SuccessAlert 
          message={successMessage} 
          onClose={() => dispatch(clearLearningMessages())} 
        />
      )}
      {error && (
        <ErrorAlert 
          message={error} 
          onRetry={() => dispatch(fetchLearningHistoryAsync({ email: user?.email, token }))} 
        />
      )}

      {loading ? (
        <LoadingSpinner message="Retrieving student learning history..." />
      ) : enrollments.length === 0 ? (
        <EmptyState 
          title="No Enrolled Courses Yet" 
          description="You haven't enrolled in any courses. Explore the catalog and enroll to start learning." 
        />
      ) : (
        <div className="dashboard-layout">
          {/* Left Sidebar: Enrolled Courses List */}
          <aside className="dashboard-sidebar">
            <h3 className="sidebar-heading">
              <BookOpen size={18} /> My Enrolled Courses ({enrollments.length})
            </h3>
            <div className="enrolled-list">
              {enrollments.map((enr) => {
                const isSelected = enr.enrollmentId === activeId;
                return (
                  <div 
                    key={enr.enrollmentId}
                    className={`enrolled-item-card ${isSelected ? 'active' : ''}`}
                    onClick={() => setSelectedEnrollmentId(enr.enrollmentId)}
                  >
                    <div className="enrolled-item-header">
                      <span className="category-mini-badge">{enr.category}</span>
                      <span className="progress-percent-text">{enr.progressPercentage}%</span>
                    </div>
                    <h4 className="enrolled-title">{enr.courseTitle}</h4>
                    
                    {/* Visual Progress Bar */}
                    <div className="progress-track">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${enr.progressPercentage}%` }}
                      ></div>
                    </div>

                    <div className="enrolled-item-footer">
                      {enr.progressPercentage >= 100 ? (
                        <span className="cert-status-ready" onClick={(e) => {
                          e.stopPropagation();
                          handleViewCertificate(enr);
                        }}>
                          <Award size={14} /> Certificate Ready
                        </span>
                      ) : (
                        <span className="status-in-progress">In Progress</span>
                      )}
                      <ChevronRight size={16} />
                    </div>
                  </div>
                );
              })}
            </div>

            <button 
              className="btn btn-outline btn-block" 
              onClick={onNavigateToCourses}
              style={{ marginTop: '1rem' }}
            >
              + Browse More Courses
            </button>
          </aside>

          {/* Right Main Panel: Course Learning Console */}
          {currentEnrollment && (
            <main className="dashboard-main-content">
              <div className="course-progress-header">
                <div>
                  <span className="badge badge-primary">{currentEnrollment.category}</span>
                  <h3 className="active-course-title">{currentEnrollment.courseTitle}</h3>
                  <span className="enrollment-id-text">
                    Enrollment ID: <code>{currentEnrollment.enrollmentId}</code> | Enrolled: {new Date(currentEnrollment.enrolledAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="progress-gauge-box">
                  <div className="gauge-number">{currentEnrollment.progressPercentage}%</div>
                  <span>Curriculum Progress</span>
                  {currentEnrollment.progressPercentage >= 100 && (
                    <button 
                      className="btn btn-cert-open"
                      onClick={() => handleViewCertificate(currentEnrollment)}
                    >
                      <Award size={16} /> View Certificate
                    </button>
                  )}
                </div>
              </div>

              {/* Learning Console Tabs */}
              <div className="dashboard-tabs">
                <button 
                  className={`tab-btn ${activeTab === 'materials' ? 'active' : ''}`}
                  onClick={() => setActiveTab('materials')}
                >
                  <FileText size={16} /> Course Materials & Lessons
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'progress' ? 'active' : ''}`}
                  onClick={() => setActiveTab('progress')}
                >
                  <GraduationCap size={16} /> Progress Analytics
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'quiz' ? 'active' : ''}`}
                  onClick={() => setActiveTab('quiz')}
                >
                  <HelpCircle size={16} /> Quizzes ({currentCourse?.quizzes?.length || 0})
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'assignment' ? 'active' : ''}`}
                  onClick={() => setActiveTab('assignment')}
                >
                  <Send size={16} /> Assignments ({currentCourse?.assignments?.length || 0})
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'certificate' ? 'active' : ''}`}
                  onClick={() => setActiveTab('certificate')}
                >
                  <Award size={16} /> Certificate
                </button>
              </div>

              {/* Tab 1: Materials (Progress) */}
              {activeTab === 'materials' && (
                <div className="tab-pane">
                  <div className="materials-task-list">
                    {currentCourse?.materials?.map((mat) => {
                      const isCompleted = currentEnrollment.completedMaterials?.includes(mat.id);
                      return (
                        <div key={mat.id} className={`material-task-row ${isCompleted ? 'completed' : ''}`}>
                          <div className="task-left">
                            <span className={`task-check-circle ${isCompleted ? 'checked' : ''}`}>
                              {isCompleted && <Check size={14} />}
                            </span>
                            <div>
                              <h4 className="task-title">{mat.title}</h4>
                              <span className="task-sub">{mat.type} • Duration: {mat.duration}</span>
                            </div>
                          </div>

                          <div>
                            {isCompleted ? (
                              <span className="badge-done">
                                <CheckCircle size={15} /> Completed
                              </span>
                            ) : (
                              <button 
                                className="btn btn-sm btn-primary"
                                disabled={operationLoading}
                                onClick={() => handleMarkMaterialComplete(mat.id)}
                              >
                                {operationLoading ? 'Saving...' : 'Mark as Completed'}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tab 2: Quizzes */}
              {activeTab === 'quiz' && (
                <div className="tab-pane">
                  <QuizComponent
                    quizzes={currentCourse?.quizzes || []}
                    quizScores={currentEnrollment?.quizScores || {}}
                    onSubmitQuiz={(q, answer) => {
                      handleSubmitQuiz({ ...q, userAnswer: answer });
                    }}
                    isSubmitting={operationLoading}
                  />
                </div>
              )}

              {/* Tab 3: Assignments */}
              {activeTab === 'assignment' && (
                <div className="tab-pane">
                  <AssignmentComponent
                    assignments={currentCourse?.assignments || []}
                    submittedAssignments={currentEnrollment?.assignments || {}}
                    onSubmitAssignment={(assignmentId, text) => {
                      setAssignmentText(text);
                      handleSubmitAssignment(assignmentId, text);
                    }}
                    isSubmitting={operationLoading}
                  />
                </div>
              )}

              {/* Tab 4: Progress Analytics */}
              {activeTab === 'progress' && (
                <div className="tab-pane">
                  <div className="progress-analytics-card">
                    <h4>Curriculum Milestone Breakdown</h4>
                    <p className="analytics-desc">Track completion across syllabus readings, assessments, and laboratory coursework:</p>
                    
                    <div className="analytics-bars-group">
                      <div className="analytics-metric-row">
                        <div className="metric-info">
                          <span>Course Learning Materials (50% Weight)</span>
                          <strong>{currentEnrollment.completedMaterials?.length || 0} / {currentCourse?.materials?.length || 3} Completed</strong>
                        </div>
                        <div className="progress-track">
                          <div 
                            className="progress-fill" 
                            style={{ 
                              width: `${Math.min(100, Math.round(((currentEnrollment.completedMaterials?.length || 0) / (currentCourse?.materials?.length || 3)) * 100))}%` 
                            }}
                          ></div>
                        </div>
                      </div>

                      <div className="analytics-metric-row">
                        <div className="metric-info">
                          <span>Interactive Assessment Quizzes (25% Weight)</span>
                          <strong>{Object.keys(currentEnrollment.quizScores || {}).length} / {currentCourse?.quizzes?.length || 2} Submitted</strong>
                        </div>
                        <div className="progress-track">
                          <div 
                            className="progress-fill" 
                            style={{ 
                              width: `${Math.min(100, Math.round((Object.keys(currentEnrollment.quizScores || {}).length / (currentCourse?.quizzes?.length || 2)) * 100))}%` 
                            }}
                          ></div>
                        </div>
                      </div>

                      <div className="analytics-metric-row">
                        <div className="metric-info">
                          <span>Laboratory Practical Assignments (25% Weight)</span>
                          <strong>{Object.keys(currentEnrollment.assignments || {}).length} / {currentCourse?.assignments?.length || 1} Uploaded</strong>
                        </div>
                        <div className="progress-track">
                          <div 
                            className="progress-fill" 
                            style={{ 
                              width: `${Math.min(100, Math.round((Object.keys(currentEnrollment.assignments || {}).length / (currentCourse?.assignments?.length || 1)) * 100))}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    <div className="analytics-summary-box">
                      <div>
                        <span className="summary-title">Total Weighted Course Progress</span>
                        <h2 className="summary-percentage">{currentEnrollment.progressPercentage}%</h2>
                      </div>
                      {currentEnrollment.progressPercentage >= 100 ? (
                        <button 
                          className="btn btn-cert-open btn-lg"
                          onClick={() => handleViewCertificate(currentEnrollment)}
                        >
                          <Award size={18} /> View Verified Certificate
                        </button>
                      ) : (
                        <span className="badge badge-outline">Complete all tasks to unlock certificate</span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 5: Course Certificate */}
              {activeTab === 'certificate' && (
                <div className="tab-pane">
                  {currentEnrollment.progressPercentage >= 100 ? (
                    <div className="certificate-ready-pane">
                      <Award size={64} className="cert-gold-icon" style={{ margin: '0 auto 1rem' }} />
                      <h3>Official Academic Certificate Ready</h3>
                      <p>Congratulations! You have completed all learning modules, quizzes, and laboratory assignments with distinction.</p>
                      <button 
                        className="btn btn-primary btn-lg"
                        onClick={() => handleViewCertificate(currentEnrollment)}
                        style={{ marginTop: '1rem' }}
                      >
                        <Award size={18} /> Open & Print Full Certificate
                      </button>
                    </div>
                  ) : (
                    <div className="certificate-locked-pane">
                      <GraduationCap size={48} className="empty-icon" />
                      <h3>Certificate Locked ({currentEnrollment.progressPercentage}% / 100%)</h3>
                      <p>Certificates are cryptographically verified and issued only when all course modules, quizzes, and practical assignments reach 100% completion.</p>
                      <button 
                        className="btn btn-primary"
                        onClick={() => setActiveTab('materials')}
                        style={{ marginTop: '0.75rem' }}
                      >
                        Continue Course Lessons
                      </button>
                    </div>
                  )}
                </div>
              )}
            </main>
          )}
        </div>
      )}

      {/* Certificate Modal */}
      {showCertModal && (
        <CertificateModal 
          enrollment={activeCertEnrollment}
          studentName={user?.name}
          onClose={() => setShowCertModal(false)}
        />
      )}
    </div>
  );
};
