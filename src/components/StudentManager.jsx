import React, { useState } from 'react';

function StudentManager({ students, onAddStudent, onDeleteStudent }) {
  const [newStudentName, setNewStudentName] = useState('');
  const [message, setMessage] = useState('');

  const handleAddStudent = () => {
    if (!newStudentName.trim()) {
      setMessage({ type: 'error', text: 'Please enter a student name' });
      return;
    }

    if (students.some(s => s.name.toLowerCase() === newStudentName.toLowerCase())) {
      setMessage({ type: 'error', text: 'Student already exists' });
      return;
    }

    onAddStudent(newStudentName.trim());
    setNewStudentName('');
    setMessage({ type: 'success', text: 'Student added successfully!' });
    setTimeout(() => setMessage(''), 3000);
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this student? This will also delete their attendance records.')) {
      onDeleteStudent(id);
      setMessage({ type: 'success', text: 'Student deleted successfully!' });
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <div className="student-manager">
      <h2>👥 Manage Students</h2>

      {message && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="form-group">
        <div className="form-field" style={{ flex: 1, minWidth: '200px' }}>
          <label htmlFor="studentName">Add New Student</label>
          <input
            id="studentName"
            type="text"
            placeholder="Enter student name"
            value={newStudentName}
            onChange={(e) => setNewStudentName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddStudent()}
          />
        </div>
        <button className="btn btn-primary" onClick={handleAddStudent}>
          Add Student
        </button>
      </div>

      <h3>Current Students ({students.length})</h3>

      {students.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">👥</div>
          <p>No students added yet. Add your first student above!</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Added Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id}>
                  <td>{student.name}</td>
                  <td>{new Date(student.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button
                      className="btn btn-danger btn-small"
                      onClick={() => handleDelete(student.id)}
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
    </div>
  );
}

export default StudentManager;
