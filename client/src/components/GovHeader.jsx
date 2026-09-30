import React from 'react';
import GovernmentBar from './GovernmentBar';

/**
 * GovHeader adapter wrapping GovernmentBar for backwards compatibility
 */
const GovHeader = () => {
  return <GovernmentBar />;
};

export default GovHeader;
