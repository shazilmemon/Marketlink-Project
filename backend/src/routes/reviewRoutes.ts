import { Router } from 'express';
import { moderateReview, deleteReview } from '../controllers/reviewController';
import { requireAuth } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/roleMiddleware';
import { validateRequest } from '../middleware/validateMiddleware';
import { moderateReviewSchema } from '../validators/marketplaceValidator';

const router = Router();

// Admin moderation
router.patch('/:id', requireAuth, requireRole('ADMIN'), validateRequest(moderateReviewSchema), moderateReview);
router.delete('/:id', requireAuth, requireRole('ADMIN'), deleteReview);

export default router;
