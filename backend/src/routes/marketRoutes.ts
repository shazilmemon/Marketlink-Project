import { Router } from 'express';
import {
  listMarkets,
  getMarketById,
  createMarket,
  updateMarket,
  deleteMarket,
  listMarketStalls,
  createStall,
  updateStall,
  deleteStall,
} from '../controllers/marketController';
import { requireAuth } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/roleMiddleware';
import { validateRequest } from '../middleware/validateMiddleware';
import {
  createMarketSchema,
  updateMarketSchema,
  createStallSchema,
  updateStallSchema,
} from '../validators/marketplaceValidator';

const router = Router();

// Public
router.get('/', listMarkets);
router.get('/:id', getMarketById);

// Admin only: create/update/delete markets
router.post('/', requireAuth, requireRole('ADMIN'), validateRequest(createMarketSchema), createMarket);
router.patch('/:id', requireAuth, requireRole('ADMIN'), validateRequest(updateMarketSchema), updateMarket);
router.delete('/:id', requireAuth, requireRole('ADMIN'), deleteMarket);

// Stalls under markets
router.get('/:marketId/stalls', listMarketStalls);
router.post(
  '/:marketId/stalls',
  requireAuth,
  requireRole('FARMER', 'ADMIN'),
  validateRequest(createStallSchema),
  createStall
);

export default router;
