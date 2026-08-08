import { Router } from 'express';
import express from 'express';
import { createPaymentIntent, confirmOrder, webhook } from '../../controllers/paymentController.js';
import { protect } from '../../middleware/authMiddleware.js';

const router = Router();

router.post('/create-payment-intent', protect, createPaymentIntent);
router.post('/confirm', protect, confirmOrder);
// Stripe must receive the raw request body (Buffer) to verify the signature
router.post('/webhook', express.raw({ type: 'application/json' }), webhook);

export default router;