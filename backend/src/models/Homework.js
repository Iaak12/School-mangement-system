const mongoose = require('mongoose');

const homeworkSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
    section: { type: mongoose.Schema.Types.ObjectId, ref: 'Section' },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
    dueDate: { type: Date, required: true },
    attachments: [
      {
        filename: String,
        url: String,
        publicId: String,
        type: String,
      },
    ],
    maxMarks: { type: Number, default: 10 },
    status: { type: String, enum: ['active', 'closed', 'cancelled'], default: 'active' },
    academicYear: String,
  },
  { timestamps: true }
);

homeworkSchema.index({ class: 1, section: 1, dueDate: 1 });

module.exports = mongoose.model('Homework', homeworkSchema);
