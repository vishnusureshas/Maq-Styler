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

const slugify = (name) =>
  String(name)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export const createCategory = asyncHandler(async (req, res, next) => {
  const { name, slug, parent, image, isActive } = req.body;

  const cleanedName = String(name ?? '').trim();
  if (!cleanedName) return next(new ApiError(400, 'Category name is required'));

  const slugValue = slugify(slug || cleanedName);

  const dup = await Category.findOne({ $or: [{ name: cleanedName }, { slug: slugValue }] });
  if (dup) return next(new ApiError(409, 'Category already exists'));

  const category = await Category.create({ name: cleanedName, slug: slugValue, parent, image, isActive });
  await redisDel(CATEGORIES_CACHE_KEY);
  res.status(201).json({ success: true, category });
});

export const updateCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);
  if (!category) return next(new ApiError(404, 'Category not found'));

  const { name, slug, ...rest } = req.body;
  if (name !== undefined && String(name).trim() !== category.name) {
    category.name = String(name).trim();
    category.slug = slugify(slug || category.name);
  }
  if (slug !== undefined && slug !== category.slug) {
    category.slug = slugify(slug || category.name);
  }

  const dup = await Category.findOne({
    _id: { $ne: category._id },
    $or: [{ name: category.name }, { slug: category.slug }],
  });
  if (dup) return next(new ApiError(409, 'Category already exists'));

  Object.assign(category, rest);
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