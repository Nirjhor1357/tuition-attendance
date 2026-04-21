import React, { useState } from 'react';

function AttendanceTable({ attendance, students, onDeleteAttendance }) {
  const [filterDate, setFilterDate] = useState('');
  const [filterStudent, setFilterStudent] = useState('');

  const studentMap = Object.fromEntries(students.map((s) => [s.id, s.name]));

  const openStudentWindow = (studentId) => {
    const studentName = studentMap[studentId] || 'Unknown';
    const studentRecords = attendance
      .filter((record) => record.studentId === studentId)
      .sort((a, b) => String(b.date).localeCompare(String(a.date)));

    const detailWindow = window.open('', '_blank', 'width=900,height=700');
    if (!detailWindow) return;

    const totalClasses = studentRecords.length;
    const firstDate = totalClasses ? new Date(studentRecords[0].date).toLocaleDateString() : '-';
    const lastDate = totalClasses ? new Date(studentRecords[studentRecords.length - 1].date).toLocaleDateString() : '-';

    detailWindow.document.write(`
      <html>
        <head>
          <title>${studentName} - Attendance</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 24px; color: #222; background: #f7f8fc; }
            h1, h2, p, li, td, th { color: #222; }
            .card { background: #fff; border: 1px solid #e5e7eb; border-radius: 10px; padding: 16px; margin-bottom: 16px; }
            .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 16px; }
            .stat { background: linear-gradient(135deg, #667eea, #764ba2); color: #fff; border-radius: 10px; padding: 14px; }
            table { width: 100%; border-collapse: collapse; background: #fff; }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
            th { background: #667eea; color: #fff; }
            tr:nth-child(even) { background: #f8f9fa; }
          </style>
        </head>
        <body>
          <h1>${studentName}</h1>
          <div class="stats">
            <div class="stat"><strong>Total Classes</strong><br>${totalClasses}</div>
            <div class="stat"><strong>First Attendance</strong><br>${firstDate}</div>
            <div class="stat"><strong>Last Attendance</strong><br>${lastDate}</div>
          </div>
          <div class="card">
            <h2>Attendance Records</h2>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                ${studentRecords.map((record) => `
                  <tr>
                    <td>${new Date(record.date).toLocaleDateString()}</td>
                    <td>${record.notes || '-'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </body>
      </html>
    `);
    detailWindow.document.close();
  };

  // Filter attendance records
  const filteredAttendance = attendance.filter((record) => {
    if (filterDate && record.date !== filterDate) return false;
    if (filterStudent && record.studentId !== parseInt(filterStudent)) return false;
    return true;
  });

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this record?')) {
      onDeleteAttendance(id);
    }
  };

  return (
    <div className="attendance-table">
      <h2>📊 Attendance Records</h2>

      <div className="form-group">
        <div className="form-field">
          <label htmlFor="filterDate">Filter by Date</label>
          <input
            id="filterDate"
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
        </div>
        <div className="form-field">
          <label htmlFor="filterStudent">Filter by Student</label>
          <select
            id="filterStudent"
            value={filterStudent}
            onChange={(e) => setFilterStudent(e.target.value)}
          >
            <option value="">All Students</option>
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.name}
              </option>
            ))}
          </select>
        </div>
        <button
          className="btn btn-secondary btn-small"
          onClick={() => {
            setFilterDate('');
            setFilterStudent('');
          }}
        >
          Clear Filters
        </button>
      </div>

      {filteredAttendance.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📊</div>
          <p>
            {attendance.length === 0
              ? 'No attendance records yet. Start recording attendance in the "Record Attendance" tab.'
              : 'No records match your filters. Try adjusting them.'}
          </p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Student Name</th>
                <th>Notes</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredAttendance.map((record) => (
                <tr key={record.id}>
                  <td>{new Date(record.date).toLocaleDateString()}</td>
                  <td>
                    <button
                      className="student-link"
                      onClick={() => openStudentWindow(record.studentId)}
                      type="button"
                    >
                      {studentMap[record.studentId] || 'Unknown'}
                    </button>
                  </td>
                  <td>{record.notes || '-'}</td>
                  <td>
                    <button
                      className="btn btn-danger btn-small"
                      onClick={() => handleDelete(record.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p style={{ marginTop: '15px', color: '#666', fontSize: '0.9em' }}>
        Showing {filteredAttendance.length} of {attendance.length} records
      </p>
    </div>
  );
}

export default AttendanceTable;
