const crypto = require('crypto');
const User = require('../models/User');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Parent = require('../models/Parent');
const Staff = require('../models/Staff');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { generateTokens } = require('../utils/generateTokens');
const { sendEmail } = require('../services/email.service');

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new ApiError(400, 'Email and password are required.');

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Invalid email or password.');
  }
  if (!user.isActive) throw new ApiError(401, 'Account deactivated. Contact admin.');

  const tokens = generateTokens(user);
  user.lastLogin = Date.now();
  user.refreshTokens.push({
    token: tokens.refreshToken,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });
  // Keep max 5 refresh tokens
  if (user.refreshTokens.length > 5) {
    user.refreshTokens = user.refreshTokens.slice(-5);
  }
  await user.save({ validateBeforeSave: false });

  res.cookie('refreshToken', tokens.refreshToken, COOKIE_OPTIONS);

  return res.status(200).json(
    new ApiResponse(200, {
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
      accessToken: tokens.accessToken,
    }, 'Login successful.')
  );
});

// POST /api/auth/logout
const logout = asyncHandler(async (req, res) => {
  const refreshToken = req.body?.refreshToken || req.cookies?.refreshToken;
  if (req.user) {
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { refreshTokens: { token: refreshToken } },
    });
  }
  res.clearCookie('refreshToken');
  return res.status(200).json(new ApiResponse(200, null, 'Logged out successfully.'));
});

// POST /api/auth/refresh-token
const refreshToken = asyncHandler(async (req, res) => {
  const tokens = req.tokens;
  res.cookie('refreshToken', tokens.refreshToken, COOKIE_OPTIONS);
  return res.status(200).json(
    new ApiResponse(200, { accessToken: tokens.accessToken }, 'Token refreshed.')
  );
});

// POST /api/auth/forgot-password
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) throw new ApiError(404, 'No account found with this email.');

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
  try {
    await sendEmail({
      to: user.email,
      subject: 'Password Reset Request',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
          <h2>Password Reset</h2>
          <p>Click the button below to reset your password. This link expires in 10 minutes.</p>
          <a href="${resetUrl}" style="background:#4f46e5;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;">Reset Password</a>
          <p style="color:#666;margin-top:20px;">If you didn't request this, ignore this email.</p>
        </div>
      `,
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    throw new ApiError(500, 'Error sending email. Try again later.');
  }

  return res.status(200).json(new ApiResponse(200, null, 'Password reset email sent.'));
});

// POST /api/auth/reset-password/:token
const resetPassword = asyncHandler(async (req, res) => {
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) throw new ApiError(400, 'Reset token is invalid or has expired.');

  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.refreshTokens = [];
  await user.save();

  return res.status(200).json(new ApiResponse(200, null, 'Password reset successfully. Please login.'));
});

// PUT /api/auth/change-password
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');

  if (!(await user.comparePassword(currentPassword))) {
    throw new ApiError(400, 'Current password is incorrect.');
  }

  user.password = newPassword;
  user.refreshTokens = [];
  await user.save();

  return res.status(200).json(new ApiResponse(200, null, 'Password changed successfully.'));
});

// GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-refreshTokens');
  return res.status(200).json(new ApiResponse(200, user, 'Profile fetched.'));
});

module.exports = { login, logout, refreshToken, forgotPassword, resetPassword, changePassword, getMe };
