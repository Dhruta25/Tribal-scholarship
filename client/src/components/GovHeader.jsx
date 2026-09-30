import React, { useState, useEffect } from 'react';
import { Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Award, Globe, Moon, Sun } from 'lucide-react';

const GovHeader = () => {
  const { lang, setLang } = useLanguage();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <header className="gov-header-wrapper" style={{ background: '#0a0a0d', borderBottom: '1px solid #1f1f25' }}>
      {/* Tricolour Accent Strip at Very Top */}
      <div
        className="gov-tricolour-strip"
        style={{
          height: '4px',
          background: 'linear-gradient(90deg, #FF9933 0%, #FFFFFF 50%, #138808 100%)'
        }}
      ></div>

      {/* Main Government Portal Header */}
      <div className="py-2.5 px-3 px-md-4">
        <Container fluid className="d-flex justify-content-between align-items-center flex-wrap gap-3">
          {/* Brand Emblem & Titles */}
          <Link to="/" className="d-flex align-items-center gap-3 text-decoration-none">
            {/* Dark Emblem Box with Golden Ribbon */}
            <div
              className="rounded-3 d-flex align-items-center justify-content-center shadow-sm flex-shrink-0"
              style={{
                width: '46px',
                height: '46px',
                backgroundColor: '#16161a',
                border: '1px solid rgba(255, 255, 255, 0.12)'
              }}
            >
              <Award size={26} className="text-warning" strokeWidth={2.2} />
            </div>

            {/* Title Hierarchy */}
            <div className="d-flex flex-column">
              {/* Row 1: Government of India Pill & SIH ID */}
              <div className="d-flex align-items-center gap-2 mb-1">
                <span
                  style={{
                    backgroundColor: '#262010',
                    color: '#fbbf24',
                    border: '1px solid #4a3810',
                    fontSize: '0.72rem',
                    fontWeight: '800',
                    padding: '2px 9px',
                    borderRadius: '50rem',
                    letterSpacing: '0.5px',
                    lineHeight: '1.2'
                  }}
                >
                  GOVERNMENT OF INDIA
                </span>
                <span style={{ fontSize: '0.82rem', fontWeight: '500', color: '#91919e' }}>
                  SIH-26239
                </span>
              </div>

              {/* Row 2: Hindi & English Ministry Title */}
              <div
                className="fw-bold text-white"
                style={{ fontSize: '1.18rem', letterSpacing: '-0.2px', lineHeight: '1.2' }}
              >
                <span>जनजातीय कार्य मंत्रालय</span>{' '}
                <span style={{ color: '#555560', fontWeight: 'normal' }}>|</span>{' '}
                <span>Ministry of Tribal Affairs</span>
              </div>

              {/* Row 3: Subtitle */}
              <div style={{ fontSize: '0.86rem', color: '#a1a1aa', lineHeight: '1.2' }}>
                National Fellowship &amp; Scholarship Management System for Scheduled Tribes (ST)
              </div>
            </div>
          </Link>

          {/* Right Action Bar (Language Switcher & Theme Switcher) */}
          <div className="d-flex align-items-center gap-2">
            {/* Language Switcher */}
            <div
              className="d-flex align-items-center gap-1 border px-2.5 py-1 rounded-3"
              style={{ background: '#141418', borderColor: 'rgba(255,255,255,0.12)' }}
            >
              <Globe size={14} className="text-warning me-1" />
              <button
                className={`btn btn-sm py-0 px-1 border-0 ${lang === 'en' ? 'fw-bold text-white text-decoration-underline' : 'text-secondary'}`}
                onClick={() => setLang('en')}
                style={{ fontSize: '0.85rem' }}
              >
                English
              </button>
              <span style={{ fontSize: '0.75rem', color: '#555560' }}>|</span>
              <button
                className={`btn btn-sm py-0 px-1 border-0 ${lang === 'hi' ? 'fw-bold text-white text-decoration-underline' : 'text-secondary'}`}
                onClick={() => setLang('hi')}
                style={{ fontSize: '0.85rem' }}
              >
                हिन्दी
              </button>
            </div>

            {/* Theme Toggle (Dark / Light) */}
            <button
              onClick={toggleTheme}
              className="btn btn-sm border py-1 px-3 rounded-3 d-flex align-items-center gap-1.5 text-white"
              style={{ background: '#141418', borderColor: 'rgba(255,255,255,0.12)', fontSize: '0.85rem' }}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            >
              {theme === 'dark' ? (
                <>
                  <Moon size={14} className="text-warning" />
                  <span>Dark</span>
                </>
              ) : (
                <>
                  <Sun size={14} className="text-warning" />
                  <span>Light</span>
                </>
              )}
            </button>
          </div>
        </Container>
      </div>
    </header>
  );
};

export default GovHeader;

