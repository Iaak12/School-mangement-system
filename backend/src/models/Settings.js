const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
  {
    // School Identity
    schoolName: { type: String, default: 'School ERP' },
    schoolCode: String,
    logo: { url: String, publicId: String },
    tagline: String,

    // Contact
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      country: { type: String, default: 'India' },
    },
    phone: String,
    alternatePhone: String,
    email: String,
    website: String,

    // Academic
    currentAcademicYear: { type: String, default: '2024-25' },
    academicYearStart: String, // e.g., "April"
    academicYearEnd: String,
    workingDays: [
      {
        type: String,
        enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
      },
    ],

    // Principal
    principal: {
      name: String,
      phone: String,
      email: String,
      photo: { url: String, publicId: String },
    },

    // Fee settings
    feeSettings: {
      dueDateDay: { type: Number, default: 10 },
      finePerDay: { type: Number, default: 5 },
      currency: { type: String, default: 'INR' },
    },

    // Library settings
    librarySettings: {
      maxBooksPerStudent: { type: Number, default: 3 },
      maxIssueDays: { type: Number, default: 14 },
      finePerDay: { type: Number, default: 1 },
    },

    // Grading system
    gradingSystem: [
      {
        grade: String,
        minPercentage: Number,
        maxPercentage: Number,
        gradePoint: Number,
        description: String,
      },
    ],

    // Social links
    socialLinks: {
      facebook: String,
      twitter: String,
      instagram: String,
      youtube: String,
    },

    isConfigured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Settings', settingsSchema);
