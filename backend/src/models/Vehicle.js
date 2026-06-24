const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema(
  {
    registrationNumber: { type: String, required: true, unique: true, uppercase: true },
    type: { type: String, enum: ['bus', 'van', 'auto', 'other'], default: 'bus' },
    model: String,
    make: String,
    year: Number,
    capacity: { type: Number, required: true },
    fuelType: { type: String, enum: ['petrol', 'diesel', 'cng', 'electric'] },
    insuranceNumber: String,
    insuranceExpiry: Date,
    pollutionExpiry: Date,
    fitnessExpiry: Date,
    lastService: Date,
    nextService: Date,
    gpsDeviceId: String,
    isActive: { type: Boolean, default: true },
    photo: { url: String, publicId: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Vehicle', vehicleSchema);
