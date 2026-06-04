import express from 'express';
import { uploadSingle } from '../controllers/uploadController';
import { protect, admin } from '../middlewares/authMiddleware';
import { upload } from '../middlewares/uploadMiddleware';

const router = express.Router();

// General Admin upload
router.post('/', protect, admin, upload.single('image'), uploadSingle);

// Seller product image upload
router.post('/product', protect, upload.single('image'), uploadSingle);

export default router;
