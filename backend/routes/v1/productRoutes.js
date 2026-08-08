import { Router } from 'express';
import {
  getProducts,
  getProduct,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadImages,
} from '../../controllers/productController.js';
import { protect, adminOnly } from '../../middleware/authMiddleware.js';
import { validate } from '../../middleware/validationMiddleware.js';
import { uploadProductImages } from '../../middleware/uploadMiddleware.js';
import { createProductValidator, updateProductValidator } from '../../validators/productValidator.js';

const router = Router();

router.get('/', getProducts);
router.get('/slug/:slug', getProductBySlug);
router.get('/:id', getProduct);

router.post('/upload', protect, adminOnly, uploadProductImages, uploadImages);
router.post('/', protect, adminOnly, uploadProductImages, validate(createProductValidator), createProduct);
router.put('/:id', protect, adminOnly, validate(updateProductValidator), updateProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);

export default router;