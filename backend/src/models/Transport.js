const mongoose = require('mongoose');

const transportSchema = new mongoose.Schema(
  {
    routeName: { type: String, required: true, trim: true },
    routeNumber: { type: String, required: true, unique: true },
    description: String,
    stops: [
      {
        stopName: { type: String, required: true },
        pickupTime: String,
        dropTime: String,
        fare: { type: Number, default: 0 },
        order: Number,
      },
    ],
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
    driver: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver' },
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Transport', transportSchema);
