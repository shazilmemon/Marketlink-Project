import { Router } from 'express';
import {
  listInventory,
  getInventoryById,
  createInventory,
  updateInventory,
  deleteInventory,
} from '../controllers/inventoryController';
import { requireAuth } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/roleMiddleware';
import { validateRequest } from '../middleware/validateMiddleware';
import { createInventorySchema, updateInventorySchema } from '../validators/marketplaceValidator';

const router = Router();

// All inventory routes require auth
router.get('/', requireAuth, requireRole('FARMER', 'ADMIN'), listInventory);
router.get('/:id', requireAuth, requireRole('FARMER', 'ADMIN'), getInventoryById);
router.post('/', requireAuth, requireRole('FARMER'), validateRequest(createInventorySchema), createInventory);
router.patch('/:id', requireAuth, requireRole('FARMER', 'ADMIN'), validateRequest(updateInventorySchema), updateInventory);
router.delete('/:id', requireAuth, requireRole('FARMER', 'ADMIN'), deleteInventory);

export default router;
