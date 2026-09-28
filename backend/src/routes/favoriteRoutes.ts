import { Router } from 'express';
import {
  listFavorites,
  addFavorite,
  removeFavorite,
  checkFavorite,
} from '../controllers/favoriteController';
import { requireAuth } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/roleMiddleware';

const router = Router();

router.get('/', requireAuth, listFavorites);
router.post('/', requireAuth, addFavorite);
router.get('/check/:productId', requireAuth, checkFavorite);
router.delete('/:productId', requireAuth, removeFavorite);

export default router;
