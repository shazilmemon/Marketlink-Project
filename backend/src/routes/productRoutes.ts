import { Router } from 'express';
import {
  listProducts,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController';
import {
  listProductReviews,
  createReview,
  moderateReview,
  deleteReview,
} from '../controllers/reviewController';
import { requireAuth } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/roleMiddleware';
import { validateRequest } from '../middleware/validateMiddleware';
import {
  createProductSchema,
  updateProductSchema,
  createReviewSchema,
  moderateReviewSchema,
} from '../validators/marketplaceValidator';

const router = Router();

// Public
router.get('/', listProducts);
router.get('/:slug', getProductBySlug);

// Farmer/Admin: product management
router.post('/', requireAuth, requireRole('FARMER', 'ADMIN'), validateRequest(createProductSchema), createProduct);
router.patch('/:id', requireAuth, requireRole('FARMER', 'ADMIN'), validateRequest(updateProductSchema), updateProduct);
router.delete('/:id', requireAuth, requireRole('FARMER', 'ADMIN'), deleteProduct);

// Reviews under products
router.get('/:productId/reviews', listProductReviews);
router.post(
  '/:productId/reviews',
  requireAuth,
  requireRole('CUSTOMER'),
  validateRequest(createReviewSchema),
  createReview
);

export default router;
