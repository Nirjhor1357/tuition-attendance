import React from 'react';

function StatCard({ label, value, hint, tone = 'primary' }) {
  return (
    <div className={`stat-card-v2 tone-${tone}`}>
      <p className="stat-label-v2">{label}</p>
      <h3>{value}</h3>
      {hint ? <p className="stat-hint-v2">{hint}</p> : null}
    </div>
  );
}

export default StatCard;
