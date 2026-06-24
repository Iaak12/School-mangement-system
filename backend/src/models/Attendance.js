const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
    section: { type: mongoose.Schema.Types.ObjectId, ref: 'Section', required: true },
    academicYear: { type: String, required: true },
    takenBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    records: [
      {
        student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
        status: {
          type: String,
          enum: ['present', 'absent', 'leave', 'late', 'half-day'],
          required: true,
          default: 'present',
        },
        remarks: String,
        checkInTime: String,
        checkOutTime: String,
      },
    ],

    // Teacher attendance tracking
    teacherAttendance: [
      {
        teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
        status: {
          type: String,
          enum: ['present', 'absent', 'leave', 'late', 'half-day'],
        },
        remarks: String,
      },
    ],

    isHoliday: { type: Boolean, default: false },
    holidayReason: String,
  },
  { timestamps: true }
);

attendanceSchema.index({ date: 1, class: 1, section: 1 }, { unique: true });
attendanceSchema.index({ date: 1 });
attendanceSchema.index({ 'records.student': 1 });

module.exports = mongoose.model('Attendance', attendanceSchema);
