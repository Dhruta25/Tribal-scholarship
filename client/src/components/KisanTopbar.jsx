import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  Award,
  Search,
  Bell,
  LogOut,
  ChevronDown,
  LayoutDashboard,
  Compass,
  AlertTriangle,
  Landmark,
  Users,
  Cpu
} from 'lucide-react';

const KisanTopbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { lang, setLang } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getOverviewPath = () => {
    if (!user) return '/';
    if (user.role === 'admin') return '/admin/dashboard';
    if (user.role === 'applicant') return '/applicant/dashboard';
    if (user.role === 'officer') return '/officer/scrutiny';
    if (user.role === 'verifier') return '/verifier/queue';
    return '/';
  };

  return (
    <header className="ks-topbar px-4 py-2 flex-wrap gap-3" style={{ height: 'auto', minHeight: '68px' }}>
      {/* Brand Emblem Logo Header */}
      <Link to="/" className="ks-brand-header text-decoration-none py-0 me-2">
        <div className="ks-brand-logo-icon">
          <Award size={18} />
        </div>
        <div>
          <span className="ks-brand-title d-block" style={{ fontSize: '1.05rem', lineHeight: '1.1' }}>
            MoTA VanSetu
          </span>
          <span className="text-muted" style={{ fontSize: '0.65rem', letterSpacing: '0.04em' }}>
            TRIBAL SCHOLARSHIPS
          </span>
        </div>
      </Link>

      {/* Center Horizontal Navigation Menu Pills */}
      <nav className="d-flex align-items-center gap-1.5 flex-wrap mx-auto">
        <NavLink
          to={getOverviewPath()}
          className={({ isActive }) => `ks-nav-item py-1.5 px-3 mb-0 ${isActive ? 'active' : ''}`}
          end
        >
          <LayoutDashboard size={15} />
          <span>Overview</span>
        </NavLink>

        <NavLink
          to="/eligibility"
          className={({ isActive }) => `ks-nav-item py-1.5 px-3 mb-0 ${isActive ? 'active' : ''}`}
        >
          <Compass size={15} />
          <span>Scholar Advisory</span>
        </NavLink>

        <NavLink
          to="/admin/anomalies"
          className={({ isActive }) => `ks-nav-item py-1.5 px-3 mb-0 ${isActive ? 'active' : ''}`}
        >
          <AlertTriangle size={15} />
          <span>Distress Alerts</span>
          <span className="ks-badge-red ms-1">12</span>
        </NavLink>

        <NavLink
          to="/schemes"
          className={({ isActive }) => `ks-nav-item py-1.5 px-3 mb-0 ${isActive ? 'active' : ''}`}
        >
          <Landmark size={15} />
          <span>Scholarship Schemes</span>
        </NavLink>

        <NavLink
          to="/applicant/applications"
          className={({ isActive }) => `ks-nav-item py-1.5 px-3 mb-0 ${isActive ? 'active' : ''}`}
        >
          <Users size={15} />
          <span>ST Applicants</span>
        </NavLink>

        {user?.role === 'admin' && (
          <NavLink
            to="/ml-hub"
            className={({ isActive }) => `ks-nav-item py-1.5 px-3 mb-0 ${isActive ? 'active' : ''}`}
          >
            <Cpu size={15} className="text-info" />
            <span>ML Intelligence</span>
          </NavLink>
        )}
      </nav>

      {/* Right User & Utility Actions */}
      <div className="ks-topbar-actions ms-auto">
        {/* Search button */}
        <button type="button" className="ks-topbar-icon-btn" title="Search scholarship signals">
          <Search size={16} />
        </button>

        {/* Notification Bell */}
        <button type="button" className="ks-topbar-icon-btn" title="Notifications">
          <Bell size={16} />
          <span className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-dark rounded-circle" style={{ width: '8px', height: '8px' }}></span>
        </button>

        {/* Language Selector Pills */}
        <div className="ks-lang-pill-container d-none d-lg-flex">
          <button
            type="button"
            className={`ks-lang-pill-btn ${lang === 'en' ? 'active' : ''}`}
            onClick={() => setLang('en')}
          >
            English
          </button>
          <button
            type="button"
            className={`ks-lang-pill-btn ${lang === 'hi' ? 'active' : ''}`}
            onClick={() => setLang('hi')}
          >
            हिन्दी
          </button>
        </div>

        {/* User Profile Pill */}
        {isAuthenticated ? (
          <div className="dropdown">
            <button
              className="btn btn-dark btn-sm d-flex align-items-center gap-2 rounded-pill px-3 py-1 bg-transparent border-0"
              type="button"
              id="kisanUserDropdown"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <div
                className="rounded-circle bg-warning text-dark d-flex align-items-center justify-content-center fw-bold"
                style={{ width: '28px', height: '28px', fontSize: '0.75rem' }}
              >
                {user?.name ? user.name.charAt(0) : 'A'}
              </div>
              <div className="text-start d-none d-md-block" style={{ lineHeight: '1.2' }}>
                <div className="fw-bold text-white" style={{ fontSize: '0.82rem' }}>
                  {user?.name || 'Ananya Shah'}
                </div>
                <div className="text-muted" style={{ fontSize: '0.7rem' }}>
                  {user?.role ? `${user.role} officer` : 'Scrutiny Officer'}
                </div>
              </div>
              <ChevronDown size={14} className="text-muted" />
            </button>
            <ul className="dropdown-menu dropdown-menu-dark dropdown-menu-end shadow-lg" aria-labelledby="kisanUserDropdown">
              <li>
                <div className="dropdown-header">
                  <div className="fw-bold text-white">{user?.name}</div>
                  <div className="small text-muted">{user?.email}</div>
                </div>
              </li>
              <li><hr className="dropdown-divider" /></li>
              <li>
                <Link to="/applicant/profile" className="dropdown-item">Profile Settings</Link>
              </li>
              <li>
                <button onClick={handleLogout} className="dropdown-item text-danger d-flex align-items-center gap-2">
                  <LogOut size={14} /> Sign Out
                </button>
              </li>
            </ul>
          </div>
        ) : (
          <div className="d-flex align-items-center gap-2">
            <Link to="/login" className="ks-btn-dark px-3 py-1.5" style={{ fontSize: '0.82rem' }}>
              Sign In
            </Link>
            <Link to="/register" className="ks-btn-white px-3 py-1.5" style={{ fontSize: '0.82rem' }}>
              Register
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default KisanTopbar;
