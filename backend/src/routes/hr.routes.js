const express = require('express');
const router = express.Router();
const Staff = require('../models/Staff');
const Payroll = require('../models/Payroll');
const User = require('../models/User');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/rbac.middleware');

router.use(protect);
router.use(authorize('admin', 'principal', 'accountant'));

// Staff
router.get('/staff', asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status, department } = req.query;
  const query = {};
  if (status) query.status = status;
  if (department) query.department = department;

  const total = await Staff.countDocuments(query);
  const staff = await Staff.find(query).skip((page - 1) * limit).limit(Number(limit));
  return res.status(200).json(new ApiResponse(200, { staff, pagination: { total, page: Number(page) } }));
}));

router.post('/staff', asyncHandler(async (req, res) => {
  const { email, password, ...staffData } = req.body;
  let user;
  if (email) {
    user = await User.create({
      name: `${staffData.firstName} ${staffData.lastName}`,
      email,
      password: password || `Staff@${new Date().getFullYear()}`,
      role: 'accountant',
    });
  }
  if (!staffData.employeeId) {
    const count = await Staff.countDocuments();
    staffData.employeeId = `STF${String(count + 1).padStart(4, '0')}`;
  }
  const staff = await Staff.create({ ...staffData, user: user?._id });
  return res.status(201).json(new ApiResponse(201, staff, 'Staff created.'));
}));

router.put('/staff/:id', asyncHandler(async (req, res) => {
  const staff = await Staff.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!staff) throw new ApiError(404, 'Staff not found.');
  return res.status(200).json(new ApiResponse(200, staff, 'Staff updated.'));
}));

// Payroll
router.get('/payroll', asyncHandler(async (req, res) => {
  const { month, year, staffId } = req.query;
  const query = {};
  if (month) query.month = Number(month);
  if (year) query.year = Number(year);
  if (staffId) query.staff = staffId;

  const payrolls = await Payroll.find(query)
    .populate('staff', 'firstName lastName employeeId designation')
    .sort({ createdAt: -1 });
  return res.status(200).json(new ApiResponse(200, payrolls));
}));

router.post('/payroll', asyncHandler(async (req, res) => {
  const { staffId, month, year, ...payrollData } = req.body;
  const existing = await Payroll.findOne({ staff: staffId, month, year });
  if (existing) throw new ApiError(400, 'Payroll already generated for this month.');

  const payroll = await Payroll.create({
    staff: staffId,
    month,
    year,
    ...payrollData,
    generatedBy: req.user._id,
  });
  return res.status(201).json(new ApiResponse(201, payroll, 'Payroll generated.'));
}));

router.put('/payroll/:id/pay', asyncHandler(async (req, res) => {
  const payroll = await Payroll.findByIdAndUpdate(
    req.params.id,
    { status: 'paid', paymentDate: new Date(), ...req.body },
    { new: true }
  );
  if (!payroll) throw new ApiError(404, 'Payroll not found.');
  return res.status(200).json(new ApiResponse(200, payroll, 'Payroll marked as paid.'));
}));

module.exports = router;
