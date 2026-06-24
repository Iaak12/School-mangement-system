const Notice = require('../models/Notice');
const Notification = require('../models/Notification');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/notices
const getNotices = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, category, isPublished, search } = req.query;
  const query = {};

  // Role-based filtering
  const roleAudience = {
    student: ['all', 'students'],
    teacher: ['all', 'teachers'],
    parent: ['all', 'parents'],
    principal: null,
    admin: null,
  };

  const audienceFilter = roleAudience[req.user.role];
  if (audienceFilter) {
    query.targetAudience = { $in: audienceFilter };
    query.isPublished = true;
  }

  if (category) query.category = category;
  if (isPublished !== undefined) query.isPublished = isPublished === 'true';
  if (search) query.title = { $regex: search, $options: 'i' };

  const total = await Notice.countDocuments(query);
  const notices = await Notice.find(query)
    .populate('createdBy', 'name role')
    .sort({ isPinned: -1, publishDate: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  return res.status(200).json(
    new ApiResponse(200, {
      notices,
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) },
    })
  );
});

// POST /api/notices
const createNotice = asyncHandler(async (req, res) => {
  const notice = await Notice.create({ ...req.body, createdBy: req.user._id });

  // If publishing immediately, send notifications
  if (notice.isPublished) {
    setImmediate(async () => {
      try {
        const roles = notice.targetAudience.includes('all')
          ? ['student', 'teacher', 'parent']
          : notice.targetAudience.map((a) => a.replace(/s$/, ''));

        const users = await User.find({ role: { $in: roles }, isActive: true }).select('_id');
        const notifications = users.map((u) => ({
          recipient: u._id,
          title: notice.title,
          body: notice.content.substring(0, 150),
          type: 'notice',
          link: `/notices/${notice._id}`,
        }));
        if (notifications.length > 0) {
          await Notification.insertMany(notifications);
        }
      } catch (_) {}
    });
  }

  return res.status(201).json(new ApiResponse(201, notice, 'Notice created.'));
});

// PUT /api/notices/:id
const updateNotice = asyncHandler(async (req, res) => {
  const notice = await Notice.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!notice) throw new ApiError(404, 'Notice not found.');
  return res.status(200).json(new ApiResponse(200, notice, 'Notice updated.'));
});

// DELETE /api/notices/:id
const deleteNotice = asyncHandler(async (req, res) => {
  const notice = await Notice.findByIdAndDelete(req.params.id);
  if (!notice) throw new ApiError(404, 'Notice not found.');
  return res.status(200).json(new ApiResponse(200, null, 'Notice deleted.'));
});

// PUT /api/notices/:id/publish
const publishNotice = asyncHandler(async (req, res) => {
  const notice = await Notice.findByIdAndUpdate(
    req.params.id,
    { isPublished: true, publishDate: new Date() },
    { new: true }
  );
  if (!notice) throw new ApiError(404, 'Notice not found.');
  return res.status(200).json(new ApiResponse(200, notice, 'Notice published.'));
});

// GET /api/notifications
const getNotifications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, isRead } = req.query;
  const query = { recipient: req.user._id };
  if (isRead !== undefined) query.isRead = isRead === 'true';

  const [notifications, unreadCount] = await Promise.all([
    Notification.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit)),
    Notification.countDocuments({ recipient: req.user._id, isRead: false }),
  ]);

  return res.status(200).json(new ApiResponse(200, { notifications, unreadCount }));
});

// PUT /api/notifications/read-all
const markAllNotificationsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true, readAt: new Date() });
  return res.status(200).json(new ApiResponse(200, null, 'All notifications marked as read.'));
});

module.exports = { getNotices, createNotice, updateNotice, deleteNotice, publishNotice, getNotifications, markAllNotificationsRead };
