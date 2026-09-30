import React, { useState, useEffect } from 'react';
import { Row, Col, Table } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import AppShell from '../../components/AppShell';
import PageHeader from '../../components/common/PageHeader';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import ErrorState from '../../components/common/ErrorState';
import { formatCurrencyINR, formatNumberIN } from '../../utils/formatters';
import {
  Award,
  FileText,
  ShieldCheck,
  ArrowLeft,
  Calendar,
  IndianRupee,
  CheckCircle2,
  Users
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const SchemeDetail = () => {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const [scheme, setScheme] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchScheme = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axiosClient.get(`/schemes/${id}`);
        if (res.data.success && res.data.scheme) {
          setScheme(res.data.scheme);
        } else {
          setScheme(null);
          setError('Scheme not found in national registry.');
        }
      } catch (e) {
        setScheme(null);
        setError(e.response?.data?.message || 'Could not retrieve scheme details.');
      } finally {
        setLoading(false);
      }
    };

    fetchScheme();
  }, [id]);

  if (loading) {
    return (
      <AppShell>
        <div className="py-4">
          <LoadingSkeleton count={3} />
        </div>
      </AppShell>
    );
  }

  if (error || !scheme) {
    return (
      <AppShell>
        <ErrorState
          title="Scheme Not Found"
          message={error || 'The requested scheme could not be located in the official portal.'}
          onRetry={() => (window.location.href = '/schemes')}
        />
      </AppShell>
    );
  }

  const applyUrl = isAuthenticated
    ? `/applicant/applications/new?schemeId=${scheme._id}`
    : `/login?redirect=/applicant/applications/new?schemeId=${scheme._id}`;

  const openDate = scheme.openDate
    ? new Date(scheme.openDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : 'Open';
  const closeDate = scheme.closeDate
    ? new Date(scheme.closeDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : 'Active';

  return (
    <AppShell>
      <PageHeader
        category={`${scheme.code} • ${scheme.category || 'Central Sector Scheme'}`}
        title={scheme.name}
        subtitle={scheme.description}
        breadcrumbs={[
          { label: 'Schemes', path: '/schemes' },
          { label: scheme.code }
        ]}
        action={
          <div className="d-flex align-items-center gap-2">
            <Link to={`/eligibility?scheme=${scheme.code}`} className="btn-civic-secondary">
              Check My Eligibility
            </Link>
            <Link to={applyUrl} className="btn-civic-primary">
              Apply Online &rarr;
            </Link>
          </div>
        }
      />

      {/* Meta Banner */}
      <div className="civic-card p-3 mb-4 civic-card-muted">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 small text-secondary">
          <div>
            Target Education Level: <strong className="text-primary text-capitalize">{scheme.level || 'Higher Ed'}</strong>
          </div>
          <div>
            Application Window: <strong className="text-primary">{openDate}</strong> to <strong className="text-primary">{closeDate}</strong>
          </div>
          <div>
            Disbursement Mode: <strong className="text-success">{scheme.benefitType || 'In Cash (DBT)'}</strong>
          </div>
        </div>
      </div>

      <Row className="gy-4">
        {/* Left Column: Eligibility Rules & Documents */}
        <Col lg={8}>
          {/* Eligibility Rules */}
          <div className="civic-card p-4 mb-4">
            <h3 className="h6 fw-bold text-primary mb-3 d-flex align-items-center gap-2">
              <ShieldCheck className="text-success" size={20} />
              <span>Official Eligibility Rules &amp; Conditions</span>
            </h3>

            <div className="table-responsive">
              <Table bordered hover size="sm" className="small align-middle mb-0">
                <thead>
                  <tr>
                    <th>Criterion</th>
                    <th>Condition</th>
                    <th>Official Specification</th>
                  </tr>
                </thead>
                <tbody>
                  {scheme.eligibilityRules?.map((rule, idx) => (
                    <tr key={idx}>
                      <td className="fw-bold text-capitalize text-primary">
                        {typeof rule.field === 'string' ? rule.field.replace(/_/g, ' ') : 'Requirement'}
                      </td>
                      <td>
                        <code>{rule.operator || 'equals'}</code> {typeof rule.value === 'number' && (rule.field === 'familyIncome' || rule.field === 'annualIncome') ? formatCurrencyINR(rule.value) : JSON.stringify(rule.value)}
                      </td>
                      <td className="text-secondary">{rule.message || 'Criteria verified against official parameters'}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </div>

          {/* Required Documents */}
          <div className="civic-card p-4 mb-4">
            <h3 className="h6 fw-bold text-primary mb-3 d-flex align-items-center gap-2">
              <FileText className="text-primary" size={20} />
              <span>Mandatory Supporting Documents (Offline OCR Verified)</span>
            </h3>

            <div className="table-responsive">
              <Table bordered hover size="sm" className="small align-middle mb-0">
                <thead>
                  <tr>
                    <th>Document Name</th>
                    <th>Accepted Formats</th>
                    <th>Validity Period</th>
                    <th>Extracted Key Attributes</th>
                  </tr>
                </thead>
                <tbody>
                  {scheme.requiredDocuments?.map((doc, idx) => (
                    <tr key={idx}>
                      <td className="fw-bold text-primary">{doc.label}</td>
                      <td>{doc.acceptedTypes?.join(', ').toUpperCase()} (Max 5MB)</td>
                      <td>{doc.maxAgeMonths > 0 ? `Issued within ${doc.maxAgeMonths} months` : 'Permanent / Lifetime'}</td>
                      <td>
                        {doc.ocrFields?.map((f) => (
                          <span key={f} className="civic-badge civic-badge-neutral me-1 mb-1" style={{ fontSize: '0.72rem' }}>
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

        {/* Right Column: Scheme Overview & Merit Weights */}
        <Col lg={4}>
          <div className="civic-card p-4 mb-4">
            <h3 className="h6 fw-bold text-primary mb-3">Scheme Overview &amp; Quotas</h3>
            <div className="d-flex flex-column gap-2 small">
              <div className="d-flex justify-content-between pb-2 border-bottom">
                <span className="text-secondary">Annual Intake Slots:</span>
                <strong className="text-primary">{formatNumberIN(scheme.totalSeats || 750)} Seats</strong>
              </div>
              <div className="d-flex justify-content-between pb-2 border-bottom">
                <span className="text-secondary">Financial Fellowship:</span>
                <strong className="text-success">{scheme.stipendAmountPerYear ? `${formatCurrencyINR(scheme.stipendAmountPerYear)} / year` : 'As per UGC / Ministry norms'}</strong>
              </div>
              <div className="d-flex justify-content-between pb-2 border-bottom">
                <span className="text-secondary">Women Reservation:</span>
                <strong className="text-primary">{((scheme.reservationQuota?.female ?? 0.30) * 100)}% Horizontal</strong>
              </div>
              <div className="d-flex justify-content-between pb-2 border-bottom">
                <span className="text-secondary">Disability (PwD) Quota:</span>
                <strong className="text-primary">{((scheme.reservationQuota?.disability ?? 0.04) * 100)}% Horizontal</strong>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-secondary">PVTG Priority Quota:</span>
                <strong className="text-primary">{((scheme.reservationQuota?.pvtg ?? 0.05) * 100)}% Priority</strong>
              </div>
            </div>
          </div>

          {/* Merit Scoring Weights */}
          {scheme.meritWeights && (
            <div className="civic-card p-4">
              <h3 className="h6 fw-bold text-primary mb-2">Merit Ranking Weights</h3>
              <p className="small text-secondary mb-3">
                Transparent multi-factor ranking formula configured by Ministry Scrutiny Officers.
              </p>
              <div className="d-flex flex-column gap-2 small">
                {Object.entries(scheme.meritWeights).map(([key, weight]) => (
                  <div key={key} className="d-flex justify-content-between align-items-center p-2 rounded civic-card-muted">
                    <span className="text-capitalize fw-semibold text-primary">{key.replace(/_/g, ' ')}</span>
                    <span className="civic-badge civic-badge-info">{Math.round(Number(weight) * 100)}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Col>
      </Row>
    </AppShell>
  );
};

export default SchemeDetail;
