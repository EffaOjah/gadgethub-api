import express from 'express';
import { 
  getDashboardStats, 
  getSellerRequests, 
  approveSeller, 
  rejectSeller,
  getAllUsers,
  toggleUserStatus
} from '../controllers/adminController';
import { protect, admin } from '../middlewares/authMiddleware';

const router = express.Router();

// All admin routes are protected
router.use(protect, admin);

router.get('/stats', getDashboardStats);
router.get('/seller-requests', getSellerRequests);
router.put('/approve-seller/:id', approveSeller);
router.delete('/reject-seller/:id', rejectSeller);
router.get('/users', getAllUsers);
router.put('/toggle-user-status/:id', toggleUserStatus);

export default router;
