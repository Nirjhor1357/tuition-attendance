import React, { useState } from 'react';

function AttendanceRecorder({ students, onRecordAttendance }) {
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [notes, setNotes] = useState('');
  const [message, setMessage] = useState('');

  const handleStudentToggle = (studentId) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleRecordAttendance = async () => {
    if (!attendanceDate) {
      setMessage({ type: 'error', text: 'Please select a date' });
      return;
    }

    if (selectedStudents.length === 0) {
      setMessage({ type: 'error', text: 'Please select at least one student' });
      return;
    }

    try {
      await onRecordAttendance(selectedStudents, attendanceDate, notes);
      setNotes('');
      setSelectedStudents([]);
      setAttendanceDate(new Date().toISOString().split('T')[0]);
      setMessage({ type: 'success', text: 'Attendance recorded successfully!' });
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Error recording attendance' });
    }
  };

  const selectAll = () => {
    setSelectedStudents(students.map((s) => s.id));
  };

  const clearSelection = () => {
    setSelectedStudents([]);
  };

  return (
    <div className="attendance-recorder">
      <h2>📝 Record Attendance</h2>

      {message && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="form-group">
        <div className="form-field">
          <label htmlFor="attendanceDate">Date</label>
          <input
            id="attendanceDate"
            type="date"
            value={attendanceDate}
            onChange={(e) => setAttendanceDate(e.target.value)}
          />
        </div>
      </div>

      <div className="form-group">
        <div className="form-field" style={{ width: '100%' }}>
          <label htmlFor="notes">Notes (Optional)</label>
          <textarea
            id="notes"
            placeholder="Add any notes about this session"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows="3"
          />
        </div>
      </div>

      <div className="form-group">
        <button className="btn btn-secondary btn-small" onClick={selectAll}>
          Select All
        </button>
        <button className="btn btn-secondary btn-small" onClick={clearSelection}>
          Clear Selection
        </button>
      </div>

      {students.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">👥</div>
          <p>No students added yet. Please add students first in the "Manage Students" tab.</p>
        </div>
      ) : (
        <div>
          <h3>Select Students Present ({selectedStudents.length} / {students.length})</h3>
          <div className="checkbox-wrapper">
            {students.map((student) => (
              <label key={student.id} className="checkbox-item">
                <input
                  type="checkbox"
                  checked={selectedStudents.includes(student.id)}
                  onChange={() => handleStudentToggle(student.id)}
                />
                <span>{student.name}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginTop: '30px' }}>
        <button className="btn btn-primary" onClick={handleRecordAttendance}>
          Record Attendance
        </button>
      </div>
    </div>
  );
}

export default AttendanceRecorder;
