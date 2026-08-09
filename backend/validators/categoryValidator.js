import { body } from 'express-validator';

export const createCategoryValidator = [
  body('name').trim().notEmpty().withMessage('Category name is required'),
  body('slug').optional().trim().isSlug().withMessage('Slug must be lowercase letters, numbers and dashes'),
  body('parent').optional().isMongoId().withMessage('Valid parent id required'),
  body('image').optional().isURL().withMessage('Image must be a valid URL'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
];

export const updateCategoryValidator = [
  body('name').optional().trim().notEmpty().withMessage('Category name cannot be empty'),
  body('slug').optional().trim().isSlug().withMessage('Slug must be lowercase letters, numbers and dashes'),
  body('parent').optional().isMongoId().withMessage('Valid parent id required'),
  body('image').optional().isURL().withMessage('Image must be a valid URL'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
];