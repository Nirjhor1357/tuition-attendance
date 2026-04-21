import React from 'react';

function Statistics({ stats }) {
  return (
    <div className="statistics">
      <div className="stat-card">
        <div className="stat-label">📊 Total Records</div>
        <div className="stat-value">{stats.totalRecords || 0}</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">👥 Students</div>
        <div className="stat-value">{stats.studentCount || 0}</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">📚 Classes</div>
        <div className="stat-value">{stats.classCount || 0}</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">📅 Sessions</div>
        <div className="stat-value">{stats.sessionCount || 0}</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">✓ Present Count</div>
        <div className="stat-value">{stats.presentCount || 0}</div>
      </div>
    </div>
  );
}

export default Statistics;
