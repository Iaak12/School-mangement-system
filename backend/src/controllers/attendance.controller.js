const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { sendAttendanceAlert } = require('../services/email.service');
const { generateAttendanceExcel } = require('../services/excel.service');
const moment = require('moment');

// POST /api/attendance - Mark/update attendance for a class
const markAttendance = asyncHandler(async (req, res) => {
  const { date, classId, sectionId, records, academicYear } = req.body;

  const attendanceDate = moment(date).startOf('day').toDate();

  let attendance = await Attendance.findOne({
    date: attendanceDate,
    class: classId,
    section: sectionId,
  });

  if (attendance) {
    attendance.records = records;
    attendance.takenBy = req.user._id;
    await attendance.save();
  } else {
    attendance = await Attendance.create({
      date: attendanceDate,
      class: classId,
      section: sectionId,
      academicYear,
      records,
      takenBy: req.user._id,
    });
  }

  // Send absence alerts (non-blocking)
  const absentRecords = records.filter((r) => r.status === 'absent');
  if (absentRecords.length > 0) {
    setImmediate(async () => {
      for (const record of absentRecords) {
        try {
          const student = await Student.findById(record.student).populate('parents', 'email firstName');
          if (student?.parents?.length > 0) {
            for (const parent of student.parents) {
              if (parent.email) {
                await sendAttendanceAlert(
                  parent.email,
                  `${student.firstName} ${student.lastName}`,
                  date,
                  'Absent'
                );
              }
            }
          }
        } catch (_) {}
      }
    });
  }

  const populated = await Attendance.findById(attendance._id)
    .populate('records.student', 'firstName lastName admissionNumber rollNumber')
    .populate('class', 'name')
    .populate('section', 'name');

  return res.status(201).json(new ApiResponse(201, populated, 'Attendance marked successfully.'));
});

// GET /api/attendance?classId=&sectionId=&date=
const getAttendanceByDate = asyncHandler(async (req, res) => {
  const { classId, sectionId, date } = req.query;
  const attendanceDate = moment(date).startOf('day').toDate();

  const attendance = await Attendance.findOne({
    date: attendanceDate,
    class: classId,
    section: sectionId,
  })
    .populate('records.student', 'firstName lastName admissionNumber rollNumber photo')
    .populate('class', 'name')
    .populate('section', 'name')
    .populate('takenBy', 'name');

  if (!attendance) {
    // Return student list for marking
    const students = await Student.find({ class: classId, section: sectionId, status: 'active' })
      .select('firstName lastName admissionNumber rollNumber photo')
      .sort({ rollNumber: 1 });

    return res.status(200).json(
      new ApiResponse(200, { attendance: null, students }, 'No attendance found for this date.')
    );
  }

  return res.status(200).json(new ApiResponse(200, { attendance }));
});

// GET /api/attendance/monthly?classId=&sectionId=&month=&year=
const getMonthlyAttendance = asyncHandler(async (req, res) => {
  const { classId, sectionId, month, year } = req.query;
  const startDate = moment(`${year}-${month}-01`).startOf('month').toDate();
  const endDate = moment(`${year}-${month}-01`).endOf('month').toDate();

  const records = await Attendance.find({
    class: classId,
    section: sectionId,
    date: { $gte: startDate, $lte: endDate },
  }).sort({ date: 1 });

  return res.status(200).json(new ApiResponse(200, records));
});

// GET /api/attendance/student/:studentId - Student attendance summary
const getStudentAttendance = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const { academicYear, month, year } = req.query;

  const query = { 'records.student': studentId };
  if (month && year) {
    query.date = {
      $gte: moment(`${year}-${month}-01`).startOf('month').toDate(),
      $lte: moment(`${year}-${month}-01`).endOf('month').toDate(),
    };
  }

  const attendances = await Attendance.find(query).sort({ date: 1 });

  const summary = { present: 0, absent: 0, leave: 0, late: 0, halfDay: 0, total: attendances.length };

  const dailyRecords = attendances.map((att) => {
    const record = att.records.find((r) => r.student.toString() === studentId);
    if (record) {
      if (record.status === 'present') summary.present++;
      else if (record.status === 'absent') summary.absent++;
      else if (record.status === 'leave') summary.leave++;
      else if (record.status === 'late') summary.late++;
      else if (record.status === 'half-day') summary.halfDay++;
    }
    return { date: att.date, status: record?.status || 'not-marked' };
  });

  const percentage = summary.total > 0
    ? parseFloat(((summary.present + summary.late + summary.halfDay * 0.5) / summary.total * 100).toFixed(2))
    : 0;

  return res.status(200).json(new ApiResponse(200, { summary: { ...summary, percentage }, dailyRecords }));
});

// GET /api/attendance/report/export
const exportAttendanceExcel = asyncHandler(async (req, res) => {
  const { classId, sectionId, month, year } = req.query;
  const startDate = moment(`${year}-${month}-01`).startOf('month').toDate();
  const endDate = moment(`${year}-${month}-01`).endOf('month').toDate();

  const students = await Student.find({ class: classId, section: sectionId, status: 'active' })
    .sort({ rollNumber: 1 });
  const attendances = await Attendance.find({ class: classId, section: sectionId, date: { $gte: startDate, $lte: endDate } });

  const report = students.map((s) => {
    let present = 0, absent = 0, leave = 0, late = 0, halfDay = 0;
    attendances.forEach((att) => {
      const rec = att.records.find((r) => r.student.toString() === s._id.toString());
      if (rec) {
        if (rec.status === 'present') present++;
        else if (rec.status === 'absent') absent++;
        else if (rec.status === 'leave') leave++;
        else if (rec.status === 'late') late++;
        else if (rec.status === 'half-day') halfDay++;
      }
    });
    const total = attendances.length;
    return {
      student: `${s.firstName} ${s.lastName}`,
      totalDays: total,
      present,
      absent,
      leave,
      late,
      halfDay,
      percentage: total > 0 ? ((present + late + halfDay * 0.5) / total * 100).toFixed(2) + '%' : '0%',
    };
  });

  const buffer = generateAttendanceExcel(report);
  res.setHeader('Content-Disposition', 'attachment; filename=attendance_report.xlsx');
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  return res.send(buffer);
});

module.exports = { markAttendance, getAttendanceByDate, getMonthlyAttendance, getStudentAttendance, exportAttendanceExcel };
