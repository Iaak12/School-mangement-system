const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
    classTeacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
    capacity: { type: Number, default: 40 },
    academicYear: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

sectionSchema.index({ class: 1, name: 1, academicYear: 1 }, { unique: true });

module.exports = mongoose.model('Section', sectionSchema);
