import { Router } from 'express';
import { getProductReviews, createReview, updateReview, deleteReview } from '../../controllers/reviewController.js';
import { protect } from '../../middleware/authMiddleware.js';

const router = Router();

router.get('/product/:productId', getProductReviews);
router.post('/product/:productId', protect, createReview);
router.patch('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);

export default router;