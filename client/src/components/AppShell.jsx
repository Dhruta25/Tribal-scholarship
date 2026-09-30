import React from 'react';
import GovHeader from './GovHeader';
import Navbar from './Navbar';

const AppShell = ({ children }) => {
  return (
    <div className="d-flex flex-column min-vh-100" style={{ background: '#08080a', color: '#ffffff' }}>
      {/* Top 2-Tier Horizontal Header */}
      <GovHeader />
      <Navbar />

      {/* Main Page Content Area */}
      <main className="container-fluid p-4 p-md-5 flex-grow-1">
        {children}
      </main>
    </div>
  );
};

export default AppShell;

