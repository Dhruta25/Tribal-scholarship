import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Sparkles } from 'lucide-react';
import { Button, Form, Spinner } from 'react-bootstrap';
import axiosClient from '../api/axiosClient';

const OFFLINE_KNOWLEDGE_BASE = [
  {
    keywords: ['which scheme', 'apply', 'available', 'recommend', 'list', 'option'],
    reply: `Here are the official Scheduled Tribe (ST) schemes under the Ministry of Tribal Affairs:\n\n• **Pre-Matric Scholarship (BPVGK)**: Class 9th & 10th ST students (Income ≤ ₹2.50 Lakhs)\n• **Post-Matric Scholarship (BVOBC)**: Class 11th, 12th, ITI & Diploma (Income ≤ ₹2.50 Lakhs)\n• **Top Class Education (A023B)**: Full fee + ₹45,000 laptop grant in IIT, IIM, AIIMS, NIT (Income ≤ ₹6.00 Lakhs)\n• **National Overseas Scholarship (AZKMI)**: 100% tuition + $15,400 living allowance in Top 500 QS global universities (Income ≤ ₹6.00 Lakhs)\n• **National Fellowship (NFST - ARG45)**: JRF/SRF fellowship for M.Phil & Ph.D. research in Indian Universities (Income ≤ ₹8.00 Lakhs)`,
    source: 'MoTA Official Scheme Directory',
    suggestions: ['What documents do I need for NOS?', 'Am I eligible for NFST?', 'When is the deadline?']
  },
  {
    keywords: ['document', 'nos', 'overseas', 'upload', 'require'],
    reply: `### Required Documents for National Overseas Scholarship (NOS):\n• **Foreign University Offer Letter** (Unconditional offer in QS Top 500 University)\n• **ST Caste Certificate** (Verified digitally)\n• **Annual Income Certificate** (Issued by competent authority, ≤ ₹6.00 Lakhs)\n• **Passport Scans** (First & last page)\n• **Qualifying Degree Marksheet** (Min 60% aggregate marks)`,
    source: 'NOS Scheme Guidelines',
    suggestions: ['Which schemes can I apply for?', 'Am I eligible for NFST?', 'How does OCR work?']
  },
  {
    keywords: ['nfst', 'fellowship', 'phd', 'research', 'mphil'],
    reply: `### National Fellowship for ST Students (NFST - ARG45):\n• **Eligibility**: ST Scholars admitted to M.Phil or Ph.D. in recognized Indian Universities / IITs / NITs.\n• **Income Limit**: Annual family income ≤ ₹8.00 Lakhs.\n• **Stipend**: JRF @ ₹31,000/mo + HRA, SRF @ ₹35,000/mo + Annual Contingency Grant.\n• **Reservation**: 30% Women Quota, 5% PVTG Priority.`,
    source: 'NFST Guidelines',
    suggestions: ['Which schemes can I apply for?', 'What documents do I need for NOS?', 'Check application status']
  },
  {
    keywords: ['status', 'track', 'application'],
    reply: `### Application Tracking Guide:\nTo track your live application stage:\n1. Click **Sign In** on the top menu bar.\n2. Navigate to your **Workspace / Applicant Dashboard**.\n3. View your application timeline: **Submitted → AI OCR Verified → Verifier Queue → Scrutiny → Merit Listed → Disbursed**.`,
    source: 'Application Management Portal',
    suggestions: ['Which schemes can I apply for?', 'What documents do I need for NOS?']
  },
  {
    keywords: ['deadline', 'last date', 'close', 'when'],
    reply: `### Scheme Application Deadlines (2026 Season):\n• **Pre-Matric (BPVGK)**: Closes 30 Nov 2026\n• **Post-Matric (BVOBC)**: Closes 31 Dec 2026\n• **Top Class Education (A023B)**: Closes 15 Nov 2026\n• **National Overseas Scholarship (NOS)**: Closes 31 Oct 2026\n• **National Fellowship (NFST)**: Closes 30 Nov 2026`,
    source: 'MoTA Application Timeline',
    suggestions: ['Which schemes can I apply for?', 'Am I eligible for NFST?']
  }
];

/**
 * Render Markdown text gracefully into clean HTML elements without raw ** or ### showing
 */
