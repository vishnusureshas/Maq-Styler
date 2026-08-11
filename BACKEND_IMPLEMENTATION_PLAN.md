# E-Commerce Shopping Cart — Backend Implementation Plan (MERN + ES Modules)

> Tech Stack: **Node.js**, **Express**, **MongoDB (Mongoose)**, **JWT Auth**, **ES Module (ESM)** syntax.
> Scope: Full backend for a shopping cart application including an **Admin Panel** (products, orders, users, inventory, analytics).
> Role model: `guest` → `user` → `admin`. Every endpoint is guarded by `protect` (any logged-in user) and/or `adminOnly` (role === `admin`). Sections [7.5](#75-role-based-access-matrix), [8.3](#83-user-workflow--end-to-end-with-roles-) and [10.5](#105-admin-workflow--end-to-end-with-roles-) describe the complete role-based workflows.

---

## Table of Contents

1. [Tech Stack & Dependencies](#1-tech-stack--dependencies)
2. [Project Structure](#2-project-structure)
3. [Environment Variables](#3-environment-variables)
4. [Database Models](#4-database-models)
5. [Middleware](#5-middleware)
6. [API Endpoints (Full List)](#6-api-endpoints--full-list-)
7. [Authentication & Authorization (JWT + Roles)](#7-authentication--authorization--jwt---roles-)
8. [Cart & Order Flow](#8-cart--order-flow)
9. [Payments & Shipping](#9-payments--shipping)
10. [Admin Panel Features](#10-admin-panel-features)
11. [File Upload / Media](#11-file-upload--media)
12. [Error Handling & Validation](#12-error-handling--validation)
13. [Security Best Practices](#13-security-best-practices)
14. [Testing & Scripts](#14-testing--scripts)
15. [Deployment Notes](#15-deployment-notes)

---

## 1. Tech Stack & Dependencies

### Production Dependencies
```json
{
  "dependencies": {
    "express": "^4.19.0",
    "mongoose": "^8.0.0",
    "dotenv": "^16.4.0",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "express-rate-limit": "^7.1.0",
    "jsonwebtoken": "^9.0.0",
    "bcryptjs": "^2.4.3",
    "cookie-parser": "^1.4.6",
    "express-validator": "^7.0.0",
    "multer": "^1.4.5-lts.1",
    "cloudinary": "^2.0.0",
    "stripe": "^14.0.0",
    "nodemailer": "^6.9.0"
  }
}
```

### Dev Dependencies
```json
{
  "devDependencies": {
    "nodemon": "^3.0.0",
    "cross-env": "^7.0.3"
  }
}
```

### package.json — ESM setup
```json
{
  "name": "ecommerce-backend",
  "type": "module",
  "main": "server.js",
  "scripts": {
    "dev": "nodemon server.js",
    "start": "node server.js",
    "seed": "node utils/seeder.js"
  }
}
```

---

## 2. Project Structure

```
backend/
├── server.js
├── config/
│   ├── db.js
│   └── cloudinary.js
├── models/
│   ├── User.js
│   ├── Product.js
│   ├── Category.js
│   ├── Order.js
│   ├── Cart.js
│   ├── Coupon.js
│   ├── Review.js
│   └── Inventory.js
├── controllers/
│   ├── authController.js
│   ├── userController.js
│   ├── productController.js
│   ├── categoryController.js
│   ├── cartController.js
│   ├── orderController.js
│   ├── couponController.js
│   ├── reviewController.js
│   ├── paymentController.js
│   └── adminController.js
├── routes/
│   ├── v1/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── productRoutes.js
│   │   ├── categoryRoutes.js
│   │   ├── cartRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── couponRoutes.js
│   │   ├── reviewRoutes.js
│   │   ├── paymentRoutes.js
│   │   └── adminRoutes.js
│   └── index.js
├── middleware/
│   ├── authMiddleware.js
│   ├── adminMiddleware.js
│   ├── errorMiddleware.js
│   ├── validationMiddleware.js
│   ├── uploadMiddleware.js
│   └── rateLimiter.js
├── utils/
│   ├── emailService.js
│   ├── generateToken.js
│   ├── ApiError.js
│   ├── ApiResponse.js
│   ├── asyncHandler.js
│   └── seeder.js
├── validators/
│   ├── authValidator.js
│   ├── productValidator.js
│   └── orderValidator.js
├── config/
│   └── all
├── .env
└── server.js
```

---

## 3. Environment Variables

`.env` — never commit to git.
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your_refresh_secret
JWT_REFRESH_EXPIRES_IN=30d
COOKIE_SECURE=false

# Email (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=you@gmail.com
SMTP_PASS=app_password

# Payment (Stripe)
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Cloudinary
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx

# Client URL (for CORS)
CLIENT_URL=http://localhost:3000
```

---

## 4. Database Schema

### 4.1 User.js
```js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // exclude from queries by default
    },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    profileImage: { type: String },
    isActive: { type: Boolean, default: true },
    address: {
      street: String,
      city: String,
      state: String,
      zip: String,
      country: String,
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    refreshToken: String,
  },
  { timestamps: true }
);

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password helper
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
```

### 4.2 Product.js
```js
import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, lowercase: true },
    description: { type: String, required: true },
    brand: { type: String },
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, min: 0 }, // for discounts
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    images: [{ type: String }], // Cloudinary URLs
    stock: { type: Number, default: 0, min: 0 },
    sku: { type: String, unique: true },
    variants: [
      {
        name: String, // e.g. 'Color', 'Size'
        options: [String],
      },
    ],
    ratingsAverage: { type: Number, default: 0, min: 0, max: 5 },
    ratingsQuantity: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    tags: [String],
  },
  { timestamps: true }
);

// Auto-generate slug
productSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  }
  next();
});

const Product = mongoose.model('Product', productSchema);
export default Product;
```

### 4.3 Category.js
```js
import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, unique: true, lowercase: true },
    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' }, // sub-categories
    image: String,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Category = mongoose.model('Category', categorySchema);
export default Category;
```

### 4.4 Cart.js
```js
import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true, min: 1, default: 1 },
        variant: { type: Map, of: String }, // e.g. { color: 'Red', size: 'M' }
        priceAtAdd: { type: Number }, // snapshot price
      },
    ],
    totalPrice: { type: Number, default: 0 },
    totalDiscount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Cart = mongoose.model('Cart', cartSchema);
export default Cart;
```

### 4.5 Order.js
```js
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

// Generate unique order number
orderSchema.pre('save', async function (next) {
  if (!this.orderNumber) {
    this.orderNumber = `ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
  }
  next();
});

const Order = mongoose.model('Order', orderSchema);
export default Order;
```

### 4.6 Coupon.js
```js
import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    type: { type: String, enum: ['percentage', 'fixed'], default: 'percentage' },
    value: { type: Number, required: true }, // % or amount
    minOrderValue: { type: Number, default: 0 },
    maxDiscount: { type: Number },
    usageLimit: { type: Number }, // total uses allowed
    usedCount: { type: Number, default: 0 },
    perUserLimit: { type: Number, default: 1 },
    startsAt: Date,
    expiresAt: Date,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Coupon = mongoose.model('Coupon', couponSchema);
export default Coupon;
```

### 4.7 Review.js
```js
import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: String,
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

// One review per user per product
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

const Review = mongoose.model('Review', reviewSchema);
export default Review;
```

### 4.8 Inventory.js
```js
import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, unique: true },
    sku: String,
    quantity: { type: Number, default: 0 },
    lowStockThreshold: { type: Number, default: 5 },
    reserved: { type: Number, default: 0 }, // items in pending carts/orders
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
```

---

## 5. Middleware

### 5.1 authMiddleware.js — protect + ensure admin
```js
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';

export const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.token) {
      token = req.cookies.token;
    }
    if (!token) {
      return next(new ApiError(401, 'Not authorized, no token'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user || !user.isActive) {
      return next(new ApiError(401, 'User not found or deactivated'));
    }
    req.user = user;
    next();
  } catch (error) {
    next(new ApiError(401, 'Not authorized, token failed'));
  }
};

export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  next(new ApiError(403, 'Access denied. Admin only'));
};
```

### 5.2 errorMiddleware.js
```js
import { ApiError } from '../utils/ApiError.js';

export const notFound = (req, res, next) => {
  next(new ApiError(404, `Route not found: ${req.originalUrl}`));
};

export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Resource not found (invalid ${err.path})`;
  }
  // Mongoose duplicate key
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue)[0];
    message = `Duplicate value for field: ${field}`;
  }
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map((e) => e.message).join(', ');
  }

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
};
```

### 5.3 validationMiddleware.js
```js
import { validationResult } from 'express-validator';
import { ApiError } from '../utils/ApiError.js';

export const validate = (validations) => async (req, res, next) => {
  await Promise.all(validations.map((v) => v.run(req)));
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();
  const messages = errors.array().map((e) => e.msg);
  next(new ApiError(400, messages.join('; ')));
};
```

### 5.4 uploadMiddleware.js (Multer + memory)
```js
import multer from 'multer';
import { ApiError } from '../utils/ApiError.js';

const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new ApiError(400, 'Only image files are allowed'), false);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

