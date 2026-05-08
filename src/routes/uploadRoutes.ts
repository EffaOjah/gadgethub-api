import express from 'express';
import { uploadSingle } from '../controllers/uploadController';
import { protect, admin } from '../middlewares/authMiddleware';
import { upload } from '../middlewares/uploadMiddleware';

const router = express.Router();

// Only admins can upload for now (to avoid abuse)
router.post('/', protect, admin, upload.single('image'), uploadSingle);

export default router;
