import { Router } from 'express';
import { verifyFarmerStall } from '../controllers/authController';
import { requireAuth } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/roleMiddleware';
import { validateRequest } from '../middleware/validateMiddleware';
import { farmerVerifySchema } from '../validators/authValidator';

const router = Router();

// Admin endpoint to approve or reject farmer applications
router.patch('/farmers/:id/verify', requireAuth, requireRole('ADMIN'), validateRequest(farmerVerifySchema), verifyFarmerStall);

export default router;
