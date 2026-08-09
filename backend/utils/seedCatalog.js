import mongoose from 'mongoose';
import { pathToFileURL } from 'url';
import dotenv from 'dotenv';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Inventory from '../models/Inventory.js';
import { categories, products } from './seeder.js';
import { isRedisUp } from '../config/redis.js';

dotenv.config();

// Non-destructive catalog seed: creates any missing categories/products by
// slug/sku and never deletes or overwrites existing data.
export const seedCatalog = async () => {
  const { default: connectDB } = await import('../config/db.js');
  await connectDB();

  let createdCategories = 0;
  const categoryBySlug = {};

  for (const c of categories) {
    if (!(await Category.exists({ slug: c.slug }))) createdCategories += 1;
    const cat = await Category.findOneAndUpdate(
      { slug: c.slug },
      { $setOnInsert: { name: c.name, slug: c.slug } },
      { upsert: true, new: true }
    );
    categoryBySlug[c.slug] = cat._id;
  }

  let createdProducts = 0;
  for (const p of products) {
    const slug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    if (!(await Product.exists({ slug }))) createdProducts += 1;
    const existing = await Product.findOneAndUpdate(
      { slug },
      {
        $setOnInsert: {
          name: p.name,
          slug,
          description: p.description,
          brand: p.brand,
          price: p.price,
          compareAtPrice: p.compareAtPrice,
          category: categoryBySlug[p.category],
          stock: p.stock,
          sku: p.sku,
          isFeatured: p.isFeatured,
          tags: p.tags,
        },
      },
      { upsert: true, new: true }
    );

    await Inventory.updateOne(
      { product: existing._id },
      { $setOnInsert: { product: existing._id, sku: existing.sku, quantity: existing.stock } },
      { upsert: true }
    );
  }

  if (isRedisUp()) {
    try {
      const { default: redis } = await import('../config/redis.js');
      await redis.del('categories:active');
      const keys = await redis.keys('products:*');
      if (keys.length) await redis.del(...keys);
    } catch {
      // cache invalidation is best-effort
    }
  }

  console.log(
    `Catalog seeded: ${createdCategories} categories created, ${createdProducts} products created (existing left untouched)`
  );
  mongoose.connection.close();
  process.exit(0);
};

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  seedCatalog();
}