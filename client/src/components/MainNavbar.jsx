import React, { useState } from 'react';
import { Container, Nav, Navbar as BsNavbar, NavDropdown } from 'react-bootstrap';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import NotificationBell from './NotificationBell';
import {
  Award,
  FileCheck2,
  FileText,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  User,
  Menu,
  X,
  Layers,
  Cpu
} from 'lucide-react';

const MainNavbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [navExpanded, setNavExpanded] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getDashboardPath = () => {
    if (!user) return '/login?redirect=/applicant/dashboard';
    if (user.role === 'admin') return '/admin/dashboard';
    if (user.role === 'verifier') return '/verifier/queue';
    if (user.role === 'officer') return '/officer/scrutiny';
    return '/applicant/dashboard';
  };

  const getDocVerificationPath = () => {
    if (!isAuthenticated) return '/login?redirect=/applicant/deficiencies';
    if (user?.role === 'verifier') return '/verifier/queue';
    if (user?.role === 'officer') return '/officer/scrutiny';
    return '/applicant/deficiencies';
  };

  const navLinkClass = ({ isActive }) =>
    `nav-link px-3 py-2 rounded-2 fw-semibold d-flex align-items-center gap-1.5 transition-all ${
      isActive
        ? 'text-primary bg-light'
        : 'text-secondary hover-text-primary'
    }`;

  return (
    <BsNavbar
      expand="lg"
      expanded={navExpanded}
      onToggle={setNavExpanded}
      className="sticky-top border-bottom py-2 bg-white"
      style={{
        boxShadow: 'var(--shadow-sticky)',
        zIndex: 1020
      }}
    >
      <div className="civic-container d-flex justify-content-between align-items-center">
        {/* Brand & Logo */}
        <BsNavbar.Brand
          as={Link}
          to="/"
          className="d-flex align-items-center gap-2.5 text-decoration-none me-3 py-1"
          onClick={() => setNavExpanded(false)}
        >
          <img
            src="/images/vidyasetu-logo.jpg"
            alt="VIDYA SETU"
            className="flex-shrink-0 rounded-1"
            style={{
              height: '44px',
              width: 'auto',
              objectFit: 'contain'
            }}
          />

          <div className="d-flex flex-column justify-content-center">
            <span
              className="fw-bold"
              style={{
                fontSize: '1.2rem',
                lineHeight: '1.1',
                letterSpacing: '-0.01em',
                color: 'var(--color-primary)'
              }}
            >
              VIDYA<span style={{ color: 'var(--color-accent)' }}>SETU</span>
            </span>
            <span
              className="text-secondary small d-none d-sm-block"
              style={{ fontSize: '0.70rem', letterSpacing: '0.02em', lineHeight: '1.1', fontWeight: 500 }}
            >
              Ministry of Tribal Affairs, GoI
            </span>
          </div>
        </BsNavbar.Brand>

        {/* Mobile Toggle Button */}
        <BsNavbar.Toggle
          aria-controls="civic-main-navbar-nav"
          className="border-0 p-1.5"
          aria-label="Toggle navigation menu"
        >
          {navExpanded ? <X size={24} className="text-primary" /> : <Menu size={24} className="text-primary" />}
        </BsNavbar.Toggle>

        {/* Navigation Items */}
        <BsNavbar.Collapse id="civic-main-navbar-nav">
          <Nav className="me-auto align-items-lg-center gap-1 my-2 my-lg-0">
            <Nav.Link as={NavLink} to="/" end className={navLinkClass} onClick={() => setNavExpanded(false)}>
              {t('nav.home', 'Home')}
            </Nav.Link>

            <Nav.Link as={NavLink} to="/schemes" className={navLinkClass} onClick={() => setNavExpanded(false)}>
              {t('nav.schemes', 'Schemes')}
            </Nav.Link>

            <Nav.Link as={NavLink} to="/eligibility" className={navLinkClass} onClick={() => setNavExpanded(false)}>
              {t('nav.eligibility', 'Eligibility Check')}
            </Nav.Link>

            <Nav.Link as={NavLink} to={getDocVerificationPath()} className={navLinkClass} onClick={() => setNavExpanded(false)}>
              <FileCheck2 size={16} className="d-none d-xl-inline" aria-hidden="true" />
              <span>Document Verification</span>
            </Nav.Link>

            <Nav.Link as={NavLink} to={getDashboardPath()} className={navLinkClass} onClick={() => setNavExpanded(false)}>
              <LayoutDashboard size={16} className="d-none d-xl-inline" aria-hidden="true" />
              <span>{t('nav.dashboard', 'Dashboard')}</span>
            </Nav.Link>

            {/* Admin ML Hub Link */}
            {isAuthenticated && user?.role === 'admin' && (
              <Nav.Link as={NavLink} to="/ml-hub" className={navLinkClass} onClick={() => setNavExpanded(false)}>
                <Cpu size={16} className="text-info" aria-hidden="true" />
                <span>ML Hub</span>
              </Nav.Link>
            )}
          </Nav>

          {/* Right Action Bar: Notifications & User Menu */}
          <div className="d-flex align-items-center gap-2 pt-2 pt-lg-0 border-top border-lg-0">
            {isAuthenticated ? (
              <>
                <NotificationBell />

                <NavDropdown
                  title={
                    <span className="d-inline-flex align-items-center gap-2 text-primary fw-semibold">
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold flex-shrink-0"
                        style={{
                          width: '32px',
                          height: '32px',
                          backgroundColor: 'var(--color-primary)',
                          fontSize: '0.85rem'
                        }}
                        aria-hidden="true"
                      >
                        {user?.name?.charAt(0) || 'U'}
                      </div>
                      <span className="text-truncate d-none d-md-inline" style={{ maxWidth: '120px' }}>
                        {user?.name?.split(' ')[0]}
                      </span>
                      <span className="civic-badge civic-badge-neutral text-uppercase" style={{ fontSize: '0.68rem' }}>
                        {user?.role}
                      </span>
                    </span>
                  }
                  id="user-profile-menu-dropdown"
                  align="end"
                >
                  <NavDropdown.Header>
                    <div className="fw-bold text-primary">{user?.name}</div>
                    <div className="text-secondary small text-truncate" style={{ maxWidth: '200px' }}>
                      {user?.email}
                    </div>
                  </NavDropdown.Header>
                  <NavDropdown.Divider />

                  {user?.role === 'applicant' && (
                    <>
                      <NavDropdown.Item as={Link} to="/applicant/profile" onClick={() => setNavExpanded(false)}>
                        <User size={15} className="me-2 text-secondary" /> {t('nav.profile', 'My Profile')}
                      </NavDropdown.Item>
                      <NavDropdown.Item as={Link} to="/applicant/applications" onClick={() => setNavExpanded(false)}>
                        <FileText size={15} className="me-2 text-secondary" /> {t('nav.applications', 'My Applications')}
                      </NavDropdown.Item>
                      <NavDropdown.Item as={Link} to="/applicant/deficiencies" onClick={() => setNavExpanded(false)}>
                        <FileCheck2 size={15} className="me-2 text-secondary" /> Deficiency Inbox
                      </NavDropdown.Item>
                      <NavDropdown.Item as={Link} to="/applicant/fellowship" onClick={() => setNavExpanded(false)}>
                        <Award size={15} className="me-2 text-secondary" /> {t('nav.fellowship', 'My Fellowship')}
                      </NavDropdown.Item>
                    </>
                  )}

                  {user?.role === 'verifier' && (
                    <NavDropdown.Item as={Link} to="/verifier/queue" onClick={() => setNavExpanded(false)}>
                      <ShieldCheck size={15} className="me-2 text-secondary" /> Verification Queue
                    </NavDropdown.Item>
                  )}

                  {user?.role === 'officer' && (
                    <>
                      <NavDropdown.Item as={Link} to="/officer/scrutiny" onClick={() => setNavExpanded(false)}>
                        <Layers size={15} className="me-2 text-secondary" /> Officer Scrutiny
                      </NavDropdown.Item>
                      <NavDropdown.Item as={Link} to="/officer/merit" onClick={() => setNavExpanded(false)}>
                        <Award size={15} className="me-2 text-secondary" /> Merit List
                      </NavDropdown.Item>
                    </>
                  )}

                  {user?.role === 'admin' && (
                    <>
                      <NavDropdown.Item as={Link} to="/admin/dashboard" onClick={() => setNavExpanded(false)}>
                        <LayoutDashboard size={15} className="me-2 text-secondary" /> Admin Dashboard
                      </NavDropdown.Item>
                      <NavDropdown.Item as={Link} to="/admin/rules" onClick={() => setNavExpanded(false)}>
                        <ShieldCheck size={15} className="me-2 text-secondary" /> Rule Engine Builder
                      </NavDropdown.Item>
                    </>
                  )}

                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={handleLogout} className="text-danger fw-semibold">
                    <LogOut size={15} className="me-2 text-danger" /> {t('nav.logout', 'Sign Out')}
                  </NavDropdown.Item>
                </NavDropdown>
              </>
            ) : (
              <div className="d-flex align-items-center gap-2 w-100 w-lg-auto justify-content-end">
                <Link
                  to="/login"
                  className="btn-civic-secondary py-1.5 px-3"
                  style={{ minHeight: '38px', fontSize: '0.875rem' }}
                  onClick={() => setNavExpanded(false)}
                >
                  {t('nav.login', 'Sign In')}
                </Link>
                <Link
                  to="/register"
                  className="btn-civic-primary py-1.5 px-3"
                  style={{ minHeight: '38px', fontSize: '0.875rem' }}
                  onClick={() => setNavExpanded(false)}
                >
                  {t('nav.register', 'Register')}
                </Link>
              </div>
            )}
          </div>
        </BsNavbar.Collapse>
      </div>
    </BsNavbar>
  );
};

export default MainNavbar;
