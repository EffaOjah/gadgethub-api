import express from 'express';
import { getProfile, updateProfile, getUserReviews, getPublicProfile, uploadAvatar } from '../controllers/userController';
import { protect } from '../middlewares/authMiddleware';
import { upload } from '../middlewares/uploadMiddleware';

const router = express.Router();

// Private routes (require authentication)
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.post('/avatar', protect, upload.single('avatar'), uploadAvatar);
router.get('/reviews', protect, getUserReviews);

// Public routes
router.get('/:id', getPublicProfile);

export default router;
