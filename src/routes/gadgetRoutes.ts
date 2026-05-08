import express from 'express';
import { getGadgets, getTrendingGadgets, getDeals, getGadgetById, createGadget, updateGadget, deleteGadget } from '../controllers/gadgetController';
import { protect, admin } from '../middlewares/authMiddleware';

const router = express.Router();

router.route('/')
  .get(getGadgets)
  .post(protect, admin, createGadget);

router.get('/trending', getTrendingGadgets);
router.get('/deals', getDeals);

router.route('/:id')
  .get(getGadgetById)
  .put(protect, admin, updateGadget)
  .delete(protect, admin, deleteGadget);

export default router;
