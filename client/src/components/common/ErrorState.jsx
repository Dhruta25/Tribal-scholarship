import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import Button from './Button';

const ErrorState = ({
  title = 'Unable to load information',
  message = 'An unexpected error occurred while communicating with the server. Please check your connection and try again.',
  onRetry = null,
  className = ''
}) => {
  return (
    <div
      role="alert"
      className={`civic-card p-4 my-3 border-danger bg-opacity-10 ${className}`}
      style={{ borderColor: 'var(--color-error)' }}
    >
      <div className="d-flex align-items-start gap-3">
        <div
          className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
          style={{
            width: '40px',
            height: '40px',
            backgroundColor: 'var(--color-error-light)',
            color: 'var(--color-error)'
          }}
          aria-hidden="true"
        >
          <AlertCircle size={22} />
        </div>
        <div className="flex-grow-1">
          <h4 className="h6 fw-bold mb-1" style={{ color: 'var(--color-error)' }}>
            {title}
          </h4>
          <p className="text-secondary small mb-3">{message}</p>
          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              icon={RefreshCw}
            >
              Try Again
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorState;
