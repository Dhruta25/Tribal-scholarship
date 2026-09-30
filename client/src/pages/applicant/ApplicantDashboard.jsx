import React, { useState, useEffect } from 'react';
import { Row, Col, ProgressBar } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axiosClient from '../../api/axiosClient';
import AppShell from '../../components/AppShell';
import StatusBadge from '../../components/StatusBadge';
import PageHeader from '../../components/common/PageHeader';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import Button from '../../components/common/Button';
import {
  FileText,
  AlertTriangle,
  Award,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Clock,
  Calendar,
  UserCheck,
  FileCheck2,
  ShieldCheck,
  Plus
} from 'lucide-react';

const ApplicantDashboard = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [appsRes, recRes] = await Promise.all([
          axiosClient.get('/applications/mine'),
          axiosClient.get('/eligibility/recommend')
        ]);

        if (appsRes.data.success) {
          setApplications(appsRes.data.applications || []);
        }
        if (recRes.data.success) {
          setRecommendations(recRes.data.recommendations || []);
        }
      } catch (e) {
        setError('Failed to load dashboard records from server.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  // Compute Profile Completion
  const profileFields = [
    user?.name,
    user?.email,
    user?.phone,
    user?.profile?.category,
    user?.profile?.state,
    user?.profile?.education?.level,
    user?.profile?.education?.course,
    user?.profile?.familyIncome
  ];
  const filledFields = profileFields.filter(Boolean).length;
  const profilePercent = Math.round((filledFields / profileFields.length) * 100);

  const deficientApps = applications.filter((a) => a.status === 'DEFICIENT');
  const activeAwards = applications.filter((a) => a.status === 'AWARD_ACCEPTED' || a.status === 'DISBURSING');

  // Identify next recommended action
  let nextAction = {
    title: 'Explore Open Scholarships',
    description: 'Check your eligibility against national fellowship and higher education schemes.',
    linkText: 'Check Eligibility',
    linkTo: '/eligibility',
    variant: 'primary'
  };

  if (deficientApps.length > 0) {
    nextAction = {
      title: 'Resolve Pending Document Deficiency',
      description: `You have ${deficientApps.length} application(s) requiring document re-upload to proceed with verification.`,
      linkText: 'Resolve Deficiencies Now',
      linkTo: '/applicant/deficiencies',
      variant: 'accent'
    };
  } else if (profilePercent < 80) {
    nextAction = {
      title: 'Complete Your Scholar Profile',
      description: 'Add your domicile, qualification details, and family income to unlock faster pre-checks.',
      linkText: 'Update Profile',
      linkTo: '/applicant/profile',
      variant: 'primary'
    };
  } else if (applications.length === 0) {
    nextAction = {
      title: 'Submit Your First Scholarship Application',
      description: 'National Fellowship for ST Students (NFST) and Top Class Education are currently accepting applications.',
      linkText: 'Start New Application',
      linkTo: '/applicant/applications/new',
      variant: 'primary'
    };
  }

  return (
    <AppShell>
      <PageHeader
        category="Student Portal"
        title={`Welcome, ${user?.name || 'Scholar'}`}
        subtitle={`Scheduled Tribe (ST) Scholarship & Fellowship Dashboard. Category: ${user?.profile?.category || 'ST'} | State: ${user?.profile?.state || 'India'}`}
        action={
          <Link to="/applicant/applications/new" className="btn-civic-primary">
            <Plus size={16} /> New Application
          </Link>
        }
      />

      {error && <ErrorState message={error} onRetry={() => window.location.reload()} />}

      {/* 1. TOP ROW: PROFILE COMPLETION & RECOMMENDED NEXT ACTION */}
      <Row className="g-4 mb-4">
        {/* Profile Completion Indicator */}
        <Col lg={5}>
          <div className="civic-card h-100 p-4">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="fw-bold text-primary small text-uppercase">Profile Completion</span>
              <span className="fw-bold text-primary fs-6">{profilePercent}%</span>
            </div>
            <ProgressBar
              now={profilePercent}
              variant={profilePercent >= 80 ? 'success' : 'primary'}
              style={{ height: '8px', borderRadius: '4px' }}
              className="mb-3"
            />
            <p className="text-secondary small mb-3">
              {profilePercent >= 100
                ? 'Your student profile is completely verified and ready for seamless scheme matching.'
                : 'Complete remaining educational and domicile fields to enable automated pre-filling on applications.'}
            </p>
            <Link
              to="/applicant/profile"
              className="btn-civic-secondary btn-sm"
              style={{ minHeight: '36px', fontSize: '0.85rem' }}
            >
              <UserCheck size={14} /> Review &amp; Edit Profile
            </Link>
          </div>
        </Col>

        {/* Recommended Next Action Card */}
        <Col lg={7}>
          <div
            className="civic-card h-100 p-4"
            style={{
              backgroundColor: deficientApps.length > 0 ? 'var(--color-accent-light)' : 'var(--color-surface)',
              borderLeft: `5px solid ${deficientApps.length > 0 ? 'var(--color-accent)' : 'var(--color-primary)'}`
            }}
          >
            <div className="d-flex align-items-center gap-2 mb-2">
              <span className="civic-badge civic-badge-warning fw-bold">Recommended Next Action</span>
            </div>
            <h3 className="h5 fw-bold text-primary mb-1">{nextAction.title}</h3>
            <p className="text-secondary small mb-3">{nextAction.description}</p>
            <Link
              to={nextAction.linkTo}
              className={nextAction.variant === 'accent' ? 'btn-civic-accent btn-sm' : 'btn-civic-primary btn-sm'}
              style={{ minHeight: '36px', fontSize: '0.85rem' }}
            >
              {nextAction.linkText} &rarr;
            </Link>
          </div>
        </Col>
      </Row>

      {/* 2. STAT SUMMARY METRICS (Meaningful Counts) */}
      <Row className="g-3 mb-4">
        <Col md={3} sm={6}>
          <div className="civic-card p-3 text-center">
            <span className="text-secondary small mb-1 d-block">Submitted Applications</span>
            <div className="fw-bold text-primary fs-3">{applications.length}</div>
          </div>
        </Col>
        <Col md={3} sm={6}>
          <div className="civic-card p-3 text-center">
            <span className="text-secondary small mb-1 d-block">Action Required (Deficiencies)</span>
            <div className={`fw-bold fs-3 ${deficientApps.length > 0 ? 'text-danger' : 'text-primary'}`}>
              {deficientApps.length}
            </div>
          </div>
        </Col>
        <Col md={3} sm={6}>
          <div className="civic-card p-3 text-center">
            <span className="text-secondary small mb-1 d-block">Eligible Schemes</span>
            <div className="fw-bold text-success fs-3">
              {recommendations.filter((r) => r.isEligible).length}
            </div>
          </div>
        </Col>
        <Col md={3} sm={6}>
          <div className="civic-card p-3 text-center">
            <span className="text-secondary small mb-1 d-block">Active Fellowships (DBT)</span>
            <div className="fw-bold text-primary fs-3">{activeAwards.length}</div>
          </div>
        </Col>
      </Row>

      {/* 3. DEFICIENCY BANNER (If any) */}
      {deficientApps.length > 0 && (
        <div
          role="alert"
          className="civic-card p-3 mb-4 d-flex justify-content-between align-items-center flex-wrap gap-2"
          style={{
            backgroundColor: 'var(--color-error-light)',
            borderColor: 'var(--color-error)'
          }}
        >
          <div className="d-flex align-items-center gap-2">
            <AlertTriangle className="text-danger flex-shrink-0" size={20} />
            <span className="text-danger small fw-semibold">
              You have <strong>{deficientApps.length} application(s)</strong> with pending document discrepancies requiring re-upload.
            </span>
          </div>
          <Link to="/applicant/deficiencies" className="btn-civic-destructive-solid btn-sm" style={{ minHeight: '34px', fontSize: '0.82rem' }}>
            Resolve Discrepancies &rarr;
          </Link>
        </div>
      )}

      {/* 4. RECENT APPLICATIONS & DEADLINES */}
      <Row className="g-4 mb-4">
        {/* Left Column: Recent Applications */}
        <Col lg={8}>
          <div className="civic-card h-100 p-4">
            <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
              <h3 className="h6 fw-bold text-primary mb-0">Recent Submitted Applications</h3>
              <Link to="/applicant/applications" className="small text-primary text-decoration-none fw-semibold">
                View All Applications &rarr;
              </Link>
            </div>

            {loading ? (
              <LoadingSkeleton count={2} />
            ) : applications.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="No applications submitted yet"
                description="You haven't initiated or submitted any scholarship applications yet. Browse open schemes to get started."
                actionText="Explore Schemes"
                onAction={() => (window.location.href = '/schemes')}
              />
            ) : (
              <div className="d-flex flex-column gap-2">
                {applications.slice(0, 4).map((app) => (
                  <div
                    key={app._id}
                    className="civic-card-muted p-3 d-flex justify-content-between align-items-center flex-wrap gap-2"
                  >
                    <div>
                      <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
                        <strong className="text-primary">{app.schemeName || app.schemeCode}</strong>
                        <StatusBadge status={app.status} size="sm" />
                      </div>
                      <div className="text-secondary small">
                        Application No: <span className="fw-semibold text-primary">{app.applicationNo}</span> | Submitted: {new Date(app.createdAt).toLocaleDateString('en-IN')}
                      </div>
                    </div>

                    <Link
                      to={`/applicant/applications/${app._id}`}
                      className="btn-civic-secondary btn-sm"
                      style={{ minHeight: '34px', fontSize: '0.82rem' }}
                    >
                      Track Status &rarr;
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Col>

        {/* Right Column: Upcoming Deadlines & Saved Schemes */}
        <Col lg={4}>
          <div className="civic-card h-100 p-4">
            <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
              <h3 className="h6 fw-bold text-primary mb-0 d-flex align-items-center gap-1.5">
                <Calendar size={16} className="text-primary" />
                <span>Upcoming Deadlines</span>
              </h3>
            </div>

            <ul className="list-unstyled d-flex flex-column gap-3 mb-0">
              <li className="civic-card-muted p-2.5">
                <div className="d-flex justify-content-between align-items-start mb-1">
                  <span className="fw-semibold text-primary small">NFST 2026 Batch</span>
                  <span className="civic-badge civic-badge-info" style={{ fontSize: '0.7rem' }}>30 Days Left</span>
                </div>
                <div className="text-secondary small">M.Phil &amp; Ph.D. Fellowships Closing Date: 30 Nov 2026</div>
              </li>

              <li className="civic-card-muted p-2.5">
                <div className="d-flex justify-content-between align-items-start mb-1">
                  <span className="fw-semibold text-primary small">National Overseas (NOS)</span>
                  <span className="civic-badge civic-badge-neutral" style={{ fontSize: '0.7rem' }}>Open Cycle</span>
                </div>
                <div className="text-secondary small">Foreign Top 500 University Admission Intake</div>
              </li>

              <li className="civic-card-muted p-2.5">
                <div className="d-flex justify-content-between align-items-start mb-1">
                  <span className="fw-semibold text-primary small">Top Class Education</span>
                  <span className="civic-badge civic-badge-success" style={{ fontSize: '0.7rem' }}>Active</span>
                </div>
                <div className="text-secondary small">IIT, IIM, AIIMS, NIT Premier Institute Verification</div>
              </li>
            </ul>
          </div>
        </Col>
      </Row>
    </AppShell>
  );
};

export default ApplicantDashboard;
