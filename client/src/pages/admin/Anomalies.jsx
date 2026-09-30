import React, { useState, useEffect } from 'react';
import { Badge, Spinner, Alert } from 'react-bootstrap';
import axiosClient from '../../api/axiosClient';
import AppShell from '../../components/AppShell';
import { AlertOctagon, ShieldAlert, CheckCircle, RefreshCw } from 'lucide-react';

const Anomalies = () => {
  const [anomalies, setAnomalies] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAnomalies = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get('/admin/anomalies');
      if (res.data.success) {
        setAnomalies(res.data.anomalies || []);
      }
    } catch (e) {
      console.error('Failed to run anomaly scan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnomalies();
  }, []);

  return (
    <AppShell activeTab="distress">
      {/* LIVE MULTI-FACTOR ANOMALY DETECTOR RESULTS */}
      <section className="py-2">
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
          <div>
            <div className="ks-module-tag">FRAUD &amp; ANOMALY DETECTION AUDIT</div>
            <h1 className="ks-display-title mb-1" style={{ fontSize: '2.5rem' }}>Multi-Factor Fraud &amp; Anomaly Scanner</h1>
            <p className="ks-display-sub">Automated multi-factor anomaly flagging across file hashes, certificates, and identity records.</p>
          </div>

          <button
            type="button"
            onClick={fetchAnomalies}
            className="ks-btn-white py-2.5 px-4"
          >
            <RefreshCw size={16} /> Run Live Anomaly Scan
          </button>
        </div>

        <Alert variant="info" className="py-3 small mb-4 bg-dark border-secondary text-info">
          <strong>Government Compliance Standard:</strong> All flags below are purely for human officer review. Protocol: <em>"Anomaly detected, manual verification required."</em> No automated punitive actions are taken.
        </Alert>

        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="light" />
          </div>
        ) : anomalies.length === 0 ? (
          <div className="ks-card p-5 text-center">
            <CheckCircle size={48} className="mx-auto mb-3 text-success" />
            <h4 className="fw-bold text-white mb-2">No System Anomalies Detected</h4>
            <p className="text-muted small mb-0">
              No duplicate certificates, shared bank accounts, or identical file hashes were found across database records.
            </p>
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {anomalies.map((anom, idx) => (
              <div key={idx} className="ks-card border border-danger border-opacity-50">
                <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-2">
                  <div className="d-flex align-items-center gap-2">
                    <ShieldAlert size={22} className="text-danger" />
                    <h5 className="mb-0 fw-bold text-white fs-6">{anom.title}</h5>
                  </div>
                  <span className={`badge rounded-pill ${anom.severity === 'critical' ? 'bg-danger' : 'bg-warning text-dark'} px-3 py-1`}>
                    {anom.type}
                  </span>
                </div>

                <p className="text-secondary small mb-3" style={{ lineHeight: '1.5' }}>
                  {anom.description}
                </p>

                <div className="p-3 bg-danger bg-opacity-10 border border-danger border-opacity-25 rounded-3 small text-danger fw-semibold mb-3">
                  Protocol Action: {anom.actionRequired}
                </div>

                {anom.details?.affectedApplications && (
                  <div className="ks-card-sub p-3 rounded-3 small">
                    <strong className="d-block mb-2 text-white">Affected Applications:</strong>
                    <div className="d-flex flex-column gap-1">
                      {anom.details.affectedApplications.map((app, aIdx) => (
                        <div key={aIdx} className="d-flex justify-content-between text-muted">
                          <span>• <strong>{app.applicantName}</strong> ({app.email})</span>
                          <code className="text-info">{app.applicationNo}</code>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </AppShell>
  );
};

export default Anomalies;
