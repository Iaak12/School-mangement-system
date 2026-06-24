const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    receiptNumber: { type: String, required: true, unique: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    collectedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    academicYear: { type: String, required: true },
    month: String,

    items: [
      {
        label: String,
        type: {
          type: String,
          enum: ['tuition', 'transport', 'hostel', 'library', 'sports', 'exam', 'misc', 'fine'],
        },
        amount: Number,
      },
    ],

    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    discountReason: String,
    fine: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    paidAmount: { type: Number, required: true },
    balance: { type: Number, default: 0 },

    paymentMethod: {
      type: String,
      enum: ['cash', 'upi', 'bank-transfer', 'cheque', 'online'],
      required: true,
    },
    transactionId: String,
    bankReference: String,

    status: {
      type: String,
      enum: ['paid', 'partial', 'pending', 'overdue', 'cancelled'],
      default: 'paid',
    },

    dueDate: Date,
    paidDate: { type: Date, default: Date.now },
    remarks: String,
  },
  { timestamps: true }
);

paymentSchema.index({ student: 1, academicYear: 1 });
paymentSchema.index({ status: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
