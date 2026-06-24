const mongoose = require('mongoose');

const classSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    numericName: { type: Number },
    description: String,
    academicYear: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

classSchema.index({ name: 1, academicYear: 1 }, { unique: true });

module.exports = mongoose.model('Class', classSchema);
