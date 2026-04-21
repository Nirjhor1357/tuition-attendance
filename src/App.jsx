import React, { useState, useEffect } from 'react';
import './App.css';
import StudentManager from './components/StudentManager';
import AttendanceRecorder from './components/AttendanceRecorder';
import AttendanceTable from './components/AttendanceTable';
import Statistics from './components/Statistics';
import ExportImport from './components/ExportImport';
import { studentAPI, attendanceAPI, analyticsAPI } from './db';
import preloadedAttendance from './data/preloadedAttendance.json';

function App() {
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [stats, setStats] = useState({});
  const [activeTab, setActiveTab] = useState('record');

  // Load initial data
  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = async () => {
    try {
      await seedPreloadedAttendance();
      await loadData();
    } catch (error) {
      console.error('Error initializing data:', error);
      await loadData();
    }
  };

  const seedPreloadedAttendance = async () => {
    if (!preloadedAttendance?.students?.length || !preloadedAttendance?.attendance?.length) {
      return;
    }

    const existingStudents = await studentAPI.getAllStudents();
    const studentMap = new Map(existingStudents.map((s) => [s.name.toLowerCase(), s.id]));

    for (const student of preloadedAttendance.students) {
      const name = String(student.name || '').trim();
      if (!name) continue;
      const key = name.toLowerCase();
      if (!studentMap.has(key)) {
        const id = await studentAPI.addStudent(name);
        studentMap.set(key, id);
      }
    }

    const existingAttendance = await attendanceAPI.getAllAttendance();
    const attendanceKeys = new Set(existingAttendance.map((r) => `${r.studentId}__${r.date}`));

    for (const record of preloadedAttendance.attendance) {
      const studentName = String(record.studentName || '').trim().toLowerCase();
      const date = String(record.date || '').trim();
      if (!studentName || !date) continue;

      const studentId = studentMap.get(studentName);
      if (!studentId) continue;

      const key = `${studentId}__${date}`;
      if (attendanceKeys.has(key)) continue;

      await attendanceAPI.recordAttendance(studentId, date, record.notes || '');
      attendanceKeys.add(key);
    }
  };

  const loadData = async () => {
    try {
      const studentsData = await studentAPI.getAllStudents();
      const attendanceData = await attendanceAPI.getAllAttendance();
      const statsData = await analyticsAPI.getTotalStatistics();
      
      setStudents(studentsData);
      setAttendance(attendanceData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleAddStudent = async (name) => {
    try {
      await studentAPI.addStudent(name);
      await loadData();
    } catch (error) {
      console.error('Error adding student:', error);
    }
  };

  const handleDeleteStudent = async (id) => {
    try {
      await studentAPI.deleteStudent(id);
      await attendanceAPI.deleteAttendanceByStudent(id);
      await loadData();
    } catch (error) {
      console.error('Error deleting student:', error);
    }
  };

  const handleRecordAttendance = async (studentIds, date, notes = '') => {
    try {
      for (const studentId of studentIds) {
        await attendanceAPI.recordAttendance(studentId, date, notes);
      }
      await loadData();
    } catch (error) {
      console.error('Error recording attendance:', error);
    }
  };

  const handleDeleteAttendance = async (id) => {
    try {
      await attendanceAPI.deleteAttendance(id);
      await loadData();
    } catch (error) {
      console.error('Error deleting attendance:', error);
    }
  };

  const handleDataImported = async () => {
    await loadData();
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>📚 Tuition Attendance Tracker</h1>
        <p className="subtitle">Manage and track student attendance efficiently</p>
      </header>

      <div className="app-container">
        <nav className="tabs">
          <button 
            className={`tab ${activeTab === 'record' ? 'active' : ''}`}
            onClick={() => setActiveTab('record')}
          >
            📝 Record Attendance
          </button>
          <button 
            className={`tab ${activeTab === 'students' ? 'active' : ''}`}
            onClick={() => setActiveTab('students')}
          >
            👥 Manage Students
          </button>
          <button 
            className={`tab ${activeTab === 'view' ? 'active' : ''}`}
            onClick={() => setActiveTab('view')}
          >
            📊 View Records
          </button>
          <button 
            className={`tab ${activeTab === 'export' ? 'active' : ''}`}
            onClick={() => setActiveTab('export')}
          >
            📥 Export/Import
          </button>
        </nav>

        <Statistics stats={stats} />

        <div className="content">
          {activeTab === 'record' && (
            <AttendanceRecorder
              students={students}
              onRecordAttendance={handleRecordAttendance}
            />
          )}

          {activeTab === 'students' && (
            <StudentManager
              students={students}
              onAddStudent={handleAddStudent}
              onDeleteStudent={handleDeleteStudent}
            />
          )}

          {activeTab === 'view' && (
            <AttendanceTable
              attendance={attendance}
              students={students}
              onDeleteAttendance={handleDeleteAttendance}
            />
          )}

          {activeTab === 'export' && (
            <ExportImport
              attendance={attendance}
              students={students}
              onDataImported={handleDataImported}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
