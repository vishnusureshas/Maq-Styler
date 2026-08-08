import { Router } from 'express';
import {
  getCart,
  addItem,
  updateItem,
  removeItem,
  clearCart,
  applyCoupon,
  removeCoupon,
} from '../../controllers/cartController.js';
import { protect } from '../../middleware/authMiddleware.js';

const router = Router();

router.use(protect);

router.get('/', getCart);
router.post('/add', addItem);
router.put('/update/:productId', updateItem);
router.delete('/remove/:productId', removeItem);
router.delete('/clear', clearCart);
router.post('/apply-coupon', applyCoupon);
router.delete('/remove-coupon', removeCoupon);

export default router;