import React, { useState } from 'react';

function AttendanceTable({ attendance, students, onDeleteAttendance }) {
  const [filterDate, setFilterDate] = useState('');
  const [filterStudent, setFilterStudent] = useState('');

  const studentMap = Object.fromEntries(students.map((s) => [s.id, s.name]));

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
                  <td>{studentMap[record.studentId] || 'Unknown'}</td>
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
