import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.js';

dotenv.config();

const slugify = (name) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const products = await Product.find({ $or: [{ slug: { $exists: false } }, { slug: '' }, { slug: null }] });
  for (const p of products) {
    p.slug = slugify(p.name) || p._id.toString();
    await p.save();
  }
  console.log(`Backfilled slugs for ${products.length} products`);
  await mongoose.disconnect();
  process.exit(0);
};

run().catch(async (e) => {
  console.error(e.message);
  await mongoose.disconnect();
  process.exit(1);
});