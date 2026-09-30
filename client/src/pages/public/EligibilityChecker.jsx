import React, { useState, useEffect } from 'react';
import { Row, Col, Spinner } from 'react-bootstrap';
import { useSearchParams, Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';
import AppShell from '../../components/AppShell';
import PageHeader from '../../components/common/PageHeader';
import FormField from '../../components/common/FormField';
import SelectField from '../../components/common/SelectField';
import Button from '../../components/common/Button';
import ErrorState from '../../components/common/ErrorState';
import EligibilityResultCard from '../../components/EligibilityResultCard';
import { formatCurrencyINR, extractMaxIncome } from '../../utils/formatters';
import {
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  BookOpen,
  User,
  GraduationCap,
  Award
} from 'lucide-react';

const steps = [
  { id: 1, label: '1. Choose Scheme', icon: BookOpen },
  { id: 2, label: '2. Personal Details', icon: User },
  { id: 3, label: '3. Education & Income', icon: GraduationCap },
  { id: 4, label: '4. Evaluation Result', icon: Award }
];

const EligibilityChecker = () => {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [schemes, setSchemes] = useState([]);
  const [selectedSchemeCode, setSelectedSchemeCode] = useState(searchParams.get('scheme') || '');
  
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
  const [validationErrors, setValidationErrors] = useState({});

  // 1. Fetch schemes list
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
      } catch (e) {
        setError(e.response?.data?.message || 'Could not load scholarship schemes.');
      }
    };
    fetchSchemes();
  }, []);

  // 2. Set scheme from URL parameter if provided
  useEffect(() => {
    const urlScheme = searchParams.get('scheme');
    if (urlScheme) {
      const code = { NFST: 'ARG45', NOS: 'AZKMI' }[urlScheme.toUpperCase()] || urlScheme.toUpperCase();
      setSelectedSchemeCode(code);
    }
  }, [searchParams]);

  // 3. Pre-fill profile if user is logged in
  useEffect(() => {
    if (user?.profile) {
      setFormData((prev) => ({
        ...prev,
        category: user.profile.category || 'ST',
        educationLevel: user.profile.education?.level || prev.educationLevel,
        course: user.profile.education?.course || prev.course,
        marksPercent: user.profile.education?.marksPercent ?? prev.marksPercent,
        familyIncome: user.profile.familyIncome ?? prev.familyIncome,
        age: user.profile.dob
          ? (() => {
              const birth = new Date(user.profile.dob);
              const now = new Date();
              return (
                now.getFullYear() -
                birth.getFullYear() -
                (now.getMonth() < birth.getMonth() ||
                (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate())
                  ? 1
                  : 0)
              );
            })()
          : prev.age
      }));
    }
  }, [user]);

  const selectedScheme = schemes.find((s) => s.code === selectedSchemeCode) || null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setValidationErrors((prev) => ({ ...prev, [name]: null }));
    if (result) setResult(null);
  };

  const handleSchemeChange = (code) => {
    setSelectedSchemeCode(code);
    setResult(null);
  };

  // Step Validation
  const validateStep = (step) => {
    const errs = {};
    if (step === 1 && !selectedSchemeCode) {
      errs.scheme = 'Please select a scholarship scheme to proceed.';
    }
    if (step === 2) {
      if (!formData.category) errs.category = 'Social category is required.';
      if (!formData.age || Number(formData.age) < 5 || Number(formData.age) > 80) {
        errs.age = 'Please enter a valid age between 5 and 80.';
      }
    }
    if (step === 3) {
      if (formData.familyIncome === '' || isNaN(Number(formData.familyIncome)) || Number(formData.familyIncome) < 0) {
        errs.familyIncome = 'Please enter a valid non-negative family income.';
      }
      if (formData.marksPercent === '' || isNaN(Number(formData.marksPercent)) || Number(formData.marksPercent) < 0 || Number(formData.marksPercent) > 100) {
        errs.marksPercent = 'Marks percentage must be between 0 and 100.';
      }
      if (!formData.course?.trim()) {
        errs.course = 'Degree or course name is required.';
      }
    }
    setValidationErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleEvaluate = async (e) => {
    if (e) e.preventDefault();
    if (!validateStep(3)) return;

    setLoading(true);
    setError(null);

    try {
      const res = await axiosClient.post('/eligibility/check', {
        schemeCode: selectedSchemeCode,
        category: formData.category,
        educationLevel: formData.educationLevel,
        course: formData.course,
        marksPercent: formData.marksPercent === '' ? undefined : Number(formData.marksPercent),
        familyIncome: formData.familyIncome === '' ? undefined : Number(formData.familyIncome),
        age: formData.age === '' ? undefined : Number(formData.age),
        country: formData.country
      });

      if (res.data.success) {
        setResult(res.data);
        setCurrentStep(4);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to check eligibility. Please verify network connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <PageHeader
        category="Official MoTA Rule Evaluation Engine"
        title="Check Your Scholarship Eligibility"
        subtitle="Follow this calm 4-step guided check to evaluate your parameters against official government guidelines."
        breadcrumbs={[{ label: 'Eligibility Check' }]}
      />

      {/* Stepper Navigation */}
      <div className="civic-stepper mb-5" role="navigation" aria-label="Eligibility Check Stepper">
        <div className="civic-stepper-line" aria-hidden="true" />
        {steps.map((step) => {
          const isCompleted = currentStep > step.id || (step.id === 4 && result);
          const isActive = currentStep === step.id;
          return (
            <div
              key={step.id}
              className={`civic-step-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
            >
              <button
                type="button"
                className="civic-step-circle border-0"
                onClick={() => {
                  if (isCompleted || step.id <= currentStep) {
                    setCurrentStep(step.id);
                  }
                }}
                disabled={step.id > currentStep && !result}
                aria-current={isActive ? 'step' : undefined}
                aria-label={step.label}
              >
                {isCompleted && !isActive ? (
                  <CheckCircle2 size={18} />
                ) : (
                  <span>{step.id}</span>
                )}
              </button>
              <div className="civic-step-label d-none d-sm-block">{step.label}</div>
            </div>
          );
        })}
      </div>

      {error && <ErrorState message={error} onRetry={handleEvaluate} />}

      <div className="row g-4">
        {/* Left Side: Form Controls for Steps 1, 2, 3 */}
        <div className={currentStep === 4 && result ? 'col-lg-12' : 'col-lg-8 mx-auto'}>
          {/* STEP 1: CHOOSE SCHEME */}
          {currentStep === 1 && (
            <div className="civic-card p-4">
              <h2 className="h5 fw-bold text-primary mb-3">Step 1: Select a Scholarship Scheme</h2>
              <p className="text-secondary small mb-4">
                Choose the official government scheme you wish to check your eligibility for.
              </p>

              <SelectField
                label="Target Scholarship or Fellowship"
                name="selectedScheme"
                value={selectedSchemeCode}
                onChange={(e) => handleSchemeChange(e.target.value)}
                options={schemes.map((s) => ({
                  value: s.code,
                  label: `${s.name} (${s.code})`
                }))}
                required
                error={validationErrors.scheme}
                helperText="Select from Central Sector and Centrally Sponsored schemes."
              />

              {/* Scheme Summary Card */}
              {selectedScheme && (
                <div className="civic-card-muted p-3 my-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="civic-badge civic-badge-info">{selectedScheme.code}</span>
                    <span className="civic-badge civic-badge-neutral">{selectedScheme.schemeType || 'Central Sector Scheme'}</span>
                  </div>
                  <h3 className="h6 fw-bold text-primary mb-1">{selectedScheme.name}</h3>
                  <p className="text-secondary small mb-2">{selectedScheme.description}</p>
                  <div className="d-flex justify-content-between small text-secondary border-top pt-2">
                    <span>Income Ceiling: <strong className="text-primary">{extractMaxIncome(selectedScheme)}</strong></span>
                    <span>Target Level: <strong className="text-primary text-capitalize">{selectedScheme.level || 'Higher Ed'}</strong></span>
                  </div>
                </div>
              )}

              <div className="d-flex justify-content-end mt-4">
                <Button
                  variant="primary"
                  onClick={handleNextStep}
                  icon={ArrowRight}
                  iconPosition="right"
                >
                  Next: Personal Details
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: PERSONAL DETAILS */}
          {currentStep === 2 && (
            <div className="civic-card p-4">
              <h2 className="h5 fw-bold text-primary mb-3">Step 2: Personal &amp; Social Category Details</h2>
              <p className="text-secondary small mb-4">
                MoTA scholarship schemes are specifically reserved for Scheduled Tribe students. Please provide accurate details.
              </p>

              <Row className="g-3">
                <Col md={6}>
                  <SelectField
                    label="Social Category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    options={[
                      { value: 'ST', label: 'Scheduled Tribe (ST)' },
                      { value: 'PVTG', label: 'Particularly Vulnerable Tribal Group (PVTG)' },
                      { value: 'SC', label: 'Scheduled Caste (SC)' },
                      { value: 'OBC', label: 'Other Backward Class (OBC)' },
                      { value: 'GENERAL', label: 'General / Unreserved' }
                    ]}
                    required
                    error={validationErrors.category}
                    helperText="Valid ST certificate from competent revenue authority required."
                  />
                </Col>

                <Col md={6}>
                  <FormField
                    label="Age in Years (as of application date)"
                    name="age"
                    type="number"
                    value={formData.age}
                    onChange={handleChange}
                    required
                    min={5}
                    max={80}
                    error={validationErrors.age}
                    helperText="Calculated as of scheme closing date."
                  />
                </Col>

                <Col md={6}>
                  <FormField
                    label="Country of Study / Domicile"
                    name="country"
                    type="text"
                    value={formData.country}
                    onChange={handleChange}
                    required
                    helperText="For National Overseas Scholarship (NOS), enter intended study nation."
                  />
                </Col>
              </Row>

              <div className="d-flex justify-content-between align-items-center mt-4">
                <Button
                  variant="secondary"
                  onClick={handlePrevStep}
                  icon={ArrowLeft}
                >
                  Back
                </Button>
                <Button
                  variant="primary"
                  onClick={handleNextStep}
                  icon={ArrowRight}
                  iconPosition="right"
                >
                  Next: Education &amp; Income
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: EDUCATION & INCOME */}
          {currentStep === 3 && (
            <div className="civic-card p-4">
              <h2 className="h5 fw-bold text-primary mb-3">Step 3: Academic Qualifications &amp; Family Income</h2>
              <p className="text-secondary small mb-4">
                Income and examination marks are verified against your revenue certificate and marksheets.
              </p>

              <Row className="g-3">
                <Col md={6}>
                  <SelectField
                    label="Current or Completed Education Level"
                    name="educationLevel"
                    value={formData.educationLevel}
                    onChange={handleChange}
                    options={[
                      { value: '10th', label: 'Class 9th & 10th (Pre-Matric)' },
                      { value: '12th', label: 'Class 11th & 12th / Diploma' },
                      { value: 'bachelors', label: "Bachelor's Degree (Undergraduate)" },
                      { value: 'masters', label: "Master's Degree (Postgraduate)" },
                      { value: 'phd', label: 'Ph.D. / M.Phil Research' }
                    ]}
                    required
                  />
                </Col>

                <Col md={6}>
                  <FormField
                    label="Course / Degree Specialization"
                    name="course"
                    type="text"
                    value={formData.course}
                    onChange={handleChange}
                    required
                    error={validationErrors.course}
                    placeholder="e.g. M.Sc. Computer Science / Ph.D. Botany"
                    helperText="Name of your enrolled or completed programme."
                  />
                </Col>

                <Col md={6}>
                  <FormField
                    label="Qualifying Examination Marks (%)"
                    name="marksPercent"
                    type="number"
                    value={formData.marksPercent}
                    onChange={handleChange}
                    required
                    min={0}
                    max={100}
                    step="0.01"
                    error={validationErrors.marksPercent}
                    helperText="Aggregate percentage obtained in qualifying exam."
                  />
                </Col>

                <Col md={6}>
                  <FormField
                    label="Annual Family Income (from all sources)"
                    name="familyIncome"
                    type="number"
                    prefix="₹"
                    value={formData.familyIncome}
                    onChange={handleChange}
                    required
                    error={validationErrors.familyIncome}
                    helperText={`Formatted value: ${formatCurrencyINR(formData.familyIncome || 0)}`}
                  />
                </Col>
              </Row>

              <div className="d-flex justify-content-between align-items-center mt-4">
                <Button
                  variant="secondary"
                  onClick={handlePrevStep}
                  icon={ArrowLeft}
                >
                  Back
                </Button>
                <Button
                  variant="primary"
                  onClick={handleEvaluate}
                  loading={loading}
                  icon={Sparkles}
                >
                  Evaluate Eligibility Now
                </Button>
              </div>
            </div>
          )}

          {/* STEP 4: REVIEW & RESULT */}
          {currentStep === 4 && result && (
            <div>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="h5 fw-bold text-primary mb-0">Pre-Check Evaluation Results</h2>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setCurrentStep(1)}
                  icon={RotateCcw}
                >
                  Test Another Scheme
                </Button>
              </div>

              <EligibilityResultCard
                isEligible={result.isEligible}
                summary={result.summary}
                criteriaResults={result.criteriaResults}
                alternativeSchemes={result.alternativeSchemes}
                scheme={result.scheme}
                schemeName={result.scheme?.name || selectedScheme?.name}
              />
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
};

export default EligibilityChecker;
