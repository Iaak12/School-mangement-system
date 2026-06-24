const Message = require('../models/Message');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

const getConversationId = (id1, id2) => [id1, id2].sort().join('_');

// GET /api/messages/conversations
const getConversations = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const conversations = await Message.aggregate([
    { $match: { $or: [{ sender: userId }, { receiver: userId }], isDeleted: false } },
    { $sort: { createdAt: -1 } },
    { $group: { _id: '$conversationId', lastMessage: { $first: '$$ROOT' } } },
    { $sort: { 'lastMessage.createdAt': -1 } },
  ]);

  const populated = await Promise.all(
    conversations.map(async (conv) => {
      const lastMsg = conv.lastMessage;
      const otherId = lastMsg.sender.toString() === userId.toString() ? lastMsg.receiver : lastMsg.sender;
      const other = await User.findById(otherId).select('name role avatar');
      const unreadCount = await Message.countDocuments({
        conversationId: conv._id,
        receiver: userId,
        isRead: false,
      });
      return { conversationId: conv._id, other, lastMessage: lastMsg, unreadCount };
    })
  );

  return res.status(200).json(new ApiResponse(200, populated));
});

// GET /api/messages/:userId - Get messages with a user
const getMessages = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { page = 1, limit = 50 } = req.query;
  const conversationId = getConversationId(req.user._id.toString(), userId);

  const [total, messages] = await Promise.all([
    Message.countDocuments({ conversationId }),
    Message.find({ conversationId, isDeleted: false })
      .populate('sender', 'name avatar role')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit)),
  ]);

  // Mark as read
  await Message.updateMany(
    { conversationId, receiver: req.user._id, isRead: false },
    { isRead: true, readAt: new Date() }
  );

  return res.status(200).json(new ApiResponse(200, { messages: messages.reverse(), total }));
});

// POST /api/messages - Send message
const sendMessage = asyncHandler(async (req, res) => {
  const { receiverId, content, attachments } = req.body;

  if (!receiverId || !content) throw new ApiError(400, 'Receiver and content are required.');

  const receiver = await User.findById(receiverId);
  if (!receiver) throw new ApiError(404, 'Receiver not found.');

  const conversationId = getConversationId(req.user._id.toString(), receiverId);

  const message = await Message.create({
    sender: req.user._id,
    receiver: receiverId,
    content,
    attachments,
    conversationId,
  });

  const populated = await Message.findById(message._id)
    .populate('sender', 'name avatar role')
    .populate('receiver', 'name avatar role');

  // Emit via socket (handled in socket config)
  const io = req.app.get('io');
  if (io) {
    io.to(receiverId.toString()).emit('new_message', populated);
  }

  return res.status(201).json(new ApiResponse(201, populated, 'Message sent.'));
});

// GET /api/messages/users - Get users you can message
const getMessageableUsers = asyncHandler(async (req, res) => {
  const role = req.user.role;
  let roles = [];

  if (role === 'student') roles = ['teacher', 'admin'];
  else if (role === 'parent') roles = ['teacher', 'admin'];
  else if (role === 'teacher') roles = ['student', 'parent', 'admin', 'teacher'];
  else roles = ['principal', 'admin', 'teacher', 'student', 'parent', 'accountant', 'librarian'];

  const users = await User.find({ role: { $in: roles }, isActive: true, _id: { $ne: req.user._id } })
    .select('name role avatar');

  return res.status(200).json(new ApiResponse(200, users));
});

module.exports = { getConversations, getMessages, sendMessage, getMessageableUsers };
