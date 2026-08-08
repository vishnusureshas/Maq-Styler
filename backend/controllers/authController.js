import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendTokenResponse, generateAccessToken, generateRefreshToken, revokeRefreshToken, storeRefreshToken } from '../utils/generateToken.js';
import { sendEmail } from '../utils/emailService.js';

export const register = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) return next(new ApiError(409, 'User already exists'));

  const user = await User.create({ name, email, password });

  const verifyToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
  const verifyUrl = `${process.env.CLIENT_URL}/verify-email/${verifyToken}`;

  try {
    await sendEmail({
      to: user.email,
      subject: 'Verify your email',
      html: `<a href="${verifyUrl}">Click to verify your email</a>`,
    });
  } catch (err) {
    // SMTP may be unavailable in dev; registration should not fail
  }

  await sendTokenResponse(res, user, 201);
});

export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    return next(new ApiError(401, 'Invalid credentials'));
  }
  if (!user.isActive) {
    return next(new ApiError(401, 'Account deactivated'));
  }
  await sendTokenResponse(res, user);
});

export const logout = asyncHandler(async (req, res) => {
  if (req.user?._id) await revokeRefreshToken(req.user._id.toString());
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0),
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
  });
  res.json({ success: true, message: 'Logged out successfully' });
});

export const verifyEmail = asyncHandler(async (req, res, next) => {
  const { token } = req.params;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    await User.findByIdAndUpdate(decoded.id, { isEmailVerified: true });
    res.json({ success: true, message: 'Email verified' });
  } catch {
    next(new ApiError(400, 'Invalid or expired token'));
  }
});

export const forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return next(new ApiError(404, 'No user with that email'));

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '10m' });
  user.resetPasswordToken = token;
  user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;
  try {
    await sendEmail({
      to: user.email,
      subject: 'Reset your password',
      html: `<a href="${resetUrl}">Click to reset your password</a>`,
    });
  } catch (err) {
    // best-effort email delivery
  }

  res.json({ success: true, message: 'Reset link sent to email' });
});

export const resetPassword = asyncHandler(async (req, res, next) => {
  const { token } = req.params;
  const { password } = req.body;

  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() },
  });
  if (!user) return next(new ApiError(400, 'Invalid or expired token'));

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  await sendTokenResponse(res, user);
});

export const refreshToken = asyncHandler(async (req, res, next) => {
  const { refreshToken: incoming } = req.body;
  if (!incoming) return next(new ApiError(401, 'No refresh token'));

  try {
    const decoded = jwt.verify(incoming, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return next(new ApiError(401, 'User not found'));

    const accessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);
    user.refreshToken = newRefreshToken;
    await user.save();

    await storeRefreshToken(user._id.toString(), newRefreshToken);

    res.json({ success: true, token: accessToken, refreshToken: newRefreshToken });
  } catch {
    next(new ApiError(401, 'Invalid refresh token'));
  }
});

export const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user });
});