const renderFormattedMessage = (text) => {
  if (!text) return null;

  const lines = text.split('\n');

  return (
    <div style={{ color: '#ffffff', display: 'flex', flexDirection: 'column', gap: '3px' }}>
      {lines.map((line, lIdx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={lIdx} style={{ height: '4px' }} />;
        }

        // Headers (### or ## or #)
        const isHeader = trimmed.startsWith('#');
        if (isHeader) {
          const headerText = trimmed.replace(/^#{1,4}\s*/, '').replace(/\*\*/g, '');
          return (
            <div
              key={lIdx}
              className="fw-bold text-warning"
              style={{ fontSize: '0.92rem', marginTop: '6px', marginBottom: '2px' }}
            >
              {headerText}
            </div>
          );
        }

        // Horizontal rule
        if (trimmed === '***' || trimmed === '---' || trimmed === '___') {
          return <hr key={lIdx} style={{ borderColor: 'rgba(255,255,255,0.15)', margin: '6px 0' }} />;
        }

        // Inline tokens (**bold**, *italic*, `code`)
        const tokens = [];
        let lastIndex = 0;
        const regex = /(\*\*(.*?)\*\*|\*(.*?)\*|`(.*?)`)/g;
        let match;

        while ((match = regex.exec(line)) !== null) {
          if (match.index > lastIndex) {
            tokens.push(line.substring(lastIndex, match.index));
          }

          if (match[2] !== undefined) {
            // **bold**
            tokens.push(
              <strong key={tokens.length} style={{ color: '#ffffff', fontWeight: 600 }}>
                {match[2]}
              </strong>
            );
          } else if (match[3] !== undefined) {
            // *italic*
            tokens.push(
              <em key={tokens.length} style={{ color: '#fbbf24', fontStyle: 'italic' }}>
                {match[3]}
              </em>
            );
          } else if (match[4] !== undefined) {
            // `code`
            tokens.push(
              <code key={tokens.length} style={{ background: '#22222a', color: '#fbbf24', padding: '1px 4px', borderRadius: '4px', fontSize: '0.82rem' }}>
                {match[4]}
              </code>
            );
          }

          lastIndex = regex.lastIndex;
        }

        if (lastIndex < line.length) {
          tokens.push(line.substring(lastIndex));
        }

        // Strip any stray raw ** left in plain strings
        const cleanedTokens = tokens.map((token) => {
          if (typeof token === 'string') {
            return token.replace(/\*\*/g, '');
          }
          return token;
        });

        // Bullet point formatting
        const isBullet = trimmed.startsWith('•') || trimmed.startsWith('- ') || trimmed.startsWith('* ');
        if (isBullet) {
          // Remove leading bullet char if present in text
          const bulletContent = line.replace(/^\s*[•\-\*]\s*/, '');
          
          // Re-tokenize the content without the bullet symbol
          const bTokens = [];
          let bLastIndex = 0;
          const bRegex = /(\*\*(.*?)\*\*|\*(.*?)\*|`(.*?)`)/g;
          let bMatch;

          while ((bMatch = bRegex.exec(bulletContent)) !== null) {
            if (bMatch.index > bLastIndex) {
              bTokens.push(bulletContent.substring(bLastIndex, bMatch.index));
            }
            if (bMatch[2] !== undefined) {
              bTokens.push(<strong key={bTokens.length} style={{ color: '#ffffff', fontWeight: 600 }}>{bMatch[2]}</strong>);
            } else if (bMatch[3] !== undefined) {
              bTokens.push(<em key={bTokens.length} style={{ color: '#fbbf24', fontStyle: 'italic' }}>{bMatch[3]}</em>);
            } else if (bMatch[4] !== undefined) {
              bTokens.push(<code key={bTokens.length} style={{ background: '#22222a', color: '#fbbf24', padding: '1px 4px', borderRadius: '4px', fontSize: '0.82rem' }}>{bMatch[4]}</code>);
            }
            bLastIndex = bRegex.lastIndex;
          }
          if (bLastIndex < bulletContent.length) {
            bTokens.push(bulletContent.substring(bLastIndex));
          }

          const cleanedBTokens = bTokens.map(t => typeof t === 'string' ? t.replace(/\*\*/g, '') : t);

          return (
            <div key={lIdx} className="d-flex align-items-start gap-1.5" style={{ paddingLeft: '2px', lineHeight: '1.45' }}>
              <span style={{ color: '#fbbf24', fontWeight: 'bold' }}>•</span>
              <div>{cleanedBTokens}</div>
            </div>
          );
        }

        return (
          <div key={lIdx} style={{ lineHeight: '1.45' }}>
            {cleanedTokens}
          </div>
        );
      })}
    </div>
  );
};

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'Namaste! I am your AI Tribal Affairs Scholarship Assistant. How can I assist you today with schemes, rules, or document requirements?',
      source: 'MoTA Automated Helpdesk',
      suggestions: [
        'Which schemes can I apply for?',
        'What documents do I need for NOS?',
        'What is the status of my application?',
        'Am I eligible for NFST?'
      ]
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const findGroundedAnswer = (query) => {
    const q = query.toLowerCase();
    for (const item of OFFLINE_KNOWLEDGE_BASE) {
      if (item.keywords.some(kw => q.includes(kw))) {
        return item;
      }
    }

    return {
      reply: `I am your **MoTA Scholarship Assistant**. You can ask me about:\n• *"Which schemes can I apply for?"*\n• *"What documents do I need for NOS?"*\n• *"Am I eligible for NFST?"*\n• *"When is the application deadline?"*\n• *"How do I track my application status?"*`,
      source: 'MoTA Grounded Helpdesk',
      suggestions: [
        'Which schemes can I apply for?',
        'What documents do I need for NOS?',
        'Am I eligible for NFST?'
      ]
    };
  };

  const handleSendMessage = async (textToSend = null) => {
    const text = (textToSend || inputText).trim();
    if (!text || loading) return;

    // Append user message
    const userMsg = { sender: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      const res = await axiosClient.post('/chatbot/message', { message: text });
      if (res.data && res.data.success && res.data.reply) {
        setMessages(prev => [
          ...prev,
          {
            sender: 'bot',
            text: res.data.reply,
            source: res.data.source || 'MoTA Live Helpdesk',
            suggestions: res.data.suggestions || []
          }
        ]);
      } else {
        const fallback = findGroundedAnswer(text);
        setMessages(prev => [...prev, { sender: 'bot', ...fallback }]);
      }
    } catch (err) {
      // Use grounded local AI response if server unavailable
      const fallback = findGroundedAnswer(text);
      setMessages(prev => [...prev, { sender: 'bot', ...fallback }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Toggle Button (Obsidian Dark Theme) */}
      <button
        type="button"
        className="chat-floating-btn"
        onClick={() => setIsOpen(!isOpen)}
        title="Scholarship AI Assistant"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '54px',
          height: '54px',
          borderRadius: '50%',
          backgroundColor: '#16161a',
          color: '#fbbf24',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 30px rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          cursor: 'pointer'
        }}
      >
        {isOpen ? <X size={24} className="text-white" /> : <MessageSquare size={24} className="text-warning" />}
      </button>

      {/* Floating Chat Window (Obsidian Dark Theme) */}
      {isOpen && (
        <div
          className="chat-window"
          style={{
            position: 'fixed',
            bottom: '90px',
            right: '24px',
            width: '380px',
            maxWidth: 'calc(100vw - 32px)',
            height: '520px',
            maxHeight: 'calc(100vh - 120px)',
            backgroundColor: '#0a0a0d',
            border: '1px solid #282832',
            borderRadius: '16px',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            zIndex: 9999
          }}
        >
          {/* Header */}
          <div
            className="p-3 text-white d-flex justify-content-between align-items-center"
            style={{ background: '#121215', borderBottom: '1px solid #22222a' }}
          >
            <div className="d-flex align-items-center gap-2">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: '32px', height: '32px', background: '#1a1a20', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <Bot size={18} className="text-warning" />
              </div>
              <div>
                <div className="fw-bold text-white fs-6" style={{ lineHeight: '1.2' }}>Scholarship Assistant</div>
                <div style={{ fontSize: '0.72rem', color: '#91919e' }}>Offline Knowledge Grounded AI</div>
              </div>
            </div>
            <button
              className="btn btn-sm text-secondary p-1 border-0"
              onClick={() => setIsOpen(false)}
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages Feed */}
          <div
            className="p-3 flex-grow-1 overflow-auto"
            style={{ background: '#08080a', fontSize: '0.86rem' }}
          >
            {messages.map((msg, index) => (
              <div key={index} className={`d-flex flex-column mb-3 ${msg.sender === 'user' ? 'align-items-end' : 'align-items-start'}`}>
                <div
                  className="p-3 rounded-3 shadow-sm chat-msg-bubble"
                  style={{
                    maxWidth: '88%',
                    whiteSpace: 'pre-wrap',
                    lineHeight: '1.5',
                    background: msg.sender === 'user' ? '#27272a' : '#16161a',
                    color: '#ffffff',
                    border: msg.sender === 'user' ? '1px solid #3f3f46' : '1px solid #2a2a32'
                  }}
                >
                  {renderFormattedMessage(msg.text)}
                </div>

                {/* Source Citation */}
                {msg.source && (
                  <div className="mt-1 px-1" style={{ fontSize: '0.68rem', color: '#a1a1aa' }}>
                    <Sparkles size={10} className="me-1 text-warning" />
                    Source: <em style={{ color: '#fbbf24' }}>{msg.source}</em>
                  </div>
                )}

                {/* Suggestion Pills */}
                {msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="d-flex flex-wrap gap-1.5 mt-2">
                    {msg.suggestions.map((sug, sIdx) => (
                      <button
                        key={sIdx}
                        type="button"
                        className="btn btn-sm py-1 px-2.5 rounded-pill text-white border"
                        style={{
                          fontSize: '0.74rem',
                          background: '#18181c',
                          borderColor: '#3f3f46',
                          color: '#ffffff'
                        }}
                        onClick={() => handleSendMessage(sug)}
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="d-flex align-items-center gap-2 text-warning small py-2">
                <Spinner size="sm" animation="grow" variant="warning" />
                <span className="text-light">Consulting scheme database…</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <div className="p-2.5" style={{ background: '#121215', borderTop: '1px solid #22222a' }}>
            <Form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="d-flex gap-2"
            >
              <Form.Control
                type="text"
                placeholder="Ask about schemes, status, rules..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                size="sm"
                className="rounded-pill border-0"
                style={{ background: '#1a1a20', color: '#ffffff', fontSize: '0.85rem' }}
              />
              <Button
                type="submit"
                size="sm"
                className="rounded-circle p-0 d-flex align-items-center justify-content-center border-0"
                disabled={!inputText.trim() || loading}
                style={{ width: '34px', height: '34px', backgroundColor: '#fbbf24', color: '#000000' }}
              >
                <Send size={14} />
              </Button>
            </Form>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatWidget;


