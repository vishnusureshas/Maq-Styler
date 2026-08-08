import Product from '../models/Product.js';
import Inventory from '../models/Inventory.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import cloudinary from '../config/cloudinary.js';
import { redisGet, redisSet, redisDelPattern } from '../config/redis.js';

const PRODUCTS_CACHE_PREFIX = 'products:';
const PRODUCTS_CACHE_TTL = 300; // 5 min

const invalidateProductsCache = async () => {
  await redisDelPattern(`${PRODUCTS_CACHE_PREFIX}*`);
};

const uploadToCloudinary = async (buffer) => {
  return new Promise((resolve, reject) => {
    const upload = cloudinary.uploader.upload_stream(
      { folder: 'ecommerce/products', resource_type: 'image' },
      (error, result) => (error ? reject(error) : resolve(result.secure_url))
    );
    upload.end(buffer);
  });
};

export const uploadImages = asyncHandler(async (req, res, next) => {
  if (!req.files?.length) return next(new ApiError(400, 'No images uploaded'));
  const urls = [];
  for (const file of req.files) {
    urls.push(await uploadToCloudinary(file.buffer));
  }
  res.json({ success: true, urls });
});

export const getProducts = asyncHandler(async (req, res) => {
  const pageSize = Number(req.query.pageSize) || 10;
  const page = Number(req.query.page) || 1;

  const keyword = req.query.keyword
    ? { name: { $regex: req.query.keyword, $options: 'i' } }
    : {};
  const category = req.query.category ? { category: req.query.category } : {};
  const featured = req.query.featured ? { isFeatured: req.query.featured === 'true' } : {};
  const price = {};
  if (req.query.minPrice !== undefined && req.query.minPrice !== '') {
    const min = Number(req.query.minPrice);
    if (!Number.isNaN(min)) price.$gte = min;
  }
  if (req.query.maxPrice !== undefined && req.query.maxPrice !== '') {
    const max = Number(req.query.maxPrice);
    if (!Number.isNaN(max)) price.$lte = max;
  }

  const filter = { isActive: true, ...keyword, ...category, ...featured, ...(Object.keys(price).length ? { price } : {}) };

  const cacheKey = `${PRODUCTS_CACHE_PREFIX}list:${JSON.stringify({ page, pageSize, keyword, category, featured, price })}`;
  const cached = await redisGet(cacheKey);
  if (cached) return res.json(cached);

  const count = await Product.countDocuments(filter);
  const products = await Product.find(filter)
    .populate('category', 'name')
    .sort({ createdAt: -1 })
    .skip(pageSize * (page - 1))
    .limit(pageSize);

  const payload = {
    success: true,
    products,
    page,
    pages: Math.ceil(count / pageSize),
    count,
  };

  await redisSet(cacheKey, payload, PRODUCTS_CACHE_TTL);
  res.json(payload);
});

export const getProduct = asyncHandler(async (req, res, next) => {
  const cacheKey = `${PRODUCTS_CACHE_PREFIX}detail:${req.params.id}`;
  const cached = await redisGet(cacheKey);
  if (cached) return res.json({ success: true, product: cached });

  const product = await Product.findById(req.params.id).populate('category', 'name');
  if (!product) return next(new ApiError(404, 'Product not found'));
  await redisSet(cacheKey, product.toObject(), PRODUCTS_CACHE_TTL);
  res.json({ success: true, product });
});

export const getProductBySlug = asyncHandler(async (req, res, next) => {
  const cacheKey = `${PRODUCTS_CACHE_PREFIX}slug:${req.params.slug}`;
  const cached = await redisGet(cacheKey);
  if (cached) return res.json({ success: true, product: cached });

  const product = await Product.findOne({ slug: req.params.slug }).populate('category', 'name');
  if (!product) return next(new ApiError(404, 'Product not found'));
  await redisSet(cacheKey, product.toObject(), PRODUCTS_CACHE_TTL);
  res.json({ success: true, product });
});

export const createProduct = asyncHandler(async (req, res) => {
  const { name, description, brand, price, compareAtPrice, category, images, stock, sku, variants, isFeatured, tags } =
    req.body;

  const uploaded = [];
  if (req.files?.length) {
    for (const file of req.files) {
      uploaded.push(await uploadToCloudinary(file.buffer));
    }
  }

  const product = await Product.create({
    name,
    description,
    brand,
    price,
    compareAtPrice,
    category,
    images: [...(Array.isArray(images) ? images : []), ...uploaded],
    stock,
    sku,
    variants,
    isFeatured,
    tags,
  });

  await Inventory.create({ product: product._id, sku, quantity: stock });

  await invalidateProductsCache();
  res.status(201).json({ success: true, product });
});

export const updateProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) return next(new ApiError(404, 'Product not found'));

  Object.assign(product, req.body);
  await product.save();

  await Inventory.findOneAndUpdate(
    { product: product._id },
    { quantity: req.body.stock ?? product.stock, sku: req.body.sku ?? product.sku }
  );

  await invalidateProductsCache();
  res.json({ success: true, product });
});

export const deleteProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) return next(new ApiError(404, 'Product not found'));

  await product.deleteOne();
  await Inventory.deleteOne({ product: product._id });

  await invalidateProductsCache();
  res.json({ success: true, message: 'Product deleted' });
});