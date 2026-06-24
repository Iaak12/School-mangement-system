const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: {
      type: String,
      enum: [
        'photo', 'aadhar', 'birth-certificate', 'mark-sheet',
        'transfer-certificate', 'character-certificate', 'fee-certificate',
        'bonafide-certificate', 'other',
      ],
      required: true,
    },
    ownerType: { type: String, enum: ['student', 'teacher', 'staff'], required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'ownerType' },
    file: {
      url: { type: String, required: true },
      publicId: String,
      format: String,
      size: Number,
    },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isVerified: { type: Boolean, default: false },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    remarks: String,
    expiryDate: Date,
  },
  { timestamps: true }
);

documentSchema.index({ owner: 1, ownerType: 1 });

module.exports = mongoose.model('Document', documentSchema);
