import { Router } from 'express';
import { createOrder, myOrders, getOrder, cancelOrder, returnOrder } from '../../controllers/orderController.js';
import { protect } from '../../middleware/authMiddleware.js';
import { validate } from '../../middleware/validationMiddleware.js';
import { createOrderValidator } from '../../validators/orderValidator.js';

const router = Router();

router.post('/', protect, validate(createOrderValidator), createOrder);
router.get('/my-orders', protect, myOrders);
router.get('/:id', protect, getOrder);
router.patch('/:id/cancel', protect, cancelOrder);
router.post('/:id/return', protect, returnOrder);

export default router;