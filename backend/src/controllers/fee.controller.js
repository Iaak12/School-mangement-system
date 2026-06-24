const Payment = require('../models/Payment');
const Student = require('../models/Student');
const Fee = require('../models/Fee');
const Settings = require('../models/Settings');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { generateFeeReceiptPDF } = require('../services/pdf.service');
const { generateFeeExcel } = require('../services/excel.service');
const { sendFeeReceipt } = require('../services/email.service');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');

// GET /api/fees/structure
const getFeeStructure = asyncHandler(async (req, res) => {
  const fees = await Fee.find({ isActive: true }).populate('feeItems.class', 'name');
  return res.status(200).json(new ApiResponse(200, fees));
});

// POST /api/fees/structure
const createFeeStructure = asyncHandler(async (req, res) => {
  const fee = await Fee.create(req.body);
  return res.status(201).json(new ApiResponse(201, fee, 'Fee structure created.'));
});

// PUT /api/fees/structure/:id
const updateFeeStructure = asyncHandler(async (req, res) => {
  const fee = await Fee.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!fee) throw new ApiError(404, 'Fee structure not found.');
  return res.status(200).json(new ApiResponse(200, fee, 'Fee structure updated.'));
});

// POST /api/fees/payments - Collect fee
const collectFee = asyncHandler(async (req, res) => {
  const { studentId, items, discount, discountReason, fine, paymentMethod, transactionId, month, academicYear, sendEmail: shouldEmail } = req.body;

  const student = await Student.findById(studentId).populate('parents', 'email');
  if (!student) throw new ApiError(404, 'Student not found.');

  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const totalAmount = subtotal - (discount || 0) + (fine || 0);

  const receiptNumber = `REC${moment().format('YYYYMMDD')}${uuidv4().slice(0, 6).toUpperCase()}`;

  const payment = await Payment.create({
    receiptNumber,
    student: studentId,
    collectedBy: req.user._id,
    academicYear,
    month,
    items,
    subtotal,
    discount: discount || 0,
    discountReason,
    fine: fine || 0,
    totalAmount,
    paidAmount: totalAmount,
    paymentMethod,
    transactionId,
    status: 'paid',
    paidDate: new Date(),
  });

  const settings = await Settings.findOne();

  // Generate PDF
  const pdfBuffer = await generateFeeReceiptPDF(payment, student, settings);

  // Send email if requested
  if (shouldEmail) {
    const parentEmail = student.parents?.[0]?.email;
    if (parentEmail) {
      setImmediate(async () => {
        try {
          await sendFeeReceipt(parentEmail, `${student.firstName} ${student.lastName}`, payment, pdfBuffer);
        } catch (_) {}
      });
    }
  }

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename=receipt_${receiptNumber}.pdf`);
  return res.send(pdfBuffer);
});

// GET /api/fees/payments
const getPayments = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, studentId, status, month, academicYear, from, to } = req.query;
  const query = {};
  if (studentId) query.student = studentId;
  if (status) query.status = status;
  if (month) query.month = month;
  if (academicYear) query.academicYear = academicYear;
  if (from || to) {
    query.paidDate = {};
    if (from) query.paidDate.$gte = new Date(from);
    if (to) query.paidDate.$lte = new Date(to);
  }

  const total = await Payment.countDocuments(query);
  const payments = await Payment.find(query)
    .populate('student', 'firstName lastName admissionNumber class')
    .populate('collectedBy', 'name')
    .sort({ paidDate: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  return res.status(200).json(
    new ApiResponse(200, {
      payments,
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) },
    })
  );
});

// GET /api/fees/payments/:id/receipt
const downloadReceipt = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id).populate('student');
  if (!payment) throw new ApiError(404, 'Payment not found.');

  const settings = await Settings.findOne();
  const pdfBuffer = await generateFeeReceiptPDF(payment, payment.student, settings);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename=receipt_${payment.receiptNumber}.pdf`);
  return res.send(pdfBuffer);
});

// GET /api/fees/defaulters
const getDefaulters = asyncHandler(async (req, res) => {
  const { classId, academicYear } = req.query;
  const query = { status: 'active' };
  if (classId) query.class = classId;

  const students = await Student.find(query).populate('class', 'name').populate('section', 'name');

  const defaulters = [];
  for (const student of students) {
    const paidMonths = await Payment.find({
      student: student._id,
      academicYear,
      status: { $in: ['paid', 'partial'] },
    }).distinct('month');

    const currentMonth = moment().format('MMMM');
    if (!paidMonths.includes(currentMonth)) {
      defaulters.push({
        student,
        paidMonths,
        pendingMonth: currentMonth,
      });
    }
  }

  return res.status(200).json(new ApiResponse(200, defaulters));
});

// GET /api/fees/payments/export
const exportPaymentsExcel = asyncHandler(async (req, res) => {
  const { academicYear, month } = req.query;
  const query = {};
  if (academicYear) query.academicYear = academicYear;
  if (month) query.month = month;

  const payments = await Payment.find(query).populate('student', 'firstName lastName admissionNumber');
  const buffer = generateFeeExcel(payments);

  res.setHeader('Content-Disposition', 'attachment; filename=fee_report.xlsx');
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  return res.send(buffer);
});

// GET /api/fees/stats
const getFeeStats = asyncHandler(async (req, res) => {
  const { academicYear } = req.query;
  const query = academicYear ? { academicYear } : {};

  const [totalCollected, pending] = await Promise.all([
    Payment.aggregate([
      { $match: { ...query, status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]),
    Payment.aggregate([
      { $match: { ...query, status: { $in: ['pending', 'overdue'] } } },
      { $group: { _id: null, total: { $sum: '$balance' } } },
    ]),
  ]);

  // Monthly collection trend
  const monthlyTrend = await Payment.aggregate([
    { $match: { ...query, status: 'paid' } },
    {
      $group: {
        _id: { month: { $month: '$paidDate' }, year: { $year: '$paidDate' } },
        total: { $sum: '$totalAmount' },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  return res.status(200).json(
    new ApiResponse(200, {
      totalCollected: totalCollected[0]?.total || 0,
      pending: pending[0]?.total || 0,
      monthlyTrend,
    })
  );
});

module.exports = {
  getFeeStructure, createFeeStructure, updateFeeStructure,
  collectFee, getPayments, downloadReceipt, getDefaulters,
  exportPaymentsExcel, getFeeStats,
};
