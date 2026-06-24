const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    phone: { type: String, required: true },
    alternatePhone: String,
    email: String,
    licenseNumber: { type: String, required: true, unique: true },
    licenseExpiry: Date,
    licenseType: String,
    aadharNumber: String,
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
    },
    experience: Number,
    joiningDate: { type: Date, default: Date.now },
    salary: Number,
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
    route: { type: mongoose.Schema.Types.ObjectId, ref: 'Transport' },
    photo: { url: String, publicId: String },
    status: { type: String, enum: ['active', 'inactive', 'on-leave'], default: 'active' },
  },
  { timestamps: true }
);

driverSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

module.exports = mongoose.model('Driver', driverSchema);
