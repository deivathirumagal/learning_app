import { 
  GraduationCap, 
  BookOpen, 
  LayoutDashboard, 
  LogIn, 
  LogOut, 
  User, 
  Terminal, 
  Layers,
  Award,
  Home as HomeIcon
} from 'lucide-react';

export const Navbar = ({ 
  activeTab, 
  setActiveTab, 
  user, 
  isAuthenticated, 
  onLogout,
  showDebugModal,
  setShowDebugModal
}) => {
  return (
    <header className="site-header">
      <div className="header-container">
        <div className="logo-section" onClick={() => setActiveTab(isAuthenticated ? 'home' : 'login')} role="button" tabIndex={0}>
          <div className="logo-icon-wrap">
            <GraduationCap size={28} className="logo-icon" />
          </div>
          <div>
            <h1 className="logo-title">EduPortal</h1>
            <span className="logo-subtitle">Unit 3 + Unit 4 Integrated E-Learning</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="nav-menu">
          <button 
            className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
            onClick={() => setActiveTab('home')}
          >
            <HomeIcon size={18} />
            <span>Home</span>
          </button>

          <button 
            className={`nav-item ${activeTab === 'courses' ? 'active' : ''}`}
            onClick={() => setActiveTab('courses')}
          >
            <BookOpen size={18} />
            <span>Courses</span>
          </button>

          <button 
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </button>

          <button 
            className={`nav-item ${activeTab === 'certificates' ? 'active' : ''}`}
            onClick={() => setActiveTab('certificates')}
          >
            <Award size={18} />
            <span>Certificates</span>
          </button>

          <button 
            className={`nav-item ${activeTab === 'experiments' ? 'active' : ''}`}
            onClick={() => setActiveTab('experiments')}
          >
            <Layers size={18} />
            <span>Experiments</span>
          </button>
        </nav>

        {/* User Auth controls & Store Inspector modal button */}
        <div className="header-actions">
          <button 
            className="btn btn-debug"
            onClick={() => setShowDebugModal(!showDebugModal)}
            title="Inspect Redux Middleware Logs & Cache State"
          >
            <Terminal size={16} />
            <span>Store Inspector</span>
          </button>

          {isAuthenticated ? (
            <div className="user-profile-badge">
              <div className="user-avatar" title={user?.rollNo}>
                <User size={16} />
              </div>
              <div className="user-details-mini">
                <span className="user-name">{user?.name}</span>
                <span className="user-role">{user?.role}</span>
              </div>
              <button 
                className="btn btn-logout-icon" 
                onClick={onLogout}
                title="Logout & Sign Out"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button 
              className="btn btn-login-nav"
              onClick={() => setActiveTab('login')}
            >
              <LogIn size={16} />
              <span>Student Login</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
