import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    orderNumber: { type: String, unique: true },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        name: String,
        price: Number,
        quantity: { type: Number, required: true },
        image: String,
        variant: Map,
      },
    ],
    shippingAddress: {
      fullName: String,
      address: String,
      city: String,
      state: String,
      zip: String,
      country: String,
      phone: String,
    },
    paymentMethod: { type: String, enum: ['card', 'cod', 'paypal'], default: 'card' },
    paymentResult: {
      id: String,
      status: String,
      update_time: String,
      email_address: String,
    },
    taxPrice: { type: Number, default: 0 },
    shippingPrice: { type: Number, default: 0 },
    itemsPrice: { type: Number, default: 0 },
    totalPrice: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    coupon: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon' },
    isPaid: { type: Boolean, default: false },
    paidAt: Date,
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
    status: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
      default: 'pending',
    },
    statusHistory: [{ status: String, changedAt: Date, note: String }],
    deliveredAt: Date,
  },
  { timestamps: true }
);

orderSchema.pre('save', async function (next) {
  if (!this.orderNumber) {
    this.orderNumber = `ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
  }
  next();
});

const Order = mongoose.model('Order', orderSchema);
export default Order;