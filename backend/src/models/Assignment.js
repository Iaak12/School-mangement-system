const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema(
  {
    homework: { type: mongoose.Schema.Types.ObjectId, ref: 'Homework', required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    submittedAt: { type: Date, default: Date.now },
    isLate: { type: Boolean, default: false },
    attachments: [
      {
        filename: String,
        url: String,
        publicId: String,
        type: String,
      },
    ],
    notes: String,
    marksObtained: Number,
    feedback: String,
    gradedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
    gradedAt: Date,
    status: {
      type: String,
      enum: ['submitted', 'graded', 'returned', 'late'],
      default: 'submitted',
    },
  },
  { timestamps: true }
);

assignmentSchema.index({ homework: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('Assignment', assignmentSchema);
