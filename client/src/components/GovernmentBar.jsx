import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Globe, Sun, Moon, Type } from 'lucide-react';

const GovernmentBar = () => {
  const { lang, setLang } = useLanguage();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [fontSizeLevel, setFontSizeLevel] = useState(0); // -1: small, 0: standard, 1: large

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const adjustFontSize = (level) => {
    setFontSizeLevel(level);
    const root = document.documentElement;
    if (level === -1) {
      root.style.fontSize = '14px';
    } else if (level === 1) {
      root.style.fontSize = '18px';
    } else {
      root.style.fontSize = '16px';
    }
  };

  return (
    <div className="gov-identity-bar border-bottom" style={{ backgroundColor: 'var(--color-surface-muted)', fontSize: '0.8125rem' }}>
      {/* Tricolour Strip */}
      <div className="gov-tricolour-strip" />

      {/* Accessible Skip Link */}
      <a href="#main-content" className="skip-to-content">
        Skip to main content
      </a>

      <div className="civic-container py-1.5 d-flex justify-content-between align-items-center flex-wrap gap-2">
        {/* Left: Official Government of India & Ministry Identity */}
        <div className="d-flex align-items-center gap-2">
          {/* Ashoka Lion Emblem / Official Symbol */}
          <div
            className="d-inline-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
            style={{
              width: '24px',
              height: '24px',
              backgroundColor: 'var(--color-primary)',
              color: '#FFFFFF',
              fontSize: '0.7rem',
              fontWeight: 700
            }}
            aria-hidden="true"
          >
            🏛️
          </div>

          <div className="d-flex align-items-center gap-1.5 text-secondary flex-wrap">
            <span className="fw-bold text-primary">भारत सरकार</span>
            <span className="opacity-50">|</span>
            <span className="fw-semibold">Government of India</span>
            <span className="opacity-50 d-none d-sm-inline">•</span>
            <span className="d-none d-sm-inline text-truncate" style={{ maxWidth: '280px' }}>
              Ministry of Tribal Affairs (जनजातीय कार्य मंत्रालय)
            </span>
          </div>
        </div>

        {/* Right: Accessibility Controls, Language, Theme */}
        <div className="d-flex align-items-center gap-2 flex-wrap">
          {/* Text Size Accessibility Controls */}
          <div
            className="d-none d-md-flex align-items-center border rounded px-1.5 bg-white"
            style={{ borderColor: 'var(--color-border)' }}
            role="group"
            aria-label="Text Size Adjustment"
          >
            <button
              type="button"
              className={`btn btn-sm px-1 py-0 border-0 ${fontSizeLevel === -1 ? 'fw-bold text-primary' : 'text-secondary'}`}
              onClick={() => adjustFontSize(-1)}
              title="Decrease text size"
              style={{ fontSize: '0.75rem' }}
            >
              A-
            </button>
            <span className="text-muted" style={{ fontSize: '0.7rem' }}>|</span>
            <button
              type="button"
              className={`btn btn-sm px-1 py-0 border-0 ${fontSizeLevel === 0 ? 'fw-bold text-primary' : 'text-secondary'}`}
              onClick={() => adjustFontSize(0)}
              title="Default text size"
              style={{ fontSize: '0.8rem' }}
            >
              A
            </button>
            <span className="text-muted" style={{ fontSize: '0.7rem' }}>|</span>
            <button
              type="button"
              className={`btn btn-sm px-1 py-0 border-0 ${fontSizeLevel === 1 ? 'fw-bold text-primary' : 'text-secondary'}`}
              onClick={() => adjustFontSize(1)}
              title="Increase text size"
              style={{ fontSize: '0.85rem' }}
            >
              A+
            </button>
          </div>

          {/* Language Switcher */}
          <div
            className="d-flex align-items-center border rounded px-2 py-0.5 bg-white"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <Globe size={13} className="text-secondary me-1" aria-hidden="true" />
            <button
              type="button"
              className={`btn btn-sm py-0 px-1 border-0 ${lang === 'en' ? 'fw-bold text-primary text-decoration-underline' : 'text-secondary'}`}
              onClick={() => setLang('en')}
              style={{ fontSize: '0.8rem' }}
            >
              English
            </button>
            <span className="text-muted opacity-50">|</span>
            <button
              type="button"
              className={`btn btn-sm py-0 px-1 border-0 ${lang === 'hi' ? 'fw-bold text-primary text-decoration-underline' : 'text-secondary'}`}
              onClick={() => setLang('hi')}
              style={{ fontSize: '0.8rem' }}
            >
              हिन्दी
            </button>
          </div>

          {/* Theme Selector (Default Light, Optional Dark) */}
          <button
            type="button"
            onClick={toggleTheme}
            className="btn btn-sm border py-0.5 px-2 rounded d-flex align-items-center gap-1 bg-white text-secondary"
            style={{ borderColor: 'var(--color-border)', fontSize: '0.8rem' }}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            aria-label={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Theme`}
          >
            {theme === 'dark' ? (
              <>
                <Sun size={13} className="text-warning" aria-hidden="true" />
                <span>Light</span>
              </>
            ) : (
              <>
                <Moon size={13} className="text-primary" aria-hidden="true" />
                <span>Dark</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GovernmentBar;
