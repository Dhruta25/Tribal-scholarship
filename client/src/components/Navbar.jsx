import React from 'react';
import { Navbar as BsNavbar, Nav, Container, NavDropdown, Badge } from 'react-bootstrap';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import NotificationBell from './NotificationBell';
import { User, LogOut, ShieldCheck, CheckCircle2, FileText, Layers, Award, Cpu, Trash2 } from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    window.location.replace('/login');
  };

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin/dashboard';
    if (user.role === 'verifier') return '/verifier/queue';
    if (user.role === 'officer') return '/officer/scrutiny';
    return '/applicant/dashboard';
  };

  const isAdmin = isAuthenticated && user?.role === 'admin';

  return (
    <BsNavbar expand="lg" className="py-2 shadow-sm" style={{ background: '#121215', borderBottom: '1px solid #22222a' }} variant="dark">
      <Container fluid className="px-3 px-md-4">
        {/* Brand in Lower Navbar */}
        <BsNavbar.Brand as={Link} to="/" className="d-flex align-items-center gap-2 fw-bold text-white fs-5 me-4">
          <Award className="text-warning" size={22} />
          <span>MoTA <span className="text-warning">Fellowships</span></span>
        </BsNavbar.Brand>

        <BsNavbar.Toggle aria-controls="main-navbar-nav" />
        <BsNavbar.Collapse id="main-navbar-nav">
          <Nav className="me-auto align-items-center gap-1 my-2 my-lg-0">
            <Nav.Link
              as={NavLink}
              to="/"
              end
              className={({ isActive }) => `px-3 py-1.5 rounded-3 fw-medium ${isActive ? 'bg-secondary bg-opacity-25 text-white' : 'text-light text-opacity-75'}`}
              style={{ fontSize: '0.92rem' }}
            >
              {t('nav.home', 'Home')}
            </Nav.Link>
            <Nav.Link
              as={NavLink}
              to="/schemes"
              className={({ isActive }) => `px-3 py-1.5 rounded-3 fw-medium ${isActive ? 'bg-secondary bg-opacity-25 text-white' : 'text-light text-opacity-75'}`}
              style={{ fontSize: '0.92rem' }}
            >
              {t('nav.schemes', 'Schemes & Fellowships')}
            </Nav.Link>
            <Nav.Link
              as={NavLink}
              to="/eligibility"
              className={({ isActive }) => `px-3 py-1.5 rounded-3 fw-medium ${isActive ? 'bg-secondary bg-opacity-25 text-white' : 'text-light text-opacity-75'}`}
              style={{ fontSize: '0.92rem' }}
            >
              {t('nav.eligibility', 'Eligibility Pre-Check')}
            </Nav.Link>

            {/* ML Hub (AI Models) - Admin Only */}
            {isAdmin && (
              <Nav.Link
                as={NavLink}
                to="/ml-hub"
                className={({ isActive }) => `px-3 py-1.5 rounded-3 fw-medium text-info ${isActive ? 'bg-info bg-opacity-10 text-white' : ''}`}
                style={{ fontSize: '0.92rem' }}
              >
                ⚡ ML Hub
              </Nav.Link>
            )}

            {/* Quick Link based on logged-in role */}
            {isAuthenticated && (
              <Nav.Link
                as={NavLink}
                to={getDashboardPath()}
                className={({ isActive }) => `px-3 py-1.5 rounded-3 fw-medium ${isActive ? 'bg-secondary bg-opacity-25 text-white' : 'text-light text-opacity-75'}`}
                style={{ fontSize: '0.92rem' }}
              >
                {t('nav.dashboard', 'Workspace')}
              </Nav.Link>
            )}
          </Nav>

          <Nav className="align-items-center gap-2">
            {isAuthenticated ? (
              <>
                <NotificationBell />

                <NavDropdown
                  title={
                    <span className="d-inline-flex align-items-center gap-2 text-white">
                      <div className="rounded-circle bg-warning text-dark fw-bold d-flex align-items-center justify-content-center" style={{ width: '28px', height: '28px', fontSize: '0.8rem' }}>
                        {user?.name?.charAt(0) || 'U'}
                      </div>
                      <span className="fw-medium text-truncate" style={{ maxWidth: '140px' }}>
                        {user?.name?.split(' ')[0]}
                      </span>
                      <Badge bg="light" text="dark" className="text-uppercase" style={{ fontSize: '0.65rem' }}>
                        {user?.role}
                      </Badge>
                    </span>
                  }
                  id="user-nav-dropdown"
                  align="end"
                  menuVariant="dark"
                >
                  <NavDropdown.Header>
                    <div className="fw-bold text-white">{user?.name}</div>
                    <div className="text-muted small">{user?.email}</div>
                  </NavDropdown.Header>
                  <NavDropdown.Divider />
                  
                  {user?.role === 'applicant' && (
                    <>
                      <NavDropdown.Item as={Link} to="/applicant/profile">
                        <User size={15} className="me-2" /> {t('nav.profile', 'My Profile')}
                      </NavDropdown.Item>
                      <NavDropdown.Item as={Link} to="/applicant/applications">
                        <FileText size={15} className="me-2" /> {t('nav.applications', 'My Applications')}
                      </NavDropdown.Item>
                      <NavDropdown.Item as={Link} to="/applicant/deficiencies">
                        <CheckCircle2 size={15} className="me-2" /> {t('nav.deficiencies', 'Deficiency Inbox')}
                      </NavDropdown.Item>
                      <NavDropdown.Item as={Link} to="/applicant/fellowship">
                        <Award size={15} className="me-2" /> {t('nav.fellowship', 'My Fellowship')}
                      </NavDropdown.Item>
                    </>
                  )}

                  {user?.role === 'verifier' && (
                    <>
                      <NavDropdown.Item as={Link} to="/verifier/queue">
                        <ShieldCheck size={15} className="me-2" /> {t('nav.verifier_queue', 'Verification Queue')}
                      </NavDropdown.Item>
                    </>
                  )}

                  {user?.role === 'officer' && (
                    <>
                      <NavDropdown.Item as={Link} to="/officer/scrutiny">
                        <Layers size={15} className="me-2" /> {t('nav.officer_scrutiny', 'Officer Scrutiny')}
                      </NavDropdown.Item>
                      <NavDropdown.Item as={Link} to="/officer/merit">
                        <Award size={15} className="me-2" /> {t('nav.merit_list', 'Merit List')}
                      </NavDropdown.Item>
                    </>
                  )}

                  {user?.role === 'admin' && (
                    <>
                      <NavDropdown.Item as={Link} to="/admin/dashboard">
                        <Layers size={15} className="me-2" /> {t('nav.dashboard', 'Admin Dashboard')}
                      </NavDropdown.Item>
                      <NavDropdown.Item as={Link} to="/admin/rules">
                        <ShieldCheck size={15} className="me-2" /> {t('nav.admin_rules', 'Rule Builder')}
                      </NavDropdown.Item>
                      <NavDropdown.Item as={Link} to="/ml-hub">
                        <Cpu size={15} className="me-2 text-info" /> ML Intelligence Hub
                      </NavDropdown.Item>
                    </>
                  )}

                  <NavDropdown.Divider />
                  {user?.role === 'applicant' && (
                    <NavDropdown.Item as={Link} to="/applicant/profile#danger-zone" className="text-danger small">
                      <Trash2 size={14} className="me-2" /> Delete Account
                    </NavDropdown.Item>
                  )}
                  <NavDropdown.Item onClick={handleLogout} className="text-danger fw-semibold">
                    <LogOut size={15} className="me-2" /> {t('nav.logout', 'Sign Out')}
                  </NavDropdown.Item>
                </NavDropdown>
              </>
            ) : (
              <div className="d-flex align-items-center gap-2 ms-lg-3">
                <Link
                  to="/login"
                  className="btn btn-outline-light btn-sm px-3 py-1.5 fw-semibold rounded-2"
                  style={{ fontSize: '0.85rem', borderColor: 'rgba(255,255,255,0.3)' }}
                >
                  {t('nav.login', 'Sign In')}
                </Link>
                <Link
                  to="/register"
                  className="btn btn-warning btn-sm px-3 py-1.5 fw-bold text-dark rounded-2"
                  style={{ fontSize: '0.85rem', backgroundColor: '#fbbf24', borderColor: '#fbbf24' }}
                >
                  {t('nav.register', 'Register (ST Scholar)')}
                </Link>
              </div>
            )}
          </Nav>
        </BsNavbar.Collapse>
      </Container>
    </BsNavbar>
  );
};

export default Navbar;

