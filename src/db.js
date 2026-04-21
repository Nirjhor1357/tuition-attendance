import Dexie from 'dexie';

export const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late',
};

export const db = new Dexie('TuitionAttendanceDB');

db.version(1).stores({
  students: '++id, name',
  attendance: '++id, date, studentId',
});

db.version(2)
  .stores({
    institutes: '++id, name, slug, createdAt',
    users: '++id, email, instituteId, role, createdAt',
    students: '++id, instituteId, name, batch, createdAt, updatedAt',
    attendance:
      '++id, instituteId, date, studentId, status, updatedAt, [instituteId+date], [studentId+date]',
    activity: '++id, instituteId, type, createdAt',
  })
  .upgrade(async (tx) => {
    const defaultInstitute = {
      id: 1,
      name: 'Demo Institute',
      slug: 'demo-institute',
      createdAt: new Date(),
    };

    await tx.table('institutes').put(defaultInstitute);

    await tx
      .table('students')
      .toCollection()
      .modify((student) => {
        if (!student.instituteId) {
          student.instituteId = 1;
        }
        if (!student.batch) {
          student.batch = 'General';
        }
        if (!student.createdAt) {
          student.createdAt = new Date();
        }
      });

    await tx
      .table('attendance')
      .toCollection()
      .modify((record) => {
        if (!record.instituteId) {
          record.instituteId = 1;
        }
        if (!record.status) {
          record.status = ATTENDANCE_STATUS.PRESENT;
        }
        if (!record.createdAt) {
          record.createdAt = new Date();
        }
      });
  });

const normalizeDate = (value) => {
  if (!value) return '';
  return String(value).slice(0, 10);
};

const addActivity = async (instituteId, type, message, meta = {}) => {
  await db.activity.add({
    instituteId,
    type,
    message,
    meta,
    createdAt: new Date(),
  });
};

export const instituteAPI = {
  async createInstitute({ name }) {
    const slug = String(name || '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    return db.institutes.add({
      name: String(name || '').trim(),
      slug: slug || `institute-${Date.now()}`,
      createdAt: new Date(),
    });
  },

  async getInstituteById(id) {
    return db.institutes.get(id);
  },

  async getAllInstitutes() {
    return db.institutes.toArray();
  },
};

