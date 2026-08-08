import { Router } from 'express';
import { getProfile, updateProfile, changePassword, deactivateAccount } from '../../controllers/userController.js';
import { protect } from '../../middleware/authMiddleware.js';

const router = Router();

router.route('/profile').get(protect, getProfile).patch(protect, updateProfile).delete(protect, deactivateAccount);
router.patch('/change-password', protect, changePassword);

export default router;