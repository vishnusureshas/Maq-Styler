# E-Commerce Shopping Cart — Frontend Integration Plan
## React JS + TypeScript + ShadCN UI + Tailwind CSS + Redux Toolkit

> Companion to `backend/BACKEND_IMPLEMENTATION_PLAN.md`. This plan maps the **frontend** to the backend API we already built (Express + Mongoose, ES modules, JWT auth, role-based access, admin panel).
> Backend base URL: `http://localhost:5000/api/v1`

---

## Table of Contents

1. [Tech Stack & Dependencies](#1-tech-stack--dependencies)
2. [Project Structure](#2-project-structure)
3. [Environment Setup (Vite + proxy)](#3-environment-setup--vite--proxy-)
4. [API Integration Layer (axios + interceptors)](#4-api-integration-layer-axios--interceptors-)
5. [TypeScript Types (mirror backend schemas)](#5-typescript-types-mirror-backend-schemas-)
6. [Redux Toolkit Store Setup](#6-redux-toolkit-store-setup)
7. [Auth Slice & JWT Flow](#7-auth-slice--jwt-flow)
8. [Cart Slice & Checkout Flow](#8-cart-slice--checkout-flow)
9. [Features to Pages Mapping](#9-features-to-pages-mapping)
10. [Public Pages](#10-public-pages)
11. [User Pages (Cart, Checkout, Orders)](#11-user-pages--cart--checkout--orders-)
12. [Admin Panel Pages](#12-admin-panel-pages)
13. [Routing & Protected Routes](#13-routing--protected-routes)
    - [12.1 Role-Based Route Access Matrix](#121-role-based-route-access-matrix)
    - [12.2 User Workflow (end-to-end with roles)](#122-user-workflow-end-to-end-with-roles)
    - [12.3 Admin Workflow (end-to-end with roles)](#123-admin-workflow-end-to-end-with-roles)
14. [UI Components (ShadCN) per Feature](#14-ui-components--shadcn--per-feature)
15. [State Management Strategy](#15-state-management-strategy)
16. [Error Handling & Loading States](#16-error-handling--loading-states)
17. [Build Order (Milestones)](#17-build-order--milestones-)

---

## 1. Tech Stack & Dependencies

### Scaffolding
```bash
npx create-vite@latest frontend --template react-ts
cd frontend
npx shadcn@latest init          # set up ShadCN components.json
```

### Production Dependencies
```json
{
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "react-router-dom": "^6.22.0",
    "axios": "^1.7.0",
    "@reduxjs/toolkit": "^2.2.0",
    "react-redux": "^9.1.0",
    "react-hook-form": "^7.52.0",
    "zod": "^3.23.0",
    "@hookform/resolvers": "^3.9.0",
    "@tanstack/react-query": "^5.45.0",
    "@stripe/stripe-js": "^4.1.0",
    "sonner": "^1.5.0"
  }
}
```
> RTK Query is **not used** — the plan uses classic `createAsyncThunk` + slices (per the Redux Toolkit requirement) with an axios base client. `react-hook-form` + `zod` handle form validation on the client.

### Dev Dependencies
```json
{
  "devDependencies": {
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0",
    "typescript": "^5.5.0",
    "vite": "^5.3.0",
    "@types/react": "^18.3.0"
  }
}
```

---

## 2. Project Structure

```
frontend/
├── index.html
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.ts
├── components.json                 # ShadCN config
├── src/
│   ├── main.tsx                    # Router + Provider + Toaster
│   ├── App.tsx                      # Routes
│   ├── api/
│   │   ├── client.ts                # axios instance + interceptors
│   │   ├── auth.ts                  # auth API calls
│   │   ├── product.ts
│   │   ├── cart.ts
│   │   ├── order.ts
│   │   ├── admin.ts
│   │   └── index.ts                 # typed re-exports
│   ├── store/
│   │   ├── index.ts                 # configureStore, rootReducer
│   │   ├── hooks.ts                 # useAppDispatch, useAppSelector
│   │   ├── slices/
│   │   │   ├── authSlice.ts
│   │   │   ├── cartSlice.ts
│   │   │   ├── productSlice.ts
│   │   │   ├── categorySlice.ts
│   │   │   ├── orderSlice.ts
│   │   │   └── adminSlice.ts
│   ├── types/
│   │   ├── user.ts
│   │   ├── product.ts
│   │   ├── order.ts
│   │   ├── cart.ts
│   │   └── api.ts
│   ├── components/
│   │   ├── ui/                      # ShadCN generated components
│   │   ├── layout/                  # Navbar, Footer, AdminLayout
│   │   ├── product/                 # ProductCard, ProductGrid, FilterBar
│   │   ├── cart/                    # CartItem, CartSummary, CouponInput
│   │   ├── order/                   # OrderSummary, StatusBadge, OrderItem
│   │   └── shared/                 # Spinner, EmptyState, ErrorState, Pagination
│   ├── hooks/
│   │   ├── useDebounce.ts
│   │   ├── usePagination.ts
│   │   └── usePermission.ts
│   ├── layouts/
│   │   ├── PublicLayout.tsx
│   │   ├── UserLayout.tsx
│   │   └── AdminLayout.tsx
│   ├── pages/
│   │   ├── public/                  # Home, Shop, ProductDetail, etc.
│   │   ├── auth/                    # Login, Register, ForgotPassword
│   │   ├── user/                    # Profile, Cart, Checkout, MyOrders
│   │   └── admin/                   # Dashboard, Products, Orders, Users
│   ├── config/
│   │   └── constants.ts
│   ├── lib/
│   │   ├── utils.ts                 # cn() from shadcn
│   │   ├── formatters.ts            # currency, date
│   │   └── validators.ts            # zod schemas
│   ├── routes/
│   │   └── ProtectedRoute.tsx
│   └── env.d.ts
├── .env                             # VITE_API_URL
```

---

## 3. Environment Setup (Vite + proxy)

### `.env`
```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_SERVER_URL=http://localhost:5000
VITE_STRIPE_PUBLISHABLE=pk_test_xxx
```

### `vite.config.ts` — avoid CORS during dev with a proxy
```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});
```
> Using the `/api` proxy means axios calls use relative paths (`/api/v1/...`) in dev; `VITE_API_URL` is used for production builds. The backend `cors` already whitelists `http://localhost:3000`/Vite origin.

---

## 3. API Integration Layer (axios)

### `src/api/client.ts`
```ts
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { store } from '../store';
import { logout, refreshAccessToken } from '../store/slices/authSlice';
import { toast } from 'sonner';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  withCredentials: true, // JWT cookie / refresh
});

// Attach Bearer token
client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = store.getState().auth.token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 -> refresh -> retry once
client.interceptors.response.use(
  (res) => res,
  async (error: AxiosError<{ message?: string }>) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        await store.dispatch(refreshAccessToken()).unwrap();
        return client(original); // retry original request
      } catch {
        store.dispatch(logout());
        window.location.href = '/login';
      }
    }
    toast.error(error.response?.data?.message || 'Something went wrong');
    return Promise.reject(error);
  }
);

export default client;
```
> The backend returns `{ success, message, data|... }` consistently — access via `error.response.data.message` and `res.data`.

---

## 4. TypeScript Types (mirror backend schemas)

### `src/types/user.ts`
```ts
export interface Address {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  profileImage?: string;
  isActive: boolean;
  address?: Address;
  createdAt: string;
  updatedAt: string;
}
```

### `src/types/product.ts`
```ts
export interface Category {
  _id: string;
  name: string;
  slug?: string;
  parent?: string;
  image?: string;
  isActive: boolean;
}

export interface Variant {
  name: string;
  options: string[];
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  brand?: string;
  price: number;
  compareAtPrice?: number;
  category: string | Category;
  images: string[];
  stock: number;
  sku?: string;
  variants?: Variant[];
  ratingsAverage: number;
  ratingsQuantity: number;
  isActive: boolean;
  isFeatured: boolean;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}
```

### `src/types/cart.ts`
```ts
export interface CartItem {
  product: string | Product;
  quantity: number;
  variant?: Record<string, string>; // Map -> object
  priceAtAdd?: number;
}

export interface Cart {
  _id: string;
  user: string;
  items: CartItem[];
  totalPrice: number;
  totalDiscount: number;
}
```

### `src/types/order.ts`
```ts
import type { User } from './user';
import type { Product } from './product';

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';

export interface OrderItem {
  product: string | Product;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  variant?: Record<string, string>;
}

export interface Order {
  _id: string;
  user: string | User;
  orderNumber: string;
  items: OrderItem[];
  shippingAddress: { fullName: string; address: string; city: string; state?: string; zip?: string; country: string; phone?: string; };
  paymentMethod: 'card' | 'cod' | 'paypal';
  taxPrice: number;
  shippingPrice: number;
  itemsPrice: number;
  totalPrice: number;
  discount: number;
  isPaid: boolean;
  paidAt?: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  coupon?: string;
  status: OrderStatus;
  statusHistory: { status: OrderStatus; changedAt: string; note?: string }[];
  createdAt: string;
}
```

### `src/types/api.ts`
```ts
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  // list endpoints include:
  page?: number;
  pages?: number;
  count?: number;
}
```

---

## 5. Redux Toolkit Store Setup

### `src/store/index.ts`
```ts
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import cartReducer from './slices/cartSlice';
import productReducer from './slices/productSlice';
import categoryReducer from './slices/categorySlice';
import orderReducer from './slices/orderSlice';
import adminReducer from './slices/adminSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    product: productReducer,
    category: categoryReducer,
    order: orderReducer,
    admin: adminReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

### `src/store/hooks.ts`
```ts
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './index';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
```

---

## 6. Auth Slice (JWT flow, matches backend `/auth` routes)

Backend routes:
`POST /auth/register`, `POST /auth/login`, `POST /auth/logout`, `POST /auth/verify-email/:token`, `POST /auth/forgot-password`, `POST /auth/reset-password/:token`, `POST /auth/refresh-token`, `GET /auth/me`.

### `src/store/slices/authSlice.ts`
```ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import client from '../../api/client';
import type { User } from '../../types/user';

interface AuthState {
  user: User | null;
  token: string | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token') || null,
  status: 'idle',
  error: null,
};

// login -> POST /auth/login returns { token, role, user }
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }) => {
    const res = await client.post('/auth/login', credentials);
    localStorage.setItem('token', res.data.token);
    const token = res.data.token as string;
    const tokenPack: PayloadAction<string> = { type: 'auth/mergeToken', payload: token };
    return { token };
  }
);
```
> **Note on shape:** backend login returns `{ success, token, role, user }` — so read `res.data.token` & `res.data.user`. Persist token in `localStorage`; the backend also sets an httpOnly cookie for refresh.

```ts
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem('token');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => { state.status = 'loading'; })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Login failed';
      });
  },
});

export const { logout } = authSlice.actions;
export const selectUser = (state: RootState) => state.auth.user;
export default authSlice.reducer;
```

---

## 7. Cart Slice (backend `/cart`)

Backend: `GET /cart`, `POST /cart/add`, `PUT /cart/update/:productId`, `DELETE /cart/remove/:productId`, `DELETE /cart/clear`, `POST /cart/apply-coupon`, `DELETE /cart/remove-coupon`.

```ts
export const fetchCart = createAsyncThunk('cart/fetch', async () => {
  const res = await client.get('/cart');
  return res.data.cart;
});

export const addToCart = createAsyncThunk('cart/add', async ({ ...payload }) => {
  const res = await client.post('/cart/add', payload);
  return res.data.cart;
});
```
The cart slice stores `{ data: Cart | null, status, error }`. All mutations (add/update/remove/clear/coupon) return the updated cart in `res.data.cart`, so each thunk returns it and all extraReducers set `state.data` + reset to `succeeded`.

---

## 8. Features → Pages Mapping (from backend routes)

| Backend route | Frontend page | Auth | Slice |
|---------------|---------------|------|-------|
| `/auth/*` | `/login`, `/register`, `/forgot-password`, `/verify-email/:token` | Public | auth |
| `/users/profile` | `/profile` | User | auth/user |
| `/products` | `/shop` | Public | product |
| `/products/:id`, `/products/slug/:slug` | `/product/:slug` | Public | product |
| `/categories` | `/shop` (filter), footer | Public | category |
| `/cart` | `/cart` | User | cart |
| `/orders` | `/checkout` | User | order |
| `/orders/my-orders` | `/my-orders` | User | order |
| `/orders/:id` | `/order/:id` | User/Admin | order |
| `/orders/:id/cancel`, `/orders/:id/return` | `/my-orders` (dialog actions) | User/Admin | order |
| `/payments` | `/checkout/payment` | User | order/stripe |
| `/reviews/product/:id` | ProductDetail reviews | User to write, Public to read | product |
| `/admin/*` | `/admin/...` | Admin | admin |

---

## 9. Public Pages

### Home (`/`)
- Hero banner + featured products (`GET /products?featured=true`).
- Category chips (from `GET /categories`).
- Layout: `PublicLayout` (Navbar + Footer).

### Shop (`/shop`)
- `GET /products?page=1&pageSize=10&keyword=&category=&featured=&minPrice=&maxPrice=`.
- **Filters** (category select, **price range** min/max, search box), **pagination** (`pages` from response).
- Product grid of `ProductCard`s (image, name, price, ratings, "Add to Cart").

### Product Detail (`/product/:slug`)
- `GET /products/slug/:slug`.
- Gallery (images), variant picker, quantity, stock indicator.
- "Add to Cart" → dispatches `addToCart`.
- Reviews section: `GET /reviews/product/:id`, form to `POST` (user only).

### Shop page query string → Redux `productSlice`
```ts
export const fetchProducts = createAsyncThunk(
  'product/list',
  async (params: { page?: number; keyword?: string; category?: string; featured?: boolean }) => {
    const res = await client.get('/products', { params });
    return res.data; // { products, page, pages, count }
  }
);
```

---

## 10. User Pages

### Login / Register / Forgot
- `react-hook-form` + `zod` resolvers.
- On submit → dispatch `login`/`register` thunk → redirect based on returned `role` (user → `/`, admin → `/admin`).

### Profile (`/profile`)
- `GET /users/profile`, `PATCH /users/profile`, `PATCH /users/change-password`, `DELETE /users/profile`.

### Cart (`/cart`)
- Lists `cart.items`, quantity steppers, remove buttons, `CartSummary` (subtotal, discount, shipping note, grand total).
- `CouponInput` → `POST /cart/apply-coupon`.
- "Proceed to Checkout" → `/checkout`.

### Checkout (`/checkout`)
- Multi-step: address → payment → review.
- Order payload matches backend validator (`shippingAddress.{fullName,address,city,state,zip,country,phone}`, `paymentMethod`).
- `POST /orders` to create order; `POST /payments/create-payment-intent` for card; `POST /payments/confirm` for COD.

### My Orders (`/my-orders`)
- `GET /orders/my-orders` → table with `StatusBadge` (color by `status`).
- Order detail dialog shows items, breakdown, `isPaid` + `paymentStatus`; actions:
  - **Cancel** → `PATCH /orders/:id/cancel` (allowed for `pending`/`processing`).
  - **Request return** → `POST /orders/:id/return` (allowed for `delivered`/`shipped`).
- Success banner driven by `?created=<orderNumber>`; detail dialogs by `?order=<_id>`.

---

## 11. Admin Panel Pages (`/admin`)

All under `AdminLayout` with sidebar. Every route protected by `AdminOnly` guard + backend `adminOnly` middleware (enforces again server-side).

### Dashboard (`/admin`)
- `GET /admin/stats` → cards (totalUsers, totalOrders, totalProducts, monthlyRevenue) + `recentOrders` table.

### Orders (`/admin/orders`)
- `GET /admin/orders?status=`, `PATCH /admin/orders/:id/status`, `PATCH /admin/orders/:id/payment`.
- Status dropdown to push to `statusHistory`.

### Users (`/admin/users`)
- `GET /admin/users`, `PATCH /admin/users/:id` (role/isActive), `DELETE /admin/users/:id`.

### Products (`/admin/products`)
- CRUD via `POST /products`, `PUT /products/:id`, `DELETE /products/:id`.
- Image upload: two-step — `POST /products/upload` (`multipart/form-data`, `images` field, max 5) returns Cloudinary URLs, then `POST /products` (JSON) with those URLs merged into `images[]`. File `<input>` enforces max-5 + allows comma-separated URL fallback.

### Inventory (`/admin/inventory`)
- `GET /admin/inventory`, `PATCH /admin/inventory/:id`.
- Low stock highlight (`GET /admin/products/low-stock`).

### Sales Report (`/admin/sales-report`)
- `GET /admin/sales-report?from=&to=` → revenue chart (use a chart lib like Recharts).

---

## 12. Routing & Protected Routes

### `src/routes/ProtectedRoute.tsx`
```tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';

export function ProtectedRoute({ roles }: { roles?: ('user' | 'admin')[] }) {
  const { token, user } = useAppSelector((s) => s.auth);
  if (!token) return <Navigate to="/login" replace />;
  if (roles && (!user || !roles.includes(user.role))) return <Navigate to="/" replace />;
  return <Outlet />;
}
```

### `src/App.tsx`
```tsx
<Route element={<PublicLayout />}>
  <Route path="/" element={<Home />} />
  <Route path="/shop" element={<Shop />} />
  <Route path="/product/:slug" element={<ProductDetail />} />
</Route>
<Route element={<ProtectedRoute />}>
  <Route path="/cart" element={<Cart />} />
  <Route path="/checkout" element={<Checkout />} />
  <Route path="/my-orders" element={<MyOrders />} />
  <Route path="/profile" element={<Profile />} />
</Route>
<Route element={<ProtectedRoute requireRole={['admin']} />}>
  <Route path="/admin" element={<AdminLayout />}>
    <Route index element={<Dashboard />} />
    <Route path="orders" element={<AdminOrders />} />
    <Route path="users" element={<AdminUsers />} />
    <Route path="products" element={<AdminProducts />} />
    <Route path="inventory" element={<AdminInventory />} />
    <Route path="sales" element={<SalesReport />} />
  </Route>
</Route>
```

> **Live implementation note:** `frontend/src/App.tsx` matches this layout exactly, with three layout buckets —
> `PublicLayout` (guest), `<ProtectedRoute />` (any logged-in user incl. admin), and
> `<ProtectedRoute roles={['admin']} />` (admin only). The `roles` prop is the **client-side** guard;
> the backend re-enforces it server-side with `protect` + `adminOnly` (see the backend plan §7.5).

### 12.1 Role-Based Route Access Matrix

Maps **routes** → **minimum role** → **route guard → layout**. This mirrors the backend's endpoint matrix
(backend plan §7.5) one-to-one, so a user who can reach a page is always able to call its APIs.

| Route(s) | Layout | Guard | Guest | User | Admin |
|---|---|---|---|---|---|
| `/`, `/shop`, `/product/:slug` | `PublicLayout` | — (public) | ✅ | ✅ | ✅ |
| `/login`, `/register`, `/forgot-password`, `/reset-password/:token`, `/verify-email/:token` | `PublicLayout` | redirect to `/` if already authed | ✅ | — | — |
| `/cart`, `/checkout`, `/my-orders`, `/profile` | — | `ProtectedRoute` (token present) | — | ✅ | ✅ |
| `/admin` (Dashboard, orders, products, users, inventory, sales) | `AdminLayout` | `ProtectedRoute roles={['admin']}` (role === `admin`) | — | — | ✅ |
| `/logout` | `PublicLayout` | token present (clears session) | — | ✅ | ✅ |
| `*` (404) | — | — | ✅ | ✅ | ✅ |

**Guard rules (`src/routes/ProtectedRoute.tsx`):**
- `roles` omitted → only requires `token` (any authenticated user; admins included).
- `roles={['admin']}` → additionally requires `user.role === 'admin'`; a regular user is bounced to `/`.
- Redirect target for unauthenticated users is `/login`; authorized-but-wrong-role redirects to `/`.
- These are UX guards **only** — never trust them alone; the API layer still 401/403s.

### 12.2 User Workflow (end-to-end with roles)

Numbers map to router guards + the API slice fired at each step (see §9 features→pages mapping).

1. **Browse (guest)** — `PublicLayout` routes to Home/Shop/ProductDetail; no token needed. Product cards, category chips, filters + pagination all hit public `GET /products` & `GET /categories`.
2. **Register / verify (guest)** — `/register` (form → `POST /auth/register`) then `/verify-email/:token` from the emailed link (built from backend `CLIENT_URL`).
3. **Login (guest → user)** — `/login` fires `login` thunk (`POST /auth/login`), persists token (localStorage + httpOnly cookie), then redirects by returned `role`: user → `/`, admin → `/admin`.
4. **Cart & coupon (user)** — `/cart` behind `<ProtectedRoute />`. `cartSlice` thunks hit `GET /cart·/add·/update·/remove·/apply-coupon`; totals + discount rendered from `res.data.cart`.
5. **Checkout (user)** — `/checkout` multi-step (address → payment → review). `POST /orders` (matching backend `createOrderValidator`), then card via `POST /payments/create-payment-intent` + `stripe.confirmPayment`, or COD via `POST /payments/confirm`.
6. **Orders (user)** — `/my-orders` list; `/order/:id` detail; actions `PATCH /orders/:id/cancel` (pending/processing) and `POST /orders/:id/return` (delivered/shipped). `Order.paymentStatus` badge shown from response.
7. **Profile (user)** — `/profile` → `GET/PATCH /users/profile`, `PATCH /users/change-password`, `DELETE /users/profile`.
8. **Reviews (user writes, all read)** — ProductDetail reviews `GET /reviews/product/:id`; form (user only) `POST /reviews/product/:id`.

**Role passing summary:** a user only ever holds `role: 'user'`; the whole shopping journey lives under the non-admin `ProtectedRoute`. Admin-role pages are unreachable for them at both the router and API level.

### 12.3 Admin Workflow (end-to-end with roles)

Every admin page sits under `<ProtectedRoute roles={['admin']} />` + `AdminLayout`, and every API call is
guarded server-side by `protect, adminOnly` (backend plan §10.5). A non-admin gets a client redirect + a 403
on any manual API attempt.

1. **Login & land on admin (admin)** — after `/login`, the `role: 'admin'` response routes to `/admin` (Dashboard) → `GET /admin/stats` cards.
2. **Products (admin)** — `AdminProducts`: `POST /products/upload` (multipart, Cloudinary) then `POST /products`; `PUT|DELETE /products/:id`. Categories via `POST|PUT|DELETE /categories`.
3. **Orders (admin)** — `AdminOrders`: `GET /admin/orders?status=`; `PATCH /admin/orders/:id/status`; `PATCH /admin/orders/:id/payment` to mark paid **or refund** (backend now sets `paymentStatus: 'paid'|'refunded'` and restores stock).
4. **Users (admin)** — `AdminUsers`: `GET /admin/users`, `PATCH /admin/users/:id` (role / isActive), `DELETE /admin/users/:id`. Deactivating a user makes `protect` reject their next request.
5. **Inventory (admin)** — `AdminInventory`: `GET /admin/inventory`, `PATCH /admin/inventory/:id` (adjust + note), low-stock highlight from `GET /admin/products/low-stock`.
6. **Sales report (admin)** — `SalesReport`: `GET /admin/sales-report?from=&to=` → revenue chart.

**Role passing summary:** an admin inherits every user page (cart, orders, profile) **plus** the `roles={['admin']}` subtree. The client guard and server guard are redundant by design; consistency between them is what the §17 contract checklist verifies.

---

## 13. UI Components (ShadCN) per Feature

Run `npx shadcn@latest add <component>` to install each:

| ShadCN component | Used in |
|------------------|---------|
| `button`, `input`, `label`, `form` | Login/Register/Forms |
| `card`, `avatar`, `badge` | ProductCard, Profile, Order status |
| `select`, `checkbox`, `radio-group` | Filters, Variants, Payment method |
| `table`, `dropdown-menu`, `sheet` | Admin tables, Cart drawer |
| `dialog`, `sheet` | Add/Edit Product modal, Cart side-panel |
| `tabs`, `accordion` | Checkout steps, Product reviews |
| `skeleton`, `spinner` | Loading states |
| `toast`/`sonner` | Global notifications |
| `pagination`, `separator` | Shop, breadcrumbs |

### Sample ProductCard
```tsx
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AddToCartButton } from './AddToCartButton';

export function ProductCard({ product }) {
  return (
    <Card className="overflow-hidden group">
      <img src={product.images[0]} alt={product.name} className="aspect-square object-cover w-full" />
      <CardContent>
        <p className="text-sm text-muted-foreground">{product.brand}</p>
        <h3 className="font-semibold line-clamp-2">{product.name}</h3>
        <div className="flex items-center gap-2">
          <span className="font-bold">${product.price}</span>
          {product.compareAtPrice && (
            <span className="text-muted-foreground line-through">${product.compareAtPrice}</span>
          )}
        </div>
        <Badge variant="outline">{product.stock > 0 ? 'In Stock' : 'Out of Stock'}</Badge>
        <AddToCartButton product={product} />
      </CardContent>
    </Card>
  );
}
```

---

## 14. State Management Strategy

- **Server state (data)**: `createAsyncThunk` slices store the fetched data + `status` + `error`.
- **UI state**: local component state (`useState`) for forms, filters, toggles.
- **Form state**: `react-hook-form` + `zod`, not Redux.
- **Derived values**: `cart` totals computed in selectors (`createSelector`).

### Central store shape
```
auth    -> user, token, status, error
cart    -> data: Cart, status, error
product -> list: {products, page, pages, count}, current: Product, reviews, status, error
category-> items: Category[], status
order   -> orders: Order[], current: Order, status, error
admin   -> stats, users, adminOrders, inventory, status
```

---

## 15. Error Handling & Loading States

Centralize in a reusable hook:
```ts
// components/shared/StateWrapper.tsx
export function StateWrapper({ status, error, children, skeleton }) {
  if (status === 'loading') return skeleton ?? <Spinner />;
  if (status === 'failed') return <ErrorState message={error} />;
  return children;
}
```
- Global error toasts via axios interceptor (`sonner`).
- 401 → auto refresh token, single retry, else redirect to `/login`.

---

## 16. Build Order (Milestones)

1. **Scaffold**: Vite + React + TS + Tailwind + ShadCN init; axios client; store skeleton.
2. **Auth**: authSlice, login/register pages, ProtectedRoute, session persistence.
3. **Catalog**: category + product slices, Home, Shop (filters + pagination), ProductDetail.
4. **Cart**: cartSlice, Cart page, cart drawer, coupon.
5. **Checkout & Orders**: orderSlice, Checkout, Stripe intent, MyOrders, status badges.
6. **User Account**: profile, change password, address.
7. **Admin**: AdminLayout, Dashboard(stats), Products CRUD + image upload, Orders management.
8. **Inventory & Reports**: inventory adjust, low-stock, sales report chart.
9. **Polish**: skeletons, empty states, responsive, toasts, code splitting.

---

## 17. Integration Contract Checklist (backend ↔ frontend)

Verify these exact matches to avoid integration bugs:

| Contract | Backend | Frontend expectation |
|----------|---------|----------------------|
| Login response | `{success, token, role, user}` | read `res.data.token`, `res.data.user` |
| Error shape | `{ success:false, message }` | read `error.response.data.message` |
| Product list | `{ products, page, pages, count }` | pagination from `page/pages/count` |
| Cart mutations | return `res.data.cart` | replace `state.data` with response |
| Order create | `POST /orders` → 201 `{ success, order }` | read `res.data.order` |
| Admin guard | `adminOnly` middleware (403) | `requireRole={['admin']}` route guard (redundant but safe) |
| Image upload | `multipart/form-data` under `images` field, max 5 images; `POST /products/upload` returns `{ urls }` | `FormData` with `images.append(file)`, then JSON create with `images[]` |
| Pagination query | `?page=1&pageSize=10&keyword=&category=&minPrice=&maxPrice=` | `params` in `client.get` |
| Order return | `POST /orders/:id/return` (delivered/shipped) → `{ order }` | `orderApi.return(id)` → refresh detail |
| COD confirm | `POST /payments/confirm` with `{ orderId }` → `{ order }` | `paymentApi.confirmOrder(orderId)` |
| Order detail | Order includes `paymentStatus` (`pending\|paid\|failed\|refunded`) | `Order.paymentStatus` typed in `types/order.ts` |
| Product slug route | `GET /products/slug/:slug` (coexists with `/:id`) | ProductCard links `/product/{slug ?? _id}`; ProductDetail detects 24-hex id vs slug |

---

> This plan is the sibling of the backend plan and references its concrete routes, response shapes, and auth model (JWT + role-based access). Build features in the milestone order, start with auth + catalog, then cart → checkout → admin.