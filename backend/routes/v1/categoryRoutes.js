import { Router } from 'express';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../../controllers/categoryController.js';
import { protect, adminOnly } from '../../middleware/authMiddleware.js';
import { validate } from '../../middleware/validationMiddleware.js';
import { createCategoryValidator, updateCategoryValidator } from '../../validators/categoryValidator.js';

const router = Router();

router.get('/', getCategories);
router.post('/', protect, adminOnly, validate(createCategoryValidator), createCategory);
router.put('/:id', protect, adminOnly, validate(updateCategoryValidator), updateCategory);
router.delete('/:id', protect, adminOnly, deleteCategory);

export default router;