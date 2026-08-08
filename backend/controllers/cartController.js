import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const recalcCart = async (cart) => {
  await cart.populate('items.product');
  cart.totalPrice = 0;
  for (const item of cart.items) {
    item.priceAtAdd = item.product.price;
    cart.totalPrice += item.product.price * item.quantity;
  }
  cart.totalDiscount = 0;
  return cart;
};

export const getCart = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
  res.json({ success: true, cart: cart || { items: [], totalPrice: 0 } });
});

export const addItem = asyncHandler(async (req, res, next) => {
  const { productId, quantity = 1, variant } = req.body;
  const product = await Product.findById(productId);
  if (!product) return next(new ApiError(404, 'Product not found'));
  if (product.stock < quantity) return next(new ApiError(400, 'Insufficient stock'));

  let cart = await Cart.findOne({ user: req.user.id });
  if (!cart) cart = new Cart({ user: req.user.id, items: [] });

  const existing = cart.items.find(
    (i) => String(i.product) === String(productId) && JSON.stringify(i.variant) === JSON.stringify(variant)
  );

  if (existing) {
    existing.quantity += quantity;
    if (existing.quantity > product.stock) return next(new ApiError(400, 'Exceeds available stock'));
  } else {
    cart.items.push({ product: productId, quantity, variant, priceAtAdd: product.price });
  }

  cart = await recalcCart(cart);
  await cart.save();
  res.json({ success: true, cart });
});

export const updateItem = asyncHandler(async (req, res, next) => {
  const { quantity, variant } = req.body;
  const cart = await Cart.findOne({ user: req.user.id });
  if (!cart) return next(new ApiError(404, 'Cart not found'));

  const item = cart.items.find((i) => String(i.product) === String(req.params.productId));
  if (!item) return next(new ApiError(404, 'Item not found in cart'));

  const product = await Product.findById(req.params.productId);
  if (quantity) {
    if (quantity > product.stock) return next(new ApiError(400, 'Exceeds available stock'));
    item.quantity = quantity;
  }
  if (variant) item.variant = variant;

  await (await recalcCart(cart)).save();
  res.json({ success: true, cart });
});

export const removeItem = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user.id });
  if (!cart) return next(new ApiError(404, 'Cart not found'));

  cart.items = cart.items.filter((i) => String(i.product) !== String(req.params.productId));
  await (await recalcCart(cart)).save();
  res.json({ success: true, cart });
});

export const clearCart = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user.id });
  if (!cart) return next(new ApiError(404, 'Cart not found'));

  cart.items = [];
  cart.totalPrice = 0;
  cart.totalDiscount = 0;
  await cart.save();

  res.json({ success: true, cart });
});

export const applyCoupon = asyncHandler(async (req, res, next) => {
  const { code } = req.body;
  const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
  if (!cart || cart.items.length === 0) return next(new ApiError(400, 'Cart is empty'));

  const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
  if (!coupon) return next(new ApiError(404, 'Invalid coupon code'));
  if (coupon.expiresAt && coupon.expiresAt < Date.now()) return next(new ApiError(400, 'Coupon expired'));
  if (coupon.startsAt && coupon.startsAt > Date.now()) return next(new ApiError(400, 'Coupon not yet active'));
  if (cart.totalPrice < coupon.minOrderValue)
    return next(new ApiError(400, `Minimum order of $${coupon.minOrderValue} required`));

  let discount = coupon.type === 'percentage' ? (cart.totalPrice * coupon.value) / 100 : coupon.value;
  if (coupon.maxDiscount && discount > coupon.maxDiscount) discount = coupon.maxDiscount;

  cart.totalDiscount = discount;
  cart.appliedCoupon = coupon._id;
  await cart.save();

  res.json({ success: true, cart, discount });
});

export const removeCoupon = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user.id });
  if (!cart) return next(new ApiError(404, 'Cart not found'));

  cart.totalDiscount = 0;
  cart.appliedCoupon = undefined;
  await cart.save();

  res.json({ success: true, cart });
});