const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const files = [
  'C:/Users/nowsh/Downloads/Afrah (Chandgaon) Attendance Sheet [2025].xlsx',
  'C:/Users/nowsh/Downloads/Takrim (2 No. Gate) Attendance Sheet [2025].xlsx',
];

const monthMap = {
  Jan: 1,
  Feb: 2,
  Mar: 3,
  Apr: 4,
  May: 5,
  Jun: 6,
  Jul: 7,
  Aug: 8,
  Sep: 9,
  Oct: 10,
  Nov: 11,
  Dec: 12,
};

function isPresent(v) {
  if (v == null) return false;
  if (typeof v === 'boolean') return v;
  const s = String(v).trim().toLowerCase();
  if (!s) return false;
  if (['false', 'a', 'absent', 'no', 'n', '0', '-', 'x', '✗'].includes(s)) return false;
  return ['true', '1', 'yes', 'y', 'p', 'present', '✓', '√'].includes(s) || !!s;
}

function parseFile(filePath) {
  const wb = XLSX.readFile(filePath);
  const students = new Set();
  const attendance = [];

  for (const sheetName of wb.SheetNames) {
    if (sheetName === '2025 Attendance Summary') continue;
    const month = monthMap[sheetName];
    if (!month) continue;

    const ws = wb.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });

    const headerIndex = rows.findIndex((r) => String(r[0] || '').trim() === 'Students');
    if (headerIndex < 0) continue;

    const dayRow = rows[headerIndex - 2] || [];
    const studentRow = rows[headerIndex + 1] || [];
    const studentName = String(studentRow[0] || '').trim();
    if (!studentName) continue;
    students.add(studentName);

    const year = 2025;
    for (let c = 6; c < studentRow.length; c++) {
      const dayNum = Number(dayRow[c]);
      if (!dayNum || Number.isNaN(dayNum)) continue;
      if (!isPresent(studentRow[c])) continue;

      const date = `${year}-${String(month).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      attendance.push({ studentName, date, notes: '' });
    }
  }

  return {
    students: Array.from(students),
    attendance,
  };
}

function main() {
  const allStudents = new Set();
  const allAttendance = [];

  for (const file of files) {
    if (!fs.existsSync(file)) {
      console.warn(`Missing file: ${file}`);
      continue;
    }
    const { students, attendance } = parseFile(file);
    students.forEach((s) => allStudents.add(s));
    allAttendance.push(...attendance);
  }

  const dedup = new Set();
  const attendance = [];
  for (const rec of allAttendance) {
    const k = `${rec.studentName}__${rec.date}`;
    if (dedup.has(k)) continue;
    dedup.add(k);
    attendance.push(rec);
  }

  const output = {
    students: Array.from(allStudents).sort().map((name) => ({ name })),
    attendance,
  };

  const outPath = path.join(__dirname, '..', 'src', 'data', 'preloadedAttendance.json');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2), 'utf8');

  console.log(`Generated: ${outPath}`);
  console.log(`Students: ${output.students.length}`);
  console.log(`Attendance records: ${output.attendance.length}`);
}

main();
