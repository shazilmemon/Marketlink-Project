import { Router } from 'express';
import {
  createOrder,
  listOrders,
  getOrderById,
  getMyOrders,
  cancelOrder,
  updateOrderStatus,
} from '../controllers/orderController';
import { requireAuth } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/roleMiddleware';
import { validateRequest } from '../middleware/validateMiddleware';
import {
  createOrderSchema,
  updateOrderStatusSchema,
  cancelOrderSchema,
} from '../validators/marketplaceValidator';

const router = Router();

// Customer: create pre-order
router.post('/', requireAuth, requireRole('CUSTOMER'), validateRequest(createOrderSchema), createOrder);

// Customer: own orders
router.get('/me', requireAuth, requireRole('CUSTOMER'), getMyOrders);

// All authenticated users: list (filtered by role in controller)
router.get('/', requireAuth, listOrders);

// Single order
router.get('/:id', requireAuth, getOrderById);

// Customer cancels
router.patch('/:id/cancel', requireAuth, requireRole('CUSTOMER'), validateRequest(cancelOrderSchema), cancelOrder);

// Farmer updates status
router.patch('/:id/status', requireAuth, requireRole('FARMER'), validateRequest(updateOrderStatusSchema), updateOrderStatus);

export default router;
