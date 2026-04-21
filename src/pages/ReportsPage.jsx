import React, { useMemo, useState } from 'react';
import { ATTENDANCE_STATUS, analyticsAPI } from '../db';
import { exportService } from '../services/exportService';

function BarChart({ rows }) {
  const max = Math.max(1, ...rows.map((item) => item.total));
  return (
    <div className="chart card">
      <h4>Monthly Attendance Volume</h4>
      <div className="bars">
        {rows.map((item) => (
          <div key={item.month} className="bar-group">
            <div className="bar-stack">
              <span className="bar present" style={{ height: `${(item.present / max) * 100}%` }} />
              <span className="bar late" style={{ height: `${(item.late / max) * 100}%` }} />
              <span className="bar absent" style={{ height: `${(item.absent / max) * 100}%` }} />
            </div>
            <label>{item.month.slice(5)}</label>
          </div>
        ))}
      </div>
    </div>
  );
}

function LineChart({ rows }) {
  const max = Math.max(1, ...rows.map((item) => item.percentage));
  return (
    <div className="chart card">
      <h4>Student Attendance Percentage</h4>
      <div className="line-points">
        {rows.map((item) => (
          <div key={item.studentId} className="line-point" title={`${item.name}: ${item.percentage}%`}>
            <span style={{ height: `${(item.percentage / max) * 100}%` }} />
            <label>{item.name.split(' ')[0]}</label>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReportsPage({ students, attendance }) {
  const [target, setTarget] = useState(75);
  const [selectedStudentId, setSelectedStudentId] = useState('');

  const studentReport = useMemo(() => {
    return students
      .map((student) => {
        const rows = attendance.filter((item) => item.studentId === student.id);
        const presentLike = rows.filter(
          (item) => item.status === ATTENDANCE_STATUS.PRESENT || item.status === ATTENDANCE_STATUS.LATE
        ).length;

        return {
          studentId: student.id,
          name: student.name,
          batch: student.batch || 'General',
          total: rows.length,
          presentLike,
          percentage: rows.length ? Math.round((presentLike / rows.length) * 100) : 0,
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [students, attendance]);

  const monthlyReport = useMemo(() => {
    const map = attendance.reduce((acc, row) => {
      const month = row.date.slice(0, 7);
      if (!acc[month]) {
        acc[month] = { month, present: 0, absent: 0, late: 0, total: 0 };
      }
      acc[month].total += 1;
      if (row.status === ATTENDANCE_STATUS.PRESENT) acc[month].present += 1;
      if (row.status === ATTENDANCE_STATUS.ABSENT) acc[month].absent += 1;
      if (row.status === ATTENDANCE_STATUS.LATE) acc[month].late += 1;
      return acc;
    }, {});

    return Object.values(map).sort((a, b) => a.month.localeCompare(b.month));
  }, [attendance]);

  const selectedStudent = studentReport.find((item) => String(item.studentId) === selectedStudentId);
  const calculator = selectedStudent
    ? analyticsAPI.calculateClassesToAttend({
        presentCount: selectedStudent.presentLike,
        totalCount: selectedStudent.total,
        targetPercentage: target,
      })
    : { toAttend: 0, canSkip: 0 };

  const exportCsv = () => {
    exportService.downloadCsv(
      `attendance_report_${new Date().toISOString().slice(0, 10)}.csv`,
      ['Student', 'Batch', 'Attended', 'Total', 'Percentage'],
      studentReport.map((item) => [item.name, item.batch, item.presentLike, item.total, `${item.percentage}%`])
    );
  };

  const exportPdf = () => {
    const rows = studentReport
      .map(
        (item) =>
          `<tr><td>${item.name}</td><td>${item.batch}</td><td>${item.presentLike}/${item.total}</td><td>${item.percentage}%</td></tr>`
      )
      .join('');

    exportService.exportReportPdf(
      'Attendance Report',
      `<table><thead><tr><th>Student</th><th>Batch</th><th>Record</th><th>Percentage</th></tr></thead><tbody>${rows}</tbody></table>`
    );
  };

  return (
    <section className="fade-in reports-layout">
      <article className="card">
        <div className="section-head">
          <h3>Analytics & Reports</h3>
          <div className="inline-actions">
            <button className="btn btn-light" type="button" onClick={exportCsv}>
              Export CSV
            </button>
            <button className="btn btn-primary" type="button" onClick={exportPdf}>
              Export PDF
            </button>
          </div>
        </div>

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Batch</th>
                <th>Attendance</th>
                <th>Percentage</th>
              </tr>
            </thead>
            <tbody>
              {studentReport.map((item) => (
                <tr key={item.studentId} className={item.percentage < 75 ? 'warn-row' : ''}>
                  <td>{item.name}</td>
                  <td>{item.batch}</td>
                  <td>
                    {item.presentLike}/{item.total}
                  </td>
                  <td>{item.percentage}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>

      <div className="chart-grid">
        <BarChart rows={monthlyReport} />
        <LineChart rows={studentReport} />
      </div>

      <article className="card calculator-card">
        <h3>Classes to Skip / Attend Calculator</h3>
        <div className="grid-form">
          <label>
            Student
            <select value={selectedStudentId} onChange={(e) => setSelectedStudentId(e.target.value)}>
              <option value="">Select student</option>
              {studentReport.map((row) => (
                <option key={row.studentId} value={row.studentId}>
                  {row.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Target Attendance %
            <input
              type="number"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              min={1}
              max={99}
            />
          </label>
        </div>

        {selectedStudent ? (
          <div className="calc-result">
            <p>
              To reach {target}% attendance, <strong>{selectedStudent.name}</strong> should attend at least{' '}
              <strong>{calculator.toAttend}</strong> more consecutive classes.
            </p>
            <p>
              They can still skip up to <strong>{calculator.canSkip}</strong> classes while staying above target.
            </p>
          </div>
        ) : (
          <p>Select a student to run the calculator.</p>
        )}
      </article>
    </section>
  );
}

export default ReportsPage;
