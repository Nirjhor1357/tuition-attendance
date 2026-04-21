import React from 'react';

function Statistics({ stats }) {
  return (
    <div className="statistics">
      <div className="stat-card">
        <div className="stat-label">📊 Total Classes Recorded</div>
        <div className="stat-value">{stats.totalRecords || 0}</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">👥 Students</div>
        <div className="stat-value">{stats.studentCount || 0}</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">📅 Sessions</div>
        <div className="stat-value">{stats.sessionCount || 0}</div>
      </div>
    </div>
  );
}

export default Statistics;
