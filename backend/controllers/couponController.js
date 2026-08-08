import Coupon from '../models/Coupon.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find({}).sort({ createdAt: -1 });
  res.json({ success: true, coupons });
});

export const createCoupon = asyncHandler(async (req, res, next) => {
  const coupon = await Coupon.create(req.body);
  res.status(201).json({ success: true, coupon });
});

export const updateCoupon = asyncHandler(async (req, res, next) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) return next(new ApiError(404, 'Coupon not found'));

  Object.assign(coupon, req.body);
  await coupon.save();

  res.json({ success: true, coupon });
});

export const deleteCoupon = asyncHandler(async (req, res, next) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) return next(new ApiError(404, 'Coupon not found'));
  await coupon.deleteOne();
  res.json({ success: true, message: 'Coupon deleted' });
});

export const validateCoupon = asyncHandler(async (req, res, next) => {
  const coupon = await Coupon.findOne({ code: req.params.code.toUpperCase(), isActive: true });
  if (!coupon) return next(new ApiError(404, 'Invalid coupon code'));

  const now = Date.now();
  if (coupon.expiresAt && coupon.expiresAt < now) return next(new ApiError(400, 'Coupon expired'));
  if (coupon.startsAt && coupon.startsAt > now) return next(new ApiError(400, 'Coupon not yet active'));
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit)
    return next(new ApiError(400, 'Coupon usage limit reached'));

  res.json({ success: true, coupon });
});