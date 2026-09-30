import React, { useState, useEffect } from 'react';
import { Row, Col, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import axiosClient from '../../api/axiosClient';
import AppShell from '../../components/AppShell';
import {
  Award, Globe, ShieldCheck, Sparkles, CheckCircle2, ArrowRight,
  Cpu, ChevronLeft, ChevronRight, GraduationCap, Landmark
} from 'lucide-react';

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
    description: 'Central Sector Scheme providing full institute tuition fee reimbursement, living allowance (Rs. 3,000/month), and a one-time computer grant for ST scholars in premier institutes.',
    level: 'bachelors',
    eligibilityRules: { educationLevel: 'Undergraduate / Degree', incomeLimitMax: 600000 }
  },
  {
    _id: 'scheme_azkmi',
    code: 'AZKMI',
    name: 'National Overseas Scholarship for ST Students (NOS)',
    description: 'Central Sector Scheme providing financial assistance to selected Scheduled Tribe students for pursuing Master\'s, Ph.D., and Post-Doctoral research abroad.',
    level: 'masters',
    eligibilityRules: { educationLevel: 'Master\'s / Study Abroad', incomeLimitMax: 600000 }
  },
  {
    _id: 'scheme_arg45',
    code: 'ARG45',
    name: 'National Fellowship for ST Students (NFST)',
    description: 'Central Sector Scheme providing financial fellowship to Scheduled Tribe students pursuing M.Phil and Ph.D. research programmes in Indian Universities, IITs, and NITs.',
    level: 'phd',
    eligibilityRules: { educationLevel: 'Ph.D. / M.Phil Research', incomeLimitMax: 800000 }
  }
];

