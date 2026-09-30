import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Table, Spinner, Alert } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import AppShell from '../../components/AppShell';
import { Award, FileText, CheckCircle2, AlertCircle, ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const FALLBACK_SCHEME_DETAILS = [
  {
    _id: 'scheme_bpvgk',
    code: 'BPVGK',
    name: 'Pre-Matric Scholarship Scheme for ST Students (Class IX & X)',
    category: 'Central Scheme',
    level: '10th',
    openDate: '2026-04-01',
    closeDate: '2026-11-30',
    totalSeats: 50000,
    stipendAmountPerYear: 3500,
    description: 'Centrally Sponsored Scheme to support ST students studying in Classes IX and X in Government or recognized schools to minimize transition dropouts.',
    eligibilityRules: [
      { field: 'category', operator: '==', value: 'ST', message: 'Applicant must belong to Scheduled Tribe (ST)' },
      { field: 'family_income', operator: '<=', value: 250000, message: 'Annual family income must not exceed ₹250,000' },
      { field: 'education_level', operator: 'in', value: ['Class 9th', 'Class 10th', '10th'], message: 'Must be currently enrolled in Class IX or X' }
    ],
    requiredDocuments: [
      { label: 'ST Caste Certificate', acceptedTypes: ['pdf', 'jpg', 'png'], maxAgeMonths: 0, ocrFields: ['caste_category', 'certificate_number', 'issuing_authority'] },
      { label: 'Income Certificate', acceptedTypes: ['pdf', 'jpg', 'png'], maxAgeMonths: 12, ocrFields: ['annual_income', 'financial_year'] },
      { label: 'School Marksheet / Enrollment Proof', acceptedTypes: ['pdf', 'jpg', 'png'], maxAgeMonths: 12, ocrFields: ['school_name', 'class_enrolled'] }
    ],
    reservationQuota: { female: 0.30, disability: 0.04, pvtg: 0.05 },
    meritWeights: { marks: 0.60, income: 0.40 }
  },
  {
    _id: 'scheme_bvobc',
    code: 'BVOBC',
    name: 'Post-Matric Scholarship Scheme for ST Students',
    category: 'Central Scheme',
    level: '12th',
    openDate: '2026-04-01',
    closeDate: '2026-12-31',
    totalSeats: 75000,
    stipendAmountPerYear: 14000,
    description: 'Centrally Sponsored Scheme delivered via Direct Benefit Transfer (DBT) to provide financial assistance to Scheduled Tribe students pursuing post-secondary courses.',
    eligibilityRules: [
      { field: 'category', operator: '==', value: 'ST', message: 'Applicant must belong to Scheduled Tribe (ST)' },
      { field: 'family_income', operator: '<=', value: 250000, message: 'Annual family income must not exceed ₹250,000' },
      { field: 'education_level', operator: 'in', value: ['11th', '12th', 'Diploma', 'higher_secondary'], message: 'Must be pursuing post-matric / diploma study' }
    ],
    requiredDocuments: [
      { label: 'ST Caste Certificate', acceptedTypes: ['pdf', 'jpg', 'png'], maxAgeMonths: 0, ocrFields: ['caste_category', 'certificate_number'] },
      { label: 'Income Certificate', acceptedTypes: ['pdf', 'jpg', 'png'], maxAgeMonths: 12, ocrFields: ['annual_income', 'applicant_name'] },
      { label: '10th / 12th Marksheet', acceptedTypes: ['pdf', 'jpg', 'png'], maxAgeMonths: 0, ocrFields: ['total_percentage', 'roll_number'] }
    ],
    reservationQuota: { female: 0.30, disability: 0.04, pvtg: 0.05 },
    meritWeights: { marks: 0.70, income: 0.30 }
  },
  {
    _id: 'scheme_a023b',
    code: 'A023B',
    name: 'Top Class Education for ST Students',
    category: 'Central Scheme',
    level: 'bachelors',
    openDate: '2026-05-01',
    closeDate: '2026-11-15',
    totalSeats: 1000,
    stipendAmountPerYear: 240000,
    description: 'Central Sector Scheme providing full institute tuition fee reimbursement, living allowance (Rs. 3,000/month), and a one-time computer grant for ST scholars in premier institutes.',
    eligibilityRules: [
      { field: 'category', operator: '==', value: 'ST', message: 'Applicant must belong to Scheduled Tribe (ST)' },
      { field: 'family_income', operator: '<=', value: 600000, message: 'Annual family income must not exceed ₹600,000' },
      { field: 'institute_type', operator: '==', value: 'Premier Institute', message: 'Must be admitted to a notified Top Class institute (IIT/IIM/NIT/AIIMS)' }
    ],
    requiredDocuments: [
      { label: 'ST Caste Certificate', acceptedTypes: ['pdf', 'jpg', 'png'], maxAgeMonths: 0, ocrFields: ['caste_category', 'certificate_number'] },
      { label: 'Income Certificate', acceptedTypes: ['pdf', 'jpg', 'png'], maxAgeMonths: 12, ocrFields: ['annual_income'] },
      { label: 'Admission Fee Receipt & Allotment Letter', acceptedTypes: ['pdf', 'jpg', 'png'], maxAgeMonths: 6, ocrFields: ['institute_name', 'course_fee'] }
    ],
    reservationQuota: { female: 0.30, disability: 0.04, pvtg: 0.05 },
    meritWeights: { marks: 0.80, income: 0.20 }
  },
  {
    _id: 'scheme_azkmi',
    code: 'AZKMI',
    name: 'National Overseas Scholarship for ST Students (NOS)',
    category: 'Central Scheme',
    level: 'masters',
    openDate: '2026-03-01',
    closeDate: '2026-10-31',
    totalSeats: 40,
    stipendAmountPerYear: 1800000,
    description: 'Central Sector Scheme providing financial assistance to selected Scheduled Tribe students for pursuing Master\'s, Ph.D., and Post-Doctoral research abroad.',
    eligibilityRules: [
      { field: 'category', operator: '==', value: 'ST', message: 'Applicant must belong to Scheduled Tribe (ST)' },
      { field: 'family_income', operator: '<=', value: 600000, message: 'Annual family income must not exceed ₹600,000' },
      { field: 'marks_percentage', operator: '>=', value: 60.0, message: 'Must have achieved at least 60% in qualifying degree' }
    ],
    requiredDocuments: [
      { label: 'Foreign University Offer Letter (QS Top 500)', acceptedTypes: ['pdf'], maxAgeMonths: 6, ocrFields: ['university_name', 'course_title'] },
      { label: 'Passport First & Last Page', acceptedTypes: ['pdf', 'jpg', 'png'], maxAgeMonths: 0, ocrFields: ['passport_number', 'expiry_date'] },
      { label: 'ST Caste Certificate', acceptedTypes: ['pdf', 'jpg', 'png'], maxAgeMonths: 0, ocrFields: ['caste_category'] }
    ],
    reservationQuota: { female: 0.30, disability: 0.04, pvtg: 0.05 },
    meritWeights: { marks: 0.50, research_proposal: 0.30, income: 0.20 }
  },
  {
    _id: 'scheme_arg45',
    code: 'ARG45',
    name: 'National Fellowship for ST Students (NFST)',
    category: 'Central Scheme',
    level: 'phd',
    openDate: '2026-04-01',
    closeDate: '2026-11-30',
    totalSeats: 750,
    stipendAmountPerYear: 420000,
    description: 'Central Sector Scheme providing financial fellowship to Scheduled Tribe students pursuing M.Phil and Ph.D. research programmes in Indian Universities.',
    eligibilityRules: [
      { field: 'category', operator: '==', value: 'ST', message: 'Applicant must belong to Scheduled Tribe (ST)' },
      { field: 'family_income', operator: '<=', value: 800000, message: 'Annual family income must not exceed ₹800,000' },
      { field: 'degree_level', operator: 'in', value: ['Master\'s', 'M.Phil', 'Ph.D.'], message: 'Must be admitted to M.Phil or Ph.D. research programme' }
    ],
    requiredDocuments: [
      { label: 'Ph.D. Registration / Admission Certificate', acceptedTypes: ['pdf'], maxAgeMonths: 12, ocrFields: ['university_name', 'registration_number'] },
      { label: 'Post-Graduation Degree Marksheet', acceptedTypes: ['pdf', 'jpg', 'png'], maxAgeMonths: 0, ocrFields: ['aggregate_percentage'] },
      { label: 'ST Caste Certificate', acceptedTypes: ['pdf', 'jpg', 'png'], maxAgeMonths: 0, ocrFields: ['caste_category'] }
    ],
    reservationQuota: { female: 0.30, disability: 0.04, pvtg: 0.05 },
    meritWeights: { marks: 0.60, research_synopsis: 0.40 }
  }
];

const SchemeDetail = () => {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const [scheme, setScheme] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScheme = async () => {
      try {
        const res = await axiosClient.get(`/schemes/${id}`);
        if (res.data.success && res.data.scheme) {
          setScheme(res.data.scheme);
        } else {
          findFallback();
        }
      } catch (e) {
        findFallback();
      } finally {
        setLoading(false);
      }
    };

    const findFallback = () => {
      const match = FALLBACK_SCHEME_DETAILS.find(
        s => s._id === id || s.code.toLowerCase() === (id || '').toLowerCase()
      );
      if (match) {
        setScheme(match);
      } else {
        setScheme(null);
      }
    };

    fetchScheme();
  }, [id]);

  if (loading) {
    return (
      <AppShell>
        <Container className="py-5 text-center">
          <Spinner animation="border" variant="warning" />
        </Container>
      </AppShell>
    );
  }

  if (!scheme) {
    return (
      <AppShell>
        <Container className="py-5">
          <Alert variant="warning" className="bg-dark text-warning border-warning">
            Scheme not found. <Link to="/schemes" className="text-warning fw-bold">View all schemes</Link>
          </Alert>
        </Container>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <Container className="py-4">
        <Link to="/schemes" className="ks-btn-dark btn-sm mb-3 d-inline-flex align-items-center gap-1 text-decoration-none" style={{ width: 'fit-content' }}>
          <ArrowLeft size={14} /> Back to Schemes
        </Link>

        {/* Header Banner */}
        <div className="ks-card p-4 mb-4">
          <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-3">
            <div>
              <Badge bg="warning" text="dark" className="px-3 py-1.5 fs-6 text-uppercase fw-bold mb-2">
                {scheme.code} — {scheme.category || 'Central Scheme'}
              </Badge>
              <h2 className="fw-bold text-white mb-1" style={{ fontSize: '1.8rem' }}>{scheme.name}</h2>
              <div className="text-secondary small">
                Target Level: <strong className="text-white text-capitalize">{scheme.level}</strong> | Application Period: <strong className="text-white">{scheme.openDate ? new Date(scheme.openDate).toLocaleDateString('en-IN') : 'Open'}</strong> to <strong className="text-white">{scheme.closeDate ? new Date(scheme.closeDate).toLocaleDateString('en-IN') : 'Active'}</strong>
              </div>
            </div>

            <div className="d-flex gap-2">
              <Link to={`/eligibility?scheme=${scheme.code}`} className="ks-btn-dark text-decoration-none">
                Pre-Check Eligibility
              </Link>
              <Link
                to={isAuthenticated ? `/applicant/applications/new?schemeId=${scheme._id}` : `/login?redirect=/applicant/applications/new?schemeId=${scheme._id}`}
                className="ks-btn-white text-decoration-none fw-bold px-4"
              >
                Apply Online →
              </Link>
            </div>
          </div>

          <p className="text-secondary mb-0" style={{ lineHeight: '1.6' }}>
            {scheme.description}
          </p>
        </div>

        <Row className="gy-4">
          {/* Left Column: Eligibility Rules & Documents */}
          <Col lg={8}>
            {/* Eligibility Rules */}
            <div className="ks-card p-3 mb-4">
              <h5 className="fw-bold text-white mb-3 d-flex align-items-center gap-2">
                <ShieldCheck className="text-warning" size={20} />
                <span>Eligibility Rules &amp; Conditions</span>
              </h5>

              <div className="table-responsive">
                <Table bordered hover size="sm" className="table-dark small align-middle mb-0">
                  <thead>
                    <tr>
                      <th>Criterion</th>
                      <th>Condition</th>
                      <th>Rule Specification</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scheme.eligibilityRules?.map((rule, idx) => (
                      <tr key={idx}>
                        <td className="fw-bold text-capitalize text-warning">
                          {typeof rule.field === 'string' ? rule.field.replace(/_/g, ' ') : 'Requirement'}
                        </td>
                        <td>
                          <code>{rule.operator || '==='}</code> {JSON.stringify(rule.value)}
                        </td>
                        <td className="text-light">{rule.message || 'Criteria verified'}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </div>

            {/* Required Documents */}
            <div className="ks-card p-3 mb-4">
              <h5 className="fw-bold text-white mb-3 d-flex align-items-center gap-2">
                <FileText className="text-success" size={20} />
                <span>Mandatory Supporting Documents (Offline OCR Verified)</span>
              </h5>

              <div className="table-responsive">
                <Table bordered hover size="sm" className="table-dark small align-middle mb-0">
                  <thead>
                    <tr>
                      <th>Document Name</th>
                      <th>Accepted Formats</th>
                      <th>Validity Period</th>
                      <th>Key OCR Extracted Attributes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scheme.requiredDocuments?.map((doc, idx) => (
                      <tr key={idx}>
                        <td className="fw-bold text-white">{doc.label}</td>
                        <td>{doc.acceptedTypes?.join(', ').toUpperCase()} (Max 5MB)</td>
                        <td>{doc.maxAgeMonths > 0 ? `Within ${doc.maxAgeMonths} months` : 'Lifetime Valid'}</td>
                        <td>
                          {doc.ocrFields?.map(f => (
                            <span key={f} className="badge bg-secondary text-white me-1 mb-1" style={{ fontSize: '0.7rem' }}>
                              {f.replace(/_/g, ' ')}
                            </span>
                          ))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </div>
          </Col>

          {/* Right Column: Key Details & Merit Weights */}
          <Col lg={4}>
            <div className="ks-card p-3 mb-4">
              <h6 className="fw-bold text-white mb-3">Scheme Overview</h6>
              <div className="d-flex flex-column gap-2 small">
                <div className="d-flex justify-content-between pb-1 border-bottom border-secondary border-opacity-25">
                  <span className="text-secondary">Total Available Seats:</span>
                  <strong className="text-white">{(scheme.totalSeats || 5000).toLocaleString('en-IN')}</strong>
                </div>
                <div className="d-flex justify-content-between pb-1 border-bottom border-secondary border-opacity-25">
                  <span className="text-secondary">Annual Financial Stipend:</span>
                  <strong className="text-success">₹{(scheme.stipendAmountPerYear || 0).toLocaleString('en-IN')}</strong>
                </div>
                <div className="d-flex justify-content-between pb-1 border-bottom border-secondary border-opacity-25">
                  <span className="text-secondary">Female Horizontal Quota:</span>
                  <strong className="text-white">{((scheme.reservationQuota?.female || 0.30) * 100)}%</strong>
                </div>
                <div className="d-flex justify-content-between pb-1 border-bottom border-secondary border-opacity-25">
                  <span className="text-secondary">PwD Horizontal Quota:</span>
                  <strong className="text-white">{((scheme.reservationQuota?.disability || 0.04) * 100)}%</strong>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-secondary">PVTG Priority Quota:</span>
                  <strong className="text-white">{((scheme.reservationQuota?.pvtg || 0.05) * 100)}%</strong>
                </div>
              </div>
            </div>

            {/* Merit Scoring Weights */}
            <div className="ks-card p-3">
              <h6 className="fw-bold text-white mb-2">Merit Ranking Weights</h6>
              <p className="small text-secondary mb-3">
                Normalized multi-factor merit calculation formula applied automatically by the system.
              </p>
              {scheme.meritWeights && (
                <div className="d-flex flex-column gap-2 small">
                  {Object.entries(scheme.meritWeights).map(([key, weight]) => (
                    <div key={key} className="d-flex justify-content-between align-items-center p-2 rounded border border-secondary border-opacity-25" style={{ background: '#18181c' }}>
                      <span className="text-capitalize fw-semibold text-light">{key.replace(/_/g, ' ')}</span>
                      <Badge bg="warning" text="dark">{Number(weight) * 100}%</Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Col>
        </Row>
      </Container>
    </AppShell>
  );
};

export default SchemeDetail;

