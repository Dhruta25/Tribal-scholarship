import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { CheckCircle2, Clock, AlertTriangle, XCircle, Award, ShieldCheck, FileText } from 'lucide-react';

const statusConfig = {
  DRAFT: {
    className: 'civic-badge-neutral',
    defaultText: 'Draft',
    icon: FileText
  },
  SUBMITTED: {
    className: 'civic-badge-info',
    defaultText: 'Submitted',
    icon: Clock
  },
  OCR_PROCESSING: {
    className: 'civic-badge-info',
    defaultText: 'OCR Scanning',
    icon: ShieldCheck
  },
  AUTO_VERIFIED: {
    className: 'civic-badge-success',
    defaultText: 'Auto-Verified',
    icon: CheckCircle2
  },
  DEFICIENT: {
    className: 'civic-badge-warning',
    defaultText: 'Deficient / Requires Action',
    icon: AlertTriangle
  },
  UNDER_VERIFICATION: {
    className: 'civic-badge-info',
    defaultText: 'In Verification',
    icon: Clock
  },
  UNDER_SCRUTINY: {
    className: 'civic-badge-info',
    defaultText: 'Under Scrutiny',
    icon: Clock
  },
  ELIGIBLE: {
    className: 'civic-badge-success',
    defaultText: 'Eligible',
    icon: CheckCircle2
  },
  INELIGIBLE: {
    className: 'civic-badge-error',
    defaultText: 'Ineligible',
    icon: XCircle
  },
  MERIT_LISTED: {
    className: 'civic-badge-info',
    defaultText: 'Merit Listed',
    icon: Award
  },
  SELECTED: {
    className: 'civic-badge-success',
    defaultText: 'Selected (Awarded)',
    icon: Award
  },
  WAITLISTED: {
    className: 'civic-badge-warning',
    defaultText: 'Waitlisted',
    icon: Clock
  },
  REJECTED: {
    className: 'civic-badge-error',
    defaultText: 'Rejected',
    icon: XCircle
  },
  AWARD_ACCEPTED: {
    className: 'civic-badge-success',
    defaultText: 'Award Accepted',
    icon: CheckCircle2
  },
  DISBURSING: {
    className: 'civic-badge-info',
    defaultText: 'Disbursing (DBT)',
    icon: Clock
  },
  COMPLETED: {
    className: 'civic-badge-neutral',
    defaultText: 'Completed',
    icon: CheckCircle2
  }
};

const StatusBadge = ({ status = 'DRAFT', className = '', size = 'md', showIcon = true }) => {
  const { t } = useLanguage();
  const config = statusConfig[status] || {
    className: 'civic-badge-neutral',
    defaultText: status,
    icon: FileText
  };
  const localizedLabel = t(`status.${status}`, config.defaultText);
  const Icon = config.icon;

  const sizeClass = size === 'sm' ? 'py-0.5 px-2 fs-6' : size === 'lg' ? 'py-1.5 px-3 fs-6' : '';

  return (
    <span
      className={`civic-badge ${config.className} ${sizeClass} ${className}`}
      role="status"
    >
      {showIcon && Icon && <Icon size={size === 'sm' ? 12 : 14} aria-hidden="true" />}
      <span>{localizedLabel}</span>
    </span>
  );
};

export default StatusBadge;
