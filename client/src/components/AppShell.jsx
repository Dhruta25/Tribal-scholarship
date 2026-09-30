import React from 'react';
import GovernmentBar from './GovernmentBar';
import MainNavbar from './MainNavbar';
import Footer from './Footer';

const AppShell = ({ children, fluid = false }) => {
  return (
    <div className="d-flex flex-column min-vh-100 app-root">
      {/* 1. Slim Government Identity Bar */}
      <GovernmentBar />

      {/* 2. Sticky Civic Main Navbar */}
      <MainNavbar />

      {/* 3. Main Page Content Area with Skip Target */}
      <main id="main-content" className="flex-grow-1" tabIndex="-1">
        {fluid ? (
          children
        ) : (
          <div className="civic-container py-4">
            {children}
          </div>
        )}
      </main>

      {/* 4. Structured Civic Service Footer */}
      <Footer />
    </div>
  );
};

export default AppShell;
