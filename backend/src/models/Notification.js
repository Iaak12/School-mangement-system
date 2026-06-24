const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
    type: {
      type: String,
      enum: [
        'fee', 'attendance', 'exam', 'homework', 'notice', 'message',
        'result', 'transport', 'library', 'general', 'alert',
      ],
      default: 'general',
    },
    link: String, // frontend route to navigate
    isRead: { type: Boolean, default: false },
    readAt: Date,
    data: { type: mongoose.Schema.Types.Mixed }, // extra payload
  },
  { timestamps: true }
);

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