export const studentAPI = {
  async addStudent({ instituteId, name, batch }) {
    if (!instituteId) throw new Error('Institute is required.');
    if (!name?.trim()) throw new Error('Student name is required.');

    const cleanName = name.trim();
    const duplicate = await db.students
      .where('instituteId')
      .equals(instituteId)
      .and((student) => student.name.toLowerCase() === cleanName.toLowerCase())
      .first();

    if (duplicate) {
      throw new Error('Student already exists in this institute.');
    }

    const studentId = await db.students.add({
      instituteId,
      name: cleanName,
      batch: String(batch || 'General').trim() || 'General',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await addActivity(instituteId, 'student_added', `Added student ${cleanName}`, { studentId });
    return studentId;
  },

  async getAllStudents(instituteId) {
    return db.students.where('instituteId').equals(instituteId).sortBy('name');
  },

  async updateStudent(id, updates = {}) {
    const current = await db.students.get(id);
    if (!current) throw new Error('Student not found.');

    const nextName = (updates.name ?? current.name).trim();
    if (!nextName) {
      throw new Error('Student name cannot be empty.');
    }

    await db.students.update(id, {
      name: nextName,
      batch: String(updates.batch ?? current.batch ?? 'General').trim() || 'General',
      updatedAt: new Date(),
    });

    await addActivity(current.instituteId, 'student_updated', `Updated student ${nextName}`, {
      studentId: id,
    });
  },

  async deleteStudent(id) {
    const student = await db.students.get(id);
    if (!student) return;

    await db.transaction('rw', db.students, db.attendance, db.activity, async () => {
      await db.attendance.where('studentId').equals(id).delete();
      await db.students.delete(id);
      await addActivity(student.instituteId, 'student_deleted', `Deleted student ${student.name}`, {
        studentId: id,
      });
    });
  },

  async getStudentsByBatch(instituteId) {
    const students = await this.getAllStudents(instituteId);
    return students.reduce((acc, student) => {
      const batch = student.batch || 'General';
      if (!acc[batch]) acc[batch] = [];
      acc[batch].push(student);
      return acc;
    }, {});
  },
};

export const attendanceAPI = {
  async upsertAttendance({ instituteId, studentId, date, status, notes = '' }) {
    if (!instituteId || !studentId || !date) {
      throw new Error('Institute, student and date are required.');
    }

    const safeDate = normalizeDate(date);
    const safeStatus = status || ATTENDANCE_STATUS.PRESENT;

    const existing = await db.attendance
      .where('[studentId+date]')
      .equals([studentId, safeDate])
      .first();

    if (existing) {
      await db.attendance.update(existing.id, {
        instituteId,
        status: safeStatus,
        notes,
        updatedAt: new Date(),
      });
      return existing.id;
    }

    return db.attendance.add({
      instituteId,
      studentId,
      date: safeDate,
      status: safeStatus,
      notes,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  },

  async bulkMarkAttendance({ instituteId, date, payload }) {
    const safeDate = normalizeDate(date);

    await db.transaction('rw', db.attendance, db.activity, async () => {
      for (const entry of payload) {
        await this.upsertAttendance({
          instituteId,
          studentId: entry.studentId,
          date: safeDate,
          status: entry.status,
          notes: entry.notes || '',
        });
      }

      await addActivity(instituteId, 'attendance_marked', `Marked attendance for ${safeDate}`, {
        date: safeDate,
        count: payload.length,
      });
    });
  },

  async getAttendanceForDate(instituteId, date) {
    const safeDate = normalizeDate(date);
    return db.attendance
      .where('[instituteId+date]')
      .equals([instituteId, safeDate])
      .toArray();
  },

  async getAllAttendance(instituteId) {
    return db.attendance.where('instituteId').equals(instituteId).toArray();
  },

  async getAttendanceByStudent(instituteId, studentId) {
    return db.attendance
      .where('instituteId')
      .equals(instituteId)
      .and((row) => row.studentId === studentId)
      .toArray();
  },

  async deleteAttendance(id) {
    await db.attendance.delete(id);
  },
};

const calculatePercentage = (presentLike, total) => {
  if (!total) return 0;
  return Math.round((presentLike / total) * 100);
};

export const analyticsAPI = {
  async getDashboardData(instituteId) {
    const students = await studentAPI.getAllStudents(instituteId);
    const attendance = await attendanceAPI.getAllAttendance(instituteId);

    const totalStudents = students.length;
    const totalClasses = new Set(attendance.map((row) => row.date)).size;
    const presentLike = attendance.filter(
      (row) => row.status === ATTENDANCE_STATUS.PRESENT || row.status === ATTENDANCE_STATUS.LATE
    ).length;
    const attendancePercentage = calculatePercentage(presentLike, attendance.length);

    return {
      totalStudents,
      totalClasses,
      attendancePercentage,
    };
  },

  async getStudentWiseReport(instituteId) {
    const students = await studentAPI.getAllStudents(instituteId);
    const attendance = await attendanceAPI.getAllAttendance(instituteId);

    return students
      .map((student) => {
        const rows = attendance.filter((item) => item.studentId === student.id);
        const presentLike = rows.filter(
          (item) => item.status === ATTENDANCE_STATUS.PRESENT || item.status === ATTENDANCE_STATUS.LATE
        ).length;

        return {
          studentId: student.id,
          name: student.name,
          batch: student.batch,
          total: rows.length,
          presentLike,
          percentage: calculatePercentage(presentLike, rows.length),
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  },

  async getMonthlyReport(instituteId) {
    const attendance = await attendanceAPI.getAllAttendance(instituteId);

    const monthMap = attendance.reduce((acc, row) => {
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

    return Object.values(monthMap).sort((a, b) => a.month.localeCompare(b.month));
  },

  async getRecentActivity(instituteId, limit = 8) {
    const rows = await db.activity.where('instituteId').equals(instituteId).reverse().sortBy('createdAt');
    return rows.slice(0, limit);
  },

  calculateClassesToAttend({ presentCount, totalCount, targetPercentage }) {
    const target = Number(targetPercentage) / 100;
    if (!target || target <= 0 || target >= 1) {
      return { toAttend: 0, canSkip: 0 };
    }

    const need = (target * totalCount - presentCount) / (1 - target);
    const toAttend = Math.max(0, Math.ceil(need));

    const skip = presentCount / target - totalCount;
    const canSkip = Math.max(0, Math.floor(skip));

    return { toAttend, canSkip };
  },
};

export const bootstrapAPI = {
  async ensureDemoInstitute() {
    const existing = await db.institutes.where('slug').equals('demo-institute').first();
    if (existing) return existing;

    const instituteId = await instituteAPI.createInstitute({ name: 'Demo Institute' });

    const demoStudents = [
      { name: 'Aarav Khan', batch: 'Batch A' },
      { name: 'Maya Noor', batch: 'Batch A' },
      { name: 'Rafi Ahmed', batch: 'Batch B' },
    ];

    for (const student of demoStudents) {
      await studentAPI.addStudent({ instituteId, ...student });
    }

    return instituteAPI.getInstituteById(instituteId);
  },
};

export default db;
