import React from 'react';
import { CheckCircle2, AlertCircle, Info, ShieldAlert } from 'lucide-react';

const EligibilitySummary = ({
  isEligible,
  schemeName = 'Selected Scheme',
  summary = '',
  totalRules = 0,
  passedRules = 0
}) => {
  const isPass = Boolean(isEligible);

  return (
    <div
      className="civic-card mb-4"
      style={{
        borderLeft: `5px solid ${isPass ? 'var(--color-success)' : 'var(--color-error)'}`
      }}
    >
      <div className="d-flex align-items-start gap-3">
        <div
          className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
          style={{
            width: '48px',
            height: '48px',
            backgroundColor: isPass ? 'var(--color-success-light)' : 'var(--color-error-light)',
            color: isPass ? 'var(--color-success)' : 'var(--color-error)'
          }}
          aria-hidden="true"
        >
          {isPass ? <CheckCircle2 size={26} /> : <AlertCircle size={26} />}
        </div>

        <div className="flex-grow-1">
          <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
            <span
              className={`civic-badge ${isPass ? 'civic-badge-success' : 'civic-badge-error'}`}
            >
              {isPass ? 'Preliminary Match Found' : 'Criteria Not Fully Met'}
            </span>
            {totalRules > 0 && (
              <span className="small text-secondary">
                ({passedRules} of {totalRules} requirements satisfied)
              </span>
            )}
          </div>

          <h3 className="h4 fw-bold text-primary mb-1">
            {isPass
              ? `You appear eligible for ${schemeName}`
              : `You may not be eligible for ${schemeName}`}
          </h3>

          <p className="text-secondary mb-3" style={{ lineHeight: '1.5' }}>
            {summary ||
              (isPass
                ? 'Based on the information provided, you satisfy the basic eligibility thresholds established for this scheme.'
                : 'One or more of the criteria does not match the official guidelines set by the Ministry of Tribal Affairs.')}
          </p>

          <div
            className="p-2.5 rounded-3 d-flex align-items-center gap-2 small"
            style={{
              backgroundColor: 'var(--color-surface-muted)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-secondary)'
            }}
          >
            <Info size={16} className="text-primary flex-shrink-0" />
            <span>
              <strong>Official Notice:</strong> This pre-check is an advisory screening. Final award decisions are made by designated Scrutiny Officers following document and certificate verification.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EligibilitySummary;
