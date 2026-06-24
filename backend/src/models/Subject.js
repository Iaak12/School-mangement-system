const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    description: String,
    type: {
      type: String,
      enum: ['theory', 'practical', 'both'],
      default: 'theory',
    },
    classes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Class' }],
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
    maxMarks: { type: Number, default: 100 },
    passMarks: { type: Number, default: 35 },
    isElective: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Subject', subjectSchema);
