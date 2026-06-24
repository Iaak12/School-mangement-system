const express = require('express');
const router = express.Router();
const Subject = require('../models/Subject');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/rbac.middleware');

router.use(protect);

router.get('/', asyncHandler(async (req, res) => {
  const { classId } = req.query;
  const query = { isActive: true };
  if (classId) query.classes = classId;
  const subjects = await Subject.find(query).populate('teacher', 'firstName lastName');
  return res.status(200).json(new ApiResponse(200, subjects));
}));

router.post('/', authorize('admin', 'principal'), asyncHandler(async (req, res) => {
  const subject = await Subject.create(req.body);
  return res.status(201).json(new ApiResponse(201, subject, 'Subject created.'));
}));

router.put('/:id', authorize('admin', 'principal'), asyncHandler(async (req, res) => {
  const subject = await Subject.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!subject) throw new ApiError(404, 'Subject not found.');
  return res.status(200).json(new ApiResponse(200, subject, 'Subject updated.'));
}));

router.delete('/:id', authorize('admin', 'principal'), asyncHandler(async (req, res) => {
  await Subject.findByIdAndDelete(req.params.id);
  return res.status(200).json(new ApiResponse(200, null, 'Subject deleted.'));
}));

module.exports = router;
