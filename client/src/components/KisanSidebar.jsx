import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  LayoutDashboard,
  Compass,
  AlertTriangle,
  Landmark,
  Users,
  Award,
  Cpu,
  FileText,
  ShieldCheck,
  Sliders
} from 'lucide-react';

const KisanSidebar = ({ activeTab, setActiveTab }) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();

  const handleNav = (tabId) => {
    if (setActiveTab) {
      setActiveTab(tabId);
    }
  };

  return (
    <aside className="ks-sidebar">
      {/* Vidya Setu Brand Header */}
      <NavLink to="/" className="ks-brand-header text-decoration-none">
        <img
          src="/images/vidyasetu-logo.jpg"
          alt="VIDYA SETU"
          className="rounded-1 flex-shrink-0"
          style={{ height: '36px', width: 'auto', objectFit: 'contain' }}
        />
        <div>
          <span className="ks-brand-title d-block" style={{ fontSize: '1.05rem', lineHeight: '1.1' }}>
            VIDYA<span style={{ color: 'var(--color-accent)' }}>SETU</span>
          </span>
          <span className="text-muted" style={{ fontSize: '0.68rem', letterSpacing: '0.04em' }}>
            TRIBAL SCHOLARSHIPS
          </span>
        </div>
      </NavLink>

      {/* Navigation Section */}
      <div className="ks-nav-section-title">OPERATIONS</div>

      <nav className="d-flex flex-column gap-1 my-1">
        <button
          type="button"
          className={`ks-nav-item ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => handleNav('overview')}
        >
          <LayoutDashboard size={17} />
          <span>Overview</span>
        </button>

        <button
          type="button"
          className={`ks-nav-item ${activeTab === 'advisory' ? 'active' : ''}`}
          onClick={() => handleNav('advisory')}
        >
          <Compass size={17} />
          <span>Scholar Advisory</span>
        </button>

        <button
          type="button"
          className={`ks-nav-item ${activeTab === 'distress' ? 'active' : ''}`}
          onClick={() => handleNav('distress')}
        >
          <AlertTriangle size={17} />
          <span>Distress Alerts</span>
          <span className="ks-badge-red">12</span>
        </button>

        <button
          type="button"
          className={`ks-nav-item ${activeTab === 'schemes' ? 'active' : ''}`}
          onClick={() => handleNav('schemes')}
        >
          <Landmark size={17} />
          <span>Scholarship Schemes</span>
        </button>

        <button
          type="button"
          className={`ks-nav-item ${activeTab === 'scholars' ? 'active' : ''}`}
          onClick={() => handleNav('scholars')}
        >
          <Users size={17} />
          <span>ST Applicants</span>
        </button>

        {user?.role === 'admin' && (
          <NavLink to="/ml-hub" className="ks-nav-item text-decoration-none">
            <Cpu size={17} className="text-info" />
            <span>ML Intelligence</span>
          </NavLink>
        )}
      </nav>

      {/* Bottom Status Card */}
      <div className="ks-sidebar-status-card">
        <div className="d-flex align-items-center gap-2 mb-1">
          <span className="ks-status-dot"></span>
          <span className="text-white fw-bold" style={{ fontSize: '0.8rem' }}>DBT sync healthy</span>
        </div>
        <div className="text-muted" style={{ fontSize: '0.72rem' }}>
          Last updated 4 min ago
        </div>
      </div>
    </aside>
  );
};

export default KisanSidebar;
