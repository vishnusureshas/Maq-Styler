import mongoose from 'mongoose';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import User from '../models/User.js';
import dotenv from 'dotenv';
import { pathToFileURL } from 'url';

dotenv.config();

const categories = [
  { name: 'Electronics', slug: 'electronics' },
  { name: 'Clothing', slug: 'clothing' },
  { name: 'Home & Kitchen', slug: 'home-kitchen' },
];

const products = [
  {
    name: 'Wireless Headphones',
    description: 'High-quality over-ear wireless headphones.',
    price: 99.99,
    category: 'electronics',
    stock: 50,
  },
];

export const seedData = async () => {
  await connectDBGuard();
  await Category.deleteMany({});
  await Product.deleteMany({});
  await User.deleteMany({});

  const [electronics] = await Category.insertMany(categories);

  await Product.insertMany(
    products.map((p) => ({
      ...p,
      category: electronics._id,
    }))
  );

  await User.create({
    name: 'Admin',
    email: 'admin@example.com',
    password: 'admin123',
    role: 'admin',
  });

  console.log('Database seeded');
  mongoose.connection.close();
  process.exit(0);
};

const connectDBGuard = async () => {
  const { default: connectDB } = await import('../config/db.js');
  await connectDB();
};

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  seedData();
}