import { Router } from 'express';
import authRoutes from './v1/authRoutes.js';
import userRoutes from './v1/userRoutes.js';
import productRoutes from './v1/productRoutes.js';
import categoryRoutes from './v1/categoryRoutes.js';
import cartRoutes from './v1/cartRoutes.js';
import orderRoutes from './v1/orderRoutes.js';
import couponRoutes from './v1/couponRoutes.js';
import reviewRoutes from './v1/reviewRoutes.js';
import paymentRoutes from './v1/paymentRoutes.js';
import adminRoutes from './v1/adminRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/coupons', couponRoutes);
router.use('/reviews', reviewRoutes);
router.use('/payments', paymentRoutes);
router.use('/admin', adminRoutes);

export default router;