const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');
const ApiError = require('../utils/ApiError');

const createCloudinaryStorage = (folder, allowedFormats = ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx']) => {
  return new CloudinaryStorage({
    cloudinary,
    params: {
      folder: `school-erp/${folder}`,
      allowed_formats: allowedFormats,
      resource_type: 'auto',
    },
  });
};

const fileFilter = (allowedTypes) => (req, file, cb) => {
  const mimeTypes = {
    images: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    documents: ['application/pdf', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    all: ['image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  };

  const allowed = mimeTypes[allowedTypes] || mimeTypes['all'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ApiError(400, `File type '${file.mimetype}' not allowed.`), false);
  }
};

const uploadAvatar = multer({
  storage: createCloudinaryStorage('avatars', ['jpg', 'jpeg', 'png']),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: fileFilter('images'),
});

const uploadDocument = multer({
  storage: createCloudinaryStorage('documents'),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: fileFilter('all'),
});

const uploadHomework = multer({
  storage: createCloudinaryStorage('homework'),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: fileFilter('all'),
});

const uploadLogo = multer({
  storage: createCloudinaryStorage('logos', ['jpg', 'jpeg', 'png', 'svg']),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: fileFilter('images'),
});

module.exports = { uploadAvatar, uploadDocument, uploadHomework, uploadLogo };
