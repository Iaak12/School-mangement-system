const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    throw new ApiError(401, 'Access denied. No token provided.');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password -refreshTokens');

    if (!user) throw new ApiError(401, 'User no longer exists.');
    if (!user.isActive) throw new ApiError(401, 'Account is deactivated. Contact admin.');
    if (user.changedPasswordAfter(decoded.iat)) {
      throw new ApiError(401, 'Password recently changed. Please log in again.');
    }

    req.user = user;
    next();
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(401, 'Invalid or expired token.');
  }
});

const refreshTokenHandler = asyncHandler(async (req, res, next) => {
  const { refreshToken } = req.body || req.cookies;
  if (!refreshToken) throw new ApiError(401, 'Refresh token required.');

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) throw new ApiError(401, 'User not found.');

    const validToken = user.refreshTokens.find((rt) => rt.token === refreshToken);
    if (!validToken || new Date() > validToken.expiresAt) {
      throw new ApiError(401, 'Invalid or expired refresh token.');
    }

    const { generateTokens } = require('../utils/generateTokens');
    const tokens = generateTokens(user);

    // Rotate refresh token
    user.refreshTokens = user.refreshTokens.filter((rt) => rt.token !== refreshToken);
    user.refreshTokens.push({
      token: tokens.refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    await user.save();

    req.tokens = tokens;
    req.user = user;
    next();
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(401, 'Invalid refresh token.');
  }
});

module.exports = { protect, refreshTokenHandler };
