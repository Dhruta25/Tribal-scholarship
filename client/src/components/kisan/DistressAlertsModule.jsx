import React, { useState } from 'react';
import { Bell, Phone, Check } from 'lucide-react';

const DistressAlertsModule = () => {
  const [alertsRouted, setAlertsRouted] = useState(false);
  const [calledId, setCalledId] = useState(null);

  const cases = [
    {
      id: 'SJ',
      name: 'Suresh Jadhav',
      risk: '86%',
      location: 'Gadchiroli · Ph.D. Research (NFST)',
      signals: 'Attendance 78% · Dispersal delay -22% · Bank link pending 12 days',
      phone: '+91 98*** 4218',
      urgency: 'high'
    },
    {
      id: 'MS',
      name: 'Meena Shinde',
      risk: '72%',
      location: 'Nandurbar · M.Tech (Top Class)',
      signals: 'Certificate OCR flag · Scrutiny delay 24 days',
      phone: '+91 87*** 1904',
      urgency: 'medium'
    },
    {
      id: 'RP',
      name: 'Ramesh Pawar',
      risk: '68%',
      location: 'Beed · M.Sc. Biotechnology',
      signals: 'Income re-verification due in 46 days',
      phone: '+91 77*** 5820',
      urgency: 'medium'
    }
  ];

  const handleRouteAlerts = () => {
    setAlertsRouted(true);
    setTimeout(() => setAlertsRouted(false), 3000);
  };

  const handleCall = (id) => {
    setCalledId(id);
    setTimeout(() => setCalledId(null), 4000);
  };

  return (
    <div className="py-2">
      {/* Header & Main CTA */}
      <div className="d-flex align-items-start justify-content-between flex-wrap gap-3 mb-4">
        <div>
          <div className="ks-module-tag mb-2">MODULE 02 / EARLY WARNING & DROPOUT RISK</div>
          <h1 className="ks-display-title mb-2">Intervene before delay becomes dropout.</h1>
          <p className="ks-display-sub" style={{ maxWidth: '720px' }}>
            Weighted rules combine 3 signals to route priority support to ST scholars needing officer assistance.
          </p>
        </div>

        <button
          type="button"
          className="ks-btn-danger shadow-lg"
          onClick={handleRouteAlerts}
        >
          {alertsRouted ? (
            <>
              <Check size={16} /> Alerts Routed to Scrutiny Officers
            </>
          ) : (
            <>
              <Bell size={16} /> Route priority alerts
            </>
          )}
        </button>
      </div>

      {/* Top 3 Weighted Rule Indicator Cards */}
      <div className="row g-3 mb-4">
        {/* Critical cases card */}
        <div className="col-md-4">
          <div className="ks-card h-100" style={{ background: '#170c0d', border: '1px solid #3d1518' }}>
            <div className="text-muted small fw-bold mb-2" style={{ fontSize: '0.78rem' }}>Critical scholar cases</div>
            <div className="fw-bold mb-1" style={{ fontSize: '2.5rem', color: '#ef4444', lineHeight: '1' }}>
              12
            </div>
            <div className="text-muted" style={{ fontSize: '0.8rem' }}>Need officer call within 24h</div>
          </div>
        </div>

        {/* Verification delay weight */}
        <div className="col-md-4">
          <div className="ks-card h-100">
            <div className="text-muted small fw-bold mb-2" style={{ fontSize: '0.78rem' }}>Verification delay weight</div>
            <div className="fw-bold text-white mb-1" style={{ fontSize: '2.5rem', lineHeight: '1' }}>
              35%
            </div>
            <div className="text-muted" style={{ fontSize: '0.8rem' }}>Pending scrutiny &gt; 15 days</div>
          </div>
        </div>

        {/* Bank seeding weight */}
        <div className="col-md-4">
          <div className="ks-card h-100">
            <div className="text-muted small fw-bold mb-2" style={{ fontSize: '0.78rem' }}>Bank DBT seeding weight</div>
            <div className="fw-bold text-white mb-1" style={{ fontSize: '2.5rem', lineHeight: '1' }}>
              30%
            </div>
            <div className="text-muted" style={{ fontSize: '0.8rem' }}>Aadhaar link pending</div>
          </div>
        </div>
      </div>

      {/* High Risk Cases List */}
      <div className="d-flex flex-column gap-3">
        {cases.map((c) => (
          <div
            key={c.id}
            className="ks-card d-flex align-items-center justify-content-between flex-wrap gap-3 py-3 px-4"
          >
            <div className="d-flex align-items-center gap-3">
              {/* Avatar initials badge */}
              <div
                className="rounded-circle d-flex align-items-center justify-content-center fw-bold"
                style={{
                  width: '44px',
                  height: '44px',
                  background: 'rgba(255,255,255,0.06)',
                  color: '#8e8e93',
                  fontSize: '0.9rem'
                }}
              >
                {c.id}
              </div>

              <div>
                <div className="d-flex align-items-center gap-2 mb-1">
                  <h4 className="fw-bold text-white mb-0" style={{ fontSize: '1.1rem' }}>{c.name}</h4>
                  <span className="badge rounded-pill bg-danger bg-opacity-25 text-danger border border-danger border-opacity-50" style={{ fontSize: '0.7rem' }}>
                    {c.risk} risk
                  </span>
                </div>
                <div className="text-muted" style={{ fontSize: '0.82rem' }}>
                  {c.location}
                </div>
                <div className="text-secondary mt-1" style={{ fontSize: '0.78rem' }}>
                  {c.signals}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="d-flex align-items-center gap-3 ms-auto">
              <span className="text-muted font-monospace d-none d-md-inline" style={{ fontSize: '0.82rem' }}>
                {c.phone}
              </span>

              <button
                type="button"
                className="ks-btn-white py-2 px-3"
                style={{ fontSize: '0.82rem' }}
                onClick={() => handleCall(c.id)}
              >
                <Phone size={14} />
                {calledId === c.id ? 'Connecting...' : 'Call student'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DistressAlertsModule;
