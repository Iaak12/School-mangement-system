const mongoose = require('mongoose');

const issuedBookSchema = new mongoose.Schema(
  {
    book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
    issuedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    issuedToType: { type: String, enum: ['student', 'teacher', 'staff'] },
    issuedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    issueDate: { type: Date, default: Date.now },
    dueDate: { type: Date, required: true },
    returnDate: Date,
    finePerDay: { type: Number, default: 1 },
    finePaid: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['issued', 'returned', 'overdue', 'lost'],
      default: 'issued',
    },
    remarks: String,
  },
  { timestamps: true }
);

issuedBookSchema.index({ issuedTo: 1, status: 1 });
issuedBookSchema.index({ book: 1 });

module.exports = mongoose.model('IssuedBook', issuedBookSchema);
