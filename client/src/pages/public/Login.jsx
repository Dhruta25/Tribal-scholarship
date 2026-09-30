import React, { useState } from 'react';
import { Row, Col, Alert, Spinner } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import AppShell from '../../components/AppShell';
import PageHeader from '../../components/common/PageHeader';
import FormField from '../../components/common/FormField';
import Button from '../../components/common/Button';
import { Lock, Mail, ShieldCheck, CheckCircle2, User, ArrowRight } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await login(email, password);
      if (data.success) {
        const role = data.user.role;
        const fromPath = location.state?.from?.pathname || new URLSearchParams(location.search).get('redirect');
        const roleHomes = {
          admin: '/admin/dashboard',
          verifier: '/verifier/queue',
          officer: '/officer/scrutiny',
          applicant: '/applicant/dashboard'
        };
        const defaultPath = roleHomes[role] || '/applicant/dashboard';

        const isAllowedPath = fromPath && (
          fromPath.startsWith('/' + role) ||
          fromPath.startsWith('/schemes') ||
          fromPath.startsWith('/eligibility')
        );

        const targetPath = isAllowedPath ? fromPath : defaultPath;
        window.location.replace(targetPath);
      }
    } catch (err) {
      if (err.response?.data?.code === 'EMAIL_NOT_VERIFIED') {
        navigate(`/verify-otp?email=${encodeURIComponent(err.response.data.email)}`, {
          state: { message: err.response.data.message }
        });
        return;
      }
      setError(err.response?.data?.message || 'Invalid email or password entered.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (userEmail, userPass) => {
    setEmail(userEmail);
    setPassword(userPass);
    setError(null);
  };

  return (
    <AppShell>
      <div className="py-2">
        <PageHeader
          category="Secure Civic Access"
          title="Sign in to Ministry Portal"
          subtitle="Access your scholarship applications, verification status, and official notifications."
          breadcrumbs={[{ label: 'Sign In' }]}
        />

        <Row className="justify-content-center gy-4">
          {/* Main Sign In Form Card */}
          <Col md={6} lg={5}>
            <div className="civic-card p-4">
              <div className="text-center mb-4">
                <div
                  className="rounded-circle d-inline-flex align-items-center justify-content-center mb-2"
                  style={{
                    width: '48px',
                    height: '48px',
                    backgroundColor: 'var(--color-primary-light)',
                    color: 'var(--color-primary)'
                  }}
                  aria-hidden="true"
                >
                  <Lock size={24} />
                </div>
                <h2 className="h5 fw-bold text-primary mb-1">Official Account Sign In</h2>
                <p className="text-secondary small mb-0">
                  Enter your registered ST scholar or government officer credentials
                </p>
              </div>

              {location.state?.message && (
                <div className="p-3 mb-3 rounded-2 bg-success bg-opacity-10 border border-success text-success small d-flex align-items-center gap-2">
                  <CheckCircle2 size={18} className="flex-shrink-0" />
                  <div>{location.state.message}</div>
                </div>
              )}

              {error && (
                <div className="p-3 mb-3 rounded-2 bg-danger bg-opacity-10 border border-danger text-danger small">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <FormField
                  label="Registered Email Address"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. rahul.st@example.com or name@mota.gov.in"
                  required
                  autoComplete="email"
                />

                <FormField
                  label="Password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your account password"
                  required
                  autoComplete="current-password"
                />

                <Button
                  type="submit"
                  variant="primary"
                  className="w-100 mt-2"
                  loading={loading}
                >
                  Sign In to Portal
                </Button>
              </form>

              <div className="text-center mt-4 pt-3 border-top small text-secondary">
                Are you a new Scheduled Tribe scholar?{' '}
                <Link to="/register" className="fw-bold text-primary text-decoration-underline">
                  Register for Scholarship
                </Link>
              </div>
            </div>
          </Col>

          {/* Quick Test Shortcuts Column */}
          <Col md={6} lg={5}>
            <div className="civic-card p-4">
              <div className="d-flex align-items-center gap-2 mb-2">
                <ShieldCheck size={20} className="text-primary" />
                <h3 className="h6 fw-bold text-primary mb-0">Testing &amp; Evaluation Shortcuts</h3>
              </div>
              <p className="small text-secondary mb-3">
                Quickly test different role interfaces using pre-configured evaluation accounts:
              </p>

              <div className="d-flex flex-column gap-2">
                <button
                  type="button"
                  className="civic-card-muted text-start d-flex justify-content-between align-items-center p-3 w-100 border-0 hover-shadow transition-all"
                  onClick={() => handleQuickFill('rahul.st@example.com', 'Applicant@123')}
                >
                  <div>
                    <div className="fw-bold small text-primary">ST Applicant (Rahul Kumar)</div>
                    <div className="text-secondary small">rahul.st@example.com</div>
                  </div>
                  <span className="civic-badge civic-badge-success">Applicant</span>
                </button>

                <button
                  type="button"
                  className="civic-card-muted text-start d-flex justify-content-between align-items-center p-3 w-100 border-0 hover-shadow transition-all"
                  onClick={() => handleQuickFill('verifier1@mota.gov.in', 'Verifier@123')}
                >
                  <div>
                    <div className="fw-bold small text-primary">Document Verification Officer</div>
                    <div className="text-secondary small">verifier1@mota.gov.in</div>
                  </div>
                  <span className="civic-badge civic-badge-info">Verifier</span>
                </button>

                <button
                  type="button"
                  className="civic-card-muted text-start d-flex justify-content-between align-items-center p-3 w-100 border-0 hover-shadow transition-all"
                  onClick={() => handleQuickFill('officer1@mota.gov.in', 'Officer@123')}
                >
                  <div>
                    <div className="fw-bold small text-primary">Scheme Scrutiny Officer</div>
                    <div className="text-secondary small">officer1@mota.gov.in</div>
                  </div>
                  <span className="civic-badge civic-badge-warning">Officer</span>
                </button>

                <button
                  type="button"
                  className="civic-card-muted text-start d-flex justify-content-between align-items-center p-3 w-100 border-0 hover-shadow transition-all"
                  onClick={() => handleQuickFill('admin@mota.gov.in', 'Admin@123')}
                >
                  <div>
                    <div className="fw-bold small text-primary">Ministry Administrator</div>
                    <div className="text-secondary small">admin@mota.gov.in</div>
                  </div>
                  <span className="civic-badge civic-badge-neutral">Admin</span>
                </button>
              </div>
            </div>
          </Col>
        </Row>
      </div>
    </AppShell>
  );
};

export default Login;
