import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, AlertCircle } from 'lucide-react';
import EligibilitySummary from './EligibilitySummary';
import CriteriaResult from './CriteriaResult';

const EligibilityResultCard = ({
  isEligible = false,
  summary = '',
  criteriaResults = [],
  alternativeSchemes = [],
  scheme = null,
  schemeName = 'Selected Scheme'
}) => {
  const finalSchemeName = scheme?.name || schemeName;
  const totalRules = criteriaResults.length;
  const passedRules = criteriaResults.filter(c => c.passed).length;

  return (
    <div className="mb-4">
      {/* 1. Summary Card */}
      <EligibilitySummary
        isEligible={isEligible}
        schemeName={finalSchemeName}
        summary={summary}
        totalRules={totalRules}
        passedRules={passedRules}
      />

      {/* 2. Criteria-by-Criteria Breakdown */}
      <div className="civic-card mb-4 p-4">
        <h4 className="h6 fw-bold text-primary mb-3">
          Detailed Criteria Breakdown ({passedRules}/{totalRules} Met)
        </h4>

        {criteriaResults.length === 0 ? (
          <p className="text-secondary small mb-0">No individual rule parameters evaluated.</p>
        ) : (
          <div className="d-flex flex-column gap-1">
            {criteriaResults.map((item, idx) => (
              <CriteriaResult key={idx} criterion={item} />
            ))}
          </div>
        )}
      </div>

      {/* 3. Alternative Scheme Recommendations if Ineligible */}
      {!isEligible && alternativeSchemes && alternativeSchemes.length > 0 && (
        <div className="civic-card p-4 border-warning bg-opacity-10 mb-4" style={{ backgroundColor: 'var(--color-accent-light)', borderColor: 'var(--color-accent)' }}>
          <div className="d-flex align-items-center gap-2 mb-2 text-primary fw-bold">
            <Sparkles size={20} className="text-warning" />
            <h4 className="h6 fw-bold mb-0 text-primary">Alternative Schemes You May Consider</h4>
          </div>
          <p className="small text-secondary mb-3">
            Based on your entered profile parameters, here are official government schemes where your qualifications may align better:
          </p>

          <div className="row g-3">
            {alternativeSchemes.map((alt) => (
              <div key={alt.id || alt._id} className="col-md-6">
                <div className="civic-card h-100 p-3 bg-white">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <span className="civic-badge civic-badge-info">{alt.code}</span>
                    <span className="civic-badge civic-badge-neutral small">{alt.level || 'Higher Ed'}</span>
                  </div>
                  <h5 className="h6 fw-bold text-primary mb-1">{alt.name}</h5>
                  <p className="text-secondary small mb-3">
                    {alt.reason || 'Criteria match your educational profile.'}
                  </p>
                  <div className="d-flex gap-2">
                    <Link
                      to={`/eligibility?scheme=${alt.code}`}
                      className="btn-civic-primary btn-sm flex-grow-1 text-center"
                      style={{ minHeight: '36px', fontSize: '0.85rem' }}
                    >
                      Check Eligibility
                    </Link>
                    <Link
                      to={`/schemes/${alt.id || alt._id}`}
                      className="btn-civic-secondary btn-sm flex-grow-1 text-center"
                      style={{ minHeight: '36px', fontSize: '0.85rem' }}
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EligibilityResultCard;
