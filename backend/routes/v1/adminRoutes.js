import { Router } from 'express';
import {
  getStats,
  getAllOrders,
  updateOrderStatus,
  updateOrderPayment,
  getUsers,
  updateUser,
  deleteUser,
  lowStock,
  getInventory,
  adjustInventory,
  salesReport,
} from '../../controllers/adminController.js';
import { protect, adminOnly } from '../../middleware/authMiddleware.js';

const router = Router();

router.use(protect, adminOnly);

router.get('/stats', getStats);
router.get('/orders', getAllOrders);
router.patch('/orders/:id/status', updateOrderStatus);
router.patch('/orders/:id/payment', updateOrderPayment);
router.get('/users', getUsers);
router.patch('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.get('/products/low-stock', lowStock);
router.get('/sales-report', salesReport);
router.get('/inventory', getInventory);
router.patch('/inventory/:id', adjustInventory);

export default router;