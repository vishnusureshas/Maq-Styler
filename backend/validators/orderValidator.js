import { body } from 'express-validator';

export const createOrderValidator = [
  body('shippingAddress').notEmpty().withMessage('Shipping address is required'),
  body('shippingAddress.fullName').notEmpty().withMessage('Full name is required'),
  body('shippingAddress.address').notEmpty().withMessage('Address is required'),
  body('shippingAddress.city').notEmpty().withMessage('City is required'),
  body('shippingAddress.country').notEmpty().withMessage('Country is required'),
  body('paymentMethod').optional().isIn(['card', 'cod', 'paypal']).withMessage('Invalid payment method'),
];