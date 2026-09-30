import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Users, AlertTriangle, TrendingUp, ShieldCheck, ChevronDown } from 'lucide-react';

const CommandCenterOverviewModule = () => {
  const { user } = useAuth();
  const [districtRegion, setDistrictRegion] = useState('Maharashtra Operations');

  const displayName = user?.name ? user.name.split(' ')[0] : 'Ananya';

  const chartData = [
    { date: '28 Jul', val: 50, critical: false },
    { date: '04 Aug', val: 68, critical: false },
    { date: '11 Aug', val: 80, critical: false },
    { date: '15 Aug', val: 100, critical: true }, // Peak red bar
    { date: '18 Aug', val: 74, critical: false },
    { date: '23 Aug', val: 42, critical: false }
  ];

  return (
    <div className="py-2">
      {/* Top Header Greeting */}
      <div className="d-flex align-items-start justify-content-between flex-wrap gap-3 mb-4">
        <div>
          <div className="ks-module-tag mb-2">SCHOLARSHIP COMMAND CENTRE / 08:40 IST</div>
          <h1 className="ks-display-title mb-1">Good morning, {displayName}.</h1>
          <p className="ks-display-sub">Here is what needs attention across your tribal districts today.</p>
        </div>

        {/* Region Selector */}
        <div className="dropdown">
          <button
            className="ks-btn-dark py-2 px-3 dropdown-toggle"
            type="button"
            id="regionDropdown"
            data-bs-toggle="dropdown"
          >
            📍 {districtRegion}
          </button>
          <ul className="dropdown-menu dropdown-menu-dark">
            <li><button className="dropdown-item" onClick={() => setDistrictRegion('Maharashtra Operations')}>Maharashtra Operations</button></li>
            <li><button className="dropdown-item" onClick={() => setDistrictRegion('Gadchiroli Zone')}>Gadchiroli Zone</button></li>
            <li><button className="dropdown-item" onClick={() => setDistrictRegion('Nandurbar Zone')}>Nandurbar Zone</button></li>
            <li><button className="dropdown-item" onClick={() => setDistrictRegion('Jharkhand Region')}>Jharkhand Region</button></li>
          </ul>
        </div>
      </div>

      {/* 4 Stat Metric Cards Row */}
      <div className="row g-3 mb-4">
        <div className="col-lg-3 col-sm-6">
          <div className="ks-card h-100">
            <div className="d-flex align-items-center justify-content-between text-muted mb-2" style={{ fontSize: '0.8rem' }}>
              <span>Scholars monitored</span>
              <Users size={16} />
            </div>
            <div className="fw-bold text-white mb-1" style={{ fontSize: '2.4rem', lineHeight: '1' }}>
              4,000
            </div>
            <div className="text-muted" style={{ fontSize: '0.78rem' }}>+128 joined this month</div>
          </div>
        </div>

        <div className="col-lg-3 col-sm-6">
          <div className="ks-card h-100">
            <div className="d-flex align-items-center justify-content-between text-muted mb-2" style={{ fontSize: '0.8rem' }}>
              <span>Scholars needing help</span>
              <AlertTriangle size={16} className="text-danger" />
            </div>
            <div className="fw-bold text-white mb-1" style={{ fontSize: '2.4rem', lineHeight: '1' }}>
              84
            </div>
            <div className="text-muted" style={{ fontSize: '0.78rem' }}>12 new since yesterday</div>
          </div>
        </div>

        <div className="col-lg-3 col-sm-6">
          <div className="ks-card h-100">
            <div className="d-flex align-items-center justify-content-between text-muted mb-2" style={{ fontSize: '0.8rem' }}>
              <span>Disbursement velocity</span>
              <TrendingUp size={16} className="text-success" />
            </div>
            <div className="fw-bold text-white mb-1" style={{ fontSize: '2.4rem', lineHeight: '1' }}>
              +18%
            </div>
            <div className="text-muted" style={{ fontSize: '0.78rem' }}>Across active districts</div>
          </div>
        </div>

        <div className="col-lg-3 col-sm-6">
          <div className="ks-card h-100">
            <div className="d-flex align-items-center justify-content-between text-muted mb-2" style={{ fontSize: '0.8rem' }}>
              <span>Anomaly signals</span>
              <AlertTriangle size={16} className="text-warning" />
            </div>
            <div className="fw-bold text-white mb-1" style={{ fontSize: '2.4rem', lineHeight: '1' }}>
              03
            </div>
            <div className="text-muted" style={{ fontSize: '0.78rem' }}>Flags awaiting scrutiny</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Bar Chart + High Contrast White System Health Card */}
      <div className="row g-4">
        {/* Left: Distress risk trend chart */}
        <div className="col-lg-8">
          <div className="ks-card h-100 d-flex flex-column justify-content-between">
            <div>
              <div className="d-flex align-items-center justify-content-between mb-1">
                <h3 className="fw-bold text-white mb-0" style={{ fontSize: '1.2rem' }}>Distress & dropout risk trend</h3>
                <span className="text-muted small border border-secondary border-opacity-25 rounded-pill px-3 py-1" style={{ fontSize: '0.75rem' }}>
                  Last 30 days <ChevronDown size={12} />
                </span>
              </div>
              <div className="text-muted mb-3" style={{ fontSize: '0.78rem' }}>
                Composite score · attendance, income verification, document risk
              </div>
            </div>

            {/* Canvas/SVG Bar Chart */}
            <div className="ks-bar-chart">
              {chartData.map((b, idx) => (
                <div key={idx} className="ks-bar-col">
                  <div
                    className={`ks-bar-fill ${b.critical ? 'critical' : ''}`}
                    style={{ height: `${b.val}%` }}
                    title={`${b.date}: ${b.val}% risk index`}
                  ></div>
                  <div className="ks-bar-label">{b.date}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: High Contrast White Safe Zone Card */}
        <div className="col-lg-4">
          <div className="ks-card-white h-100 d-flex flex-column justify-content-between">
            <div>
              <div className="d-flex align-items-center justify-content-between mb-4">
                <ShieldCheck size={26} className="text-dark" />
                <span className="badge bg-dark bg-opacity-10 text-dark font-monospace px-2 py-1 rounded" style={{ fontSize: '0.68rem', letterSpacing: '0.05em' }}>
                  SYSTEM HEALTH
                </span>
              </div>

              <div className="fw-extrabold text-dark mb-2" style={{ fontSize: '3.5rem', lineHeight: '1', fontFamily: 'Outfit, sans-serif' }}>
                92%
              </div>
              <h4 className="fw-bold text-dark mb-3" style={{ fontSize: '1.2rem' }}>
                ST Scholars in safe zone
              </h4>
              <p className="text-secondary mb-0" style={{ fontSize: '0.9rem', lineHeight: '1.5' }}>
                Your early-warning system is monitoring 4 tribal districts and 27 fellowship schemes.
              </p>
            </div>

            <div className="pt-4">
              <a href="#methodology" className="text-dark fw-bold text-decoration-none d-inline-flex align-items-center gap-1" style={{ fontSize: '0.88rem' }}>
                View methodology &rarr;
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommandCenterOverviewModule;
