const express = require('express');
const router = express.Router();
const Timetable = require('../models/Timetable');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/rbac.middleware');

router.use(protect);

router.get('/', asyncHandler(async (req, res) => {
  const { classId, sectionId, academicYear } = req.query;
  const query = { isActive: true };
  if (classId) query.class = classId;
  if (sectionId) query.section = sectionId;
  if (academicYear) query.academicYear = academicYear;

  const timetable = await Timetable.findOne(query)
    .populate('class', 'name')
    .populate('section', 'name');
  return res.status(200).json(new ApiResponse(200, timetable));
}));

router.post('/', authorize('admin', 'principal'), asyncHandler(async (req, res) => {
  const existing = await Timetable.findOne({ class: req.body.class, section: req.body.section, academicYear: req.body.academicYear });
  if (existing) {
    Object.assign(existing, req.body);
    await existing.save();
    return res.status(200).json(new ApiResponse(200, existing, 'Timetable updated.'));
  }
  const tt = await Timetable.create({ ...req.body, createdBy: req.user._id });
  return res.status(201).json(new ApiResponse(201, tt, 'Timetable created.'));
}));

module.exports = router;
