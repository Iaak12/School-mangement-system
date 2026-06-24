const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema(
  {
    class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
    section: { type: mongoose.Schema.Types.ObjectId, ref: 'Section', required: true },
    academicYear: { type: String, required: true },
    effectiveFrom: Date,

    schedule: {
      monday: [{ type: Object }],
      tuesday: [{ type: Object }],
      wednesday: [{ type: Object }],
      thursday: [{ type: Object }],
      friday: [{ type: Object }],
      saturday: [{ type: Object }],
    },

    periods: [
      {
        periodNumber: Number,
        startTime: String,
        endTime: String,
        isBreak: { type: Boolean, default: false },
        breakLabel: String,
      },
    ],

    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

timetableSchema.index({ class: 1, section: 1, academicYear: 1 });

module.exports = mongoose.model('Timetable', timetableSchema);
