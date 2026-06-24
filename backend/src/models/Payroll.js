const mongoose = require('mongoose');

const payrollSchema = new mongoose.Schema(
  {
    staff: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: true },
    month: { type: Number, required: true },
    year: { type: Number, required: true },
    basicSalary: { type: Number, required: true },
    allowances: [{ label: String, amount: Number }],
    deductions: [{ label: String, amount: Number }],
    overtimePay: { type: Number, default: 0 },
    bonuses: { type: Number, default: 0 },
    totalEarnings: { type: Number, required: true },
    totalDeductions: { type: Number, default: 0 },
    netSalary: { type: Number, required: true },
    workingDays: Number,
    presentDays: Number,
    absentDays: Number,
    leaveDays: Number,
    paymentDate: Date,
    paymentMethod: { type: String, enum: ['bank-transfer', 'cash', 'cheque'] },
    transactionId: String,
    status: { type: String, enum: ['pending', 'processed', 'paid', 'cancelled'], default: 'pending' },
    generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    remarks: String,
  },
  { timestamps: true }
);

payrollSchema.index({ staff: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Payroll', payrollSchema);
