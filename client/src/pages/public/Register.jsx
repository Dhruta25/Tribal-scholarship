import React, { useState } from 'react';
import { Row, Col, Alert, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { INDIAN_STATES, UNION_TERRITORIES } from '../../constants/indianStates';
import AppShell from '../../components/AppShell';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import { UserPlus, ShieldCheck, CheckCircle2 } from 'lucide-react';

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
          education: {
            level: formData.educationLevel,
            course: formData.course,
            university: formData.university,
            marksPercent: formData.marksPercent ? parseFloat(formData.marksPercent) : undefined
          },
          familyIncome: formData.familyIncome ? parseFloat(formData.familyIncome) : undefined,
          bankDetails: {
            accountNumber: formData.bankAccount,
            ifsc: formData.ifsc
          },
          aadhaarLast4: formData.aadhaarLast4
        }
      };

      const res = await register(payload);
      // Always go to verify-otp if the account was created (success or OTP delivery failed)
      if (res && (res.requiresVerification || res.success)) {
        navigate(`/verify-otp?email=${encodeURIComponent(formData.email)}`, {
          state: {
            message: res.message || 'OTP verification code sent to your registered email.',
            otpDebug: res.otpDebug || ''
          }
        });
      } else {
        navigate('/login', {
          state: { message: 'Registration completed successfully! Please sign in with your credentials.' }
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please check your entered details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <PageHeader
        category="Scheduled Tribe Scholar Registration"
        title="Create Your Student Account"
        subtitle="Register for National Fellowships (NFST), Overseas Scholarships (NOS), and Direct Benefit Transfer (DBT)."
        breadcrumbs={[{ label: 'Register' }]}
      />

      <Row className="justify-content-center">
        <Col lg={9}>
          <div className="civic-card p-4 p-md-5">
            <div className="d-flex align-items-center gap-3 mb-4 pb-3 border-bottom">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                style={{
                  width: '44px',
                  height: '44px',
                  backgroundColor: 'var(--color-primary-light)',
                  color: 'var(--color-primary)'
                }}
              >
                <UserPlus size={22} />
              </div>
              <div>
                <h2 className="h5 fw-bold text-primary mb-1">Scholar Information Registration Form</h2>
                <p className="text-secondary small mb-0">
                  Ensure names and details match your government identity and ST caste certificate exactly.
                </p>
              </div>
            </div>

            {error && (
              <div className="p-3 mb-4 rounded-2 bg-danger bg-opacity-10 border border-danger text-danger small">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Section 1: Personal & Contact Details */}
              <h3 className="h6 fw-bold text-primary border-bottom pb-2 mb-3">
                1. Personal &amp; Identity Details
              </h3>
              <Row className="gy-3 mb-4">
                <Col md={6}>
                  <div className="civic-form-group">
                    <label className="civic-label">First Name <span className="required-mark">*</span></label>
                    <input
                      type="text"
                      name="firstName"
                      className="civic-input"
                      placeholder="e.g. Rahul"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </Col>

                <Col md={6}>
                  <div className="civic-form-group">
                    <label className="civic-label">Last Name <span className="required-mark">*</span></label>
                    <input
                      type="text"
                      name="lastName"
                      className="civic-input"
                      placeholder="e.g. Kumar"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </Col>

                <Col md={6}>
                  <div className="civic-form-group">
                    <label className="civic-label">Email Address <span className="required-mark">*</span></label>
                    <input
                      type="email"
                      name="email"
                      className="civic-input"
                      placeholder="e.g. rahul.st@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                    <div className="civic-helper">Official verification OTP will be delivered to this address.</div>
                  </div>
                </Col>

                <Col md={6}>
                  <div className="civic-form-group">
                    <label className="civic-label">Mobile Phone Number <span className="required-mark">*</span></label>
                    <input
                      type="tel"
                      name="phone"
                      className="civic-input"
                      placeholder="10-digit mobile number"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </Col>

                <Col md={4}>
                  <div className="civic-form-group">
                    <label className="civic-label">Gender <span className="required-mark">*</span></label>
                    <select
                      name="gender"
                      className="civic-select"
                      value={formData.gender}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female (30% Horizontal Quota)</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </Col>

                <Col md={4}>
                  <div className="civic-form-group">
                    <label className="civic-label">Date of Birth <span className="required-mark">*</span></label>
                    <input
                      type="date"
                      name="dob"
                      className="civic-input"
                      value={formData.dob}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </Col>

                <Col md={4}>
                  <div className="civic-form-group">
                    <label className="civic-label">Aadhaar (Last 4 Digits) <span className="required-mark">*</span></label>
                    <input
                      type="text"
                      name="aadhaarLast4"
                      maxLength={4}
                      pattern="[0-9]{4}"
                      className="civic-input"
                      placeholder="XXXX"
                      value={formData.aadhaarLast4}
                      onChange={handleChange}
                      required
                    />
                    <div className="civic-helper">Only last 4 digits stored for privacy.</div>
                  </div>
                </Col>
              </Row>

              {/* Section 2: Domicile Details */}
              <h3 className="h6 fw-bold text-primary border-bottom pb-2 mb-3">
                2. Domicile &amp; Residential Location
              </h3>
              <Row className="gy-3 mb-4">
                <Col md={6}>
                  <div className="civic-form-group">
                    <label className="civic-label">State / UT of Domicile <span className="required-mark">*</span></label>
                    <select
                      name="state"
                      className="civic-select"
                      value={formData.state}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select State or UT</option>
                      <optgroup label="States">
                        {INDIAN_STATES.map((st) => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </optgroup>
                      <optgroup label="Union Territories">
                        {UNION_TERRITORIES.map((ut) => (
                          <option key={ut} value={ut}>{ut}</option>
                        ))}
                      </optgroup>
                    </select>
                  </div>
                </Col>

                <Col md={6}>
                  <div className="civic-form-group">
                    <label className="civic-label">District Name <span className="required-mark">*</span></label>
                    <input
                      type="text"
                      name="district"
                      className="civic-input"
                      placeholder="e.g. Ranchi / Bastar"
                      value={formData.district}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </Col>
              </Row>

              {/* Section 3: Educational Background */}
              <h3 className="h6 fw-bold text-primary border-bottom pb-2 mb-3">
                3. Current / Highest Educational Background
              </h3>
              <Row className="gy-3 mb-4">
                <Col md={4}>
                  <div className="civic-form-group">
                    <label className="civic-label">Education Level <span className="required-mark">*</span></label>
                    <select
                      name="educationLevel"
                      className="civic-select"
                      value={formData.educationLevel}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Education Level</option>
                      <option value="10th">Class 10th (Secondary)</option>
                      <option value="12th">Class 12th / Intermediate</option>
                      <option value="bachelors">Bachelor's Degree</option>
                      <option value="masters">Master's Degree</option>
                      <option value="phd">Ph.D. / M.Phil</option>
                    </select>
                  </div>
                </Col>

                <Col md={4}>
                  <div className="civic-form-group">
                    <label className="civic-label">Course / Degree Specialization <span className="required-mark">*</span></label>
                    <input
                      type="text"
                      name="course"
                      className="civic-input"
                      placeholder="e.g. M.Sc. Computer Science"
                      value={formData.course}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </Col>

                <Col md={4}>
                  <div className="civic-form-group">
                    <label className="civic-label">Marks Percentage (%) <span className="required-mark">*</span></label>
                    <input
                      type="number"
                      name="marksPercent"
                      min="0"
                      max="100"
                      step="0.01"
                      className="civic-input"
                      placeholder="e.g. 72.50"
                      value={formData.marksPercent}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </Col>

                <Col md={12}>
                  <div className="civic-form-group">
                    <label className="civic-label">Institution / University Name <span className="required-mark">*</span></label>
                    <input
                      type="text"
                      name="university"
                      className="civic-input"
                      placeholder="e.g. Banaras Hindu University / IIT Kharagpur"
                      value={formData.university}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </Col>
              </Row>

              {/* Section 4: Income & DBT Bank Details */}
              <h3 className="h6 fw-bold text-primary border-bottom pb-2 mb-3">
                4. Family Income &amp; DBT Bank Account
              </h3>
              <Row className="gy-3 mb-4">
                <Col md={4}>
                  <div className="civic-form-group">
                    <label className="civic-label">Annual Family Income (₹) <span className="required-mark">*</span></label>
                    <div className="civic-input-group">
                      <span className="civic-input-prefix">₹</span>
                      <input
                        type="number"
                        name="familyIncome"
                        className="civic-input civic-input-with-prefix"
                        placeholder="e.g. 250000"
                        value={formData.familyIncome}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                </Col>

                <Col md={4}>
                  <div className="civic-form-group">
                    <label className="civic-label">Bank Account Number <span className="required-mark">*</span></label>
                    <input
                      type="text"
                      name="bankAccount"
                      className="civic-input"
                      placeholder="Aadhaar-seeded account"
                      value={formData.bankAccount}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </Col>

                <Col md={4}>
                  <div className="civic-form-group">
                    <label className="civic-label">Bank IFSC Code <span className="required-mark">*</span></label>
                    <input
                      type="text"
                      name="ifsc"
                      className="civic-input"
                      placeholder="e.g. SBIN0001234"
                      value={formData.ifsc}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </Col>

                <Col md={12}>
                  <div className="civic-form-group">
                    <label className="civic-label">Account Password <span className="required-mark">*</span></label>
                    <input
                      type="password"
                      name="password"
                      minLength={8}
                      className="civic-input"
                      placeholder="Minimum 8 characters with numbers and symbols"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </Col>
              </Row>

              <div className="mt-4 pt-3 border-top d-flex justify-content-between align-items-center flex-wrap gap-2">
                <div className="text-secondary small">
                  By clicking Register, you confirm that you belong to a Scheduled Tribe (ST) community.
                </div>
                <Button
                  type="submit"
                  variant="primary"
                  loading={loading}
                >
                  Register &amp; Receive OTP &rarr;
                </Button>
              </div>
            </form>

            <div className="text-center mt-4 pt-3 border-top small text-secondary">
              Already registered on the MoTA portal?{' '}
              <Link to="/login" className="fw-bold text-primary text-decoration-underline">
                Sign In to Your Account
              </Link>
            </div>
          </div>
        </Col>
      </Row>
    </AppShell>
  );
};

export default Register;
