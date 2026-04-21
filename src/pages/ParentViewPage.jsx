import React from 'react';
import { ATTENDANCE_STATUS } from '../db';

function ParentViewPage({ students, attendance }) {
  const rows = students
    .map((student) => {
      const records = attendance.filter((item) => item.studentId === student.id);
      const attended = records.filter(
        (item) => item.status === ATTENDANCE_STATUS.PRESENT || item.status === ATTENDANCE_STATUS.LATE
      ).length;
      const percentage = records.length ? Math.round((attended / records.length) * 100) : 0;

      return {
        id: student.id,
        name: student.name,
        batch: student.batch,
        percentage,
        lastClass: records.length ? records.sort((a, b) => b.date.localeCompare(a.date))[0].date : '-',
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <section className="fade-in">
      <article className="card">
        <h3>Parent Read-Only Dashboard</h3>
        <p>Share this screen with guardians to provide transparent attendance progress.</p>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Batch</th>
                <th>Attendance</th>
                <th>Last Class</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>{row.name}</td>
                  <td>{row.batch || 'General'}</td>
                  <td>{row.percentage}%</td>
                  <td>{row.lastClass === '-' ? '-' : new Date(row.lastClass).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  );
}

export default ParentViewPage;
