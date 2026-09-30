import React from 'react';
import { Award, Sparkles } from 'lucide-react';

const HeroCommandCenter = ({ onExploreClick }) => {
  return (
    <div className="py-3">
      {/* Top Banner Row */}
      <div className="d-flex align-items-center justify-content-between mb-5">
        <div className="d-flex align-items-center gap-2.5">
          <img
            src="/images/vidyasetu-logo.jpg"
            alt="VIDYA SETU"
            className="rounded-1"
            style={{
              height: '36px',
              width: 'auto',
              objectFit: 'contain',
              backgroundColor: '#fff',
              padding: '2px 4px'
            }}
          />
          <span className="fw-bold text-white fs-5" style={{ fontFamily: 'Outfit, sans-serif' }}>
            VIDYA SETU
          </span>
        </div>

        <button
          type="button"
          onClick={onExploreClick}
          className="ks-btn-dark py-2 px-4"
          style={{ fontSize: '0.85rem' }}
        >
          Open dashboard
        </button>
      </div>

      {/* Main Hero Content Grid */}
      <div className="row g-5 align-items-center mb-5">
        {/* Left Column Text Content */}
        <div className="col-lg-6">
          <div className="ks-module-tag mb-3">
            SMART SCHOLARSHIP ADVISORY & TRIBAL EARLY WARNING
          </div>

          <h1 className="ks-display-title mb-4" style={{ fontSize: '3.6rem', lineHeight: '1.05' }}>
            Better decisions for every scholar, before risk becomes distress.
          </h1>

          <p className="ks-display-sub mb-4" style={{ fontSize: '1.15rem', maxWidth: '540px' }}>
            VIDYA SETU brings academic, income, document OCR, and DBT disbursement signals together so ministry teams can give clear advice and route support to ST scholars who need it first.
          </p>

          <div className="d-flex align-items-center gap-3 flex-wrap">
            <button
              type="button"
              onClick={onExploreClick}
              className="ks-btn-white py-3 px-4"
            >
              Explore the command center
            </button>

            <button
              type="button"
              onClick={onExploreClick}
              className="ks-btn-dark py-3 px-4"
            >
              See how it works
            </button>
          </div>
        </div>

        {/* Right Column: Floating Live District View Card */}
        <div className="col-lg-6">
          <div className="ks-card p-4 shadow-lg" style={{ background: '#0e0e11', border: '1px solid #242429' }}>
            <div className="d-flex align-items-center justify-content-between mb-3">
              <span className="ks-module-tag" style={{ fontSize: '0.68rem' }}>LIVE TRIBAL DISTRICT VIEW</span>
              <span className="text-muted small d-flex align-items-center gap-1" style={{ fontSize: '0.72rem' }}>
                <span className="ks-status-dot"></span> Synced 4 min ago
              </span>
            </div>

            <h3 className="fw-bold text-white mb-4" style={{ fontSize: '1.25rem' }}>
              Maharashtra operations
            </h3>

            {/* Inner Stats Grid */}
            <div className="row g-3 mb-4">
              <div className="col-6">
                <div className="ks-card-sub">
                  <div className="text-muted small mb-1" style={{ fontSize: '0.72rem' }}>ST Scholars needing help</div>
                  <div className="fw-bold text-danger" style={{ fontSize: '2.2rem', lineHeight: '1' }}>
                    84
                  </div>
                  <div className="text-muted mt-1" style={{ fontSize: '0.7rem' }}>12 new since yesterday</div>
                </div>
              </div>

              <div className="col-6">
                <div className="ks-card-sub">
                  <div className="text-muted small mb-1" style={{ fontSize: '0.72rem' }}>DBT Dispersal Velocity</div>
                  <div className="fw-bold text-white" style={{ fontSize: '2.2rem', lineHeight: '1' }}>
                    +18%
                  </div>
                  <div className="text-muted mt-1" style={{ fontSize: '0.7rem' }}>Across active districts</div>
                </div>
              </div>
            </div>

            {/* White Priority Intervention Sub-Card */}
            <div className="ks-card-white p-3 rounded-4">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="fw-bold text-dark" style={{ fontSize: '0.82rem' }}>Priority intervention</span>
                <span className="badge bg-dark bg-opacity-15 text-dark rounded-pill" style={{ fontSize: '0.68rem' }}>
                  12 cases
                </span>
              </div>

              <h4 className="fw-bold text-dark mb-1" style={{ fontSize: '1.3rem' }}>
                Gadchiroli district
              </h4>

              <p className="text-secondary small mb-3" style={{ fontSize: '0.82rem' }}>
                Scrutiny delay -32% · NFST stipend pending · 12 Aadhaar links due
              </p>

              <button
                type="button"
                onClick={onExploreClick}
                className="btn p-0 text-dark fw-bold border-0 d-inline-flex align-items-center gap-1"
                style={{ fontSize: '0.85rem' }}
              >
                Review alerts &rarr;
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Ticker Metric Row */}
      <div className="pt-4 border-top border-secondary border-opacity-25 row text-start g-4">
        <div className="col-md-4 col-4">
          <div className="fw-extrabold text-white" style={{ fontSize: '2.2rem', fontFamily: 'Outfit, sans-serif' }}>
            4,000
          </div>
          <div className="text-muted" style={{ fontSize: '0.82rem' }}>ST Scholars monitored</div>
        </div>

        <div className="col-md-4 col-4">
          <div className="fw-extrabold text-white" style={{ fontSize: '2.2rem', fontFamily: 'Outfit, sans-serif' }}>
            27
          </div>
          <div className="text-muted" style={{ fontSize: '0.82rem' }}>Fellowships &amp; Schemes tracked</div>
        </div>

        <div className="col-md-4 col-4">
          <div className="fw-extrabold text-white" style={{ fontSize: '2.2rem', fontFamily: 'Outfit, sans-serif' }}>
            92%
          </div>
          <div className="text-muted" style={{ fontSize: '0.82rem' }}>Dispersal safe-zone coverage</div>
        </div>
      </div>
    </div>
  );
};

export default HeroCommandCenter;
