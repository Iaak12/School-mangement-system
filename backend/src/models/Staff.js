const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    employeeId: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    department: String,
    designation: String,
    employmentType: {
      type: String,
      enum: ['permanent', 'contract', 'part-time'],
      default: 'permanent',
    },
    phone: String,
    email: String,
    dateOfBirth: Date,
    gender: { type: String, enum: ['male', 'female', 'other'] },
    aadharNumber: String,
    panNumber: String,
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
    },
    joiningDate: { type: Date, default: Date.now },
    leavingDate: Date,
    basicSalary: { type: Number, default: 0 },
    bankDetails: {
      accountNumber: String,
      ifscCode: String,
      bankName: String,
      branch: String,
    },
    qualifications: [{ degree: String, institution: String, year: Number }],
    leaveBalance: {
      casual: { type: Number, default: 12 },
      sick: { type: Number, default: 12 },
      earned: { type: Number, default: 15 },
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'resigned', 'terminated', 'retired'],
      default: 'active',
    },
    photo: { url: String, publicId: String },
    documents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Document' }],
  },
  { timestamps: true }
);

staffSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

module.exports = mongoose.model('Staff', staffSchema);
