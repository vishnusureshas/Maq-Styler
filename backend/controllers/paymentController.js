import Stripe from 'stripe';
import Order from '../models/Order.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createPaymentIntent = asyncHandler(async (req, res, next) => {
  const { orderId } = req.body;
  const order = await Order.findById(orderId);
  if (!order) return next(new ApiError(404, 'Order not found'));

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(order.totalPrice * 100),
    currency: 'usd',
    automatic_payment_methods: { enabled: true },
    metadata: { orderId: order._id.toString() },
  });

  res.json({
    success: true,
    clientSecret: paymentIntent.client_secret,
    publishableKey: process.env.STRIPE_PUBLISHABLE,
  });
});

export const confirmOrder = asyncHandler(async (req, res, next) => {
  const { orderId } = req.body;
  const order = await Order.findById(orderId);
  if (!order) return next(new ApiError(404, 'Order not found'));
  if (String(order.user) !== String(req.user.id) && req.user.role !== 'admin') {
    return next(new ApiError(403, 'Not authorized'));
  }

  // COD confirmation — no remote payment; mark order as pending but confirmed.
  order.paymentStatus = 'pending';
  order.statusHistory.push({ status: order.status, changedAt: new Date(), note: 'Order confirmed (COD)' });
  await order.save();

  res.json({ success: true, order });
});

export const webhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data.object;
    await Order.findOneAndUpdate(
      { _id: pi.metadata.orderId },
      { isPaid: true, paidAt: Date.now(), paymentStatus: 'paid', status: 'processing' }
    );
  }
  if (event.type === 'payment_intent.payment_failed') {
    const pi = event.data.object;
    await Order.findOneAndUpdate(
      { _id: pi.metadata.orderId },
      { paymentStatus: 'failed' }
    );
  }
  res.json({ received: true });
};