import React, { useState } from 'react';
import KisanSidebar from '../KisanSidebar';
import KisanTopbar from '../KisanTopbar';
import HeroCommandCenter from './HeroCommandCenter';
import AdvisoryEngineModule from './AdvisoryEngineModule';
import DistressAlertsModule from './DistressAlertsModule';
import CommandCenterOverviewModule from './CommandCenterOverviewModule';
import SchemeList from '../../pages/public/SchemeList';
import MyApplications from '../../pages/applicant/MyApplications';

const KisanCommandHub = ({ initialTab = 'hero' }) => {
  const [activeTab, setActiveTab] = useState(initialTab);

  const getBreadcrumbText = () => {
    switch (activeTab) {
      case 'overview':
        return 'Scholarship Command Centre';
      case 'advisory':
        return 'Smart ST Scholar Advisory Engine';
      case 'distress':
        return 'Early Warning & Dropout Risk Intervention';
      case 'schemes':
        return 'National ST Scholarship & Fellowship Schemes';
      case 'scholars':
        return 'ST Applicants & Verification Operations';
      default:
        return 'Smart ST Scholar Advisory & Early Warning System';
    }
  };

  return (
    <div className="d-flex min-vh-100" style={{ background: '#08080a', color: '#ffffff' }}>
      {/* Left Navigation Sidebar */}
      <KisanSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <div className="flex-grow-1 d-flex flex-column" style={{ minWidth: 0 }}>
        {/* Top Bar */}
        <KisanTopbar activeModuleText={getBreadcrumbText()} />

        {/* Dynamic View Body */}
        <main className="p-4 p-md-5 flex-grow-1">
          {activeTab === 'hero' && (
            <HeroCommandCenter onExploreClick={() => setActiveTab('overview')} />
          )}

          {activeTab === 'overview' && (
            <CommandCenterOverviewModule />
          )}

          {activeTab === 'advisory' && (
            <AdvisoryEngineModule />
          )}

          {activeTab === 'distress' && (
            <DistressAlertsModule />
          )}

          {activeTab === 'schemes' && (
            <div>
              <div className="ks-module-tag mb-2">SCHOLARSHIP INTELLIGENCE</div>
              <h1 className="ks-display-title mb-4">ST Scholarship & Fellowship Schemes</h1>
              <SchemeList />
            </div>
          )}

          {activeTab === 'scholars' && (
            <div>
              <div className="ks-module-tag mb-2">OPERATIONS / ST SCHOLARS</div>
              <h1 className="ks-display-title mb-4">ST Applicant & Verification Records</h1>
              <MyApplications />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default KisanCommandHub;
