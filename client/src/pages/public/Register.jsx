import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { INDIAN_STATES, UNION_TERRITORIES } from '../../constants/indianStates';
import AppShell from '../../components/AppShell';
import { UserPlus } from 'lucide-react';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    gender: '',
    dob: '',
    state: '',
    district: '',
    educationLevel: '',
    course: '',
    university: '',
    marksPercent: '',
    familyIncome: '',
    bankAccount: '',
    ifsc: '',
    aadhaarLast4: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const fullName = `${formData.firstName} ${formData.lastName}`.trim() || formData.firstName || formData.email.split('@')[0];
      const payload = {
        name: fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: 'applicant',
        profile: {
          dob: formData.dob || undefined,
          gender: formData.gender,
          category: 'ST',
          state: formData.state,
          district: formData.district,
          aadhaarLast4: formData.aadhaarLast4,
          familyIncome: formData.familyIncome ? Number(formData.familyIncome) : 0,
          bankAccount: formData.bankAccount,
          ifsc: formData.ifsc,
          education: {
            level: formData.educationLevel,
            course: formData.course,
            university: formData.university,
            marksPercent: formData.marksPercent ? Number(formData.marksPercent) : 0,
            yearOfPassing: new Date().getFullYear()
          }
        }
      };

      const res = await register(payload);
      if (res.success) {
        navigate(`/verify-otp?email=${encodeURIComponent(formData.email)}&otpDebug=${res.otpDebug || ''}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please check inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <Container className="py-4">
        <Row className="justify-content-center">
          <Col lg={8} md={10}>
            <div className="ks-card p-4">
              <div className="text-center mb-4">
                <div
                  className="rounded-circle d-inline-flex align-items-center justify-content-center p-3 mb-2"
                  style={{ background: '#1c1c22', border: '1px solid rgba(255,255,255,0.1)', color: '#fbbf24' }}
                >
                  <UserPlus size={28} />
                </div>
                <h3 className="fw-bold text-white mb-1" style={{ fontSize: '1.5rem' }}>ST Scholar Registration</h3>
                <p className="text-secondary small">
                  Create your Scheduled Tribe Scholar account for NFST and NOS online applications
                </p>
              </div>

              {error && <Alert variant="danger" className="py-2 small bg-dark text-danger border-danger">{error}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Row className="gy-3">
                  {/* Account Details */}
                  <Col md={12}>
                    <h6 className="fw-bold text-warning border-bottom border-secondary border-opacity-50 pb-2 mb-2">
                      1. Personal &amp; Contact Information
                    </h6>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="small fw-bold text-light">First Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="firstName"
                        className="ks-input"
                        placeholder="e.g. Rahul"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="small fw-bold text-light">Last Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="lastName"
                        className="ks-input"
                        placeholder="e.g. Kumar"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="small fw-bold text-light">Email Address</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        className="ks-input"
                        placeholder="e.g. scholar@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="small fw-bold text-light">Mobile Phone Number</Form.Label>
                      <Form.Control
                        type="tel"
                        name="phone"
                        className="ks-input"
                        placeholder="e.g. 9876543210"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>

                  <Col md={4}>
                    <Form.Group>
                      <Form.Label className="small fw-bold text-light">Date of Birth</Form.Label>
                      <Form.Control
                        type="date"
                        name="dob"
                        className="ks-input"
                        value={formData.dob}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>

                  <Col md={4}>
                    <Form.Group>
                      <Form.Label className="small fw-bold text-light">Gender</Form.Label>
                      <Form.Select name="gender" className="ks-select" value={formData.gender} onChange={handleChange} required>
                        <option value="">-- Select Gender --</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  <Col md={4}>
                    <Form.Group>
                      <Form.Label className="small fw-bold text-light">Domicile State</Form.Label>
                      <Form.Select
                        name="state"
                        className="ks-select"
                        value={formData.state}
                        onChange={handleChange}
                        required
                      >
                        <option value="">-- Domicile State / UT --</option>
                        <optgroup label="28 Indian States (A–Z)">
                          {INDIAN_STATES.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </optgroup>
                        <optgroup label="8 Union Territories">
                          {UNION_TERRITORIES.map((ut) => (
                            <option key={ut} value={ut}>
                              {ut}
                            </option>
                          ))}
                        </optgroup>
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="small fw-bold text-light">District</Form.Label>
                      <Form.Control
                        type="text"
                        name="district"
                        className="ks-input"
                        placeholder="e.g. Ranchi / Mayurbhanj"
                        value={formData.district}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>

                  {/* Academic & Financial */}
                  <Col md={12} className="mt-4">
                    <h6 className="fw-bold text-warning border-bottom border-secondary border-opacity-50 pb-2 mb-2">
                      2. Academic &amp; Verification Baseline
                    </h6>
                  </Col>

                  <Col md={4}>
                    <Form.Group>
                      <Form.Label className="small fw-bold text-light">Qualifying Degree Level</Form.Label>
                      <Form.Select name="educationLevel" className="ks-select" value={formData.educationLevel} onChange={handleChange} required>
                        <option value="">-- Qualifying Level --</option>
                        <option value="12th">12th Standard / Higher Secondary</option>
                        <option value="bachelors">Bachelor's (Graduation)</option>
                        <option value="masters">Master's (Post-Graduation)</option>
                        <option value="phd">Ph.D. Enrolled</option>
                        <option value="postdoc">Post-Doctoral</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  <Col md={4}>
                    <Form.Group>
                      <Form.Label className="small fw-bold text-light">Degree / Course Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="course"
                        className="ks-input"
                        placeholder="e.g. M.Sc. Biotechnology"
                        value={formData.course}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>

                  <Col md={4}>
                    <Form.Group>
                      <Form.Label className="small fw-bold text-light">Aggregate Percentage (%)</Form.Label>
                      <Form.Control
                        type="number"
                        step="0.1"
                        name="marksPercent"
                        className="ks-input"
                        placeholder="e.g. 74.5"
                        value={formData.marksPercent}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="small fw-bold text-light">University / College</Form.Label>
                      <Form.Control
                        type="text"
                        name="university"
                        className="ks-input"
                        placeholder="e.g. Central University of Jharkhand"
                        value={formData.university}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="small fw-bold text-light">Annual Family Income (INR)</Form.Label>
                      <Form.Control
                        type="number"
                        name="familyIncome"
                        className="ks-input"
                        placeholder="e.g. 250000"
                        value={formData.familyIncome}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>

                  <Col md={4}>
                    <Form.Group>
                      <Form.Label className="small fw-bold text-light">Aadhaar (Last 4 Digits)</Form.Label>
                      <Form.Control
                        type="text"
                        maxLength={4}
                        name="aadhaarLast4"
                        className="ks-input"
                        placeholder="e.g. 4892"
                        value={formData.aadhaarLast4}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>

                  <Col md={4}>
                    <Form.Group>
                      <Form.Label className="small fw-bold text-light">Bank Account Number</Form.Label>
                      <Form.Control
                        type="text"
                        name="bankAccount"
                        className="ks-input"
                        placeholder="e.g. 39847192841"
                        value={formData.bankAccount}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>

                  <Col md={4}>
                    <Form.Group>
                      <Form.Label className="small fw-bold text-light">Bank IFSC Code</Form.Label>
                      <Form.Control
                        type="text"
                        name="ifsc"
                        className="ks-input"
                        placeholder="e.g. SBIN0001234"
                        value={formData.ifsc}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>

                  <Col md={12}>
                    <Form.Group className="mb-2">
                      <Form.Label className="small fw-bold text-light">Password</Form.Label>
                      <Form.Control
                        type="password"
                        name="password"
                        className="ks-input"
                        placeholder="Enter a secure password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <div className="mt-4">
                  <Button
                    type="submit"
                    className="w-100 fw-bold py-2 shadow-sm border-0"
                    style={{ backgroundColor: '#fbbf24', color: '#000000' }}
                    disabled={loading}
                  >
                    {loading ? <Spinner size="sm" animation="border" /> : 'Register & Receive OTP'}
                  </Button>
                </div>
              </Form>

              <div className="text-center mt-3 small text-secondary">
                Already registered? <Link to="/login" className="fw-bold text-warning">Sign In Here</Link>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </AppShell>
  );
};

export default Register;

