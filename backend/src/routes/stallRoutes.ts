import { Router } from 'express';
import { updateStall, deleteStall } from '../controllers/marketController';
import { requireAuth } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/roleMiddleware';
import { validateRequest } from '../middleware/validateMiddleware';
import { updateStallSchema } from '../validators/marketplaceValidator';

const router = Router();

router.patch('/:id', requireAuth, requireRole('FARMER', 'ADMIN'), validateRequest(updateStallSchema), updateStall);
router.delete('/:id', requireAuth, requireRole('FARMER', 'ADMIN'), deleteStall);

export default router;
