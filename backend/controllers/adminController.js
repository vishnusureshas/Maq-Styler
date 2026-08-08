import User from '../models/User.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Inventory from '../models/Inventory.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendOrderStatusEmail } from '../utils/emailService.js';

export const getStats = asyncHandler(async (req, res, next) => {
  const today = new Date();
  const MonthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  const [totalUsers, totalOrders, totalProducts, revenue, recentOrders] = await Promise.all([
    User.countDocuments({}),
    Order.countDocuments({}),
    Product.countDocuments({}),
    Order.aggregate([
      { $match: { isPaid: true, paidAt: { $gte: MonthStart } } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]),
    Order.find().sort({ createdAt: -1 }).limit(5),
  ]);

  res.json({
    success: true,
    stats: {
      totalUsers,
      totalOrders,
      totalProducts,
      monthlyRevenue: revenue[0]?.total || 0,
      recentOrders,
    },
  });
});

export const getAllOrders = asyncHandler(async (req, res) => {
  const pageSize = Number(req.query.pageSize) || 10;
  const page = Number(req.query.page) || 1;
  const status = req.query.status ? { status: req.query.status } : {};

  const count = await Order.countDocuments(status);
  const orders = await Order.find(status)
    .populate('user', 'name email')
    .sort({ createdAt: -1 })
    .skip(pageSize * (page - 1))
    .limit(pageSize);

  res.json({ success: true, orders, page, pages: Math.ceil(count / pageSize), count });
});

export const updateOrderStatus = asyncHandler(async (req, res, next) => {
  const { status, note } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) return next(new ApiError(404, 'Order not found'));

  order.status = status;
  order.statusHistory.push({ status, changedAt: new Date(), note });
  if (status === 'delivered') {
    order.deliveredAt = Date.now();
  }
  if (status === 'cancelled' || status === 'refunded') {
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
    }
  }
  await order.save();

  try {
    const user = await User.findById(order.user).select('email');
    if (user?.email) await sendOrderStatusEmail(user.email, order, status);
  } catch {
    // email failure shouldn't block the status update
  }

  res.json({ success: true, order });
});

export const updateOrderPayment = asyncHandler(async (req, res, next) => {
  const { isPaid, status } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) return next(new ApiError(404, 'Order not found'));

  order.isPaid = isPaid;
  if (isPaid) order.paidAt = Date.now();
  if (status) order.status = status;
  await order.save();

  res.json({ success: true, order });
});

export const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select('-password').sort({ createdAt: -1 });
  res.json({ success: true, users });
});

export const updateUser = asyncHandler(async (req, res, next) => {
  const { role, isActive } = req.body;
  const user = await User.findByIdAndUpdate(req.params.id, { role, isActive }, { new: true }).select('-password');
  if (!user) return next(new ApiError(404, 'User not found'));
  res.json({ success: true, user });
});

export const deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) return next(new ApiError(404, 'User not found'));
  await user.deleteOne();
  res.json({ success: true, message: 'User deleted' });
});

export const lowStock = asyncHandler(async (req, res) => {
  const products = await Product.find({ stock: { $lte: 10 }, isActive: true }).sort({ stock: 1 });
  res.json({ success: true, products });
});

export const getInventory = asyncHandler(async (req, res) => {
  const inventory = await Inventory.find({}).populate('product', 'name sku price');
  res.json({ success: true, inventory });
});

export const adjustInventory = asyncHandler(async (req, res, next) => {
  const { quantity, note } = req.body;
  const inv = await Inventory.findOne({ product: req.params.id });
  if (!inv) return next(new ApiError(404, 'Inventory not found'));

  inv.quantity += quantity;
  inv.history.push({ type: 'adjust', quantity, note, changedBy: req.user._id });
  await inv.save();
  await Product.findByIdAndUpdate(req.params.id, { stock: inv.quantity });

  res.json({ success: true, inventory: inv });
});

export const salesReport = asyncHandler(async (req, res) => {
  const { from, to } = req.query;
  const match = { isPaid: true, paidAt: { $exists: true } };
  if (from) match.paidAt = { ...match.paidAt, $gte: new Date(from) };
  if (to) match.paidAt = { ...match.paidAt, $lte: new Date(to) };

  const report = await Order.aggregate([
    { $match: match },
    {
      $group: {
        _id: {
          year: { $year: '$paidAt' },
          month: { $month: '$paidAt' },
          day: { $dayOfMonth: '$paidAt' },
        },
        revenue: { $sum: '$totalPrice' },
        orders: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': -1, '_id.month': -1, '_id.day': -1 } },
  ]);

  res.json({ success: true, report });
});