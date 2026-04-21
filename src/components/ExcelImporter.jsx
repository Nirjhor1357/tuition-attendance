import React, { useRef, useState } from 'react';
import { studentAPI, attendanceAPI } from '../db';

function ExcelImporter({ onDataImported }) {
  const fileInputRef = useRef(null);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleExcelImport = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setMessage('');

    try {
      // Dynamically import xlsx library
      const XLSX = await import('xlsx');
      
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(worksheet);

      if (data.length === 0) {
        setMessage({ type: 'error', text: 'No data found in Excel file' });
        setIsLoading(false);
        return;
      }

      // Detect date column - check column names and content
      const firstRow = data[0];
      const columns = Object.keys(firstRow);
      
      // Find date column by name patterns
      const datePattern = /date|tarikh|তারিখ|डेट|день|fecha|ngày|ວັນທີ|දින/i;
      let dateCol = columns.find(col => datePattern.test(col));
      
      // If no date column found by name, try to detect by content (first column usually has dates)
      if (!dateCol) {
        dateCol = columns[0]; // Default to first column
        // Check if first column has date-like values
        const firstValue = data[0][dateCol];
        if (firstValue && (typeof firstValue === 'number' || /\d{1,2}[-/]\d{1,2}[-/]\d{2,4}|^\d{4}[-/]\d{2}[-/]\d{2}/.test(String(firstValue)))) {
          // Looks like a date column
        } else {
          setMessage({ 
            type: 'warning', 
            text: `Could not find a date column. Using "${dateCol}" as the date column. If this is incorrect, please rename your date column to "Date".` 
          });
        }
      }

      const studentColumns = columns.filter(col => col !== dateCol && !datePattern.test(col));

      if (studentColumns.length === 0) {
        setMessage({ type: 'error', text: 'No student columns found. Please check your Excel format.' });
        setIsLoading(false);
        return;
      }

      // Get or create students
      const existingStudents = await studentAPI.getAllStudents();
      let studentCount = 0;
      let attendanceCount = 0;

      for (const row of data) {
        const dateValue = row[dateCol];
        if (!dateValue) continue;

        // Parse date (handle Excel serial numbers and date strings)
        let dateStr;
        if (typeof dateValue === 'number') {
          // Excel serial number
          const excelEpoch = new Date(1899, 11, 30);
          const date = new Date(excelEpoch.getTime() + dateValue * 24 * 60 * 60 * 1000);
          dateStr = date.toISOString().split('T')[0];
        } else if (typeof dateValue === 'string') {
          // Try to parse string date
          const parsed = new Date(dateValue);
          if (!isNaN(parsed)) {
            dateStr = parsed.toISOString().split('T')[0];
          } else {
            // Try DD/MM/YYYY format
            const parts = dateValue.split(/[-/]/);
            if (parts.length === 3) {
              const day = parts[0].padStart(2, '0');
              const month = parts[1].padStart(2, '0');
              const year = parts[2].length === 2 ? '20' + parts[2] : parts[2];
              dateStr = `${year}-${month}-${day}`;
            } else {
              continue;
            }
          }
        } else {
          continue;
        }

        // Process each student column
        for (const studentCol of studentColumns) {
          const cellValue = row[studentCol];
          
          // Check if attendance is marked (various formats: ✓, √, Yes, 1, P, Present, etc.)
          const isPresent = cellValue && (
            cellValue === '✓' || 
            cellValue === '√' || 
            cellValue.toString().toLowerCase() === 'yes' ||
            cellValue.toString().toLowerCase() === 'p' ||
            cellValue.toString().toLowerCase() === 'present' ||
            cellValue === 1 ||
            cellValue === '1' ||
            (typeof cellValue === 'string' && cellValue.trim() !== '' && cellValue !== '✗' && cellValue !== 'No' && cellValue !== 'A')
          );

          if (isPresent) {
            // Find or create student
            const studentName = studentCol.trim();
            let student = existingStudents.find(s => s.name.toLowerCase() === studentName.toLowerCase());
            
            if (!student) {
              const id = await studentAPI.addStudent(studentName);
              student = { id, name: studentName };
              existingStudents.push(student);
              studentCount++;
            }

            const exists = await attendanceAPI.hasAttendance(student.id, dateStr);
            if (!exists) {
              await attendanceAPI.recordAttendance(
                student.id,
                dateStr,
                ''
              );
              attendanceCount++;
            }
          }
        }
      }

      onDataImported();
      setMessage({
        type: 'success',
        text: `✓ Imported ${attendanceCount} attendance records from ${studentCount} new/existing students!`
      });
      setTimeout(() => setMessage(''), 4000);

    } catch (error) {
      console.error('Import error:', error);
      setMessage({
        type: 'error',
        text: `Error importing Excel: ${error.message}`
      });
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="excel-importer">
      <div style={{ padding: '20px', background: '#e7f3ff', border: '1px solid #b3d9ff', borderRadius: '5px', marginBottom: '20px' }}>
        <h3 style={{ margin: '0 0 10px 0', color: '#0066cc' }}>📊 Import from Excel</h3>
        <p style={{ margin: '0', color: '#333', fontSize: '0.95em' }}>
          Upload attendance sheets from Excel files. Each column represents a student, and each row represents a date.
        </p>
      </div>

      {message && (
        <div className={`message ${message.type}`} style={{ marginBottom: '20px' }}>
          {message.text}
        </div>
      )}

      <div className="form-group">
        <div className="form-field">
          <label htmlFor="excelFile">Select Excel File (.xlsx)</label>
          <input
            id="excelFile"
            type="file"
            accept=".xlsx,.xls"
            onChange={handleExcelImport}
            ref={fileInputRef}
            disabled={isLoading}
          />
        </div>
        {isLoading && (
          <div style={{ marginTop: '10px', color: '#666' }}>
            <span>Processing...</span>
          </div>
        )}
      </div>

      <div style={{ marginTop: '30px', padding: '20px', background: '#f8f9fa', borderRadius: '5px' }}>
        <h3>📋 Excel Format Requirements</h3>
        <ul style={{ color: '#666', lineHeight: '1.8' }}>
          <li><strong>First column:</strong> Should contain dates (any format)</li>
          <li><strong>Other columns:</strong> Each column header is a student name</li>
          <li><strong>Cell values:</strong> Mark attendance with ✓, √, Yes, P, Present, or any non-empty value</li>
          <li><strong>Empty cells:</strong> Mean the student was absent</li>
          <li><strong>Multiple files:</strong> Import them one by one - data will be combined</li>
        </ul>
      </div>
    </div>
  );
}

export default ExcelImporter;
