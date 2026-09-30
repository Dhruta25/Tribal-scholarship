import React, { useState, useEffect } from 'react';
import { Row, Col, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axiosClient from '../../api/axiosClient';
import AppShell from '../../components/AppShell';
import StatusBadge from '../../components/StatusBadge';
import { FileText, AlertTriangle, Award, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';

const ApplicantDashboard = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
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
        console.error('Failed to load applicant dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const deficientApps = applications.filter(a => a.status === 'DEFICIENT');

  return (
    <AppShell activeTab="overview">
      <div className="applicant-dashboard text-white">
        {/* Welcome Banner Card */}
        <div className="ks-card mb-4 p-4">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div>
              <div className="ks-module-tag">ST APPLICANT PORTAL</div>
              <h2 className="ks-display-title mb-1" style={{ fontSize: '2rem' }}>
                Welcome back, {user?.name}!
              </h2>
              <div className="text-muted small">
                Category: <strong className="text-white">{user?.profile?.category || 'ST'}</strong> | Domicile: <strong className="text-white">{user?.profile?.state || 'India'}</strong> | Highest Level: <strong className="text-white text-capitalize">{user?.profile?.education?.level || 'Masters'}</strong>
              </div>
            </div>
            <Link to="/applicant/applications/new" className="ks-btn-white py-2 px-4">
              + New Application
            </Link>
          </div>
        </div>

        {/* 4 Stat Summary Cards */}
        <Row className="g-3 mb-4">
          <Col md={3} sm={6}>
            <div className="ks-card p-3 text-center">
              <div className="text-muted small mb-1">My Applications</div>
              <div className="fw-bold text-white fs-3">{applications.length}</div>
            </div>
          </Col>
          <Col md={3} sm={6}>
            <div className="ks-card p-3 text-center">
              <div className="text-muted small mb-1">Deficiencies</div>
              <div className="fw-bold text-warning fs-3">{deficientApps.length}</div>
            </div>
          </Col>
          <Col md={3} sm={6}>
            <div className="ks-card p-3 text-center">
              <div className="text-muted small mb-1">Eligible Schemes</div>
              <div className="fw-bold text-info fs-3">{recommendations.filter(r => r.isEligible).length}</div>
            </div>
          </Col>
          <Col md={3} sm={6}>
            <div className="ks-card p-3 text-center">
              <div className="text-muted small mb-1">Active Fellowships</div>
              <div className="fw-bold text-success fs-3">{applications.filter(a => a.status === 'AWARD_ACCEPTED').length}</div>
            </div>
          </Col>
        </Row>

        {/* Deficiency Inbox Alert Banner */}
        {deficientApps.length > 0 && (
          <Alert variant="warning" className="p-3 mb-4 bg-dark border-warning text-warning d-flex align-items-center justify-content-between flex-wrap gap-2">
            <div className="d-flex align-items-center gap-2">
              <AlertTriangle size={20} />
              <span>You have <strong>{deficientApps.length} application(s)</strong> with pending deficiencies requiring re-upload.</span>
            </div>
            <Link to="/applicant/deficiencies" className="btn btn-warning btn-sm fw-bold">
              Fix Deficiencies Now &rarr;
            </Link>
          </Alert>
        )}

        {/* Applications List */}
        <div className="ks-card mb-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="fw-bold text-white mb-0" style={{ fontSize: '1.2rem' }}>Recent Submitted Applications</h4>
            <Link to="/applicant/applications" className="ks-btn-dark py-1 px-3" style={{ fontSize: '0.8rem' }}>
              View All
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-4">
              <Spinner animation="border" variant="light" />
            </div>
          ) : applications.length === 0 ? (
            <div className="text-center py-4 text-muted">
              <FileText size={32} className="mx-auto mb-2 opacity-50" />
              <p className="mb-2">You haven't submitted any scholarship applications yet.</p>
              <Link to="/applicant/applications/new" className="ks-btn-white py-2 px-3" style={{ fontSize: '0.85rem' }}>
                Start First Application
              </Link>
            </div>
          ) : (
            <div className="d-flex flex-column gap-2">
              {applications.slice(0, 4).map((app) => (
                <div key={app._id} className="ks-card-sub d-flex align-items-center justify-content-between flex-wrap gap-2 p-3">
                  <div>
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <strong className="text-white">{app.schemeName || app.schemeCode}</strong>
                      <StatusBadge status={app.status} />
                    </div>
                    <div className="text-muted small">
                      Application No: <code className="text-info">{app.applicationNo}</code> | Submitted: {new Date(app.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <Link to={`/applicant/applications/${app._id}`} className="ks-btn-dark py-1.5 px-3" style={{ fontSize: '0.8rem' }}>
                    Track Status &rarr;
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
};

export default ApplicantDashboard;
