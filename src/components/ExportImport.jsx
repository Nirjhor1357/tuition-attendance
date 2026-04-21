import React, { useRef, useState } from 'react';
import { attendanceAPI, dataAPI, studentAPI } from '../db';
import ExcelImporter from './ExcelImporter';

const parseCsvLine = (line) => {
  const values = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  values.push(current.trim());
  return values;
};

function ExportImport({ attendance, students, onDataImported }) {
  const fileInputRef = useRef(null);
  const [message, setMessage] = useState('');

  const exportToCSV = () => {
    const studentMap = Object.fromEntries(students.map((s) => [s.id, s.name]));

    let csv = 'Date,Student Name,Notes\n';
    attendance.forEach((record) => {
      const studentName = studentMap[record.studentId] || 'Unknown';
      csv += `${record.date},"${studentName}","${(record.notes || '').replace(/"/g, '""')}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    setMessage({ type: 'success', text: 'CSV exported successfully!' });
    setTimeout(() => setMessage(''), 3000);
  };

  const exportToJSON = () => {
    const data = {
      exportDate: new Date().toISOString(),
      students: students,
      attendance: attendance,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    setMessage({ type: 'success', text: 'JSON exported successfully!' });
    setTimeout(() => setMessage(''), 3000);
  };

  const handleImportJSON = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (!data.students || !data.attendance) {
        setMessage({
          type: 'error',
          text: 'Invalid JSON format. File must contain students and attendance arrays.',
        });
        return;
      }

      await dataAPI.replaceAllData(data.students, data.attendance);

      onDataImported();
      setMessage({
        type: 'success',
        text: `Imported ${data.students.length} students and ${data.attendance.length} attendance records!`,
      });
      setTimeout(() => setMessage(''), 4000);
    } catch (error) {
      setMessage({
        type: 'error',
        text: `Error importing JSON: ${error.message}`,
      });
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImportCSV = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const lines = text
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);

      if (lines.length < 2) {
        setMessage({
          type: 'error',
          text: 'CSV file is empty or missing attendance rows.',
        });
        return;
      }

      const headers = parseCsvLine(lines[0]);

      // Validate CSV format
      const requiredColumns = [
        'Date',
        'Student Name'
      ];
      const hasRequiredColumns = requiredColumns.every((col) =>
        headers.some((h) => h.includes(col))
      );

      if (!hasRequiredColumns) {
        setMessage({
          type: 'error',
          text: 'Invalid CSV format. Missing required columns: Date, Student Name',
        });
        return;
      }

      const dateIdx = headers.findIndex((h) => h.includes('Date'));
      const studentIdx = headers.findIndex((h) => h.includes('Student'));
      const notesIdx = headers.findIndex((h) => h.includes('Notes'));

      // Parse CSV data
      const records = [];
      for (let i = 1; i < lines.length; i++) {
        const values = parseCsvLine(lines[i]);

        const date = values[dateIdx];
        const studentName = values[studentIdx];
        if (!date || !studentName) continue;

        records.push({
          date,
          studentName,
          notes: notesIdx >= 0 ? values[notesIdx] || '' : '',
        });
      }

      const existingStudents = await studentAPI.getAllStudents();
      const uniqueStudentNames = [...new Set(records.map((r) => r.studentName))];

      for (const name of uniqueStudentNames) {
        const exists = existingStudents.some((s) => s.name === name);
        if (!exists) {
          await studentAPI.addStudent(name);
        }
      }

      const allStudents = await studentAPI.getAllStudents();

      let importedCount = 0;
      for (const record of records) {
        const student = allStudents.find((s) => s.name === record.studentName);
        if (student) {
          const exists = await attendanceAPI.hasAttendance(student.id, record.date);
          if (!exists) {
            await attendanceAPI.recordAttendance(
              student.id,
              record.date,
              record.notes
            );
            importedCount++;
          }
        }
      }

      onDataImported();
      setMessage({
        type: 'success',
        text: `Imported ${importedCount} new attendance records (${records.length - importedCount} duplicates skipped).`,
      });
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage({
        type: 'error',
        text: `Error importing CSV: ${error.message}`,
      });
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const printAttendance = () => {
    const studentMap = Object.fromEntries(students.map((s) => [s.id, s.name]));

    const printWindow = window.open('', '', 'width=900,height=600');
    let html = `
      <html>
      <head>
        <title>Attendance Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { text-align: center; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
          th { background: #667eea; color: white; }
          tr:nth-child(even) { background: #f8f9fa; }
        </style>
      </head>
      <body>
        <h1>Tuition Attendance Report</h1>
        <p><strong>Generated on:</strong> ${new Date().toLocaleString()}</p>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Student Name</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
    `;

    attendance.forEach((record) => {
      html += `
        <tr>
          <td>${new Date(record.date).toLocaleDateString()}</td>
          <td>${studentMap[record.studentId] || 'Unknown'}</td>
          <td>${record.notes || '-'}</td>
        </tr>
      `;
    });

    html += `
          </tbody>
        </table>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 250);
  };

  return (
    <div className="export-import">
      <h2>📥 Export & Import Data</h2>

      {message && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <h3>📤 Export</h3>
      <div className="form-group">
        <button className="btn btn-primary" onClick={exportToCSV}>
          📥 Export to CSV
        </button>
        <button className="btn btn-primary" onClick={exportToJSON}>
          📥 Export to JSON
        </button>
        <button className="btn btn-secondary" onClick={printAttendance}>
          🖨️ Print Report
        </button>
      </div>

      <hr style={{ margin: '30px 0', border: 'none', borderTop: '2px solid #ddd' }} />

      <h3>📤 Import</h3>
      <p style={{ color: '#666', marginBottom: '15px' }}>
        Import previously exported data or data from external sources.
      </p>

      <div className="form-group">
        <div className="form-field">
          <label htmlFor="importJSON">Import JSON File</label>
          <input
            id="importJSON"
            type="file"
            accept=".json"
            onChange={handleImportJSON}
            ref={fileInputRef}
          />
        </div>
      </div>

      <div className="form-group">
        <div className="form-field">
          <label htmlFor="importCSV">Import CSV File</label>
          <input
            id="importCSV"
            type="file"
            accept=".csv"
            onChange={handleImportCSV}
          />
        </div>
      </div>

      <hr style={{ margin: '30px 0', border: 'none', borderTop: '2px solid #ddd' }} />

      <h3>📊 Import from Excel</h3>
      <ExcelImporter onDataImported={onDataImported} />

      <div style={{ marginTop: '30px', padding: '20px', background: '#f8f9fa', borderRadius: '5px' }}>
        <h3>ℹ️ Import Guidelines</h3>
        <ul>
          <li><strong>CSV Format:</strong> Must include columns: Date, Student Name, Notes (optional)</li>
          <li><strong>JSON Format:</strong> Must contain "students" and "attendance" arrays</li>
          <li><strong>Excel Format:</strong> First column should be dates, other columns are student names. Mark attendance with ✓, Yes, P, or any value.</li>
          <li><strong>Duplicate Handling:</strong> New students will be added, attendance records will be appended</li>
          <li><strong>Data Validation:</strong> Invalid files will be rejected with an error message</li>
        </ul>
      </div>
    </div>
  );
}

export default ExportImport;
