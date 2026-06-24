const Homework = require('../models/Homework');
const Assignment = require('../models/Assignment');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/homework
const getHomework = asyncHandler(async (req, res) => {
  const { classId, sectionId, subjectId, status } = req.query;
  const query = {};
  if (classId) query.class = classId;
  if (sectionId) query.section = sectionId;
  if (subjectId) query.subject = subjectId;
  if (status) query.status = status;

  // If student, only show active homework
  if (req.user.role === 'student') query.status = 'active';

  const homework = await Homework.find(query)
    .populate('subject', 'name code')
    .populate('class', 'name')
    .populate('section', 'name')
    .populate('teacher', 'firstName lastName')
    .sort({ dueDate: 1 });

  return res.status(200).json(new ApiResponse(200, homework));
});

// POST /api/homework
const createHomework = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findOne({ user: req.user._id });
  const hw = await Homework.create({ ...req.body, teacher: teacher?._id });
  return res.status(201).json(new ApiResponse(201, hw, 'Homework created.'));
});

// PUT /api/homework/:id
const updateHomework = asyncHandler(async (req, res) => {
  const hw = await Homework.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!hw) throw new ApiError(404, 'Homework not found.');
  return res.status(200).json(new ApiResponse(200, hw, 'Homework updated.'));
});

// DELETE /api/homework/:id
const deleteHomework = asyncHandler(async (req, res) => {
  await Homework.findByIdAndDelete(req.params.id);
  return res.status(200).json(new ApiResponse(200, null, 'Homework deleted.'));
});

// POST /api/homework/:id/submit
const submitAssignment = asyncHandler(async (req, res) => {
  const homework = await Homework.findById(req.params.id);
  if (!homework) throw new ApiError(404, 'Homework not found.');
  if (homework.status !== 'active') throw new ApiError(400, 'Homework is closed.');

  const student = await Student.findOne({ user: req.user._id });
  if (!student) throw new ApiError(404, 'Student not found.');

  const isLate = new Date() > homework.dueDate;

  let assignment = await Assignment.findOne({ homework: homework._id, student: student._id });
  if (assignment) {
    Object.assign(assignment, { ...req.body, isLate, submittedAt: new Date(), status: isLate ? 'late' : 'submitted' });
    await assignment.save();
  } else {
    assignment = await Assignment.create({
      homework: homework._id,
      student: student._id,
      ...req.body,
      isLate,
      status: isLate ? 'late' : 'submitted',
    });
  }

  return res.status(201).json(new ApiResponse(201, assignment, 'Assignment submitted.'));
});

// GET /api/homework/:id/submissions
const getSubmissions = asyncHandler(async (req, res) => {
  const submissions = await Assignment.find({ homework: req.params.id })
    .populate('student', 'firstName lastName admissionNumber rollNumber')
    .sort({ submittedAt: -1 });
  return res.status(200).json(new ApiResponse(200, submissions));
});

// PUT /api/homework/submissions/:id/grade
const gradeSubmission = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findOne({ user: req.user._id });
  const assignment = await Assignment.findByIdAndUpdate(
    req.params.id,
    { ...req.body, gradedBy: teacher?._id, gradedAt: new Date(), status: 'graded' },
    { new: true }
  );
  if (!assignment) throw new ApiError(404, 'Assignment not found.');
  return res.status(200).json(new ApiResponse(200, assignment, 'Assignment graded.'));
});

module.exports = { getHomework, createHomework, updateHomework, deleteHomework, submitAssignment, getSubmissions, gradeSubmission };
