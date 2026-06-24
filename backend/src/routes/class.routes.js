const express = require('express');
const router = express.Router();
const Class = require('../models/Class');
const Section = require('../models/Section');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/rbac.middleware');

router.use(protect);

// Classes
router.get('/', asyncHandler(async (req, res) => {
  const { academicYear } = req.query;
  const query = academicYear ? { academicYear, isActive: true } : { isActive: true };
  const classes = await Class.find(query).sort({ numericName: 1 });
  return res.status(200).json(new ApiResponse(200, classes));
}));

router.post('/', authorize('admin', 'principal'), asyncHandler(async (req, res) => {
  const cls = await Class.create(req.body);
  return res.status(201).json(new ApiResponse(201, cls, 'Class created.'));
}));

router.put('/:id', authorize('admin', 'principal'), asyncHandler(async (req, res) => {
  const cls = await Class.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!cls) throw new ApiError(404, 'Class not found.');
  return res.status(200).json(new ApiResponse(200, cls, 'Class updated.'));
}));

router.delete('/:id', authorize('admin', 'principal'), asyncHandler(async (req, res) => {
  await Class.findByIdAndDelete(req.params.id);
  return res.status(200).json(new ApiResponse(200, null, 'Class deleted.'));
}));

// Sections
router.get('/:classId/sections', asyncHandler(async (req, res) => {
  const sections = await Section.find({ class: req.params.classId, isActive: true })
    .populate('classTeacher', 'firstName lastName');
  return res.status(200).json(new ApiResponse(200, sections));
}));

router.post('/:classId/sections', authorize('admin', 'principal'), asyncHandler(async (req, res) => {
  const section = await Section.create({ ...req.body, class: req.params.classId });
  return res.status(201).json(new ApiResponse(201, section, 'Section created.'));
}));

module.exports = router;
