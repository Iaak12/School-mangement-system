const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    admissionNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    rollNumber: { type: String, trim: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    dateOfBirth: { type: Date, required: true },
    gender: { type: String, enum: ["male", "female", "other"], required: true },
    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    },
    nationality: { type: String, default: "Indian" },
    religion: String,
    category: {
      type: String,
      enum: ["general", "obc", "sc", "st", "ews", "other"],
    },
    aadharNumber: { type: String, trim: true },

    // Address
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      country: { type: String, default: "India" },
    },

    // Academic info
    class: { type: mongoose.Schema.Types.ObjectId, ref: "Class" },
    section: { type: mongoose.Schema.Types.ObjectId, ref: "Section" },
    admissionDate: { type: Date, default: Date.now },
    academicYear: { type: String, required: true },

    // Parent info
    parents: [{ type: mongoose.Schema.Types.ObjectId, ref: "Parent" }],

    // Previous school
    previousSchool: {
      name: String,
      address: String,
      lastClass: String,
      tcNumber: String,
    },

    // Status
    status: {
      type: String,
      enum: ["active", "inactive", "transferred", "alumni", "expelled"],
      default: "active",
    },

    // Transport
    transport: {
      enrolled: { type: Boolean, default: false },
      route: { type: mongoose.Schema.Types.ObjectId, ref: "Transport" },
      vehicle: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle" },
    },

    // Hostel
    hostel: {
      enrolled: { type: Boolean, default: false },
      roomNumber: String,
    },

    // Medical
    medical: {
      conditions: [String],
      allergies: [String],
      emergencyContact: {
        name: String,
        phone: String,
        relation: String,
      },
    },

    photo: { url: String, publicId: String },
    documents: [{ type: mongoose.Schema.Types.ObjectId, ref: "Document" }],
    remarks: String,
  },
  { timestamps: true },
);

studentSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

studentSchema.index({ class: 1, section: 1 });
studentSchema.index({ status: 1 });

module.exports = mongoose.model("Student", studentSchema);