export const uploadProductImages = upload.array('images', 5);
```

### 5.5 rateLimiter.js
```js
import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 20, // 20 attempts per IP
  message: { success: false, message: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
```

---

## 6. API Endpoints (All-API)

### Auth (`/api/v1/auth`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/register` | Create account, send verify email | Public |
| POST | `/login` | Login, return JWT + set cookie | Public |
| POST | `/logout` | Clear cookie | Auth |
| POST | `/verify-email/:token` | Verify email | Public |
| POST | `/forgot-password` | Send reset email | Public |
| POST | `/reset-password/:token` | Reset password | Public |
| POST | `/refresh-token` | Get new access token | Public |
| GET | `/me` | Current user profile | Auth |

### Users (`/api/v1/users`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/profile` | Get own profile | User |
| PATCH | `/profile` | Update own profile | User |
| PATCH | `/change-password` | Change password | User |
| DELETE | `/profile` | Deactivate account | User |

### Products (`/api/v1/products`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/` | List (filter/search/paginate) | Public |
| GET | `/:id` | Single product | Public |
| GET | `/:slug` | Single product by slug | Public |
| POST | `/` | Create product | Admin |
| PUT | `/:id` | Update product | Admin |
| DELETE | `/:id` | Delete product | Admin |

### Categories (`/api/v1/categories`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/` | List categories | Public |
| POST | `/` | Create category | Admin |
| PUT | `/:id` | Update category | Admin |
| DELETE | `/:id` | Delete category | Admin |

### Cart (`/api/v1/cart`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/` | Get current cart | User |
| POST | `/add` | Add item to cart | User |
| PUT | `/update/:productId` | Update qty / variant | User |
| DELETE | `/remove/:productId` | Remove item | User |
| DELETE | `/clear` | Clear cart | User |
| POST | `/apply-coupon` | Apply coupon | User |
| DELETE | `/remove-coupon` | Remove coupon | User |

### Orders (`/api/v1/orders`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/` | Create order from cart | User |
| GET | `/my-orders` | Current user orders | User |
| GET | `/:id` | Single order (owner/admin) | User/Admin |
| PATCH | `/:id/cancel` | Cancel order | User/Admin |
| POST | `/:id/return` | Request return | User |

### Payments (`/api/v1/payments`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/create-payment-intent` | Create Stripe intent | User |
| POST | `/webhook` | Stripe webhook | Public |
| POST | `/confirm` | Confirm payment (COD) | User |

### Reviews (`/api/v1/reviews`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/product/:productId` | List product reviews | Public |
| POST | `/product/:productId` | Add review | User |
| PATCH | `/:id` | Update own review | User |
| DELETE | `/:id` | Delete review | User/Admin |

### Coupons (`/api/v1/coupons`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/` | List all coupons | Admin |
| POST | `/` | Create coupon | Admin |
| PATCH | `/:id` | Update coupon | Admin |
| DELETE | `/:id` | Delete coupon | Admin |
| GET | `/validate/:code` | Validate a coupon | User |

### Admin Panel (`/api/v1/admin`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/stats` | Dashboard stats | Admin |
| GET | `/orders` | All orders + filter | Admin |
| PATCH | `/orders/:id/status` | Update order status | Admin |
| PATCH | `/orders/:id/payment` | Mark paid/refund | Admin |
| GET | `/users` | All users | Admin |
| PATCH | `/users/:id` | Update user role/status | Admin |
| DELETE | `/users/:id` | Delete user | Admin |
| GET | `/products/low-stock` | Low stock report | Admin |
| GET | `/sales-report` | Revenue per period | Admin |
| GET | `/inventory` | Full inventory | Admin |
| PATCH | `/inventory/:id` | Adjust stock | Admin |

---

## 7. Authentication & Authorization (JWT + Roles)

### 7.1 Token Strategy
- **Access Token**: short-lived (15m–7d), signed with `JWT_SECRET`.
- **Refresh Token**: long-lived (30d), stored hashed in `User.refreshToken`, used at `/refresh-token`.

### 7.2 generateToken.js
```js
import jwt from 'jsonwebtoken';

export const generateAccessToken = (user) =>
  jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

export const generateRefreshToken = (user) =>
  jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
  });

export const sendTokenResponse = (res, user, statusCode = 200) => {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  user.refreshToken = refreshToken;
  // persist hashed refresh token handled in controller

  res.cookie('jwt', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(statusCode).json({
    success: true,
    token: accessToken,
    role: user.role,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
};
```

### 7.3 Login flow (authController.js)
```js
import User from '../models/User.js';

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return next(new ApiError(401, 'Invalid credentials'));
    }
    if (user.role === 'admin') {
      // optional: log admin actions (audit)
    }
    sendTokenResponse(res, user);
  } catch (error) {
    next(error);
  }
};
```

### 7.4 Route protection usage
```js
import { protect, adminOnly } from '../middleware/authMiddleware.js';
router.post('/', protect, adminOnly, createProduct);
```

### 7.5 Role-Based Access Matrix

All routes act on the **most privileged role that satisfies the guard**. Matches the live `backend/routes/v1/*.js`:

| Resource / Action | Guest | User | Admin |
|---|---|---|---|
| Auth: register, login, verify-email, forgot/reset-password, refresh-token | ✅ | — | — |
| Auth: `/me`, logout | — | ✅ | ✅ |
| User: profile read/update/delete, change-password | — | ✅ | ✅ |
| Products: list, by id, by slug | ✅ | ✅ | ✅ |
| Products: create/update/delete/upload images (Cloudinary) | — | — | ✅ |
| Categories: list | ✅ | ✅ | ✅ |
| Categories: create/update/delete | — | — | ✅ |
| Cart: get/add/update/remove/clear/apply-coupon/remove-coupon | — | ✅ | ✅ |
| Orders: create, my-orders, get, cancel, return | — | ✅ (owner only) | ✅ (any) |
| Payments: create-payment-intent, confirm | — | ✅ | ✅ |
| Payments: webhook | ✅ (Stripe-signed, raw body) | — | — |
| Reviews: list product reviews | ✅ | ✅ | ✅ |
| Reviews: create/update/delete | — | ✅ (owner only) | ✅ |
| Coupons: validate | — | ✅ | ✅ |
| Coupons: list/create/update/delete | — | — | ✅ |
| Admin: stats, all orders, order status/payment, users, inventory, low-stock, sales-report | — | — | ✅ |

**Guard rules (from `middleware/authMiddleware.js`):**
- `protect` → any authenticated, active `user` OR `admin` (403 only when role needed).
- `adminOnly` → fails with `403 Access denied. Admin only` unless `req.user.role === 'admin'`.
- Ownership checks inside controllers (e.g. `getOrder`, `cancelOrder`) compare `order.user` with `req.user._id`.

---

## 8. Cart & Order Flow

### 8.1 Add to Cart (cartController.js)
```js
export const addItem = async (req, res, next) => {
  try {
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
  } catch (error) {
    next(error);
  }
};

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
```

### 8.2 Create Order (orderController.js)
```js
export const createOrder = async (req, res, next) => {
  try {
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

    const order = await Order.create({
      user: req.user.id,
      items,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      discount,
      totalPrice,
      coupon: req.user.appliedCoupon,
    });

    // Decrement inventory
    for (const item of items) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
    }

    // Clear cart
    cart.items = [];
    cart.totalPrice = 0;
    cart.totalDiscount = 0;
    await cart.save();

    res.status(201).json({ success: true, order });
  } catch (error) {
    next(error);
  }
};
```

### 8.3 User Workflow (end-to-end with roles)

Numbers map to the middleware running at each step.

1. **Browse (guest)** — public `GET /api/v1/products`, `GET /api/v1/products/:id|slug`, `GET /api/v1/categories`, `GET /api/v1/reviews/product/:productId`. No token needed.
2. **Register (guest → user)** — `POST /auth/register` (rate-limited + validated) sends verification email built from `CLIENT_URL`; `POST /auth/verify-email/:token` activates the account.
3. **Login (user/guest)** — `POST /auth/login` returns access JWT (also set as httpOnly cookie) + stored refresh token (`/auth/refresh-token` rotates it). Subsequent requests send `Authorization: Bearer <token>` → passes `protect`.
4. **Add to cart (user)** — `GET/POST/PUT/DELETE /api/v1/cart*` all sit behind `router.use(protect)`. Apply coupon via `POST /cart/apply-coupon` (coupon validated by `getCoupons`-adjacent logic + `POST /coupons/validate/:code`).
5. **Checkout (user)** — `POST /api/v1/orders` with `shippingAddress` + `paymentMethod` (`card`|`cod`|`paypal`). Server recomputes `itemsPrice`, `shippingPrice`, `discount`, `totalPrice`, decrements product stock, clears the cart.
6. **Pay (user)** — Card: `POST /payments/create-payment-intent` → client `stripe.confirmPayment()` → Stripe calls public `POST /payments/webhook` (raw body + signature verified) which sets `isPaid: true`, `paidAt`, `status: processing`. COD: `POST /payments/confirm` (order stays `pending`/`processing` until admin marks paid).
7. **Track & manage orders (user)** — `GET /orders/my-orders`, `GET /orders/:id` (owner-only), `PATCH /orders/:id/cancel` (owner; restores stock on cancel), `POST /orders/:id/return`.
8. **Review (user)** — `POST /reviews/product/:productId` then `PATCH|DELETE /reviews/:id` (owner-only, one review per user per product via unique index).

**Role passing summary:** a user never exceeds `role: 'user'`; every user endpoint must pass `protect` and any `adminOnly` guard will 403 for them. Ownership is enforced at controller level, not just by role.

---

## 9. Payments & Shipping

### 9.1 Stripe — create payment intent
```js
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET);

export const createPaymentIntent = async (req, res, next) => {
  try {
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
  } catch (error) {
    next(error);
  }
};
```

### 9.2 Stripe webhook
```js
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
  res.json({ received: true });
};
```

### 9.3 Shipping
- Flat-rate shipping: free above `$100`, else `$10`.
- Store configurable rates in DB or `.env`.
- Update shipping price at order creation; editable by admin.

---

## 10. Admin Panel Features

### 10.1 Dashboard Stats (adminController.js)
```js
export const getStats = async (req, res, next) => {
  try {
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
        monthlyRevenue: total[0]?.total || 0,
        recentOrders,
      },
    });
  } catch (error) {
    next(error);
  }
};
```

### 10.2 Update Order Status
```js
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return next(new ApiError(404, 'Order not found'));
    order.status = status;
    order.statusHistory.push({ status, changedAt: new Date(), note });
    if (status === 'delivered') {
      // mark as delivered
    }
    if (status === 'cancelled' || status === 'refunded') {
      // restore stock
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
      }
    }
    await order.save();
    // notify user via email
    res.json({ success: true, order });
  } catch (error) {
    next(error);
  }
};
```

### 10.3 Low Stock / Inventory
```js
export const lowStock = async (req, res, next) => {
  const products = await Product.find({ stock: { $lte: 10 }, isActive: true }).sort({ stock: 1 });
  res.json({ success: true, products });
};

export const adjustInventory = async (req, res, next) => {
  const { quantity, note } = req.body;
  const inv = await Inventory.findOne({ product: req.params.id });
  if (!inv) return next(new ApiError(404, 'Inventory not found'));
  inv.quantity += quantity;
  inv.history.push({ type: 'adjust', quantity, note, changedBy: req.user._id });
  await inv.save();
  await Product.findByIdAndUpdate(req.params.id, { stock: inv.quantity });
  res.json({ success: true, inventory: inv });
};
```

### 10.4 Role & User Management
```js
export const updateUser = async (req, res, next) => {
  const { role, isActive } = req.body;
  const user = await User.findByIdAndUpdate(req.params.id, { role, isActive }, { new: true });
  if (!user) return next(new ApiError(404, 'User not found'));
  res.json({ success: true, user });
};
```

### 10.5 Admin Workflow (end-to-end with roles)

Every route in `adminRoutes.js` starts with `router.use(protect, adminOnly)`, so **both** guards must pass — the admin is first authenticated, then confirmed as `role === 'admin'`. A regular `user` gets `403 Access denied. Admin only`.

1. **Login & enter dashboard (admin)** — standard `/auth/login`; frontend routes to the admin panel only when the returned `role` is `admin`. `GET /admin/stats` returns total users/orders/products, monthly revenue, recent orders.
2. **Product catalog (admin)** — `POST /products/upload` (Multer → Cloudinary URLs) then `POST /products` (validated); `PUT|DELETE /products/:id`; `PUT /categories/:id`, `DELETE /categories/:id`, `POST /categories`. Admin can flag `isFeatured`, set `compareAtPrice`, manage `stock`, `sku`, `variants`.
3. **Order management (admin)** — `GET /admin/orders` (all orders + filters) → `PATCH /admin/orders/:id/status` (appends to `statusHistory`; `cancelled`/`refunded` restores stock) → `PATCH /admin/orders/:id/payment` (mark paid / refund).
4. **Inventory (admin)** — `GET /admin/products/low-stock` (threshold) and `GET /admin/inventory`; `PATCH /admin/inventory/:id` records +/- adjustments with note + `changedBy` and syncs `Product.stock`.
5. **Customer management (admin)** — `GET /admin/users`; `PATCH /admin/users/:id` to change `role` (user↔admin) or activate/deactivate; `DELETE /admin/users/:id`. Deactivated users fail the `isActive` check inside `protect` on their next request — enforcing role revocation.
6. **Coupons (admin)** — `GET|POST|PUT|DELETE /coupons` (admin-only); listed rules like `type`, `value`, `minOrderValue`, `usageLimit`, `expiresAt` are enforced at apply time for users.
7. **Reporting (admin)** — `GET /admin/sales-report` (revenue per period) powers the admin analytics view.

**Role passing summary:** an admin inherits every `user` capability (cart, orders, reviews) **plus** all `adminOnly` endpoints. Guard evaluation order is always `protect` → `adminOnly` → controller ownership logic.

---

## 11. File Uploading (Cloudinary)

### cloudinary.js config
```js
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;
```

### Upload product image (in controller)
```js
import cloudinary from '../config/cloudinary.js';

const uploadToCloudinary = async (buffer) => {
  return new Promise((resolve, reject) => {
    const upload = cloudinary.uploader.upload_stream(
      { folder: 'ecommerce/products', resource_type: 'image' },
      (error, result) => (error ? reject(error) : resolve(result.secure_url))
    );
    upload.end(buffer);
  });
};

export const uploadImages = async (req, res, next) => {
  try {
    if (!req.files?.length) return next(new ApiError(400, 'No images uploaded'));
    const urls = [];
    for (const file of req.files) {
      urls.push(await uploadToCloudinary(file.buffer));
    }
    res.json({ success: true, urls });
  } catch (error) {
    next(error);
  }
};
```

---

## 12. Error Handling & Validation

### ApiError.js
```js
export class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
```

### Sample Validator (authValidator.js)
```js
import { body } from 'express-validator';

export const loginValidator = [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password is required'),
];

export const registerValidator = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password min 6 chars'),
];
```

---

## 13. Security Best Practices
- **helmet** sets secure HTTP headers.
- **prevent NoSQL injection**: sanitize input (mongoose default + express-validator).
- **Prevent XSS**: escape/whitelist HTML; never `res.send(req.body)` raw.
- **JWT**: short-lived access tokens + rotating refresh tokens, stored **httpOnly** cookies.
- **Rate limiting** on login/register/auth endpoints.
- **CORS**: allow only `CLIENT_URL`.
- **bcrypt** (cost 10) for password hashing.
- Never trust client-supplied price — always compute server-side from DB.
- Stripe webhooks verified via signature.
- `.env` and uploaded secrets never committed.

### server.js with security middleware
```js
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import v1Routes from './routes/index.js';

dotenv.config();
connectDB();

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true })); 
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());
app.use('/api', apiLimiter);

app.get('/health', (req, res) => res.send('E-commerce API is healthy'));
app.use('/api/v1', v1Routes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```

---

## 14. Testing & Scripts

### Recommended test setup (Vitest/Supertest)
```json
{
  "scripts": {
    "test": "node --test"
  }
}
```
- Unit tests: validators, cart price calculation.
- Integration tests: auth, product CRUD, order flow.
- API test with Supertest + in-memory Mongo (`mongodb-memory-server`).

### Seeder (utils/seeder.js)
```js
import mongoose from 'mongoose';
import Product from '../models/Product.js';

const products = [
  {
    name: 'Wireless Headphones',
    description: 'High-quality over-ear wireless headphones.',
    price: 99.99,
    category: 'electronics',
    stock: 50,
  },
];

export const seedProducts = async () => {
  await Product.deleteMany({});
  await Product.insertMany(products);
  console.log('Products seeded');
  mongoose.connection.close();
};
```

---

## 15. Deployment Notes
- **Hosting**: Render / Railway / AWS EC2 for Express + Stripe webhooks need a public URL.
- **Mongo**: Atlas (M0 free tier) for production DB.
- **Env**: set all `process.env.*` in platform dashboard.
- **Build/packaging**: Node.js buildpack, `npm start` script.
- **CI/CD**: GitHub Actions running lint + tests before deploy.
- **Logging**: morgan (dev) + optional winston for structured production logs.
- **Monitoring**: Sentry for error tracking.

---

## Suggested Build Order (Milestones)
1. Project setup + DB connection + error handling middleware
2. Auth (register/login/JWT/roles) + User model
3. Category + Product CRUD + image upload
4. Cart API + coupon
5. Order API + inventory deduction + email receipts
6. Stripe payment integration
7. Reviews
8. Admin dashboard + stats + reports
9. Tests + security hardening + deployment

> This plan is the single source of truth for the backend. Implements each layer as ES Modules with `import`/`export`, features JWT role-based access, and a complete admin panel for operations.