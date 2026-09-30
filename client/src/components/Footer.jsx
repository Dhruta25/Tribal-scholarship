import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Award, ShieldCheck, ExternalLink, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  const { t, lang } = useLanguage();

  return (
    <footer className="mt-auto border-top" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
      {/* Tricolour Accent Strip */}
      <div className="gov-tricolour-strip" />

      <div className="civic-container py-5">
        <div className="row gy-4">
          {/* Column 1: Ministry Branding & Purpose */}
          <div className="col-lg-4 col-md-6">
            <div className="d-flex align-items-center gap-2.5 mb-2.5">
              <img
                src="/images/vidyasetu-logo.jpg"
                alt="VIDYA SETU"
                className="rounded-1 flex-shrink-0"
                style={{
                  height: '40px',
                  width: 'auto',
                  objectFit: 'contain'
                }}
              />
              <div>
                <h5 className="h6 fw-bold text-primary mb-0" style={{ letterSpacing: '-0.01em' }}>
                  VIDYA<span style={{ color: 'var(--color-accent)' }}>SETU</span>
                </h5>
                <span className="text-secondary small" style={{ fontSize: '0.72rem' }}>
                  {lang === 'hi' ? 'जनजातीय कार्य मंत्रालय, भारत सरकार' : 'Ministry of Tribal Affairs, GoI'}
                </span>
              </div>
            </div>
            <p className="text-secondary small mb-3" style={{ lineHeight: '1.6' }}>
              Government of India National Scholarship and Fellowship Portal for Scheduled Tribe (ST) students. Transparent rule verification and Direct Benefit Transfer (DBT) delivery.
            </p>
            <div className="d-flex align-items-center gap-2 text-primary small fw-semibold">
              <ShieldCheck size={16} className="text-success" />
              <span>Official Civic-Tech Service (SIH PS 26239)</span>
            </div>
          </div>

          {/* Column 2: Key Schemes */}
          <div className="col-lg-2 col-md-3 col-6">
            <h6 className="fw-bold text-primary mb-3 small text-uppercase" style={{ letterSpacing: '0.04em' }}>
              Official Schemes
            </h6>
            <ul className="list-unstyled small d-flex flex-column gap-2 text-secondary mb-0">
              <li>
                <Link to="/schemes" className="text-secondary text-decoration-none hover-text-primary">
                  NFST Fellowship (Ph.D.)
                </Link>
              </li>
              <li>
                <Link to="/schemes" className="text-secondary text-decoration-none hover-text-primary">
                  National Overseas (NOS)
                </Link>
              </li>
              <li>
                <Link to="/schemes" className="text-secondary text-decoration-none hover-text-primary">
                  Top Class Education
                </Link>
              </li>
              <li>
                <Link to="/schemes" className="text-secondary text-decoration-none hover-text-primary">
                  Post-Matric ST Scheme
                </Link>
              </li>
              <li>
                <Link to="/eligibility" className="text-secondary text-decoration-none hover-text-primary">
                  Eligibility Checker
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Important Government Portals */}
          <div className="col-lg-3 col-md-3 col-6">
            <h6 className="fw-bold text-primary mb-3 small text-uppercase" style={{ letterSpacing: '0.04em' }}>
              Important Portals
            </h6>
            <ul className="list-unstyled small d-flex flex-column gap-2 text-secondary mb-0">
              <li>
                <a href="https://tribal.nic.in" target="_blank" rel="noreferrer" className="text-secondary text-decoration-none d-inline-flex align-items-center gap-1 hover-text-primary">
                  tribal.nic.in <ExternalLink size={12} />
                </a>
              </li>
              <li>
                <a href="https://dbttribal.gov.in" target="_blank" rel="noreferrer" className="text-secondary text-decoration-none d-inline-flex align-items-center gap-1 hover-text-primary">
                  DBT Tribal Portal <ExternalLink size={12} />
                </a>
              </li>
              <li>
                <a href="https://scholarships.gov.in" target="_blank" rel="noreferrer" className="text-secondary text-decoration-none d-inline-flex align-items-center gap-1 hover-text-primary">
                  National Scholarship Portal (NSP) <ExternalLink size={12} />
                </a>
              </li>
              <li>
                <a href="https://pfms.nic.in" target="_blank" rel="noreferrer" className="text-secondary text-decoration-none d-inline-flex align-items-center gap-1 hover-text-primary">
                  PFMS Direct Disbursement <ExternalLink size={12} />
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Helpdesk & Grievance Contact */}
          <div className="col-lg-3 col-md-12">
            <h6 className="fw-bold text-primary mb-3 small text-uppercase" style={{ letterSpacing: '0.04em' }}>
              Helpdesk &amp; Support
            </h6>
            <div className="small text-secondary d-flex flex-column gap-2">
              <div className="d-flex align-items-start gap-2">
                <MapPin size={16} className="text-primary flex-shrink-0 mt-0.5" />
                <span>Shastri Bhawan, Dr. Rajendra Prasad Road, New Delhi - 110001</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <Mail size={16} className="text-primary flex-shrink-0" />
                <span>support-scholarship@tribal.gov.in</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <Phone size={16} className="text-primary flex-shrink-0" />
                <span>Toll-Free: 1800-11-7777 (Mon–Fri, 9:30 AM – 5:30 PM)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer on Preliminary Eligibility & Authority */}
        <div
          className="mt-4 pt-3 pb-3 px-3 rounded-2 small text-secondary"
          style={{
            backgroundColor: 'var(--color-surface-muted)',
            border: '1px solid var(--color-border)',
            lineHeight: '1.5'
          }}
        >
          <strong>Statutory Disclaimer:</strong> Pre-check evaluations and automated document checks provided on this portal are for preliminary advisory screening. Final scholarship awards, merit listing, and disbursements remain under the sole statutory authority of designated Government Officers and the Ministry of Tribal Affairs.
        </div>

        {/* Bottom Bar: Copyright, Policy Links, Last Updated */}
        <div className="border-top mt-4 pt-3 d-flex justify-content-between align-items-center flex-wrap gap-2 small text-secondary">
          <div>
            © {new Date().getFullYear()} Ministry of Tribal Affairs, Government of India. All Rights Reserved.
          </div>
          <div className="d-flex align-items-center gap-3">
            <span className="text-muted">Last Updated: October 2026</span>
            <span className="text-muted">•</span>
            <Link to="/schemes" className="text-secondary text-decoration-none">Privacy Policy</Link>
            <span className="text-muted">•</span>
            <Link to="/schemes" className="text-secondary text-decoration-none">Terms of Service</Link>
            <span className="text-muted">•</span>
            <Link to="/schemes" className="text-secondary text-decoration-none">Accessibility Statement</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