const Home = () => {
  const { t, lang } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const isAdmin = isAuthenticated && user?.role === 'admin';

  const [schemes, setSchemes] = useState([]);
  const [loadingSchemes, setLoadingSchemes] = useState(true);
  const [showAllSchemes, setShowAllSchemes] = useState(false);

  // 5-Second Rotating Carousel State
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const heroSlides = [
    {
      id: 1,
      tag: 'FLAGSHIP CENTRAL SECTOR SCHEME (ARG45)',
      badgeVariant: 'warning',
      badgeColor: '#FF9933',
      title: 'National Fellowship for ST Students (NFST)',
      tagline: 'Empowering Scheduled Tribe Research Scholars in India',
      subtitle: 'Direct financial fellowship for M.Phil & Ph.D. scholars in Indian Universities, IITs, NITs, and National Research Laboratories with JRF/SRF fellowship as per UGC norms + contingency.',
      stats: [
        { label: 'Annual Fellowships', value: '750 Seats' },
        { label: 'JRF / SRF Stipend', value: 'As per UGC norms' },
        { label: 'Women Reservation', value: '30% Quota' }
      ],
      preCheckCode: 'ARG45',
      image: '/images/hero/slide_nfst.jpg',
      alt: 'ST student engaged in research',
      floatingBadges: [
        { position: 'top-left', text: '🎓 750 Annual Fellowships', color: '#10b981' },
        { position: 'bottom-right', text: '🔬 Indian Universities & IITs', color: '#38bdf8' }
      ],
      icon: Award
    },
    {
      id: 2,
      tag: 'GLOBAL HIGHER STUDIES SCHEME (AZKMI)',
      badgeVariant: 'info',
      badgeColor: '#38bdf8',
      title: 'National Overseas Scholarship for ST Students (NOS)',
      tagline: 'Study Abroad at World Top 500 QS Universities',
      subtitle: '100% full international tuition fee reimbursement + annual living allowance ($15,400 USD / £9,900 GBP) + airfare for Master\'s and Ph.D. programmes abroad.',
      stats: [
        { label: 'Annual Overseas Slots', value: '20 Seats (17 ST + 3 PVTG)' },
        { label: 'Max Family Income', value: '≤ ₹6.00 Lakhs' },
        { label: 'QS University Rank', value: 'Top 500 Global' }
      ],
      preCheckCode: 'AZKMI',
      image: '/images/hero/slide_nos.jpg',
      alt: 'Graduates tossing academic caps',
      floatingBadges: [
        { position: 'top-left', text: '✈️ Oxford, MIT & Harvard', color: '#f59e0b' },
        { position: 'bottom-right', text: '🌍 20 Overseas Slots (17 ST + 3 PVTG)', color: '#38bdf8' }
      ],
      icon: Globe
    },
    {
      id: 3,
      tag: 'PREMIER INSTITUTES SCHEME (A023B)',
      badgeVariant: 'success',
      badgeColor: '#22c55e',
      title: 'Top Class Education for ST Students',
      tagline: 'Full Fee Support in 265+ Premier Indian Institutes',
      subtitle: 'Full tuition fee reimbursement + ₹3,000/mo living expense + ₹45,000 one-time computer/hardware grant for ST scholars admitted in IITs, IIMs, AIIMS, NITs, and NLUs.',
      stats: [
        { label: 'Notified Institutes', value: '265+ Premier' },
        { label: 'Hardware Grant', value: '₹45,000 One-Time' },
        { label: 'Annual ST Intake', value: '1,000+ Slots' }
      ],
      preCheckCode: 'A023B',
      image: '/images/hero/slide_topclass.jpg',
      alt: 'Students studying in library',
      floatingBadges: [
        { position: 'top-left', text: '💻 ₹45,000 Hardware Grant', color: '#6366f1' },
        { position: 'bottom-right', text: '🏛️ IIT, IIM, AIIMS, NIT', color: '#10b981' }
      ],
      icon: GraduationCap
    },
    {
      id: 4,
      tag: 'CENTRALLY SPONSORED DBT (BVOBC & BPVGK)',
      badgeVariant: 'warning',
      badgeColor: '#eab308',
      title: 'Post-Matric & Pre-Matric ST Scholarships',
      tagline: 'Direct Benefit Transfer for School & College ST Scholars',
      subtitle: 'Direct Benefit Transfer (DBT) assistance for Class 9th, 10th, 11th, 12th, and College/University ST students across all Indian States & UTs to eliminate transition dropouts.',
      stats: [
        { label: 'Disbursement Mode', value: '100% Cash DBT' },
        { label: 'Income Limit', value: '≤ ₹2.50 Lakhs' },
        { label: 'Coverage', value: 'All 28 States & UTs' }
      ],
      preCheckCode: 'BVOBC',
      image: '/images/hero/slide_matric.jpg',
      alt: 'Tribal school students',
      floatingBadges: [
        { position: 'top-left', text: '📱 100% Cash DBT to Bank', color: '#10b981' },
        { position: 'bottom-right', text: '👨‍👩‍👧 Class 9 to 12 & Degree', color: '#eab308' }
      ],
      icon: Landmark
    },
    {
      id: 5,
      tag: 'SMART INDIA HACKATHON 2026 | PS 26239',
      badgeVariant: 'danger',
      badgeColor: '#ec4899',
      title: 'AI-Enabled Scholarship & Fellowship Platform',
      tagline: 'Offline OCR, Fraud Detection & Explainable Decision Support',
      subtitle: 'OCR reads each certificate in about 2 seconds and flags mismatches. Rules decide eligibility, and a human officer makes every final decision.',
      stats: [
        { label: 'Document reading', value: '~2 sec / document' },
        { label: 'Wrong uploads approved', value: '0 of 44 in test' },
        { label: 'Final decision', value: 'Always a human' }
      ],
      preCheckCode: 'ARG45',
      image: '/images/hero/slide_ai_model.jpg',
      alt: 'Tribal students working on computer workstations',
      floatingBadges: [
        { position: 'top-left', text: '🧠 AI flags, humans decide', color: '#a855f7' },
        { position: 'bottom-right', text: '📝 Every decision has a reason', color: '#10b981' }
      ],
      icon: Cpu
    }
  ];

  useEffect(() => {
    const fetchSchemes = async () => {
      try {
        const res = await axiosClient.get('/schemes?active=true');
        if (res.data.success && res.data.schemes?.length > 0) {
          setSchemes(res.data.schemes);
        } else {
          setSchemes(FALLBACK_SCHEMES);
        }
      } catch (err) {
        setSchemes(FALLBACK_SCHEMES);
      } finally {
        setLoadingSchemes(false);
      }
    };
    fetchSchemes();
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused, heroSlides.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);

  const activeSlide = heroSlides[currentSlide];

  return (
    <AppShell activeTab="overview">
      <div className="home-page text-white">
        {/* TOP HERO SECTION: 5-SECOND ROTATING CAROUSEL IN SLEEK BLACK & WHITE OBSIDIAN CARD */}
        <section
          className="p-4 p-md-5 ks-card text-white mb-5 position-relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="carousel-progress-bar mb-4">
            <div
              key={currentSlide}
              className="carousel-progress-fill"
              style={{ animationPlayState: isPaused ? 'paused' : 'running' }}
            />
          </div>

          <Row className="align-items-center gy-4">
            <Col lg={7}>
              <div key={activeSlide.id} className="slide-fade-enter">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <span className="ks-module-tag">{activeSlide.tag}</span>
                </div>

                <h1 className="ks-display-title mb-2" style={{ fontSize: '2.8rem', lineHeight: '1.1' }}>
                  {activeSlide.title}
                </h1>
                <h5 className="text-warning mb-3 fw-semibold" style={{ fontSize: '1.2rem' }}>{activeSlide.tagline}</h5>
                <p className="ks-display-sub mb-4" style={{ fontSize: '1.02rem', lineHeight: '1.6' }}>
                  {activeSlide.subtitle}
                </p>

                <div className="row g-3 mb-4">
                  {activeSlide.stats.map((st, idx) => (
                    <div key={idx} className="col-4">
                      <div className="ks-card-sub text-center p-3">
                        <div className="fw-bold text-white fs-5">{st.value}</div>
                        <div className="text-muted small" style={{ fontSize: '0.75rem' }}>{st.label}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="d-flex align-items-center gap-3 flex-wrap">
                  <Link
                    to={`/eligibility?scheme=${activeSlide.preCheckCode}`}
                    className="ks-btn-white py-3 px-4"
                  >
                    <Sparkles size={18} /> Pre-Check Eligibility
                  </Link>

                  <Link to="/schemes" className="ks-btn-dark py-3 px-4">
                    Explore All Schemes <ArrowRight size={16} />
                  </Link>

                  <div className="d-flex align-items-center gap-2 ms-auto">
                    <button onClick={prevSlide} className="ks-btn-dark py-2 px-3" title="Previous Slide">
                      <ChevronLeft size={18} />
                    </button>
                    <span className="small text-muted font-monospace">{currentSlide + 1} / {heroSlides.length}</span>
                    <button onClick={nextSlide} className="ks-btn-dark py-2 px-3" title="Next Slide">
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </Col>

            <Col lg={5} className="text-center">
              <div className="hero-3d-frame-wrapper mx-auto">
                <div className="hero-3d-image-card">
                  <img src={activeSlide.image} alt={activeSlide.alt} />
                </div>
                {activeSlide.floatingBadges.map((bg, idx) => (
                  <div key={idx} className={`floating-3d-badge ${bg.position}`}>
                    <span style={{ color: bg.color }}>{bg.text}</span>
                  </div>
                ))}
              </div>
            </Col>
          </Row>
        </section>

        {/* LIVE DATABASE SCHEMES GRID */}
        <section id="schemes-section" className="my-5">
          <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
            <div>
              <div className="ks-module-tag">MINISTRY OF TRIBAL AFFAIRS OFFICIAL SCHEMES</div>
              <h2 className="ks-display-title" style={{ fontSize: '2.2rem' }}>Official Higher Education &amp; Fellowship Schemes</h2>
              <p className="text-muted small">Extracted from official portals (tribal.nic.in &amp; dbttribal.gov.in). Transparent criteria and Direct Benefit Transfer (DBT) delivery.</p>
            </div>
            <Link to="/schemes" className="ks-btn-dark">
              View All Schemes <ArrowRight size={16} />
            </Link>
          </div>

          {loadingSchemes ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="light" />
            </div>
          ) : (
            <Row className="g-4">
              {(showAllSchemes ? schemes : schemes.slice(0, 3)).map((s) => (
                <Col lg={4} md={6} key={s._id}>
                  <div className="ks-card h-100 d-flex flex-column justify-content-between">
                    <div>
                      <div className="d-flex align-items-center justify-content-between mb-3">
                        <span className="ks-module-tag">{s.code}</span>
                        <span className="badge bg-warning bg-opacity-25 text-warning px-2.5 py-1">Central Sector Scheme</span>
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
                          <strong className="text-white">{s.eligibilityRules?.educationLevel || 'ST Students'}</strong>
                        </div>
                        <div className="d-flex justify-content-between small text-muted mb-1.5">
                          <span>Benefit Mode:</span>
                          <strong className="text-success">In Cash (DBT Allowance &amp; Stipend)</strong>
                        </div>
                        <div className="d-flex justify-content-between small text-muted">
                          <span>Max Income Limit:</span>
                          <strong className="text-white">≤ ₹{(s.eligibilityRules?.incomeLimitMax / 100000).toFixed(2)} Lakhs</strong>
                        </div>
                      </div>

                      <div className="d-flex align-items-center gap-2">
                        <Link to={`/eligibility?scheme=${s.code}`} className="ks-btn-white w-50 justify-content-center py-2">
                          Pre-Check
                        </Link>
                        <Link to={`/schemes/${s._id}`} className="ks-btn-dark w-50 justify-content-center py-2">
                          Details &rarr;
                        </Link>
                      </div>
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          )}

          {schemes.length > 3 && (
            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => setShowAllSchemes(prev => !prev)}
                className="ks-btn-dark"
              >
                {showAllSchemes ? 'Show Fewer Schemes' : `See More Schemes (${schemes.length - 3} More)`}
              </button>
            </div>
          )}
        </section>

        {/* 4-STEP EASY WORKFLOW */}
        <section className="my-5 py-4 border-top border-secondary border-opacity-25">
          <div className="text-center mb-5">
            <div className="ks-module-tag">SIMPLE 4-STEP WORKFLOW</div>
            <h2 className="ks-display-title mb-2" style={{ fontSize: '2.2rem' }}>How to Avail MoTA Scholarships &amp; Fellowships</h2>
            <p className="ks-display-sub mx-auto" style={{ maxWidth: '600px' }}>
              Transparent, automated, and hassle-free journey from eligibility pre-check to direct bank disbursement.
            </p>
          </div>

          <Row className="g-4">
            <Col md={3} sm={6}>
              <div className="ks-card text-center h-100">
                <div className="rounded-circle bg-white text-dark d-inline-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: '52px', height: '52px' }}>
                  <Sparkles size={24} />
                </div>
                <h5 className="fw-bold text-white fs-6 mb-2">1. Eligibility Pre-Check</h5>
                <p className="small text-muted mb-0">
                  Instantly verify criteria against official MoTA rules with green ticks without needing to register.
                </p>
              </div>
            </Col>

            <Col md={3} sm={6}>
              <div className="ks-card text-center h-100">
                <div className="rounded-circle bg-white text-dark d-inline-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: '52px', height: '52px' }}>
                  <Cpu size={24} />
                </div>
                <h5 className="fw-bold text-white fs-6 mb-2">2. Offline AI OCR Scan</h5>
                <p className="small text-muted mb-0">
                  Upload certificates. Local offline OCR extracts data, flags mismatches, and validates in seconds.
                </p>
              </div>
            </Col>

            <Col md={3} sm={6}>
              <div className="ks-card text-center h-100">
                <div className="rounded-circle bg-white text-dark d-inline-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: '52px', height: '52px' }}>
                  <ShieldCheck size={24} />
                </div>
                <h5 className="fw-bold text-white fs-6 mb-2">3. Transparent Scrutiny</h5>
                <p className="small text-muted mb-0">
                  AI flags discrepancies for human verifiers. Merit scoring allocates 750 NFST and 20 NOS slots with gender quotas.
                </p>
              </div>
            </Col>

            <Col md={3} sm={6}>
              <div className="ks-card text-center h-100">
                <div className="rounded-circle bg-white text-dark d-inline-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: '52px', height: '52px' }}>
                  <Award size={24} />
                </div>
                <h5 className="fw-bold text-white fs-6 mb-2">4. Direct DBT Grant</h5>
                <p className="small text-muted mb-0">
                  Monthly research stipends and tuition grants disbursed directly to verified Aadhaar-seeded bank accounts.
                </p>
              </div>
            </Col>
          </Row>
        </section>
      </div>
    </AppShell>
  );
};

export default Home;
