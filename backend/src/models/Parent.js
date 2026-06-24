const mongoose = require('mongoose');

const parentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    relation: { type: String, enum: ['father', 'mother', 'guardian', 'other'], required: true },
    phone: { type: String, required: true },
    alternatePhone: String,
    email: String,
    occupation: String,
    qualification: String,
    annualIncome: Number,
    aadharNumber: String,

    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      country: { type: String, default: 'India' },
    },

    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],

    photo: { url: String, publicId: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

parentSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

module.exports = mongoose.model('Parent', parentSchema);
