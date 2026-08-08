import Category from '../models/Category.js';
import Product from '../models/Product.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { redisGet, redisSet, redisDel } from '../config/redis.js';

const CATEGORIES_CACHE_KEY = 'categories:active';
const CATEGORIES_CACHE_TTL = 300;

export const getCategories = asyncHandler(async (req, res) => {
  const cached = await redisGet(CATEGORIES_CACHE_KEY);
  if (cached) return res.json({ success: true, categories: cached });

  const categories = await Category.find({ isActive: true }).sort({ name: 1 });
  await redisSet(CATEGORIES_CACHE_KEY, categories.map((c) => c.toObject()), CATEGORIES_CACHE_TTL);
  res.json({ success: true, categories });
});

export const createCategory = asyncHandler(async (req, res, next) => {
  const { name, parent, image } = req.body;

  const exists = await Category.findOne({ name });
  if (exists) return next(new ApiError(409, 'Category already exists'));

  const category = await Category.create({ name, parent, image });
  await redisDel(CATEGORIES_CACHE_KEY);
  res.status(201).json({ success: true, category });
});

export const updateCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);
  if (!category) return next(new ApiError(404, 'Category not found'));

  Object.assign(category, req.body);
  await category.save();

  await redisDel(CATEGORIES_CACHE_KEY);
  res.json({ success: true, category });
});

export const deleteCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);
  if (!category) return next(new ApiError(404, 'Category not found'));

  const hasProducts = await Product.exists({ category: category._id });
  if (hasProducts) return next(new ApiError(400, 'Cannot delete category with products'));

  await category.deleteOne();
  await redisDel(CATEGORIES_CACHE_KEY);
  res.json({ success: true, message: 'Category deleted' });
});