// Simple in-memory data store (works immediately without MongoDB)
const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'data');

// Create data directory if it doesn't exist
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Load data from files or initialize empty
let studentsData = [];
let attendanceData = [];

const studentsFile = path.join(dataDir, 'students.json');
const attendanceFile = path.join(dataDir, 'attendance.json');

try {
  if (fs.existsSync(studentsFile)) {
    studentsData = JSON.parse(fs.readFileSync(studentsFile, 'utf8'));
  }
} catch (e) {
  console.log('Initializing students file');
  studentsData = [];
}

try {
  if (fs.existsSync(attendanceFile)) {
    attendanceData = JSON.parse(fs.readFileSync(attendanceFile, 'utf8'));
  }
} catch (e) {
  console.log('Initializing attendance file');
  attendanceData = [];
}

// Save functions
const saveStudents = () => {
  fs.writeFileSync(studentsFile, JSON.stringify(studentsData, null, 2));
};

const saveAttendance = () => {
  fs.writeFileSync(attendanceFile, JSON.stringify(attendanceData, null, 2));
};

// Student operations
const studentOps = {
  create: (data) => {
    if (studentsData.find(s => s.studentId === data.studentId)) {
      throw new Error('Student with this ID already exists');
    }
    const student = {
      _id: Date.now().toString(),
      ...data,
      createdAt: new Date(),
    };
    studentsData.push(student);
    saveStudents();
    return student;
  },

  findOne: (query) => {
    return studentsData.find(s => {
      if (query.studentId) return s.studentId === query.studentId;
      if (query._id) return s._id === query._id;
      return false;
    });
  },

  find: () => studentsData,

  findById: (id) => studentsData.find(s => s._id === id),

  updateOne: (query, update) => {
    const index = studentsData.findIndex(s => {
      if (query._id) return s._id === query._id;
      return false;
    });
    if (index !== -1) {
      studentsData[index] = { ...studentsData[index], ...update.$set };
      saveStudents();
      return { modifiedCount: 1 };
    }
    return { modifiedCount: 0 };
  },
};

// Attendance operations
const attendanceOps = {
  create: (data) => {
    const attendance = {
      _id: Date.now().toString(),
      ...data,
      date: new Date(),
    };
    attendanceData.push(attendance);
    saveAttendance();
    return attendance;
  },

  find: (query = {}) => {
    return attendanceData.filter(a => {
      if (query.studentId && a.studentId !== query.studentId) return false;
      if (query.class && a.class !== query.class) return false;
      if (query.division && a.division !== query.division) return false;
      return true;
    });
  },

  findOne: (query) => {
    return attendanceData.find(a => {
      if (query.studentId) return a.studentId === query.studentId;
      return false;
    });
  },
};

// Mock Student model for MongoDB compatibility
const Student = {
  findOne: (query) => Promise.resolve(studentOps.findOne(query)),
  find: () => Promise.resolve(studentOps.find()),
  findById: (id) => Promise.resolve(studentOps.findById(id)),
  create: (data) => Promise.resolve(studentOps.create(data)),
  prototype: {
    save: function() {
      const existing = studentOps.findById(this._id);
      if (existing) {
        studentOps.updateOne({ _id: this._id }, { $set: this });
      } else {
        studentOps.create(this);
      }
      return Promise.resolve(this);
    }
  }
};

// Mock Attendance model for MongoDB compatibility
const Attendance = {
  findOne: (query) => Promise.resolve(attendanceOps.findOne(query)),
  find: (query = {}) => Promise.resolve(attendanceOps.find(query)),
  create: (data) => Promise.resolve(attendanceOps.create(data)),
  prototype: {
    save: function() {
      attendanceOps.create(this);
      return Promise.resolve(this);
    }
  }
};

module.exports = {
  Student,
  Attendance,
  studentOps,
  attendanceOps,
};
