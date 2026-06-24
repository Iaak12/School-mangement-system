const Student = require('../models/Student');
const User = require('../models/User');
const Document = require('../models/Document');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { generateStudentExcel } = require('../services/excel.service');
const { generateCertificatePDF } = require('../services/pdf.service');
const Settings = require('../models/Settings');

// GET /api/students
const getStudents = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search, classId, sectionId, status, academicYear, gender } = req.query;
  const query = {};

  if (search) {
    query.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { admissionNumber: { $regex: search, $options: 'i' } },
    ];
  }
  if (classId) query.class = classId;
  if (sectionId) query.section = sectionId;
  if (status) query.status = status;
  if (gender) query.gender = gender;
  if (academicYear) query.academicYear = academicYear;

  const total = await Student.countDocuments(query);
  const students = await Student.find(query)
    .populate('class', 'name')
    .populate('section', 'name')
    .populate('parents', 'firstName lastName phone')
    .sort({ firstName: 1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  return res.status(200).json(
    new ApiResponse(200, {
      students,
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) },
    })
  );
});

// GET /api/students/:id
const getStudent = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id)
    .populate('class', 'name')
    .populate('section', 'name classTeacher')
    .populate('parents', 'firstName lastName phone email relation')
    .populate('documents');

  if (!student) throw new ApiError(404, 'Student not found.');
  return res.status(200).json(new ApiResponse(200, student));
});

// POST /api/students
const createStudent = asyncHandler(async (req, res) => {
  const { email, password, ...studentData } = req.body;

  // Create user account
  const user = await User.create({
    name: `${studentData.firstName} ${studentData.lastName}`,
    email,
    password: password || `Student@${new Date().getFullYear()}`,
    role: 'student',
    phone: studentData.phone,
  });

  // Generate admission number if not provided
  if (!studentData.admissionNumber) {
    const count = await Student.countDocuments();
    studentData.admissionNumber = `ADM${new Date().getFullYear()}${String(count + 1).padStart(4, '0')}`;
  }

  const student = await Student.create({ ...studentData, user: user._id });

  // Update user with profile ref
  await User.findByIdAndUpdate(user._id, { profileRef: student._id, profileModel: 'Student' });

  const populated = await Student.findById(student._id)
    .populate('class', 'name')
    .populate('section', 'name');

  return res.status(201).json(new ApiResponse(201, populated, 'Student admitted successfully.'));
});

// PUT /api/students/:id
const updateStudent = asyncHandler(async (req, res) => {
  const student = await Student.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })
    .populate('class', 'name')
    .populate('section', 'name');

  if (!student) throw new ApiError(404, 'Student not found.');
  return res.status(200).json(new ApiResponse(200, student, 'Student updated.'));
});

// DELETE /api/students/:id
const deleteStudent = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id);
  if (!student) throw new ApiError(404, 'Student not found.');

  await User.findByIdAndDelete(student.user);
  await Student.findByIdAndDelete(req.params.id);

  return res.status(200).json(new ApiResponse(200, null, 'Student deleted.'));
});

// PUT /api/students/:id/promote
const promoteStudent = asyncHandler(async (req, res) => {
  const { newClass, newSection, newAcademicYear } = req.body;
  const student = await Student.findByIdAndUpdate(
    req.params.id,
    { class: newClass, section: newSection, academicYear: newAcademicYear },
    { new: true }
  );
  if (!student) throw new ApiError(404, 'Student not found.');
  return res.status(200).json(new ApiResponse(200, student, 'Student promoted.'));
});

// PUT /api/students/:id/transfer
const transferStudent = asyncHandler(async (req, res) => {
  const { reason, remarks } = req.body;
  const student = await Student.findByIdAndUpdate(
    req.params.id,
    { status: 'transferred', remarks },
    { new: true }
  );
  if (!student) throw new ApiError(404, 'Student not found.');
  return res.status(200).json(new ApiResponse(200, student, 'Transfer certificate issued.'));
});

// GET /api/students/export/excel
const exportStudentsExcel = asyncHandler(async (req, res) => {
  const { classId, sectionId, status } = req.query;
  const query = {};
  if (classId) query.class = classId;
  if (sectionId) query.section = sectionId;
  if (status) query.status = status;

  const students = await Student.find(query)
    .populate('class', 'name')
    .populate('section', 'name');

  const buffer = generateStudentExcel(students);

  res.setHeader('Content-Disposition', 'attachment; filename=students.xlsx');
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  return res.send(buffer);
});

// GET /api/students/:id/certificate/:type
const generateCertificate = asyncHandler(async (req, res) => {
  const { type } = req.params;
  const student = await Student.findById(req.params.id)
    .populate('class', 'name')
    .populate('section', 'name');

  if (!student) throw new ApiError(404, 'Student not found.');
  const settings = await Settings.findOne();

  const data = {
    className: student.class?.name,
    sectionName: student.section?.name,
    academicYear: student.academicYear,
    lastClass: student.class?.name,
    ...req.body,
  };

  const pdfBuffer = await generateCertificatePDF(type, student, data, settings);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename=${type}_certificate_${student.admissionNumber}.pdf`);
  return res.send(pdfBuffer);
});

module.exports = {
  getStudents, getStudent, createStudent, updateStudent, deleteStudent,
  promoteStudent, transferStudent, exportStudentsExcel, generateCertificate,
};
