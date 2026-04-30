import express from 'express';
import { getProfile, updateProfile, getUserReviews, getPublicProfile } from '../controllers/userController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

// Private routes (require authentication)
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.get('/reviews', protect, getUserReviews);

// Public routes
router.get('/:id', getPublicProfile);

export default router;
