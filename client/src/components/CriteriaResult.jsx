import React from 'react';
import { CheckCircle2, XCircle, HelpCircle, ArrowRight } from 'lucide-react';
import { formatCurrencyINR } from '../utils/formatters';

const CriteriaResult = ({ criterion }) => {
  const isPassed = Boolean(criterion.passed);
  const isInfoRequired = criterion.passed === null || criterion.passed === undefined;

  const formatActualValue = (field, actual) => {
    if (actual === null || actual === undefined || actual === '') {
      return 'Not provided';
    }
    if ((field === 'familyIncome' || field === 'annualIncome') && !isNaN(Number(actual))) {
      return formatCurrencyINR(Number(actual));
    }
    if (field === 'marksPercent' && !isNaN(Number(actual))) {
      return `${actual}%`;
    }
    if (field === 'age' && !isNaN(Number(actual))) {
      return `${actual} years`;
    }
    return String(actual);
  };

  const getCriterionDisplayName = (field) => {
    const fieldMap = {
      category: 'Social Category',
      familyIncome: 'Annual Family Income',
      annualIncome: 'Annual Family Income',
      marksPercent: 'Qualifying Examination Marks',
      educationLevel: 'Education Level',
      age: 'Age Limit',
      course: 'Degree Programme',
      country: 'Study Location'
    };
    return fieldMap[field] || field.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ');
  };

  const getNextAction = (field, actual) => {
    if (field === 'familyIncome' || field === 'annualIncome') {
      return 'Explore schemes without income ceiling, or review revenue authority certificate values.';
    }
    if (field === 'category') {
      return 'Schemes under MoTA are reserved for Scheduled Tribe (ST/PVTG) scholars. Consider state general scholarships.';
    }
    if (field === 'marksPercent') {
      return 'Look for schemes with lower threshold marks requirements or check merit weighting.';
    }
    if (field === 'educationLevel') {
      return 'Verify whether your current enrolled course matches the required level (e.g. Master’s vs Ph.D.).';
    }
    return 'Update your applicant profile or check alternative schemes tailored to your level.';
  };

  const actualDisplay = formatActualValue(criterion.field, criterion.actual);
  const criterionTitle = getCriterionDisplayName(criterion.field);

  return (
    <div
      className="civic-card p-3 mb-3"
      style={{
        backgroundColor: isPassed
          ? 'var(--color-success-light)'
          : isInfoRequired
          ? 'var(--color-surface-muted)'
          : 'var(--color-error-light)',
        borderColor: isPassed
          ? 'rgba(22, 128, 91, 0.3)'
          : isInfoRequired
          ? 'var(--color-border)'
          : 'rgba(199, 62, 77, 0.3)'
      }}
    >
      <div className="d-flex justify-content-between align-items-start gap-2 mb-2 flex-wrap">
        <div className="d-flex align-items-center gap-2">
          {isPassed ? (
            <CheckCircle2 size={18} className="text-success flex-shrink-0" />
          ) : isInfoRequired ? (
            <HelpCircle size={18} className="text-secondary flex-shrink-0" />
          ) : (
            <XCircle size={18} className="text-danger flex-shrink-0" />
          )}
          <span className="fw-bold text-capitalize text-primary">
            {criterionTitle}
          </span>
        </div>

        <div>
          {isPassed ? (
            <span className="civic-badge civic-badge-success">Requirement Met</span>
          ) : isInfoRequired ? (
            <span className="civic-badge civic-badge-neutral">Info Required</span>
          ) : (
            <span className="civic-badge civic-badge-error">Criterion Not Met</span>
          )}
        </div>
      </div>

      <div className="row g-2 small text-secondary my-1">
        <div className="col-sm-6">
          <span className="fw-semibold text-primary">Official Requirement: </span>
          <span>{criterion.message || 'Must meet official scheme rule.'}</span>
        </div>
        <div className="col-sm-6">
          <span className="fw-semibold text-primary">Your Provided Input: </span>
          <span className="fw-bold text-primary">{actualDisplay}</span>
        </div>
      </div>

      {!isPassed && !isInfoRequired && (
        <div className="mt-2 pt-2 border-top small" style={{ borderColor: 'rgba(199, 62, 77, 0.2)' }}>
          <strong className="text-danger">Recommended Next Action: </strong>
          <span className="text-secondary">{getNextAction(criterion.field, criterion.actual)}</span>
        </div>
      )}
    </div>
  );
};

export default CriteriaResult;
