const Settings = require('../models/Settings');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/settings
const getSettings = asyncHandler(async (req, res) => {
  let settings = await Settings.findOne();
  if (!settings) settings = await Settings.create({});
  return res.status(200).json(new ApiResponse(200, settings));
});

// PUT /api/settings
const updateSettings = asyncHandler(async (req, res) => {
  let settings = await Settings.findOne();
  if (settings) {
    Object.assign(settings, req.body);
    await settings.save();
  } else {
    settings = await Settings.create({ ...req.body, isConfigured: true });
  }
  return res.status(200).json(new ApiResponse(200, settings, 'Settings updated.'));
});

// POST /api/settings/logo (handled by upload middleware, then this)
const uploadLogo = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'No file uploaded.');
  const settings = await Settings.findOneAndUpdate(
    {},
    { logo: { url: req.file.path, publicId: req.file.filename } },
    { new: true, upsert: true }
  );
  return res.status(200).json(new ApiResponse(200, settings, 'Logo updated.'));
});

module.exports = { getSettings, updateSettings, uploadLogo };
