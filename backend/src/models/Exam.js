const mongoose = require('mongoose');

const examSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['unit-test', 'midterm', 'final', 'pre-board', 'board', 'other'],
      required: true,
    },
    academicYear: { type: String, required: true },
    class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
    section: { type: mongoose.Schema.Types.ObjectId, ref: 'Section' },

    schedule: [
      {
        subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
        date: Date,
        startTime: String,
        endTime: String,
        venue: String,
        maxMarks: Number,
        passingMarks: Number,
      },
    ],

    status: {
      type: String,
      enum: ['scheduled', 'ongoing', 'completed', 'cancelled'],
      default: 'scheduled',
    },
    instructions: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

examSchema.index({ class: 1, academicYear: 1 });

module.exports = mongoose.model('Exam', examSchema);
