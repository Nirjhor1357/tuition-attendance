import Dexie from 'dexie';

// Create a new database instance
export const db = new Dexie('TuitionAttendanceDB');

// Define the database schema
db.version(1).stores({
  students: '++id, name',
  attendance: '++id, date, studentId'
});

// Student management functions
export const studentAPI = {
  async addStudent(name) {
    return db.students.add({ name, createdAt: new Date() });
  },

  async getAllStudents() {
    return db.students.toArray();
  },

  async updateStudent(id, name) {
    return db.students.update(id, { name, updatedAt: new Date() });
  },

  async deleteStudent(id) {
    return db.students.delete(id);
  },

  async getStudentById(id) {
    return db.students.get(id);
  }
};

// Attendance management functions
export const attendanceAPI = {
  async recordAttendance(studentId, date, notes = '') {
    return db.attendance.add({
      studentId,
      date,
      notes,
      createdAt: new Date()
    });
  },

  async getAllAttendance() {
    return db.attendance.toArray();
  },

  async getAttendanceByDate(date) {
    return db.attendance.where('date').equals(date).toArray();
  },

  async getAttendanceByStudent(studentId) {
    return db.attendance.where('studentId').equals(studentId).toArray();
  },



  async updateAttendance(id, updates) {
    return db.attendance.update(id, { ...updates, updatedAt: new Date() });
  },

  async deleteAttendance(id) {
    return db.attendance.delete(id);
  },

  async deleteAttendanceByStudent(studentId) {
    return db.attendance.where('studentId').equals(studentId).delete();
  }
};



// Analytics functions
export const analyticsAPI = {
  async getStudentAttendanceRate(studentId) {
    const records = await db.attendance.where('studentId').equals(studentId).toArray();
    if (records.length === 0) return 0;
    const presentCount = records.filter(r => r.present).length;
    return Math.round((presentCount / records.length) * 100);
  },



  async getTotalStatistics() {
    const records = await db.attendance.toArray();
    const students = new Set(records.map(r => r.studentId)).size;
    const sessions = new Set(records.map(r => r.date)).size;
    return {
      totalRecords: records.length,
      studentCount: students,
      sessionCount: sessions
    };
  },

  async getStudentClassCount(studentId) {
    const records = await db.attendance.where('studentId').equals(studentId).toArray();
    return records.length;
  }
};

// Export database for advanced usage
export default db;
