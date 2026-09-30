import React from 'react';

const LoadingSkeleton = ({ count = 3, type = 'card' }) => {
  if (type === 'table') {
    return (
      <div className="civic-card p-3 my-3">
        <div className="civic-skeleton mb-3" style={{ height: '36px', width: '100%' }} />
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="civic-skeleton mb-2" style={{ height: '28px', width: '100%' }} />
        ))}
      </div>
    );
  }

  if (type === 'stat') {
    return (
      <div className="row g-3">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="col-md-3 col-sm-6">
            <div className="civic-card p-3">
              <div className="civic-skeleton mb-2" style={{ height: '14px', width: '50%' }} />
              <div className="civic-skeleton" style={{ height: '32px', width: '70%' }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="row g-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="col-lg-4 col-md-6">
          <div className="civic-card h-100 p-4">
            <div className="civic-skeleton mb-3" style={{ height: '22px', width: '35%' }} />
            <div className="civic-skeleton mb-2" style={{ height: '26px', width: '85%' }} />
            <div className="civic-skeleton mb-4" style={{ height: '48px', width: '100%' }} />
            <div className="civic-card-muted mb-4">
              <div className="civic-skeleton mb-2" style={{ height: '16px', width: '90%' }} />
              <div className="civic-skeleton" style={{ height: '16px', width: '75%' }} />
            </div>
            <div className="d-flex gap-2">
              <div className="civic-skeleton" style={{ height: '44px', width: '50%' }} />
              <div className="civic-skeleton" style={{ height: '44px', width: '50%' }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LoadingSkeleton;
