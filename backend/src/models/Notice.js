const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    category: {
      type: String,
      enum: ['general', 'academic', 'exam', 'fee', 'event', 'holiday', 'urgent'],
      default: 'general',
    },
    targetAudience: [
      {
        type: String,
        enum: ['all', 'students', 'teachers', 'parents', 'staff'],
      },
    ],
    targetClasses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Class' }],

    attachments: [
      {
        filename: String,
        url: String,
        publicId: String,
      },
    ],

    publishDate: { type: Date, default: Date.now },
    expiryDate: Date,
    isPublished: { type: Boolean, default: false },
    isPinned: { type: Boolean, default: false },
    priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

noticeSchema.index({ isPublished: 1, publishDate: -1 });

module.exports = mongoose.model('Notice', noticeSchema);
