const AuditLog = require('../models/AuditLog');

const audit = (action, module) => async (req, res, next) => {
  const originalJson = res.json.bind(res);
  
  res.json = async (body) => {
    try {
      await AuditLog.create({
        user: req.user?._id,
        action,
        module,
        resourceId: req.params?.id,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        status: res.statusCode < 400 ? 'success' : 'failed',
        changes: req.body,
      });
    } catch (e) {
      // Don't break the response if audit fails
    }
    return originalJson(body);
  };
  next();
};

module.exports = audit;
