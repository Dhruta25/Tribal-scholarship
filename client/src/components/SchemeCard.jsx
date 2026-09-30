import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Award, Calendar, IndianRupee } from 'lucide-react';
import { formatCurrencyINR, extractMaxIncome } from '../utils/formatters';

const SchemeCard = ({ scheme }) => {
  if (!scheme) return null;

  const maxIncomeText = extractMaxIncome(scheme);
  const educationLevel = scheme.eligibilityRules?.educationLevel || scheme.level || 'ST Students';
  const benefit = scheme.benefitType || (scheme.stipendAmountPerYear ? `${formatCurrencyINR(scheme.stipendAmountPerYear, { compact: true })}/year Stipend` : 'Direct Benefit Transfer (DBT)');
  const deadlineText = scheme.closeDate ? new Date(scheme.closeDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Active Open Cycle';

  return (
    <div className="civic-card h-100 d-flex flex-column justify-content-between">
      <div>
        {/* Card Header & Badges */}
        <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
          <span className="civic-badge civic-badge-info fw-bold">
            {scheme.code || 'GOI-SCHEME'}
          </span>
          <span className="civic-badge civic-badge-neutral">
            Ministry of Tribal Affairs
          </span>
        </div>

        {/* Scheme Title */}
        <h3 className="h5 fw-bold text-primary mb-2" style={{ lineHeight: '1.3' }}>
          {scheme.name}
        </h3>

        {/* Short description */}
        <p className="text-secondary small mb-3" style={{ lineHeight: '1.5', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {scheme.description || 'Central Sector initiative for Scheduled Tribe scholars providing direct assistance and educational support.'}
        </p>
      </div>

      <div>
        {/* Key Parameters Matrix */}
        <div className="civic-card-muted mb-3">
          <div className="d-flex justify-content-between align-items-center small mb-1.5 pb-1 border-bottom">
            <span className="text-secondary">Education Level:</span>
            <strong className="text-primary text-capitalize">{educationLevel}</strong>
          </div>
          <div className="d-flex justify-content-between align-items-center small mb-1.5 pb-1 border-bottom">
            <span className="text-secondary">Family Income:</span>
            <strong className="text-primary">{maxIncomeText}</strong>
          </div>
          <div className="d-flex justify-content-between align-items-center small mb-1.5 pb-1 border-bottom">
            <span className="text-secondary">Key Benefit:</span>
            <strong className="text-success text-truncate ms-2" style={{ maxWidth: '170px' }}>
              {benefit}
            </strong>
          </div>
          <div className="d-flex justify-content-between align-items-center small">
            <span className="text-secondary">Deadline:</span>
            <span className="text-secondary fw-semibold">{deadlineText}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="d-flex align-items-center gap-2">
          <Link
            to={`/eligibility?scheme=${scheme.code}`}
            className="btn-civic-primary w-50 text-center"
            style={{ minHeight: '40px', fontSize: '0.9rem' }}
          >
            Check Eligibility
          </Link>
          <Link
            to={`/schemes/${scheme._id}`}
            className="btn-civic-secondary w-50 text-center"
            style={{ minHeight: '40px', fontSize: '0.9rem' }}
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SchemeCard;
