const Exam = require('../models/Exam');
const Result = require('../models/Result');
const Student = require('../models/Student');
const Settings = require('../models/Settings');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { calculateResult } = require('../utils/gradeCalculator');
const { generateReportCardPDF } = require('../services/pdf.service');

// GET /api/exams
const getExams = asyncHandler(async (req, res) => {
  const { classId, academicYear, status } = req.query;
  const query = {};
  if (classId) query.class = classId;
  if (academicYear) query.academicYear = academicYear;
  if (status) query.status = status;

  const exams = await Exam.find(query)
    .populate('class', 'name')
    .populate('section', 'name')
    .populate('schedule.subject', 'name code')
    .sort({ createdAt: -1 });

  return res.status(200).json(new ApiResponse(200, exams));
});

// POST /api/exams
const createExam = asyncHandler(async (req, res) => {
  const exam = await Exam.create({ ...req.body, createdBy: req.user._id });
  return res.status(201).json(new ApiResponse(201, exam, 'Exam created.'));
});

// PUT /api/exams/:id
const updateExam = asyncHandler(async (req, res) => {
  const exam = await Exam.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!exam) throw new ApiError(404, 'Exam not found.');
  return res.status(200).json(new ApiResponse(200, exam, 'Exam updated.'));
});

// DELETE /api/exams/:id
const deleteExam = asyncHandler(async (req, res) => {
  const exam = await Exam.findByIdAndDelete(req.params.id);
  if (!exam) throw new ApiError(404, 'Exam not found.');
  return res.status(200).json(new ApiResponse(200, null, 'Exam deleted.'));
});

// POST /api/exams/:examId/results - Enter/update marks
const enterMarks = asyncHandler(async (req, res) => {
  const { examId } = req.params;
  const { studentId, marks, attendance } = req.body;

  const exam = await Exam.findById(examId).populate('schedule.subject');
  if (!exam) throw new ApiError(404, 'Exam not found.');

  const settings = await Settings.findOne();
  const gradingSystem = settings?.gradingSystem || [];

  const computed = calculateResult(marks, gradingSystem);

  let result = await Result.findOne({ student: studentId, exam: examId });

  if (result) {
    Object.assign(result, {
      ...computed,
      attendance,
      enteredBy: req.user._id,
    });
    await result.save();
  } else {
    result = await Result.create({
      student: studentId,
      exam: examId,
      class: exam.class,
      section: exam.section,
      academicYear: exam.academicYear,
      ...computed,
      attendance,
      enteredBy: req.user._id,
    });
  }

  // Calculate rank within class
  const allResults = await Result.find({ exam: examId, class: exam.class });
  allResults.sort((a, b) => b.percentage - a.percentage);
  for (let i = 0; i < allResults.length; i++) {
    allResults[i].rank = i + 1;
    await allResults[i].save();
  }

  return res.status(200).json(new ApiResponse(200, result, 'Marks entered.'));
});

// GET /api/exams/:examId/results
const getExamResults = asyncHandler(async (req, res) => {
  const { examId } = req.params;
  const { classId } = req.query;

  const query = { exam: examId };
  if (classId) query.class = classId;

  const results = await Result.find(query)
    .populate('student', 'firstName lastName admissionNumber rollNumber photo')
    .populate('marks.subject', 'name code')
    .sort({ rank: 1 });

  return res.status(200).json(new ApiResponse(200, results));
});

// GET /api/exams/:examId/results/:studentId/report-card
const downloadReportCard = asyncHandler(async (req, res) => {
  const { examId, studentId } = req.params;

  const result = await Result.findOne({ exam: examId, student: studentId })
    .populate('marks.subject', 'name code')
    .populate('student')
    .populate('exam');

  if (!result) throw new ApiError(404, 'Result not found.');

  const settings = await Settings.findOne();
  const pdfBuffer = await generateReportCardPDF(result, result.student, result.exam, settings);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename=report_card_${result.student.admissionNumber}.pdf`);
  return res.send(pdfBuffer);
});

// PUT /api/exams/:examId/results/publish
const publishResults = asyncHandler(async (req, res) => {
  await Result.updateMany({ exam: req.params.examId }, { isPublished: true });
  return res.status(200).json(new ApiResponse(200, null, 'Results published.'));
});

module.exports = { getExams, createExam, updateExam, deleteExam, enterMarks, getExamResults, downloadReportCard, publishResults };
