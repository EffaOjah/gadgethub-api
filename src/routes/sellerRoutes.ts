import express from 'express';
import { 
  getAllSellers, 
  getSellerById, 
  registerAsSeller,
  createSeller, 
  updateSeller, 
  deleteSeller 
} from '../controllers/sellerController';
import { protect, admin } from '../middlewares/authMiddleware';

const router = express.Router();

// Public routes
router.get('/', getAllSellers);
router.get('/:id', getSellerById);

// Authenticated User routes
router.post('/register', protect, registerAsSeller);

// Protected Admin routes
router.post('/', protect, admin, createSeller);
router.put('/:id', protect, admin, updateSeller);
router.delete('/:id', protect, admin, deleteSeller);

export default router;
