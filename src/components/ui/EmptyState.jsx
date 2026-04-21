import React from 'react';

function EmptyState({ title, subtitle, action }) {
  return (
    <div className="empty-state-v2">
      <h3>{title}</h3>
      <p>{subtitle}</p>
      {action ? <div>{action}</div> : null}
    </div>
  );
}

export default EmptyState;
