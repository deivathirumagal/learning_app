import React, { useState } from 'react';
import { 
  Terminal, 
  Database, 
  AlertTriangle, 
  ShieldAlert, 
  RefreshCw,
  Cpu
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { clearCourseCache } from '../features/courses/coursesSlice';
import { setSimulatedExpiredToken } from '../features/authentication/authSlice';
import { courseApiService } from '../services/courseApi';

export const StoreInspectorModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('redux');
  const [failState, setFailState] = useState(courseApiService.isSimulatedFailureActive());

  const coursesState = useSelector((state) => state.courses);
  const learningState = useSelector((state) => state.learning);
  const authState = useSelector((state) => state.auth);

  if (!isOpen) return null;

  const logs = (typeof window !== 'undefined' && window.__REDUX_LOGS__) || [];

  const handleToggleFailure = () => {
    const nextVal = !failState;
    courseApiService.toggleSimulatedFailure(nextVal);
    setFailState(nextVal);
    dispatch(clearCourseCache());
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card debug-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-meta">
            <Terminal size={20} />
            <h3 style={{ margin: 0 }}>Redux Middleware & State Store Inspector</h3>
          </div>
          <button className="btn-close-modal" onClick={onClose}>×</button>
        </div>

        <div className="inspector-tabs">
          <button 
            className={`tab-btn ${activeTab === 'redux' ? 'active' : ''}`}
            onClick={() => setActiveTab('redux')}
          >
            <Cpu size={16} /> Middleware Action Logs ({logs.length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'cache' ? 'active' : ''}`}
            onClick={() => setActiveTab('cache')}
          >
            <Database size={16} /> Cache & State Snapshot
          </button>
          <button 
            className={`tab-btn ${activeTab === 'viva' ? 'active' : ''}`}
            onClick={() => setActiveTab('viva')}
          >
            <ShieldAlert size={16} /> Viva Error Simulations
          </button>
        </div>

        <div className="modal-body" style={{ maxHeight: '440px', overflowY: 'auto' }}>
          {activeTab === 'redux' && (
            <div>
              <p className="helper-note">
                Logs captured in real-time by <code>actionLoggerMiddleware</code> for all dispatched learning/auth actions:
              </p>
              {logs.length === 0 ? (
                <div className="empty-subtext">No Redux actions dispatched yet. Try enrolling or filtering courses!</div>
              ) : (
                <div className="log-list">
                  {logs.map((lg, i) => (
                    <div key={i} className="log-item">
                      <div className="log-header">
                        <span className="log-time">[{lg.time}]</span>
                        <strong className="log-type">{lg.type}</strong>
                      </div>
                      {lg.payload && (
                        <pre className="log-payload">
                          {JSON.stringify(lg.payload, null, 2)}
                        </pre>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'cache' && (
            <div>
              <div className="cache-card-info">
                <h4>Experiment 2 Caching Status:</h4>
                <div className="cache-stat-grid">
                  <div className="stat-pill">
                    <span>Course Cache Status:</span>
                    <strong>{coursesState.isFromCache ? '⚡ CACHED (Memory hit)' : '🌐 Fresh REST API Fetch'}</strong>
                  </div>
                  <div className="stat-pill">
                    <span>Cache Last Updated:</span>
                    <strong>{coursesState.cacheTimestamp ? new Date(coursesState.cacheTimestamp).toLocaleTimeString() : 'No Cache'}</strong>
                  </div>
                  <div className="stat-pill">
                    <span>Active Enrollments in Store:</span>
                    <strong>{learningState.enrollments.length} records</strong>
                  </div>
                </div>

                <button 
                  className="btn btn-outline btn-sm" 
                  onClick={() => dispatch(clearCourseCache())}
                  style={{ marginTop: '0.75rem' }}
                >
                  <RefreshCw size={14} /> Invalidate / Clear Course Cache
                </button>
              </div>

              <div style={{ marginTop: '1rem' }}>
                <h4>Active Store State Snapshot:</h4>
                <pre className="state-json-viewer">
                  {JSON.stringify({
                    auth: {
                      isAuthenticated: authState.isAuthenticated,
                      userEmail: authState.user?.email || null,
                      hasToken: !!authState.token
                    },
                    coursesCount: coursesState.courses.length,
                    enrolledCourses: learningState.enrollments.map(e => ({
                      id: e.enrollmentId,
                      course: e.courseTitle,
                      progress: `${e.progressPercentage}%`
                    }))
                  }, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'viva' && (
            <div>
              <p className="helper-note">
                Use these interactive toggles to demonstrate error states and viva questions on demand:
              </p>
              
              <div className="viva-control-card">
                <div>
                  <strong>1. Test API Server Failure & Retry Button (Exp 1 Requirement):</strong>
                  <p className="control-desc">Forces all Course REST API requests to throw HTTP 500 error to show loading, error banners, and the working Retry button.</p>
                </div>
                <button 
                  className={`btn ${failState ? 'btn-danger' : 'btn-outline'}`}
                  onClick={handleToggleFailure}
                >
                  {failState ? 'Simulated Failure Active (Disable)' : 'Simulate API Network Failure'}
                </button>
              </div>

              <div className="viva-control-card" style={{ marginTop: '1rem' }}>
                <div>
                  <strong>2. Test 401 Unauthorized / Token Expiry (Exp 4 Requirement):</strong>
                  <p className="control-desc">Modifies current session token to "EXPIRED_TOKEN" to show automatic 401 interception and redirection.</p>
                </div>
                <button 
                  className="btn btn-outline"
                  onClick={() => dispatch(setSimulatedExpiredToken())}
                >
                  <AlertTriangle size={15} /> Set Token Expired
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>Close Inspector</button>
        </div>
      </div>
    </div>
  );
};
