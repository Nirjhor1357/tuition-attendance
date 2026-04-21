import React from 'react';

function LoadingBlock({ label = 'Loading data...' }) {
  return (
    <div className="loading-block" role="status" aria-live="polite">
      <span className="spinner" />
      <span>{label}</span>
    </div>
  );
}

export default LoadingBlock;
