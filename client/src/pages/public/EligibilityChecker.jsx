import React, { useState, useEffect } from 'react';
import { Row, Col, Form, Spinner, Alert } from 'react-bootstrap';
import { useSearchParams, Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';
import AppShell from '../../components/AppShell';
import EligibilityResultCard from '../../components/EligibilityResultCard';
import { Sparkles } from 'lucide-react';

const EligibilityChecker = () => {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const [schemes, setSchemes] = useState([]);
  const [selectedSchemeCode, setSelectedSchemeCode] = useState(searchParams.get('scheme') || 'NFST');
  const [formData, setFormData] = useState({
    category: 'ST',
    educationLevel: 'masters',
    course: 'M.Sc. Computer Science',
    marksPercent: 72,
    familyIncome: 450000,
    age: 26,
    country: 'India'
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Load active schemes list
  useEffect(() => {
    const fetchSchemes = async () => {
      try {
        const res = await axiosClient.get('/schemes?active=true');
        if (res.data.success && res.data.schemes?.length > 0) {
          setSchemes(res.data.schemes);
          if (!searchParams.get('scheme')) {
            setSelectedSchemeCode(res.data.schemes[0].code);
          }
        }
      } catch (e) {}
    };
    fetchSchemes();
  }, []);

  // Set default code from URL if provided
  useEffect(() => {
    const urlScheme = searchParams.get('scheme');
    if (urlScheme) {
      setSelectedSchemeCode(urlScheme.toUpperCase());
    }
  }, [searchParams]);

  // Pre-fill profile data if user is logged in
  useEffect(() => {
    if (user?.profile) {
      setFormData(prev => ({
        ...prev,
        category: user.profile.category || 'ST',
        educationLevel: user.profile.education?.level || prev.educationLevel,
        course: user.profile.education?.course || prev.course,
        marksPercent: user.profile.education?.marksPercent || prev.marksPercent,
        familyIncome: user.profile.familyIncome || prev.familyIncome
      }));
    }
  }, [user]);

  const handleSchemeChange = (code) => {
    setSelectedSchemeCode(code);
    setResult(null);

    if (code === 'BPVGK') {
      setFormData(prev => ({ ...prev, educationLevel: '10th', course: 'Class X Secondary', familyIncome: 200000, age: 15 }));
    } else if (code === 'BVOBC') {
      setFormData(prev => ({ ...prev, educationLevel: '12th', course: 'Class XII Higher Secondary', familyIncome: 220000, age: 17 }));
    } else if (code === 'A023B') {
      setFormData(prev => ({ ...prev, educationLevel: 'bachelors', course: 'B.Tech Computer Science (IIT/NIT)', familyIncome: 500000, age: 20 }));
    } else if (code === 'ARG45' || code === 'NFST') {
      setFormData(prev => ({ ...prev, educationLevel: 'masters', course: 'M.Sc. / Ph.D. Research', familyIncome: 450000, age: 25 }));
    } else if (code === 'AZKMI' || code === 'NOS') {
      setFormData(prev => ({ ...prev, educationLevel: 'masters', course: 'M.S. in Data Science (Abroad)', familyIncome: 550000, age: 26, country: 'United States' }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEvaluate = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await axiosClient.post('/eligibility/check', {
        schemeCode: selectedSchemeCode,
        applicantData: {
          category: formData.category,
          educationLevel: formData.educationLevel,
          course: formData.course,
          marksPercent: Number(formData.marksPercent),
          familyIncome: Number(formData.familyIncome),
          age: Number(formData.age),
          country: formData.country
        }
      });

      if (res.data.success) {
        setResult(res.data.evaluation);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to check eligibility. Please verify backend server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell activeTab="advisory">
      {/* LIVE SCHOLARSHIP ELIGIBILITY CALCULATOR */}
      <section className="py-2">
        <div className="mb-4">
          <div className="ks-module-tag">OFFICIAL MoTA RULE ENGINE</div>
          <h1 className="ks-display-title mb-2" style={{ fontSize: '2.5rem' }}>Scholarship Eligibility Pre-Check</h1>
          <p className="ks-display-sub">Select a scheme and evaluate your applicant parameters against official rules instantly.</p>
        </div>

        <Row className="g-4">
          <Col lg={5}>
            <div className="ks-card h-100">
              <h4 className="fw-bold text-white mb-3">Applicant Criteria Inputs</h4>
              
              <Form onSubmit={handleEvaluate}>
                <Form.Group className="mb-3">
                  <Form.Label className="text-muted small fw-bold">Select Scheme to Evaluate</Form.Label>
                  <Form.Select
                    className="ks-select"
                    value={selectedSchemeCode}
                    onChange={(e) => handleSchemeChange(e.target.value)}
                  >
                    {schemes.map(s => (
                      <option key={s._id} value={s.code}>{s.name} ({s.code})</option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Row className="g-3 mb-3">
                  <Col sm={6}>
                    <Form.Group>
                      <Form.Label className="text-muted small fw-bold">Social Category</Form.Label>
                      <Form.Select
                        className="ks-select"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                      >
                        <option value="ST">Scheduled Tribe (ST)</option>
                        <option value="PVTG">PVTG (Particularly Vulnerable)</option>
                        <option value="SC">Scheduled Caste (SC)</option>
                        <option value="OBC">OBC</option>
                        <option value="GENERAL">General</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  <Col sm={6}>
                    <Form.Group>
                      <Form.Label className="text-muted small fw-bold">Education Level</Form.Label>
                      <Form.Select
                        className="ks-select"
                        name="educationLevel"
                        value={formData.educationLevel}
                        onChange={handleChange}
                      >
                        <option value="10th">Class 10th</option>
                        <option value="12th">Class 12th</option>
                        <option value="bachelors">Bachelor's Degree</option>
                        <option value="masters">Master's Degree</option>
                        <option value="phd">Ph.D. / M.Phil</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="g-3 mb-3">
                  <Col sm={6}>
                    <Form.Group>
                      <Form.Label className="text-muted small fw-bold">Annual Family Income (₹)</Form.Label>
                      <Form.Control
                        type="number"
                        className="ks-input"
                        name="familyIncome"
                        value={formData.familyIncome}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>

                  <Col sm={6}>
                    <Form.Group>
                      <Form.Label className="text-muted small fw-bold">Marks Percentage (%)</Form.Label>
                      <Form.Control
                        type="number"
                        className="ks-input"
                        name="marksPercent"
                        value={formData.marksPercent}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <button
                  type="submit"
                  className="ks-btn-white w-100 justify-content-center py-3 mt-2"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Spinner animation="border" size="sm" /> Evaluating Rules...
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} /> Evaluate Eligibility Now
                    </>
                  )}
                </button>
              </Form>
            </div>
          </Col>

          <Col lg={7}>
            {error && (
              <Alert variant="danger" className="py-3 bg-dark border-danger text-danger">
                {error}
              </Alert>
            )}

            {result ? (
              <EligibilityResultCard result={result} schemeCode={selectedSchemeCode} />
            ) : (
              <div className="ks-card text-center py-5 d-flex flex-column align-items-center justify-content-center h-100">
                <Sparkles size={36} className="text-warning mb-3 opacity-50" />
                <h4 className="fw-bold text-white mb-2">Ready to Evaluate Criteria</h4>
                <p className="text-muted small mb-0" style={{ maxWidth: '400px' }}>
                  Adjust the form parameters on the left and click "Evaluate Eligibility Now" to see instantaneous rule breakdown and score.
                </p>
              </div>
            )}
          </Col>
        </Row>
      </section>
    </AppShell>
  );
};

export default EligibilityChecker;
