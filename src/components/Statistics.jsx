import React from 'react';

function Statistics({ stats, students = [], attendance = [] }) {
  const studentStats = students
    .map((student) => {
      const records = attendance.filter((record) => record.studentId === student.id);
      const sortedRecords = [...records].sort((a, b) => String(a.date).localeCompare(String(b.date)));

      return {
        id: student.id,
        name: student.name,
        totalClasses: records.length,
        firstDate: sortedRecords[0]?.date || null,
        lastDate: sortedRecords[sortedRecords.length - 1]?.date || null,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="statistics-panel">
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

      <div className="student-stats-section">
        <h3>Student Stats</h3>
        <div className="student-stats-grid">
          {studentStats.length === 0 ? (
            <div className="empty-state student-stats-empty">
              <div className="empty-state-icon">👤</div>
              <p>No student stats available yet.</p>
            </div>
          ) : (
            studentStats.map((student) => (
              <div className="student-stat-card" key={student.id}>
                <div className="student-stat-name">{student.name}</div>
                <div className="student-stat-value">{student.totalClasses}</div>
                <div className="student-stat-label">Classes taken</div>
                <div className="student-stat-meta">
                  <span>First: {student.firstDate ? new Date(student.firstDate).toLocaleDateString() : '-'}</span>
                  <span>Last: {student.lastDate ? new Date(student.lastDate).toLocaleDateString() : '-'}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Statistics;
