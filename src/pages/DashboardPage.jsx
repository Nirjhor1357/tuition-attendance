import React, { useMemo } from 'react';
import StatCard from '../components/ui/StatCard';
import EmptyState from '../components/ui/EmptyState';
import { ATTENDANCE_STATUS } from '../db';

function DashboardPage({ students, attendance, activity, onOpenAttendance }) {
  const summary = useMemo(() => {
    const totalStudents = students.length;
    const totalClasses = new Set(attendance.map((row) => row.date)).size;
    const presentLike = attendance.filter(
      (row) => row.status === ATTENDANCE_STATUS.PRESENT || row.status === ATTENDANCE_STATUS.LATE
    ).length;
    const percentage = attendance.length ? Math.round((presentLike / attendance.length) * 100) : 0;

    const lowAttendance = students
      .map((student) => {
        const rows = attendance.filter((row) => row.studentId === student.id);
        const attended = rows.filter(
          (row) => row.status === ATTENDANCE_STATUS.PRESENT || row.status === ATTENDANCE_STATUS.LATE
        ).length;
        const p = rows.length ? Math.round((attended / rows.length) * 100) : 0;
        return { ...student, percentage: p, total: rows.length };
      })
      .filter((student) => student.total > 0 && student.percentage < 75)
      .sort((a, b) => a.percentage - b.percentage)
      .slice(0, 5);

    return { totalStudents, totalClasses, percentage, lowAttendance };
  }, [students, attendance]);

  return (
    <section className="fade-in">
      <div className="stats-grid">
        <StatCard label="Total Students" value={summary.totalStudents} hint="Active in this institute" />
        <StatCard label="Total Classes" value={summary.totalClasses} tone="neutral" hint="Unique class dates" />
        <StatCard label="Attendance %" value={`${summary.percentage}%`} tone="success" hint="Present + late ratio" />
      </div>

      <div className="dashboard-grid">
        <article className="card">
          <div className="section-head">
            <h3>Recent Activity</h3>
          </div>
          {activity.length === 0 ? (
            <EmptyState title="No activity yet" subtitle="Start by adding students or marking attendance." />
          ) : (
            <ul className="activity-list">
              {activity.map((item) => (
                <li key={item.id}>
                  <strong>{item.message}</strong>
                  <span>{new Date(item.createdAt).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          )}
        </article>

        <article className="card">
          <div className="section-head">
            <h3>Low Attendance Alerts</h3>
            <button className="btn btn-light" type="button" onClick={onOpenAttendance}>
              Take Action
            </button>
          </div>
          {summary.lowAttendance.length === 0 ? (
            <EmptyState title="All students are healthy" subtitle="No one is below 75% attendance currently." />
          ) : (
            <div className="risk-list">
              {summary.lowAttendance.map((student) => (
                <div key={student.id} className="risk-item">
                  <p>{student.name}</p>
                  <span>{student.percentage}%</span>
                </div>
              ))}
            </div>
          )}
        </article>
      </div>
    </section>
  );
}

export default DashboardPage;
