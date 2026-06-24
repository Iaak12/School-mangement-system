const Teacher = require('../models/Teacher');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

const getTeachers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search, status, department } = req.query;
  const query = {};
  if (search) {
    query.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { employeeId: { $regex: search, $options: 'i' } },
    ];
  }
  if (status) query.status = status;
  if (department) query.department = department;

  const total = await Teacher.countDocuments(query);
  const teachers = await Teacher.find(query)
    .populate('subjects', 'name code')
    .populate('classes', 'name')
    .sort({ firstName: 1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  return res.status(200).json(
    new ApiResponse(200, { teachers, pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) } })
  );
});

const getTeacher = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findById(req.params.id)
    .populate('subjects', 'name code')
    .populate('classes', 'name')
    .populate('classTeacherOf', 'name')
    .populate('documents');
  if (!teacher) throw new ApiError(404, 'Teacher not found.');
  return res.status(200).json(new ApiResponse(200, teacher));
});

const createTeacher = asyncHandler(async (req, res) => {
  const { email, password, ...teacherData } = req.body;

  const user = await User.create({
    name: `${teacherData.firstName} ${teacherData.lastName}`,
    email,
    password: password || `Teacher@${new Date().getFullYear()}`,
    role: 'teacher',
    phone: teacherData.phone,
  });

  if (!teacherData.employeeId) {
    const count = await Teacher.countDocuments();
    teacherData.employeeId = `EMP${String(count + 1).padStart(4, '0')}`;
  }

  const teacher = await Teacher.create({ ...teacherData, user: user._id });
  await User.findByIdAndUpdate(user._id, { profileRef: teacher._id, profileModel: 'Teacher' });

  return res.status(201).json(new ApiResponse(201, teacher, 'Teacher created.'));
});

const updateTeacher = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!teacher) throw new ApiError(404, 'Teacher not found.');
  return res.status(200).json(new ApiResponse(200, teacher, 'Teacher updated.'));
});

const deleteTeacher = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findById(req.params.id);
  if (!teacher) throw new ApiError(404, 'Teacher not found.');
  await User.findByIdAndDelete(teacher.user);
  await Teacher.findByIdAndDelete(req.params.id);
  return res.status(200).json(new ApiResponse(200, null, 'Teacher deleted.'));
});

const assignSubjects = asyncHandler(async (req, res) => {
  const { subjects, classes } = req.body;
  const teacher = await Teacher.findByIdAndUpdate(
    req.params.id,
    { subjects, classes },
    { new: true }
  ).populate('subjects', 'name').populate('classes', 'name');
  if (!teacher) throw new ApiError(404, 'Teacher not found.');
  return res.status(200).json(new ApiResponse(200, teacher, 'Subjects assigned.'));
});

module.exports = { getTeachers, getTeacher, createTeacher, updateTeacher, deleteTeacher, assignSubjects };
