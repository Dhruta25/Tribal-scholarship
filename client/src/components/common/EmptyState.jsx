import React from 'react';
import { Search } from 'lucide-react';
import Button from './Button';

const EmptyState = ({
  icon: Icon = Search,
  title = 'No records found',
  description = 'We could not find any items matching your criteria. Try adjusting your search or filters.',
  actionText = null,
  onAction = null,
  className = ''
}) => {
  return (
    <div className={`civic-empty-state ${className}`}>
      <div className="civic-empty-icon" aria-hidden="true">
        <Icon size={28} />
      </div>
      <h3 className="h5 fw-bold mb-2">{title}</h3>
      <p className="text-secondary mb-3 mx-auto" style={{ maxWidth: '440px' }}>
        {description}
      </p>
      {actionText && onAction && (
        <Button variant="secondary" size="sm" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
