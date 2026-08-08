import { Router } from 'express';
import {
  register,
  login,
  logout,
  verifyEmail,
  forgotPassword,
  resetPassword,
  refreshToken,
  getMe,
} from '../../controllers/authController.js';
import { protect } from '../../middleware/authMiddleware.js';
import { validate } from '../../middleware/validationMiddleware.js';
import { authLimiter } from '../../middleware/rateLimiter.js';
import { loginValidator, registerValidator, resetPasswordValidator, forgotPasswordValidator } from '../../validators/authValidator.js';

const router = Router();

router.post('/register', authLimiter, validate(registerValidator), register);
router.post('/login', authLimiter, validate(loginValidator), login);
router.post('/logout', protect, logout);
router.post('/verify-email/:token', verifyEmail);
router.post('/forgot-password', authLimiter, validate(forgotPasswordValidator), forgotPassword);
router.post('/reset-password/:token', authLimiter, validate(resetPasswordValidator), resetPassword);
router.post('/refresh-token', refreshToken);
router.get('/me', protect, getMe);

export default router;