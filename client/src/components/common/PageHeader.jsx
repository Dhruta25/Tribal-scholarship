import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const PageHeader = ({
  title,
  subtitle,
  category = 'Ministry of Tribal Affairs',
  breadcrumbs = [],
  action = null
}) => {
  return (
    <div className="mb-4 pb-2 border-bottom">
      {breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="mb-2">
          <ol className="d-flex align-items-center gap-1 list-unstyled small text-secondary mb-0 flex-wrap">
            <li>
              <Link to="/" className="text-secondary text-decoration-none hover-underline">
                Home
              </Link>
            </li>
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={idx}>
                <li>
                  <ChevronRight size={14} className="mx-1 opacity-50" />
                </li>
                <li>
                  {crumb.path ? (
                    <Link to={crumb.path} className="text-secondary text-decoration-none">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="fw-semibold text-primary" aria-current="page">
                      {crumb.label}
                    </span>
                  )}
                </li>
              </React.Fragment>
            ))}
          </ol>
        </nav>
      )}

      <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
        <div>
          {category && <div className="civic-tag mb-2">{category}</div>}
          <h1 className="h2 fw-bold text-primary mb-1" style={{ letterSpacing: '-0.02em' }}>
            {title}
          </h1>
          {subtitle && (
            <p className="text-secondary mb-0" style={{ maxWidth: '800px', fontSize: '1.05rem' }}>
              {subtitle}
            </p>
          )}
        </div>
        {action && <div className="d-flex align-items-center gap-2">{action}</div>}
      </div>
    </div>
  );
};

export default PageHeader;
