import { Router } from 'express';
import {
  getFarmerOverview,
  getFarmerSales,
  getFarmerOrders,
  getFarmerProducts,
  getFarmerInventory,
  getFarmerCustomers,
  getFarmerReviews,
  getFarmerMarkets,
  getFarmerInsights,
  exportFarmerAnalytics,
} from '../controllers/analyticsController';
import { requireAuth } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/roleMiddleware';

const router = Router();

// All analytics endpoints require authenticated FARMER or ADMIN users
router.use(requireAuth, requireRole('FARMER', 'ADMIN'));

router.get('/farmer/overview', getFarmerOverview);
router.get('/farmer/sales', getFarmerSales);
router.get('/farmer/orders', getFarmerOrders);
router.get('/farmer/products', getFarmerProducts);
router.get('/farmer/inventory', getFarmerInventory);
router.get('/farmer/customers', getFarmerCustomers);
router.get('/farmer/reviews', getFarmerReviews);
router.get('/farmer/markets', getFarmerMarkets);
router.get('/farmer/insights', getFarmerInsights);
router.get('/farmer/export', exportFarmerAnalytics);

export default router;
