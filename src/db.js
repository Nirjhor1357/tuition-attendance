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
    if (!studentId || !date) {
      throw new Error('Student and date are required to record attendance.');
    }

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

  async hasAttendance(studentId, date) {
    const existing = await db.attendance
      .where('studentId')
      .equals(studentId)
      .and((record) => record.date === date)
      .first();

    return Boolean(existing);
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
    // The data model only stores present records, so any stored record represents attendance.
    return 100;
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

export const dataAPI = {
  async replaceAllData(students = [], attendance = []) {
    return db.transaction('rw', db.students, db.attendance, async () => {
      await db.attendance.clear();
      await db.students.clear();

      const studentIdMap = new Map();

      for (const student of students) {
        const name = String(student?.name || '').trim();
        if (!name) {
          continue;
        }

        const newId = await db.students.add({
          name,
          createdAt: student.createdAt ? new Date(student.createdAt) : new Date(),
          updatedAt: student.updatedAt ? new Date(student.updatedAt) : undefined,
        });

        studentIdMap.set(student.id, newId);
      }

      for (const record of attendance) {
        const mappedStudentId = studentIdMap.get(record.studentId);
        if (!mappedStudentId || !record?.date) {
          continue;
        }

        await db.attendance.add({
          studentId: mappedStudentId,
          date: record.date,
          notes: record.notes || '',
          createdAt: record.createdAt ? new Date(record.createdAt) : new Date(),
          updatedAt: record.updatedAt ? new Date(record.updatedAt) : undefined,
        });
      }
    });
  },

  async deleteStudentAndAttendance(studentId) {
    return db.transaction('rw', db.students, db.attendance, async () => {
      await db.attendance.where('studentId').equals(studentId).delete();
      await db.students.delete(studentId);
    });
  },
};

// Export database for advanced usage
export default db;
