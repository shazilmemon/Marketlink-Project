import { Router } from 'express';
import {
  listFarmers,
  getFarmerById,
  getMyFarmerProfile,
  updateFarmerProfile,
  getMyInventory,
  getMyFarmerOrders,
} from '../controllers/farmerController';
import { requireAuth } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/roleMiddleware';
import { validateRequest } from '../middleware/validateMiddleware';
import { farmerProfileUpdateSchema } from '../validators/marketplaceValidator';
import { applyForFarmerStatus } from '../controllers/authController';
import { farmerApplySchema } from '../validators/authValidator';

import { handleFarmerAiAssistant } from '../controllers/farmerAiController';

const router = Router();

// Public routes
router.get('/', listFarmers);
router.get('/:id', getFarmerById);

// Authenticated farmer apply (from Phase 2 — keep as is)
router.post('/apply', requireAuth, validateRequest(farmerApplySchema), applyForFarmerStatus);

// Farmer: own profile
router.get('/me/profile', requireAuth, requireRole('FARMER'), getMyFarmerProfile);
router.patch('/me/profile', requireAuth, requireRole('FARMER'), validateRequest(farmerProfileUpdateSchema), updateFarmerProfile);
router.get('/me/inventory', requireAuth, requireRole('FARMER'), getMyInventory);
router.get('/me/orders', requireAuth, requireRole('FARMER'), getMyFarmerOrders);

// Farmer AI Assistant
router.post('/ai-assistant', requireAuth, requireRole('FARMER'), handleFarmerAiAssistant);

export default router;
