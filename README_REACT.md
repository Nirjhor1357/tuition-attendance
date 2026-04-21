# 📚 Tuition Attendance Tracker - React Edition

A modern, full-featured attendance tracking system for tuition classes built with React and Vite, using IndexedDB for persistent local data storage.

## ✨ Features

### Core Functionality
- **Student Management** - Add, view, and manage students
- **Attendance Recording** - Record attendance by date and class
- **Data Persistence** - All data stored locally in IndexedDB (no server needed)
- **Statistics Dashboard** - Real-time attendance statistics and insights
- **Advanced Filtering** - Filter records by date, class, or student
- **Export/Import** - CSV and JSON import/export for data backup and sharing

### Technical Stack
- **Frontend**: React 18 with Vite
- **Database**: Dexie.js (IndexedDB wrapper)
- **Styling**: CSS3 with responsive design
- **State Management**: React Hooks
- **Build Tool**: Vite

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm/yarn

### Installation

1. Clone or navigate to the project directory:
```bash
cd "d:\Projects\Tuition Attendance"
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to `http://localhost:5173/`

## 📖 Usage

### Tab Navigation

**1. Record Attendance**
- Select students who are present
- Enter class name and date
- Add optional notes
- Click "Record Attendance"

**2. Manage Students**
- Add new students with their names
- View all students
- Delete students (also removes their attendance records)

**3. View Records**
- See all attendance records in a table
- Filter by date, class, or student
- Delete individual records

**4. Export/Import**
- Export data as CSV (for Excel) or JSON (for backup)
- Import previously exported data
- Print attendance reports

## 🗄️ Database Structure

### Students Table
```javascript
{
  id: Number,           // Auto-generated
  name: String,         // Student name
  createdAt: DateTime   // Creation timestamp
}
```

### Attendance Table
```javascript
{
  id: Number,           // Auto-generated
  studentId: Number,    // Reference to student
  className: String,    // Class name
  date: String,         // Date (YYYY-MM-DD)
  present: Boolean,     // Attendance status
  notes: String,        // Optional notes
  createdAt: DateTime   // Creation timestamp
}
```

### Classes Table
```javascript
{
  id: Number,           // Auto-generated
  name: String,         // Class name
  createdAt: DateTime   // Creation timestamp
}
```

## 📁 Project Structure

```
src/
├── components/
│   ├── StudentManager.jsx      # Student management component
│   ├── AttendanceRecorder.jsx  # Attendance recording component
│   ├── AttendanceTable.jsx     # Records viewing component
│   ├── Statistics.jsx          # Statistics display component
│   └── ExportImport.jsx        # Export/import functionality
├── db.js                       # Database configuration & APIs
├── App.jsx                     # Main app component
├── App.css                     # App styling
├── main.jsx                    # React entry point
└── index.css                   # Global styles

public/
└── index.html                  # HTML template

.gitignore                       # Git ignore rules
package.json                     # Project dependencies
vite.config.js                   # Vite configuration
```

## 🔧 Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Check for errors (if ESLint is configured)
npm run lint
```

## 💾 Data Persistence

All data is stored locally in your browser's IndexedDB database. This means:
- ✅ No internet required after first load
- ✅ Data persists between sessions
- ✅ Data stays on your computer
- ⚠️ Clearing browser data will remove all records

**Recommendation**: Export your data regularly as CSV or JSON for backup!

## 📤 Exporting Data

### CSV Export
- Useful for importing into Excel or Google Sheets
- Includes all attendance records with student names

### JSON Export
- Complete data backup including students and records
- Can be re-imported to restore all data

## 📥 Importing Data

### From CSV
- Must include: Date, Class, Student Name, Present, Notes
- New students will be automatically added
- Records will be appended to existing data

### From JSON
- Must contain "students" and "attendance" arrays
- Original JSON format recommended for best results

## 🎨 Customization

### Styling
Edit `src/App.css` for main app styles. Each component uses BEM-like CSS classes for easy customization.

### Color Scheme
Main colors are defined in `src/App.css`:
- Primary: `#667eea`
- Primary Dark: `#764ba2`
- Success: `#28a745`
- Danger: `#dc3545`

### Database Schema
To modify the database structure, edit `src/db.js` and update the schema version.

## 🐛 Troubleshooting

### Data not saving?
- Check if cookies/storage are enabled in your browser
- Try clearing browser cache
- Check browser's IndexedDB in DevTools

### Import failing?
- Verify CSV/JSON format matches requirements
- Check file encoding is UTF-8
- Ensure no missing required columns (for CSV)

### App not loading?
- Clear browser cache
- Try incognito/private mode
- Check browser console for errors (F12)

## 📊 Statistics

The dashboard shows:
- **Total Records**: All attendance entries
- **Students**: Unique student count
- **Classes**: Unique class count
- **Sessions**: Unique dates with records
- **Present Count**: Total present entries

## 🔒 Security & Privacy

- All data is stored locally on your device
- No data is sent to any server
- No authentication required
- No tracking or analytics

## 📝 License

This project is provided as-is for personal and educational use.

## 🤝 Contributing

To improve this app, you can:
1. Fix bugs
2. Improve UI/UX
3. Add new features
4. Improve documentation

---

**Created**: April 2026  
**Version**: 2.0 (React Edition)

For the original HTML version, see `attendance_tracker.html`
