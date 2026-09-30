import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  LayoutDashboard,
  Sparkles,
  FilePlus,
  FileText,
  AlertTriangle,
  Award,
  User,
  ShieldCheck,
  FileSearch,
  ListFilter,
  Layers,
  Sliders,
  Users,
  BarChart3,
  History,
  AlertOctagon,
  Cpu,
  IndianRupee
} from 'lucide-react';

const Sidebar = () => {
  const { user } = useAuth();
  const { t } = useLanguage();

  if (!user) return null;

  const role = user.role;

  return (
    <aside className="ks-sidebar h-100">
      <NavLink to="/" className="ks-brand-header mb-2">
        <div className="ks-brand-logo-icon">
          <Award size={18} />
        </div>
        <div>
          <span className="ks-brand-title d-block" style={{ fontSize: '1.05rem', lineHeight: '1.1' }}>
            MoTA VanSetu
          </span>
          <span className="text-muted" style={{ fontSize: '0.68rem', letterSpacing: '0.04em' }}>
            TRIBAL SCHOLARSHIPS
          </span>
        </div>
      </NavLink>

      <div className="ks-nav-section-title">
        {role === 'admin' ? 'MINISTRY ADMIN' : (role === 'officer' ? 'SCRUTINY OFFICER' : (role === 'verifier' ? 'DOCUMENT VERIFIER' : 'APPLICANT PORTAL'))}
      </div>

      <nav className="d-flex flex-column gap-1 my-2">
        {/* Applicant Links */}
        {role === 'applicant' && (
          <>
            <NavLink to="/applicant/dashboard" className={({ isActive }) => `ks-nav-item ${isActive ? 'active' : ''}`}>
              <LayoutDashboard size={18} />
              <span>{t('nav.dashboard', 'Dashboard')}</span>
            </NavLink>
            <NavLink to="/applicant/recommendations" className={({ isActive }) => `ks-nav-item ${isActive ? 'active' : ''}`}>
              <Sparkles size={18} className="text-warning" />
              <span>{t('nav.schemes', 'Recommended Schemes')}</span>
            </NavLink>
            <NavLink to="/applicant/applications/new" className={({ isActive }) => `ks-nav-item ${isActive ? 'active' : ''}`}>
              <FilePlus size={18} />
              <span>New Application</span>
            </NavLink>
            <NavLink to="/applicant/applications" className={({ isActive }) => `ks-nav-item ${isActive ? 'active' : ''}`}>
              <FileText size={18} />
              <span>{t('nav.applications', 'My Applications')}</span>
            </NavLink>
            <NavLink to="/applicant/deficiencies" className={({ isActive }) => `ks-nav-item ${isActive ? 'active' : ''}`}>
              <AlertTriangle size={18} className="text-warning" />
              <span>{t('nav.deficiencies', 'Deficiency Inbox')}</span>
            </NavLink>
            <NavLink to="/applicant/fellowship" className={({ isActive }) => `ks-nav-item ${isActive ? 'active' : ''}`}>
              <Award size={18} className="text-success" />
              <span>{t('nav.fellowship', 'My Fellowship')}</span>
            </NavLink>
            <NavLink to="/applicant/profile" className={({ isActive }) => `ks-nav-item ${isActive ? 'active' : ''}`}>
              <User size={18} />
              <span>{t('nav.profile', 'Profile Settings')}</span>
            </NavLink>
          </>
        )}

        {/* Verifier Links */}
        {role === 'verifier' && (
          <>
            <NavLink to="/verifier/queue" className={({ isActive }) => `ks-nav-item ${isActive ? 'active' : ''}`}>
              <ShieldCheck size={18} />
              <span>{t('nav.verifier_queue', 'Verification Queue')}</span>
            </NavLink>
            <NavLink to="/verifier/flagged" className={({ isActive }) => `ks-nav-item ${isActive ? 'active' : ''}`}>
              <AlertTriangle size={18} className="text-danger" />
              <span>Flagged Documents</span>
            </NavLink>
          </>
        )}

        {/* Officer Links */}
        {role === 'officer' && (
          <>
            <NavLink to="/officer/scrutiny" className={({ isActive }) => `ks-nav-item ${isActive ? 'active' : ''}`}>
              <FileSearch size={18} />
              <span>{t('nav.officer_scrutiny', 'Officer Scrutiny')}</span>
            </NavLink>
            <NavLink to="/officer/merit" className={({ isActive }) => `ks-nav-item ${isActive ? 'active' : ''}`}>
              <ListFilter size={18} />
              <span>{t('nav.merit_list', 'Merit Ranking')}</span>
            </NavLink>
            <NavLink to="/officer/workflow" className={({ isActive }) => `ks-nav-item ${isActive ? 'active' : ''}`}>
              <Layers size={18} />
              <span>Selection Workflow</span>
            </NavLink>
            <NavLink to="/officer/payments" className={({ isActive }) => `ks-nav-item ${isActive ? 'active' : ''}`}>
              <IndianRupee size={18} />
              <span>Fellowship Payments</span>
            </NavLink>
          </>
        )}

        {/* Admin Links */}
        {role === 'admin' && (
          <>
            <NavLink to="/admin/dashboard" className={({ isActive }) => `ks-nav-item ${isActive ? 'active' : ''}`}>
              <LayoutDashboard size={18} />
              <span>Live Dashboards</span>
            </NavLink>
            <NavLink to="/admin/rules" className={({ isActive }) => `ks-nav-item ${isActive ? 'active' : ''}`}>
              <Sliders size={18} className="text-primary" />
              <span>{t('nav.admin_rules', 'Rule Builder')}</span>
            </NavLink>
            <NavLink to="/admin/schemes" className={({ isActive }) => `ks-nav-item ${isActive ? 'active' : ''}`}>
              <Layers size={18} />
              <span>{t('nav.admin_schemes', 'Scheme Builder')}</span>
            </NavLink>
            <NavLink to="/admin/anomalies" className={({ isActive }) => `ks-nav-item ${isActive ? 'active' : ''}`}>
              <AlertOctagon size={18} className="text-danger" />
              <span>{t('nav.admin_anomalies', 'Anomaly Dashboard')}</span>
              <span className="ks-badge-red ms-auto">12</span>
            </NavLink>
            <NavLink to="/admin/users" className={({ isActive }) => `ks-nav-item ${isActive ? 'active' : ''}`}>
              <Users size={18} />
              <span>{t('nav.admin_users', 'User Management')}</span>
            </NavLink>
            <NavLink to="/admin/reports" className={({ isActive }) => `ks-nav-item ${isActive ? 'active' : ''}`}>
              <BarChart3 size={18} />
              <span>Reports & Analytics</span>
            </NavLink>
            <NavLink to="/admin/audit" className={({ isActive }) => `ks-nav-item ${isActive ? 'active' : ''}`}>
              <History size={18} />
              <span>{t('nav.admin_audit', 'Official Audit Log')}</span>
            </NavLink>
            <NavLink to="/ml-hub" className={({ isActive }) => `ks-nav-item ${isActive ? 'active' : ''}`}>
              <Cpu size={18} className="text-info" />
              <span>⚡ ML Intelligence Hub</span>
            </NavLink>
          </>
        )}
      </nav>

      {/* Bottom Status Card */}
      <div className="ks-sidebar-status-card mt-auto">
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

export default Sidebar;
