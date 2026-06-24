const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Payment = require('../models/Payment');
const Attendance = require('../models/Attendance');
const Exam = require('../models/Exam');
const Notice = require('../models/Notice');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const moment = require('moment');

// GET /api/dashboard/admin
const getAdminDashboard = asyncHandler(async (req, res) => {
  const { academicYear } = req.query;
  const currentYear = academicYear || moment().format('YYYY') + '-' + (moment().year() + 1).toString().slice(-2);

  const [
    totalStudents,
    totalTeachers,
    totalParents,
    monthlyRevenue,
    pendingFees,
    upcomingExams,
    recentNotices,
    studentGrowth,
    monthlyFeesTrend,
  ] = await Promise.all([
    Student.countDocuments({ status: 'active', academicYear: currentYear }),
    Teacher.countDocuments({ status: 'active' }),
    require('../models/Parent').countDocuments({ isActive: true }),
    Payment.aggregate([
      {
        $match: {
          status: 'paid',
          paidDate: { $gte: moment().startOf('month').toDate(), $lte: moment().endOf('month').toDate() },
        },
      },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]),
    Payment.aggregate([
      { $match: { status: { $in: ['pending', 'overdue'] } } },
      { $group: { _id: null, total: { $sum: '$balance' } } },
    ]),
    Exam.find({
      status: 'scheduled',
      'schedule.date': { $gte: new Date() },
    })
      .populate('class', 'name')
      .sort({ 'schedule.0.date': 1 })
      .limit(5),
    Notice.find({ isPublished: true }).sort({ createdAt: -1 }).limit(5),
    // Student growth (last 6 months)
    Student.aggregate([
      {
        $group: {
          _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 },
    ]),
    // Monthly fee collection (last 6 months)
    Payment.aggregate([
      { $match: { status: 'paid' } },
      {
        $group: {
          _id: { month: { $month: '$paidDate' }, year: { $year: '$paidDate' } },
          total: { $sum: '$totalAmount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 },
    ]),
  ]);

  // Today's attendance %
  const todayAttendance = await Attendance.find({
    date: { $gte: moment().startOf('day').toDate(), $lte: moment().endOf('day').toDate() },
  });

  let presentCount = 0, totalCount = 0;
  todayAttendance.forEach((att) => {
    att.records.forEach((rec) => {
      totalCount++;
      if (rec.status === 'present' || rec.status === 'late') presentCount++;
    });
  });
  const attendancePercentage = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;

  return res.status(200).json(
    new ApiResponse(200, {
      stats: {
        totalStudents,
        totalTeachers,
        totalParents,
        monthlyRevenue: monthlyRevenue[0]?.total || 0,
        pendingFees: pendingFees[0]?.total || 0,
        attendancePercentage,
        upcomingExamsCount: upcomingExams.length,
      },
      charts: {
        studentGrowth,
        monthlyFeesTrend,
      },
      upcomingExams,
      recentNotices,
    })
  );
});

// GET /api/dashboard/teacher
const getTeacherDashboard = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findOne({ user: req.user._id })
    .populate('classes', 'name')
    .populate('subjects', 'name');
  
  if (!teacher) {
    return res.status(200).json(new ApiResponse(200, { teacher: null }));
  }

  const todayAttendances = await Attendance.find({
    date: { $gte: moment().startOf('day').toDate(), $lte: moment().endOf('day').toDate() },
    takenBy: req.user._id,
  });

  const upcomingHomework = await require('../models/Homework').find({
    teacher: teacher._id,
    dueDate: { $gte: new Date() },
    status: 'active',
  }).populate('subject', 'name').sort({ dueDate: 1 }).limit(5);

  const recentNotices = await Notice.find({ isPublished: true }).sort({ createdAt: -1 }).limit(5);

  return res.status(200).json(
    new ApiResponse(200, { teacher, todayAttendances, upcomingHomework, recentNotices })
  );
});

// GET /api/dashboard/student
const getStudentDashboard = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ user: req.user._id })
    .populate('class', 'name')
    .populate('section', 'name');

  if (!student) {
    return res.status(200).json(new ApiResponse(200, { student: null }));
  }

  const [upcomingHomework, pendingPayments, recentNotices, attendanceSummary] = await Promise.all([
    require('../models/Homework').find({
      class: student.class,
      dueDate: { $gte: new Date() },
      status: 'active',
    }).populate('subject', 'name').sort({ dueDate: 1 }).limit(5),
    Payment.find({ student: student._id, status: { $in: ['pending', 'overdue'] } }).limit(5),
    Notice.find({
      isPublished: true,
      $or: [
        { targetAudience: { $in: ['all', 'students'] } },
        { targetClasses: student.class },
      ],
    }).sort({ createdAt: -1 }).limit(5),
    Attendance.aggregate([
      { $unwind: '$records' },
      { $match: { 'records.student': student._id } },
      { $group: { _id: '$records.status', count: { $sum: 1 } } },
    ]),
  ]);

  const attendanceMap = {};
  attendanceSummary.forEach((a) => { attendanceMap[a._id] = a.count; });
  const totalDays = Object.values(attendanceMap).reduce((a, b) => a + b, 0);
  const presentDays = (attendanceMap['present'] || 0) + (attendanceMap['late'] || 0);
  const attendancePercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

  return res.status(200).json(
    new ApiResponse(200, {
      student,
      attendancePercentage,
      upcomingHomework,
      pendingPayments,
      recentNotices,
    })
  );
});

// GET /api/dashboard/parent
const getParentDashboard = asyncHandler(async (req, res) => {
  const parent = await require('../models/Parent').findOne({ user: req.user._id })
    .populate({
      path: 'students',
      populate: [{ path: 'class', select: 'name' }, { path: 'section', select: 'name' }],
    });

  if (!parent || !parent.students?.length) {
    return res.status(200).json(new ApiResponse(200, { parent, children: [] }));
  }

  const childrenData = await Promise.all(
    parent.students.map(async (student) => {
      const [pendingFees, recentAttendance, recentHomework] = await Promise.all([
        Payment.find({ student: student._id, status: { $in: ['pending', 'overdue'] } }),
        Attendance.find({ 'records.student': student._id }).sort({ date: -1 }).limit(10),
        require('../models/Homework').find({
          class: student.class,
          dueDate: { $gte: new Date() },
          status: 'active',
        }).populate('subject', 'name').limit(5),
      ]);

      return { student, pendingFees, recentAttendance, recentHomework };
    })
  );

  const recentNotices = await Notice.find({ isPublished: true }).sort({ createdAt: -1 }).limit(5);

  return res.status(200).json(new ApiResponse(200, { parent, childrenData, recentNotices }));
});

module.exports = { getAdminDashboard, getTeacherDashboard, getStudentDashboard, getParentDashboard };
