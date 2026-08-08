import Review from '../models/Review.js';
import Product from '../models/Product.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const updateProductRating = async (productId) => {
  const stats = await Review.aggregate([
    { $match: { product: productId } },
    { $group: { _id: '$product', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  const [result] = stats;
  await Product.findByIdAndUpdate(productId, {
    ratingsAverage: result ? Math.round(result.avg * 10) / 10 : 0,
    ratingsQuantity: result ? result.count : 0,
  });
};

export const getProductReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ product: req.params.productId })
    .populate('user', 'name')
    .sort({ createdAt: -1 });
  res.json({ success: true, reviews });
});

export const createReview = asyncHandler(async (req, res, next) => {
  const { rating, title, comment } = req.body;
  const product = await Product.findById(req.params.productId);
  if (!product) return next(new ApiError(404, 'Product not found'));

  const review = await Review.create({
    product: product._id,
    user: req.user.id,
    rating,
    title,
    comment,
  });

  await updateProductRating(product._id);
  res.status(201).json({ success: true, review });
});

export const updateReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);
  if (!review) return next(new ApiError(404, 'Review not found'));
  if (String(review.user) !== String(req.user.id) && req.user.role !== 'admin') {
    return next(new ApiError(403, 'Not authorized to update this review'));
  }

  Object.assign(review, req.body);
  await review.save();

  await updateProductRating(review.product);
  res.json({ success: true, review });
});

export const deleteReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);
  if (!review) return next(new ApiError(404, 'Review not found'));
  if (String(review.user) !== String(req.user.id) && req.user.role !== 'admin') {
    return next(new ApiError(403, 'Not authorized to delete this review'));
  }

  const productId = review.product;
  await review.deleteOne();

  await updateProductRating(productId);
  res.json({ success: true, message: 'Review deleted' });
});