const express = require('express');
const router = express.Router();
const Document = require('../models/Document');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/rbac.middleware');
const { uploadDocument } = require('../middlewares/upload.middleware');

router.use(protect);

router.get('/', asyncHandler(async (req, res) => {
  const { owner, ownerType, type } = req.query;
  const query = {};
  if (owner) query.owner = owner;
  if (ownerType) query.ownerType = ownerType;
  if (type) query.type = type;

  const documents = await Document.find(query).populate('uploadedBy', 'name');
  return res.status(200).json(new ApiResponse(200, documents));
}));

router.post('/', uploadDocument.single('file'), asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'No file uploaded.');

  const doc = await Document.create({
    ...req.body,
    file: {
      url: req.file.path,
      publicId: req.file.filename,
      format: req.file.format,
      size: req.file.size,
    },
    uploadedBy: req.user._id,
  });
  return res.status(201).json(new ApiResponse(201, doc, 'Document uploaded.'));
}));

router.put('/:id/verify', authorize('admin', 'principal'), asyncHandler(async (req, res) => {
  const doc = await Document.findByIdAndUpdate(
    req.params.id,
    { isVerified: true, verifiedBy: req.user._id },
    { new: true }
  );
  if (!doc) throw new ApiError(404, 'Document not found.');
  return res.status(200).json(new ApiResponse(200, doc, 'Document verified.'));
}));

router.delete('/:id', authorize('admin', 'principal'), asyncHandler(async (req, res) => {
  const doc = await Document.findByIdAndDelete(req.params.id);
  if (!doc) throw new ApiError(404, 'Document not found.');
  // TODO: Delete from cloudinary
  return res.status(200).json(new ApiResponse(200, null, 'Document deleted.'));
}));

module.exports = router;
