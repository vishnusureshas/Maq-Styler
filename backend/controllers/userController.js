import User from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  res.json({ success: true, user });
});

export const updateProfile = asyncHandler(async (req, res, next) => {
  const { name, profileImage, address } = req.body;
  const user = await User.findById(req.user._id);

  if (name) user.name = name;
  if (profileImage) user.profileImage = profileImage;
  if (address) user.address = { ...user.address, ...address };

  await user.save();
  res.json({ success: true, user });
});

export const changePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.matchPassword(currentPassword))) {
    return next(new ApiError(400, 'Current password is incorrect'));
  }

  user.password = newPassword;
  await user.save();

  res.json({ success: true, message: 'Password changed successfully' });
});

export const deactivateAccount = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { isActive: false });
  res.json({ success: true, message: 'Account deactivated' });
});