const mongoose = require('mongoose');

const feeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: String,
    academicYear: { type: String, required: true },

    // Fee structure per class
    feeItems: [
      {
        class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
        items: [
          {
            label: { type: String, required: true },
            amount: { type: Number, required: true, min: 0 },
            type: {
              type: String,
              enum: ['tuition', 'transport', 'hostel', 'library', 'sports', 'exam', 'misc'],
              default: 'tuition',
            },
            frequency: {
              type: String,
              enum: ['monthly', 'quarterly', 'half-yearly', 'annually', 'one-time'],
              default: 'monthly',
            },
          },
        ],
      },
    ],

    // Discounts / Scholarships
    discounts: [
      {
        name: String,
        type: { type: String, enum: ['percentage', 'fixed'] },
        value: Number,
        applicableTo: [String], // category names or student IDs
      },
    ],

    // Late fine
    finePerDay: { type: Number, default: 0 },
    dueDateDay: { type: Number, default: 10 }, // day of month

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Fee', feeSchema);
