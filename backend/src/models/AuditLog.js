const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    action: { type: String, required: true },
    module: { type: String, required: true },
    resourceId: mongoose.Schema.Types.ObjectId,
    resourceType: String,
    changes: { type: mongoose.Schema.Types.Mixed },
    ipAddress: String,
    userAgent: String,
    status: { type: String, enum: ['success', 'failed'], default: 'success' },
  },
  { timestamps: true }
);

auditLogSchema.index({ user: 1, createdAt: -1 });
auditLogSchema.index({ module: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
