import React, { useState } from 'react';
import { Send, Volume2, Pause, RefreshCw, Smartphone } from 'lucide-react';

const AdvisoryEngineModule = () => {
  const [selectedLang, setSelectedLang] = useState('marathi');
  const [district, setDistrict] = useState('Gadchiroli');
  const [scheme, setScheme] = useState('NFST (Ph.D / M.Phil)');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const advisories = {
    marathi: {
      title: 'एनएफएसटी फेलोशिपसाठी तुमचे कागदपत्रे मंजूर झाली आहेत.',
      body: 'राष्ट्रीय जनजातीय फेलोशिप (NFST) अंतर्गत पुढील ३ दिवसांत तुमचा पहिला हप्ता बँक खात्यात थेट DBT द्वारे जमा होईल. बायोमेट्रिक आधार लिंकिंग पूर्ण करा.',
      audioLength: '0:32 voice advisory'
    },
    hindi: {
      title: 'राष्ट्रीय जनजातीय फैलोशिप हेतु दस्तावेज सत्यापन सफल हुआ।',
      body: 'आपकी NFST फैलोशिप राशि डायरेक्ट बेनिफिट ट्रांसफर (DBT) के माध्यम से अगले ३ दिनों में आपके आधार-लिंक्ड बैंक खाते में स्थानांतरित कर दी जाएगी।',
      audioLength: '0:30 voice advisory'
    },
    english: {
      title: 'NFST Fellowship pre-check verified successfully.',
      body: 'Your National Fellowship for ST Students (NFST) stipend release has been routed to officer scrutiny. Ensure your Aadhaar-seeded bank account is active for DBT disbursement.',
      audioLength: '0:28 voice advisory'
    }
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
    }, 600);
  };

  const toggleAudio = () => {
    if ('speechSynthesis' in window) {
      if (isPlaying) {
        window.speechSynthesis.cancel();
        setIsPlaying(false);
      } else {
        const textToSpeak = `${advisories[selectedLang].title} ${advisories[selectedLang].body}`;
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.lang = selectedLang === 'marathi' ? 'mr-IN' : (selectedLang === 'hindi' ? 'hi-IN' : 'en-US');
        utterance.onend = () => setIsPlaying(false);
        utterance.onerror = () => setIsPlaying(false);
        window.speechSynthesis.speak(utterance);
        setIsPlaying(true);
      }
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const currentAdv = advisories[selectedLang] || advisories.marathi;

  return (
    <div className="py-2">
      {/* Module Heading Header */}
      <div className="mb-4">
        <div className="ks-module-tag mb-2">MODULE 01 / SCHOLAR ADVISORY ENGINE</div>
        <h1 className="ks-display-title mb-2">Turn student signals into clear action.</h1>
        <p className="ks-display-sub" style={{ maxWidth: '780px' }}>
          Localized student, academic, income, and document data translated into plain-language guidance ST scholars and officers can act on today.
        </p>
      </div>

      <div className="row g-4">
        {/* Left Card: Input Generator */}
        <div className="col-lg-6">
          <div className="ks-card h-100">
            {/* Header with Language Selector Pills */}
            <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
              <div className="d-flex align-items-center gap-2">
                <Send size={18} className="text-white" />
                <span className="fw-bold text-white" style={{ fontSize: '1.05rem' }}>Generate scholar advisory</span>
              </div>

              <div className="d-flex align-items-center gap-1 bg-dark p-1 rounded-pill border border-secondary border-opacity-25">
                <span className="text-muted small px-2" style={{ fontSize: '0.72rem' }}>文A</span>
                <button
                  type="button"
                  className={`ks-lang-pill-btn ${selectedLang === 'marathi' ? 'active' : ''}`}
                  onClick={() => setSelectedLang('marathi')}
                >
                  Marathi
                </button>
                <button
                  type="button"
                  className={`ks-lang-pill-btn ${selectedLang === 'hindi' ? 'active' : ''}`}
                  onClick={() => setSelectedLang('hindi')}
                >
                  Hindi
                </button>
                <button
                  type="button"
                  className={`ks-lang-pill-btn ${selectedLang === 'english' ? 'active' : ''}`}
                  onClick={() => setSelectedLang('english')}
                >
                  English
                </button>
              </div>
            </div>

            {/* Selectors */}
            <div className="row g-3 mb-4">
              <div className="col-6">
                <label className="text-muted small fw-bold mb-1" style={{ fontSize: '0.75rem' }}>Tribal District</label>
                <select
                  className="form-select ks-select"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                >
                  <option value="Gadchiroli">Gadchiroli</option>
                  <option value="Nandurbar">Nandurbar</option>
                  <option value="Beed">Beed</option>
                  <option value="Palghar">Palghar</option>
                  <option value="Ranchi">Ranchi</option>
                </select>
              </div>

              <div className="col-6">
                <label className="text-muted small fw-bold mb-1" style={{ fontSize: '0.75rem' }}>Target Scheme</label>
                <select
                  className="form-select ks-select"
                  value={scheme}
                  onChange={(e) => setScheme(e.target.value)}
                >
                  <option value="NFST (Ph.D / M.Phil)">NFST (National Fellowship)</option>
                  <option value="NOS (Overseas Study)">NOS (Overseas Study)</option>
                  <option value="Top Class Education">Top Class Education (IIT/IIM)</option>
                  <option value="Post-Matric ST DBT">Post-Matric ST DBT</option>
                </select>
              </div>
            </div>

            {/* Live Field Metric Signal Cards */}
            <div className="ks-card-sub mb-4">
              <div className="row text-center g-2">
                <div className="col-4 border-end border-secondary border-opacity-25">
                  <div className="text-muted" style={{ fontSize: '0.7rem' }}>Caste Certificate</div>
                  <div className="fw-bold text-success mt-1" style={{ fontSize: '0.95rem' }}>OCR Verified</div>
                </div>
                <div className="col-4 border-end border-secondary border-opacity-25">
                  <div className="text-muted" style={{ fontSize: '0.7rem' }}>Income Cap</div>
                  <div className="fw-bold text-white mt-1" style={{ fontSize: '0.95rem' }}>≤ ₹6.0 Lakhs</div>
                </div>
                <div className="col-4">
                  <div className="text-muted" style={{ fontSize: '0.7rem' }}>DBT Linkage</div>
                  <div className="fw-bold text-white mt-1" style={{ fontSize: '0.95rem' }}>Active Bank</div>
                </div>
              </div>
            </div>

            {/* Generate Action Button */}
            <div>
              <button
                type="button"
                className="ks-btn-white"
                onClick={handleGenerate}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <RefreshCw size={16} className="spin" /> Generating...
                  </>
                ) : (
                  <>
                    Generate advisory <Send size={16} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Card: Output Preview */}
        <div className="col-lg-6">
          <div className="ks-card h-100 d-flex flex-column justify-content-between">
            <div>
              {/* Header */}
              <div className="d-flex align-items-center justify-content-between mb-4">
                <div className="ks-module-tag" style={{ fontSize: '0.7rem' }}>
                  SCHOLAR PREVIEW · {selectedLang.toUpperCase()}
                </div>

                {/* Audio Play Button Circle */}
                <button
                  type="button"
                  onClick={toggleAudio}
                  className="rounded-circle bg-white text-dark border-0 p-2 d-flex align-items-center justify-content-center shadow"
                  style={{ width: '42px', height: '42px', transition: 'all 0.2s ease' }}
                  title="Play Voice Advisory"
                >
                  {isPlaying ? <Pause size={20} className="text-dark" /> : <Volume2 size={20} className="text-dark" />}
                </button>
              </div>

              {/* Main Regional Advisory Message Box */}
              <div
                className="p-4 rounded-4 mb-4"
                style={{
                  background: '#0a0a0c',
                  border: '1px solid rgba(255,255,255,0.08)',
                  minHeight: '180px'
                }}
              >
                <h3 className="fw-bold text-white mb-3" style={{ fontSize: '1.45rem', lineHeight: '1.3' }}>
                  {currentAdv.title}
                </h3>
                <p className="text-secondary mb-0" style={{ fontSize: '1.02rem', lineHeight: '1.6' }}>
                  {currentAdv.body}
                </p>
              </div>
            </div>

            {/* Footer Audio Bar & Phone Status */}
            <div className="d-flex align-items-center justify-content-between pt-2 border-top border-secondary border-opacity-25">
              <div className="d-flex align-items-center gap-2 text-muted" style={{ fontSize: '0.82rem' }}>
                <div className="ks-audio-wave">
                  <div className="ks-wave-bar"></div>
                  <div className="ks-wave-bar"></div>
                  <div className="ks-wave-bar"></div>
                  <div className="ks-wave-bar"></div>
                  <div className="ks-wave-bar"></div>
                </div>
                <span>{currentAdv.audioLength}</span>
              </div>

              <div className="d-flex align-items-center gap-1 text-muted" style={{ fontSize: '0.8rem' }}>
                <Smartphone size={14} />
                <span>Basic phone ready</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvisoryEngineModule;
