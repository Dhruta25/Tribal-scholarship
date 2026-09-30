import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner, Badge } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import AppShell from '../../components/AppShell';
import { Lock, Mail, ShieldCheck, CheckCircle2 } from 'lucide-react';

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
        const fromPath = location.state?.from?.pathname;
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
      <Container className="py-4">
        <Row className="justify-content-center gy-4">
          <Col md={6} lg={5}>
            <div className="ks-card p-4">
              <div className="text-center mb-4">
                <div
                  className="rounded-circle d-inline-flex align-items-center justify-content-center p-3 mb-2"
                  style={{ background: '#1c1c22', border: '1px solid rgba(255,255,255,0.1)', color: '#fbbf24' }}
                >
                  <Lock size={26} />
                </div>
                <h3 className="fw-bold text-white mb-1" style={{ fontSize: '1.4rem' }}>Ministry Portal Sign In</h3>
                <p className="text-secondary small">
                  Sign in with your registered ST scholar or official MoTA account
                </p>
              </div>

              {location.state?.message && (
                <Alert variant="info" className="py-2.5 small d-flex align-items-center gap-2 bg-dark text-info border-secondary">
                  <CheckCircle2 size={18} className="text-info flex-shrink-0" />
                  <div>{location.state.message}</div>
                </Alert>
              )}

              {error && <Alert variant="danger" className="py-2 small bg-dark text-danger border-danger">{error}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold text-light">Email Address</Form.Label>
                  <div className="input-group">
                    <span className="input-group-text border-end-0" style={{ background: '#141418', borderColor: 'rgba(255,255,255,0.12)', color: '#a1a1aa' }}>
                      <Mail size={16} />
                    </span>
                    <Form.Control
                      type="email"
                      className="ks-input border-start-0"
                      placeholder="e.g. scholar@example.com or name@mota.gov.in"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="small fw-bold text-light">Password</Form.Label>
                  <div className="input-group">
                    <span className="input-group-text border-end-0" style={{ background: '#141418', borderColor: 'rgba(255,255,255,0.12)', color: '#a1a1aa' }}>
                      <Lock size={16} />
                    </span>
                    <Form.Control
                      type="password"
                      className="ks-input border-start-0"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </Form.Group>

                <Button
                  type="submit"
                  className="w-100 fw-bold py-2 shadow-sm border-0"
                  style={{ backgroundColor: '#fbbf24', color: '#000000' }}
                  disabled={loading}
                >
                  {loading ? <Spinner size="sm" animation="border" /> : 'Sign In to Portal'}
                </Button>
              </Form>

              <div className="text-center mt-3 small text-secondary">
                Don't have an applicant account? <Link to="/register" className="fw-bold text-warning">Register Here</Link>
              </div>
            </div>
          </Col>

          {/* 1-Click Demo Accounts Column */}
          <Col md={6} lg={5}>
            <div className="ks-card p-4">
              <h6 className="fw-bold text-white mb-2 d-flex align-items-center gap-2">
                <ShieldCheck size={18} className="text-warning" />
                <span>Optional Quick Test Shortcuts</span>
              </h6>
              <p className="small text-secondary mb-3">
                Click any role below only if you want to test with pre-seeded evaluation accounts:
              </p>

              <div className="d-flex flex-column gap-2">
                <button
                  type="button"
                  className="ks-btn-dark text-start d-flex justify-content-between align-items-center p-2.5 w-100"
                  onClick={() => handleQuickFill('admin@mota.gov.in', 'Admin@123')}
                >
                  <div>
                    <div className="fw-bold small text-warning">👑 Ministry Admin (Full Access)</div>
                    <div className="text-secondary" style={{ fontSize: '0.75rem' }}>admin@mota.gov.in | Admin@123</div>
                  </div>
                  <Badge bg="warning" text="dark">Admin</Badge>
                </button>

                <button
                  type="button"
                  className="ks-btn-dark text-start d-flex justify-content-between align-items-center p-2.5 w-100"
                  onClick={() => handleQuickFill('verifier1@mota.gov.in', 'Verifier@123')}
                >
                  <div>
                    <div className="fw-bold small text-info">🔍 Document Verifier 1</div>
                    <div className="text-secondary" style={{ fontSize: '0.75rem' }}>verifier1@mota.gov.in | Verifier@123</div>
                  </div>
                  <Badge bg="info">Verifier</Badge>
                </button>

                <button
                  type="button"
                  className="ks-btn-dark text-start d-flex justify-content-between align-items-center p-2.5 w-100"
                  onClick={() => handleQuickFill('officer1@mota.gov.in', 'Officer@123')}
                >
                  <div>
                    <div className="fw-bold small text-light">⚖️ Scrutiny Officer 1</div>
                    <div className="text-secondary" style={{ fontSize: '0.75rem' }}>officer1@mota.gov.in | Officer@123</div>
                  </div>
                  <Badge bg="secondary">Officer</Badge>
                </button>

                <button
                  type="button"
                  className="ks-btn-dark text-start d-flex justify-content-between align-items-center p-2.5 w-100"
                  onClick={() => handleQuickFill('rahul.st@example.com', 'Applicant@123')}
                >
                  <div>
                    <div className="fw-bold small text-success">🎓 ST Applicant (Rahul Kumar - Jharkhand)</div>
                    <div className="text-secondary" style={{ fontSize: '0.75rem' }}>rahul.st@example.com | Applicant@123</div>
                  </div>
                  <Badge bg="success">Applicant</Badge>
                </button>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </AppShell>
  );
};

export default Login;

