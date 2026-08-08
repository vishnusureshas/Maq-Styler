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

export const forgotPasswordValidator = [
  body('email').isEmail().withMessage('Valid email required'),
];

export const resetPasswordValidator = [
  body('password').isLength({ min: 6 }).withMessage('Password min 6 chars'),
];