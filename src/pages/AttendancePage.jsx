import React, { useMemo, useState } from 'react';
import EmptyState from '../components/ui/EmptyState';
import { ATTENDANCE_STATUS } from '../db';

const STATUS_OPTIONS = [
  ATTENDANCE_STATUS.PRESENT,
  ATTENDANCE_STATUS.ABSENT,
  ATTENDANCE_STATUS.LATE,
];

function AttendancePage({ students, attendance, onSaveAttendance }) {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [statusMap, setStatusMap] = useState({});
  const [notesMap, setNotesMap] = useState({});
  const [saving, setSaving] = useState(false);

  const recordsForDate = useMemo(() => {
    return attendance.filter((row) => row.date === date);
  }, [attendance, date]);

  const mergedRows = useMemo(() => {
    const byStudent = Object.fromEntries(recordsForDate.map((row) => [row.studentId, row]));
    return students.map((student) => {
      const existing = byStudent[student.id];
      return {
        student,
        status: statusMap[student.id] || existing?.status || ATTENDANCE_STATUS.ABSENT,
        notes: notesMap[student.id] || existing?.notes || '',
      };
    });
  }, [students, recordsForDate, statusMap, notesMap]);

  const markAllPresent = () => {
    const next = {};
    students.forEach((student) => {
      next[student.id] = ATTENDANCE_STATUS.PRESENT;
    });
    setStatusMap(next);
  };

  const saveBulk = async () => {
    setSaving(true);
    try {
      await onSaveAttendance(
        date,
        mergedRows.map((row) => ({
          studentId: row.student.id,
          status: row.status,
          notes: row.notes,
        }))
      );
      setStatusMap({});
      setNotesMap({});
    } finally {
      setSaving(false);
    }
  };

  if (students.length === 0) {
    return <EmptyState title="No students yet" subtitle="Add students before marking attendance." />;
  }

  return (
    <section className="fade-in">
      <article className="card">
        <div className="section-head">
          <h3>Mark Attendance</h3>
          <div className="inline-actions">
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            <button className="btn btn-light" onClick={markAllPresent} type="button">
              Mark All Present
            </button>
            <button className="btn btn-primary" onClick={saveBulk} type="button" disabled={saving}>
              {saving ? 'Saving...' : 'Save Attendance'}
            </button>
          </div>
        </div>

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Batch</th>
                <th>Status</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {mergedRows.map((row) => (
                <tr key={row.student.id}>
                  <td>{row.student.name}</td>
                  <td>{row.student.batch || 'General'}</td>
                  <td>
                    <select
                      value={row.status}
                      onChange={(e) =>
                        setStatusMap((prev) => ({ ...prev, [row.student.id]: e.target.value }))
                      }
                    >
                      {STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input
                      value={row.notes}
                      onChange={(e) =>
                        setNotesMap((prev) => ({ ...prev, [row.student.id]: e.target.value }))
                      }
                      placeholder="Optional note"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  );
}

export default AttendancePage;
