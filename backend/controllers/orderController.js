import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendOrderConfirmation } from '../utils/emailService.js';

const calculateShipping = (address) => 10;

export const createOrder = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
  if (!cart || cart.items.length === 0) return next(new ApiError(400, 'Cart is empty'));

  const { shippingAddress, paymentMethod = 'card' } = req.body;

  let itemsPrice = 0;
  const items = cart.items.map((i) => {
    const price = i.product.price;
    itemsPrice += price * i.quantity;
    return {
      product: i.product._id,
      name: i.product.name,
      price,
      quantity: i.quantity,
      image: i.product.images?.[0],
      variant: i.variant,
    };
  });

  const shippingPrice = itemsPrice >= 100 ? 0 : calculateShipping(shippingAddress);
  const discount = cart.totalDiscount || 0;
  const totalPrice = itemsPrice + shippingPrice - discount;

  // Redeem coupon: validate usage limit and increment the counter atomically
  if (cart.appliedCoupon && discount > 0) {
    const coupon = await Coupon.findById(cart.appliedCoupon);
    if (coupon) {
      if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
        return next(new ApiError(400, 'Coupon usage limit reached'));
      }
      await Coupon.findByIdAndUpdate(coupon._id, { $inc: { usedCount: 1 } });
    }
  }

  const order = await Order.create({
    user: req.user.id,
    items,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    shippingPrice,
    discount,
    totalPrice,
    coupon: cart.appliedCoupon || undefined,
  });

  for (const item of items) {
    await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
  }

  cart.items = [];
  cart.totalPrice = 0;
  cart.totalDiscount = 0;
  cart.appliedCoupon = undefined;
  await cart.save();

  try {
    await sendOrderConfirmation(req.user.email, order);
  } catch {
    // email failure shouldn't block order creation
  }

  res.status(201).json({ success: true, order });
});

export const myOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
  res.json({ success: true, orders });
});

export const getOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');
  if (!order) return next(new ApiError(404, 'Order not found'));

  if (String(order.user._id) !== String(req.user.id) && req.user.role !== 'admin') {
    return next(new ApiError(403, 'Not authorized to view this order'));
  }
  res.json({ success: true, order });
});

export const cancelOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) return next(new ApiError(404, 'Order not found'));

  if (String(order.user) !== String(req.user.id) && req.user.role !== 'admin') {
    return next(new ApiError(403, 'Not authorized'));
  }
  if (!['pending', 'processing'].includes(order.status)) {
    return next(new ApiError(400, 'Order cannot be cancelled at this stage'));
  }

  order.status = 'cancelled';
  order.statusHistory.push({ status: 'cancelled', changedAt: new Date(), note: 'Cancelled by user' });

  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
  }
  await order.save();

  res.json({ success: true, order });
});

export const returnOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) return next(new ApiError(404, 'Order not found'));

  if (String(order.user) !== String(req.user.id) && req.user.role !== 'admin') {
    return next(new ApiError(403, 'Not authorized'));
  }
  if (!['delivered', 'shipped'].includes(order.status)) {
    return next(new ApiError(400, 'Only delivered or shipped orders can be returned'));
  }

  order.status = 'refunded';
  order.paymentStatus = order.isPaid ? 'refunded' : order.paymentStatus;
  order.statusHistory.push({ status: 'refunded', changedAt: new Date(), note: 'Return requested by user' });

  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
  }
  await order.save();

  res.json({ success: true, order });
});