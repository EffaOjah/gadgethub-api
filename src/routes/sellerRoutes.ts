import express from 'express';
import { 
  getAllSellers, 
  getSellerById,
  rateSellerById,
  getAllSellerGadgets,
  incrementGadgetViews,
  getMySellerProfile,
  updateMySellerProfile,
  getMySellerGadgets,
  createMySellerGadget,
  updateMySellerGadget,
  deleteMySellerGadget,
  registerAsSeller,
  createSeller, 
  updateSeller, 
  deleteSeller 
} from '../controllers/sellerController';
import { protect, admin } from '../middlewares/authMiddleware';

const router = express.Router();

// Public routes
router.get('/', getAllSellers);

// Authenticated User routes
router.get('/me', protect, getMySellerProfile);
router.put('/me', protect, updateMySellerProfile);
router.get('/me/gadgets', protect, getMySellerGadgets);
router.post('/me/gadgets', protect, createMySellerGadget);
router.put('/me/gadgets/:gadgetId', protect, updateMySellerGadget);
router.delete('/me/gadgets/:gadgetId', protect, deleteMySellerGadget);
router.post('/register', protect, registerAsSeller);

// Public: latest seller gadgets for homepage deals
router.get('/products', getAllSellerGadgets);
router.post('/products/:productId/view', incrementGadgetViews);

router.get('/:id', getSellerById);
router.post('/:id/rate', protect, rateSellerById);

// Protected Admin routes
router.post('/', protect, admin, createSeller);
router.put('/:id', protect, admin, updateSeller);
router.delete('/:id', protect, admin, deleteSeller);

export default router;
