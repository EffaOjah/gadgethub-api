import express from 'express';
import { createReview, getGadgetReviews, markReviewHelpful, updateReview } from '../controllers/reviewController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

// Public routes
router.get('/gadget/:gadgetId', getGadgetReviews);

// Protected routes
router.post('/', protect, createReview);
router.put('/:id', protect, updateReview);
router.put('/:id/helpful', markReviewHelpful); // In a real app, this might need auth to track who voted

export default router;
