import React, { useState, useEffect } from 'react';
import { Row, Col, Form, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import AppShell from '../../components/AppShell';
import { ArrowRight, Layers } from 'lucide-react';

const FALLBACK_SCHEMES = [
  {
    _id: 'scheme_bpvgk',
    code: 'BPVGK',
    name: 'Pre-Matric Scholarship Scheme for ST Students (Class IX & X)',
    description: 'Centrally Sponsored Scheme to support ST students studying in Classes IX and X in Government or recognized schools to minimize transition dropouts.',
    level: '10th',
    eligibilityRules: { educationLevel: 'Class 9th & 10th', incomeLimitMax: 250000 }
  },
  {
    _id: 'scheme_bvobc',
    code: 'BVOBC',
    name: 'Post-Matric Scholarship Scheme for ST Students',
    description: 'Centrally Sponsored Scheme delivered via Direct Benefit Transfer (DBT) to provide financial assistance to Scheduled Tribe students pursuing post-secondary courses.',
    level: '12th',
    eligibilityRules: { educationLevel: 'Class 11th, 12th & Diploma', incomeLimitMax: 250000 }
  },
  {
    _id: 'scheme_a023b',
    code: 'A023B',
    name: 'Top Class Education for ST Students',
    description: 'Central Sector Scheme providing full institute tuition fee reimbursement, living allowance (Rs. 3,000/month), and a one-time computer grant for ST scholars in premier institutes (IITs, IIMs, AIIMS).',
    level: 'bachelors',
    eligibilityRules: { educationLevel: 'Undergraduate / Degree', incomeLimitMax: 600000 }
  },
  {
    _id: 'scheme_azkmi',
    code: 'AZKMI',
    name: 'National Overseas Scholarship for ST Students (NOS)',
    description: 'Central Sector Scheme providing financial assistance to selected Scheduled Tribe students for pursuing Master\'s, Ph.D., and Post-Doctoral research in Top 500 QS global universities abroad.',
    level: 'masters',
    eligibilityRules: { educationLevel: 'Master\'s / Study Abroad', incomeLimitMax: 600000 }
  },
  {
    _id: 'scheme_arg45',
    code: 'ARG45',
    name: 'National Fellowship for ST Students (NFST)',
    description: 'Central Sector Scheme providing financial fellowship to Scheduled Tribe students pursuing M.Phil and Ph.D. research programmes in Indian Universities, IITs, and NITs with UGC JRF/SRF stipend.',
    level: 'phd',
    eligibilityRules: { educationLevel: 'Ph.D. / M.Phil Research', incomeLimitMax: 800000 }
  }
];

const SchemeList = () => {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [levelFilter, setLevelFilter] = useState('all');

  useEffect(() => {
    const fetchSchemes = async () => {
      setLoading(true);
      try {
        const res = await axiosClient.get(`/schemes?level=${levelFilter}&active=true`);
        if (res.data.success && res.data.schemes?.length > 0) {
          setSchemes(res.data.schemes);
        } else {
          // Use fallback data if MongoDB is empty or filtered
          setSchemes(filterFallbackSchemes(levelFilter));
        }
      } catch (e) {
        setSchemes(filterFallbackSchemes(levelFilter));
      } finally {
        setLoading(false);
      }
    };
    fetchSchemes();
  }, [levelFilter]);

  const filterFallbackSchemes = (lvl) => {
    if (lvl === 'all') return FALLBACK_SCHEMES;
    if (lvl === 'bachelors') return FALLBACK_SCHEMES.filter(s => s.level === 'bachelors');
    if (lvl === '12th') return FALLBACK_SCHEMES.filter(s => s.level === '12th');
    if (lvl === '10th') return FALLBACK_SCHEMES.filter(s => s.level === '10th');
    if (lvl === 'masters') return FALLBACK_SCHEMES.filter(s => s.level === 'masters');
    if (lvl === 'phd') return FALLBACK_SCHEMES.filter(s => s.level === 'phd');
    return FALLBACK_SCHEMES;
  };

  return (
    <AppShell activeTab="schemes">
      <div className="py-2 text-white">
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
          <div>
            <div className="ks-module-tag">NATIONAL SCHEME DIRECTORY</div>
            <h1 className="ks-display-title mb-1" style={{ fontSize: '2.5rem' }}>Scholarship &amp; Fellowship Schemes</h1>
            <p className="ks-display-sub">Browse all open Ministry of Tribal Affairs higher education and research schemes.</p>
          </div>

          <div className="d-flex align-items-center gap-2">
            <span className="small text-muted fw-semibold">Filter by Level:</span>
            <Form.Select
              className="ks-select"
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              style={{ width: '240px' }}
            >
              <option value="all">All Levels (5 Schemes)</option>
              <option value="10th">Class 9th &amp; 10th (Pre-Matric)</option>
              <option value="12th">Class 11th &amp; 12th / Diploma</option>
              <option value="bachelors">Undergraduate / Degree</option>
              <option value="masters">Master's Level</option>
              <option value="phd">Ph.D. / M.Phil Fellowships</option>
            </Form.Select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="light" />
          </div>
        ) : (
          <Row className="g-4">
            {schemes.map((s) => (
              <Col lg={4} md={6} key={s._id}>
                <div className="ks-card h-100 d-flex flex-column justify-content-between">
                  <div>
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <span className="ks-module-tag">{s.code}</span>
                      <span className="badge bg-warning bg-opacity-25 text-warning px-2.5 py-1">Central Scheme</span>
                    </div>
                    <h4 className="fw-bold text-white mb-2">{s.name}</h4>
                    <p className="text-secondary small mb-3" style={{ lineHeight: '1.5' }}>
                      {s.description}
                    </p>
                  </div>

                  <div>
                    <div className="ks-card-sub mb-3">
                      <div className="d-flex justify-content-between small text-muted mb-1.5">
                        <span>Target Level:</span>
                        <strong className="text-white">{s.eligibilityRules?.educationLevel || s.level || 'ST Students'}</strong>
                      </div>
                      <div className="d-flex justify-content-between small text-muted mb-1.5">
                        <span>Max Income Limit:</span>
                        <strong className="text-white">≤ ₹{(s.eligibilityRules?.incomeLimitMax / 100000 || 6).toFixed(2)} Lakhs</strong>
                      </div>
                    </div>

                    <div className="d-flex align-items-center gap-2">
                      <Link to={`/eligibility?scheme=${s.code}`} className="ks-btn-white w-50 justify-content-center py-2">
                        Pre-Check
                      </Link>
                      <Link to={`/schemes/${s._id}`} className="ks-btn-dark w-50 justify-content-center py-2">
                        Details <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        )}
      </div>
    </AppShell>
  );
};

export default SchemeList;
