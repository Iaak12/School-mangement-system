const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    employeeId: { type: String, required: true, unique: true, trim: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    dateOfBirth: Date,
    gender: { type: String, enum: ['male', 'female', 'other'] },
    bloodGroup: String,
    nationality: { type: String, default: 'Indian' },
    aadharNumber: String,
    panNumber: String,

    // Contact
    phone: String,
    alternatePhone: String,
    email: String,

    // Address
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      country: { type: String, default: 'India' },
    },

    // Academic
    qualifications: [
      {
        degree: String,
        institution: String,
        year: Number,
        percentage: Number,
      },
    ],
    experience: [
      {
        institution: String,
        designation: String,
        from: Date,
        to: Date,
      },
    ],
    specialization: [String],

    // Assignment
    subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }],
    classes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Class' }],
    isClassTeacher: { type: Boolean, default: false },
    classTeacherOf: { type: mongoose.Schema.Types.ObjectId, ref: 'Section' },

    // Employment
    designation: { type: String, default: 'Teacher' },
    department: String,
    joiningDate: { type: Date, default: Date.now },
    employmentType: {
      type: String,
      enum: ['permanent', 'contract', 'part-time', 'guest'],
      default: 'permanent',
    },
    salary: { type: Number, default: 0 },
    bankDetails: {
      accountNumber: String,
      ifscCode: String,
      bankName: String,
      branch: String,
    },

    status: {
      type: String,
      enum: ['active', 'inactive', 'on-leave', 'resigned', 'retired'],
      default: 'active',
    },

    photo: { url: String, publicId: String },
    documents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Document' }],
    remarks: String,
  },
  { timestamps: true }
);

teacherSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

teacherSchema.index({ status: 1 });

module.exports = mongoose.model('Teacher', teacherSchema);
