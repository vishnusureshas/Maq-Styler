import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, unique: true },
    sku: String,
    quantity: { type: Number, default: 0 },
    lowStockThreshold: { type: Number, default: 5 },
    reserved: { type: Number, default: 0 },
    history: [
      {
        type: { type: String, enum: ['in', 'out', 'adjust'], required: true },
        quantity: Number,
        note: String,
        changedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

const Inventory = mongoose.model('Inventory', inventorySchema);
export default Inventory;