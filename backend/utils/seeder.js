import mongoose from 'mongoose';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Inventory from '../models/Inventory.js';
import User from '../models/User.js';
import dotenv from 'dotenv';
import { pathToFileURL } from 'url';

dotenv.config();

export const categories = [
  { name: 'Electronics', slug: 'electronics' },
  { name: 'Clothing', slug: 'clothing' },
  { name: 'Home & Kitchen', slug: 'home-kitchen' },
  { name: 'Beauty', slug: 'beauty' },
  { name: 'Sports', slug: 'sports' },
  { name: 'Toys & Games', slug: 'toys-games' },
  { name: 'Books', slug: 'books' },
  { name: 'Automotive', slug: 'automotive' },
];

export const products = [
  // Electronics
  {
    name: 'Wireless Headphones',
    description: 'High-quality over-ear wireless headphones with noise cancellation and 30-hour battery life.',
    brand: 'SoundWave',
    price: 99.99,
    compareAtPrice: 129.99,
    category: 'electronics',
    stock: 50,
    sku: 'ELC-1001',
    isFeatured: true,
    tags: ['audio', 'wireless', 'headset'],
  },
  {
    name: 'Smart Fitness Watch',
    description: 'Waterproof smartwatch with heart-rate monitoring, GPS, and week-long battery.',
    brand: 'PulseTech',
    price: 149.99,
    compareAtPrice: 189.99,
    category: 'electronics',
    stock: 35,
    sku: 'ELC-1002',
    isFeatured: true,
    tags: ['wearable', 'smartwatch', 'fitness'],
  },
  {
    name: 'Portable Bluetooth Speaker',
    description: 'Compact rugged speaker with 360° sound and IPX7 waterproof rating.',
    brand: 'SoundWave',
    price: 49.99,
    category: 'electronics',
    stock: 80,
    sku: 'ELC-1003',
    tags: ['audio', 'speaker', 'bluetooth'],
  },
  // Clothing
  {
    name: 'Classic Denim Jacket',
    description: 'Timeless mid-wash denim jacket made from durable cotton blend fabric.',
    brand: 'UrbanThread',
    price: 79.99,
    compareAtPrice: 99.99,
    category: 'clothing',
    stock: 25,
    sku: 'CLO-2001',
    isFeatured: true,
    tags: ['jacket', 'denim', 'outerwear'],
  },
  {
    name: 'Everyday Cotton T-Shirt',
    description: 'Soft breathable crew-neck tee available in multiple colors.',
    brand: 'UrbanThread',
    price: 19.99,
    category: 'clothing',
    stock: 120,
    sku: 'CLO-2002',
    tags: ['tshirt', 'basics'],
  },
  {
    name: 'Trail Running Sneakers',
    description: 'Lightweight sneakers with cushioned sole and rugged grip.',
    brand: 'StepForward',
    price: 89.99,
    compareAtPrice: 110.0,
    category: 'clothing',
    stock: 45,
    sku: 'CLO-2003',
    tags: ['shoes', 'sneakers', 'running'],
  },
  // Home & Kitchen
  {
    name: 'Non-Stick Cookware Set',
    description: '10-piece ceramic non-stick cookware set with stay-cool handles.',
    brand: 'HomeChef',
    price: 129.99,
    compareAtPrice: 169.99,
    category: 'home-kitchen',
    stock: 30,
    sku: 'HOM-3001',
    isFeatured: true,
    tags: ['cookware', 'pots', 'pans'],
  },
  {
    name: 'Aromatherapy Diffuser',
    description: 'Ultrasonic essential oil diffuser with soft LED light and auto shut-off.',
    brand: 'ZenHome',
    price: 34.99,
    category: 'home-kitchen',
    stock: 60,
    sku: 'HOM-3002',
    tags: ['diffuser', 'wellness'],
  },
  {
    name: 'Memory Foam Pillow',
    description: 'Ergonomic cooling memory-foam pillow for neck and back support.',
    brand: 'RestWell',
    price: 39.99,
    compareAtPrice: 54.99,
    category: 'home-kitchen',
    stock: 70,
    sku: 'HOM-3003',
    tags: ['pillow', 'sleep'],
  },
  // Beauty
  {
    name: 'Hydrating Face Serum',
    description: 'Vitamin C and hyaluronic acid serum for bright, glowing skin.',
    brand: 'GlowLab',
    price: 24.99,
    compareAtPrice: 34.99,
    category: 'beauty',
    stock: 90,
    sku: 'BEA-4001',
    isFeatured: true,
    tags: ['skincare', 'serum', 'vitamin-c'],
  },
  {
    name: 'Matte Lipstick Set',
    description: 'Set of 4 long-wear matte lipsticks in trending shades.',
    brand: 'ColorPop',
    price: 29.99,
    category: 'beauty',
    stock: 75,
    sku: 'BEA-4002',
    tags: ['makeup', 'lipstick'],
  },
  {
    name: 'Nourishing Hair Oil',
    description: 'Argan oil blend that repairs frizz and adds shine to all hair types.',
    brand: 'SilkStrand',
    price: 18.99,
    category: 'beauty',
    stock: 100,
    sku: 'BEA-4003',
    tags: ['haircare', 'argan-oil'],
  },
  // Sports
  {
    name: 'Anti-Slip Yoga Mat',
    description: 'Extra-thick non-slip mat with alignment guides and carrying strap.',
    brand: 'FlexFit',
    price: 39.99,
    compareAtPrice: 49.99,
    category: 'sports',
    stock: 55,
    sku: 'SPO-5001',
    isFeatured: true,
    tags: ['yoga', 'fitness'],
  },
  {
    name: 'Adjustable Dumbbell Set',
    description: 'Space-saving adjustable dumbbells from 5 to 25 lbs per hand.',
    brand: 'IronHouse',
    price: 189.99,
    compareAtPrice: 229.99,
    category: 'sports',
    stock: 20,
    sku: 'SPO-5002',
    tags: ['weights', 'strength'],
  },
  {
    name: 'Resistance Bands (5-Pack)',
    description: 'Five resistance levels for home workouts, yoga, and physical therapy.',
    brand: 'FlexFit',
    price: 15.99,
    category: 'sports',
    stock: 110,
    sku: 'SPO-5003',
    tags: ['bands', 'home-gym'],
  },
  // Toys & Games
  {
    name: 'STEM Building Blocks',
    description: '500-piece educational building set that sparks creativity for ages 6+.',
    brand: 'BrainBuild',
    price: 49.99,
    compareAtPrice: 59.99,
    category: 'toys-games',
    stock: 40,
    sku: 'TOY-6001',
    tags: ['blocks', 'educational', 'stem'],
  },
  {
    name: 'Remote Control Stunt Car',
    description: '2WD stunt car with 360° flips and rechargeable battery.',
    brand: 'SpeedKidz',
    price: 59.99,
    category: 'toys-games',
    stock: 32,
    sku: 'TOY-6002',
    tags: ['rc-car', 'remote-control'],
  },
  {
    name: 'Classic Wooden Chess Set',
    description: 'Handcrafted folding wooden chessboard with felt-lined pieces.',
    brand: 'MindMoves',
    price: 44.99,
    compareAtPrice: 54.99,
    category: 'toys-games',
    stock: 28,
    sku: 'TOY-6003',
    tags: ['chess', 'board-game'],
  },
  // Books
  {
    name: 'The Art of Code',
    description: 'Bestselling paperback on software design principles for developers.',
    brand: 'Redwood Press',
    price: 24.99,
    category: 'books',
    stock: 150,
    sku: 'BOK-7001',
    isFeatured: true,
    tags: ['technology', 'programming'],
  },
  {
    name: 'Modern Home Cookbook',
    description: 'Quick and easy recipes with 200 full-color photographs.',
    brand: 'Redwood Press',
    price: 29.99,
    compareAtPrice: 39.99,
    category: 'books',
    stock: 85,
    sku: 'BOK-7002',
    tags: ['cooking', 'recipes'],
  },
  {
    name: 'Children’s Bedtime Stories',
    description: 'Illustrated hardcover collection of 20 classic bedtime tales.',
    brand: 'TinyTales',
    price: 19.99,
    category: 'books',
    stock: 95,
    sku: 'BOK-7003',
    tags: ['kids', 'stories'],
  },
  // Automotive
  {
    name: 'Full Car Seat Cover Set',
    description: 'Universal waterproof seat covers for front and rear seats.',
    brand: 'DriveGuard',
    price: 84.99,
    compareAtPrice: 109.99,
    category: 'automotive',
    stock: 42,
    sku: 'AUT-8001',
    isFeatured: true,
    tags: ['seat-covers', 'interior'],
  },
  {
    name: 'Magnetic Phone Car Mount',
    description: '360° rotating magnetic holder that mounts on dashboard or vent.',
    brand: 'RideClear',
    price: 22.99,
    category: 'automotive',
    stock: 130,
    sku: 'AUT-8002',
    tags: ['phone-mount', 'accessory'],
  },
  {
    name: 'Digital Tire Pressure Gauge',
    description: 'Accurate digital gauge with backlit display and deflate function.',
    brand: 'DriveGuard',
    price: 14.99,
    category: 'automotive',
    stock: 75,
    sku: 'AUT-8003',
    tags: ['tools', 'tire'],
  },
];

export const seedData = async () => {
  await connectDBGuard();
  await Category.deleteMany({});
  await Product.deleteMany({});
  await Inventory.deleteMany({});
  await User.deleteMany({});

  const inserted = await Category.insertMany(categories);
  const categoryBySlug = Object.fromEntries(inserted.map((c) => [c.slug, c._id]));

  const createdProducts = await Product.insertMany(
    products.map((p) => ({
      ...p,
      category: categoryBySlug[p.category],
    }))
  );

  await Inventory.insertMany(
    createdProducts.map((p) => ({
      product: p._id,
      sku: p.sku,
      quantity: p.stock,
    }))
  );

  await User.create({
    name: 'Admin',
    email: 'admin@example.com',
    password: 'admin123',
    role: 'admin',
  });

  console.log(`Database seeded: ${categories.length} categories, ${createdProducts.length} products`);
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