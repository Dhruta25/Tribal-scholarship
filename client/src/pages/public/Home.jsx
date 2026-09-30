import React, { useState, useEffect, useMemo } from 'react';
import { Row, Col, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import axiosClient from '../../api/axiosClient';
import AppShell from '../../components/AppShell';
import SchemeCard from '../../components/SchemeCard';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import {
  ShieldCheck,
  CheckCircle2,
  FileCheck2,
  Search,
  ArrowRight,
  Filter,
  RotateCcw,
  Sparkles,
  Award,
  BookOpen,
  Info
} from 'lucide-react';

const Home = () => {
  const { t } = useLanguage();
  const [schemes, setSchemes] = useState([]);
  const [loadingSchemes, setLoadingSchemes] = useState(true);
  const [error, setError] = useState('');

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [educationLevelFilter, setEducationLevelFilter] = useState('all');
  const [schemeTypeFilter, setSchemeTypeFilter] = useState('all');
  const [incomeFilter, setIncomeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('default');

  useEffect(() => {
    const fetchSchemes = async () => {
      setLoadingSchemes(true);
      setError('');
      try {
        const res = await axiosClient.get('/schemes?active=true');
        if (res.data.success && res.data.schemes?.length > 0) {
          setSchemes(res.data.schemes);
        } else {
          setSchemes([]);
        }
      } catch (err) {
        setError('Unable to load schemes from the server. Please verify network connectivity.');
        setSchemes([]);
      } finally {
        setLoadingSchemes(false);
      }
    };
    fetchSchemes();
  }, []);

  // Filter & Search Logic
  const filteredSchemes = useMemo(() => {
    return schemes.filter((s) => {
      // 1. Search term
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesName = s.name?.toLowerCase().includes(term);
        const matchesCode = s.code?.toLowerCase().includes(term);
        const matchesDesc = s.description?.toLowerCase().includes(term);
        if (!matchesName && !matchesCode && !matchesDesc) return false;
      }

      // 2. Education level filter
      if (educationLevelFilter !== 'all') {
        const level = (s.level || s.eligibilityRules?.educationLevel || '').toLowerCase();
        if (educationLevelFilter === 'school' && !level.includes('10th') && !level.includes('12th')) return false;
        if (educationLevelFilter === 'bachelors' && !level.includes('bachelor') && !level.includes('undergraduate')) return false;
        if (educationLevelFilter === 'masters' && !level.includes('master')) return false;
        if (educationLevelFilter === 'phd' && !level.includes('phd') && !level.includes('mphil') && !level.includes('fellowship')) return false;
      }

      // 3. Scheme type filter
      if (schemeTypeFilter !== 'all') {
        const type = (s.schemeType || s.category || '').toLowerCase();
        if (schemeTypeFilter === 'central' && !type.includes('central')) return false;
        if (schemeTypeFilter === 'overseas' && !type.includes('overseas') && !s.code?.includes('AZKMI')) return false;
      }

      // 4. Income limit filter
      if (incomeFilter !== 'all') {
        let maxIncome = Infinity;
        if (typeof s.incomeLimitMax === 'number') maxIncome = s.incomeLimitMax;
        else if (Array.isArray(s.eligibilityRules)) {
          const rule = s.eligibilityRules.find(r => r.field === 'familyIncome');
          if (rule && typeof rule.value === 'number') maxIncome = rule.value;
        }

        if (incomeFilter === 'under25' && maxIncome > 250000) return false;
        if (incomeFilter === 'under60' && maxIncome > 600000) return false;
        if (incomeFilter === 'under80' && maxIncome > 800000) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'name-asc') return (a.name || '').localeCompare(b.name || '');
      if (sortBy === 'name-desc') return (b.name || '').localeCompare(a.name || '');
      return 0;
    });
  }, [schemes, searchTerm, educationLevelFilter, schemeTypeFilter, incomeFilter, sortBy]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setEducationLevelFilter('all');
    setSchemeTypeFilter('all');
    setIncomeFilter('all');
    setSortBy('default');
  };

  return (
    <AppShell>
      {/* 1. HERO SECTION (Clean Two-Column Civic Design) */}
      <section className="civic-card p-4 p-md-5 mb-5 bg-white">
        <Row className="align-items-center gy-4">
          {/* Left Column: Official Heading & Purpose */}
          <Col lg={7}>
            <div className="civic-tag d-inline-flex align-items-center gap-2">
              <img
                src="/images/vidyasetu-logo.jpg"
                alt="VIDYA SETU"
                className="rounded-1"
                style={{ height: '20px', width: 'auto', objectFit: 'contain' }}
              />
              <span>VIDYA SETU &bull; Ministry of Tribal Affairs Initiative</span>
            </div>

            <h1 className="h1 fw-bold text-primary mb-3" style={{ lineHeight: '1.2' }}>
              Find the right scholarship with confidence.
            </h1>

            <p className="lead text-secondary mb-4" style={{ lineHeight: '1.6' }}>
              Discover official government scholarships, verify your eligibility with explainable criteria, and receive transparent guidance at every step of your higher education journey.
            </p>

            <div className="d-flex align-items-center gap-3 flex-wrap mb-4">
              <Link to="/eligibility" className="btn-civic-primary">
                Check My Eligibility
              </Link>
              <a href="#schemes-section" className="btn-civic-secondary">
                Explore Scholarships
              </a>
            </div>

            {/* Human-in-the-loop Trust Notice */}
            <div
              className="p-3 rounded-2 d-flex align-items-start gap-2.5 small"
              style={{
                backgroundColor: 'var(--color-surface-muted)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-secondary)',
                lineHeight: '1.45'
              }}
            >
              <Info size={18} className="text-primary flex-shrink-0 mt-0.5" />
              <div>
                <strong>Official Safeguard: </strong>
                AI assists with verification. Final decisions remain exclusively with authorised government officers.
              </div>
            </div>
          </Col>

          {/* Right Column: Realistic Student Preview Card */}
          <Col lg={5}>
            <div
              className="position-relative rounded-3 overflow-hidden shadow-sm"
              style={{
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface-muted)'
              }}
            >
              <img
                src="/images/hero/slide_nfst.jpg"
                alt="Scheduled Tribe research scholar engaged in higher education studies"
                className="w-100 object-fit-cover"
                style={{ height: '360px', display: 'block' }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div
                className="p-4 align-items-center justify-content-center text-center flex-column"
                style={{ display: 'none', height: '360px' }}
              >
                <BookOpen size={48} className="text-primary mb-2 opacity-50" />
                <h4 className="h6 fw-bold text-primary mb-1">Empowering ST Scholars</h4>
                <p className="text-secondary small mb-0">National Fellowship and Scholarship Management System</p>
              </div>

              {/* Informative Image Caption */}
              <div
                className="p-2.5 px-3 bg-white border-top small d-flex justify-content-between align-items-center"
              >
                <span className="text-primary fw-semibold">National Fellowship for ST Students</span>
                <span className="civic-badge civic-badge-success">Open for Applications</span>
              </div>
            </div>
          </Col>
        </Row>
      </section>

      {/* 2. THREE CONCISE TRUST POINTS */}
      <section className="mb-5">
        <Row className="g-4">
          <Col md={4}>
            <div className="civic-card h-100 p-4">
              <div
                className="rounded-3 d-flex align-items-center justify-content-center mb-3"
                style={{
                  width: '44px',
                  height: '44px',
                  backgroundColor: 'var(--color-primary-light)',
                  color: 'var(--color-primary)'
                }}
              >
                <BookOpen size={22} />
              </div>
              <h3 className="h6 fw-bold text-primary mb-2">Official Scheme Information</h3>
              <p className="text-secondary small mb-0" style={{ lineHeight: '1.6' }}>
                Direct access to central sector and centrally sponsored schemes verified directly from the Ministry of Tribal Affairs portals.
              </p>
            </div>
          </Col>

          <Col md={4}>
            <div className="civic-card h-100 p-4">
              <div
                className="rounded-3 d-flex align-items-center justify-content-center mb-3"
                style={{
                  width: '44px',
                  height: '44px',
                  backgroundColor: 'var(--color-success-light)',
                  color: 'var(--color-success)'
                }}
              >
                <CheckCircle2 size={22} />
              </div>
              <h3 className="h6 fw-bold text-primary mb-2">Explainable Eligibility Checks</h3>
              <p className="text-secondary small mb-0" style={{ lineHeight: '1.6' }}>
                Understand exactly why you qualify or what specific criteria need attention, with clear alternative recommendations when ineligible.
              </p>
            </div>
          </Col>

          <Col md={4}>
            <div className="civic-card h-100 p-4">
              <div
                className="rounded-3 d-flex align-items-center justify-content-center mb-3"
                style={{
                  width: '44px',
                  height: '44px',
                  backgroundColor: 'var(--color-primary-light)',
                  color: 'var(--color-info)'
                }}
              >
                <ShieldCheck size={22} />
              </div>
              <h3 className="h6 fw-bold text-primary mb-2">Secure Document Processing</h3>
              <p className="text-secondary small mb-0" style={{ lineHeight: '1.6' }}>
                Fast, local OCR extraction verifies caste, income, and educational certificates securely without external commercial third-party leakage.
              </p>
            </div>
          </Col>
        </Row>
      </section>

      {/* 3. SCHEMES & FELLOWSHIPS SECTION */}
      <section id="schemes-section" className="mb-5">
        <div className="mb-4">
          <div className="civic-tag">Direct Benefit Transfer</div>
          <h2 className="h2 fw-bold text-primary mb-1">Scholarships and fellowships for you</h2>
          <p className="text-secondary mb-0">
            Browse official financial support programmes for school, undergraduate, postgraduate, and doctoral research.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="civic-card p-3 mb-4">
          <Row className="g-3 align-items-center">
            {/* Search Input */}
            <Col lg={4} md={6}>
              <div className="civic-input-group">
                <Search size={16} className="civic-input-prefix" />
                <input
                  type="text"
                  className="civic-input civic-input-with-prefix"
                  placeholder="Search by scheme name or code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  aria-label="Search schemes"
                />
              </div>
            </Col>

            {/* Education Level Filter */}
            <Col lg={2} sm={6}>
              <select
                className="civic-select"
                value={educationLevelFilter}
                onChange={(e) => setEducationLevelFilter(e.target.value)}
                aria-label="Filter by Education Level"
              >
                <option value="all">All Education Levels</option>
                <option value="school">School (9th–12th)</option>
                <option value="bachelors">Bachelor's Degree</option>
                <option value="masters">Master's Degree</option>
                <option value="phd">Ph.D. / Research</option>
              </select>
            </Col>

            {/* Scheme Type Filter */}
            <Col lg={2} sm={6}>
              <select
                className="civic-select"
                value={schemeTypeFilter}
                onChange={(e) => setSchemeTypeFilter(e.target.value)}
                aria-label="Filter by Scheme Type"
              >
                <option value="all">All Scheme Types</option>
                <option value="central">Central Sector Schemes</option>
                <option value="overseas">Overseas Studies</option>
              </select>
            </Col>

            {/* Income Ceiling Filter */}
            <Col lg={2} sm={6}>
              <select
                className="civic-select"
                value={incomeFilter}
                onChange={(e) => setIncomeFilter(e.target.value)}
                aria-label="Filter by Income Limit"
              >
                <option value="all">Any Income Limit</option>
                <option value="under25">≤ ₹2.5 Lakhs</option>
                <option value="under60">≤ ₹6.0 Lakhs</option>
                <option value="under80">≤ ₹8.0 Lakhs</option>
              </select>
            </Col>

            {/* Reset Controls & Count */}
            <Col lg={2} md={6} className="d-flex align-items-center justify-content-between gap-2">
              <span className="small text-secondary fw-semibold">
                {filteredSchemes.length} {filteredSchemes.length === 1 ? 'Scheme' : 'Schemes'}
              </span>
              {(searchTerm || educationLevelFilter !== 'all' || schemeTypeFilter !== 'all' || incomeFilter !== 'all') && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="btn btn-sm btn-link text-decoration-none p-0 text-primary d-inline-flex align-items-center gap-1"
                >
                  <RotateCcw size={12} /> Reset
                </button>
              )}
            </Col>
          </Row>
        </div>

        {/* Schemes Results Grid */}
        {error && <ErrorState message={error} onRetry={() => window.location.reload()} />}

        {loadingSchemes ? (
          <LoadingSkeleton count={3} />
        ) : filteredSchemes.length === 0 ? (
          <EmptyState
            title="No matching scholarship schemes"
            description="No schemes matched your current filter criteria. Try adjusting the search term or resetting the filters."
            actionText="Reset All Filters"
            onAction={handleResetFilters}
          />
        ) : (
          <Row className="g-4">
            {filteredSchemes.map((scheme) => (
              <Col lg={4} md={6} key={scheme._id || scheme.code}>
                <SchemeCard scheme={scheme} />
              </Col>
            ))}
          </Row>
        )}
      </section>

      {/* 4. HOW IT WORKS SECTION (Simple 4-Step Timeline) */}
      <section className="civic-card p-4 p-md-5 mb-5 bg-white">
        <div className="text-center mb-5">
          <div className="civic-tag mx-auto">Step-by-Step Procedure</div>
          <h2 className="h2 fw-bold text-primary mb-2">How the platform works</h2>
          <p className="text-secondary mx-auto mb-0" style={{ maxWidth: '600px' }}>
            A transparent and accessible process designed for first-time students and parents.
          </p>
        </div>

        <Row className="g-4">
          <Col lg={3} sm={6}>
            <div className="civic-card-muted h-100 p-4 text-center">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3 fw-bold fs-5"
                style={{
                  width: '44px',
                  height: '44px',
                  backgroundColor: 'var(--color-primary)',
                  color: '#FFFFFF'
                }}
              >
                1
              </div>
              <h3 className="h6 fw-bold text-primary mb-2">Select a scholarship</h3>
              <p className="text-secondary small mb-0" style={{ lineHeight: '1.5' }}>
                Browse approved central and state fellowship schemes tailored for Scheduled Tribe scholars.
              </p>
            </div>
          </Col>

          <Col lg={3} sm={6}>
            <div className="civic-card-muted h-100 p-4 text-center">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3 fw-bold fs-5"
                style={{
                  width: '44px',
                  height: '44px',
                  backgroundColor: 'var(--color-primary)',
                  color: '#FFFFFF'
                }}
              >
                2
              </div>
              <h3 className="h6 fw-bold text-primary mb-2">Enter your details</h3>
              <p className="text-secondary small mb-0" style={{ lineHeight: '1.5' }}>
                Provide your academic record, social category, and family annual income details.
              </p>
            </div>
          </Col>

          <Col lg={3} sm={6}>
            <div className="civic-card-muted h-100 p-4 text-center">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3 fw-bold fs-5"
                style={{
                  width: '44px',
                  height: '44px',
                  backgroundColor: 'var(--color-primary)',
                  color: '#FFFFFF'
                }}
              >
                3
              </div>
              <h3 className="h6 fw-bold text-primary mb-2">Upload documents</h3>
              <p className="text-secondary small mb-0" style={{ lineHeight: '1.5' }}>
                Upload caste certificate, income slip, and marksheets for fast, automated OCR extraction.
              </p>
            </div>
          </Col>

          <Col lg={3} sm={6}>
            <div className="civic-card-muted h-100 p-4 text-center">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3 fw-bold fs-5"
                style={{
                  width: '44px',
                  height: '44px',
                  backgroundColor: 'var(--color-primary)',
                  color: '#FFFFFF'
                }}
              >
                4
              </div>
              <h3 className="h6 fw-bold text-primary mb-2">Review explanation</h3>
              <p className="text-secondary small mb-0" style={{ lineHeight: '1.5' }}>
                Receive clear criteria-by-criteria results with actionable alternatives if you do not qualify.
              </p>
            </div>
          </Col>
        </Row>
      </section>
    </AppShell>
  );
};

export default Home;
