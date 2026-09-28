import { Router } from 'express';
import healthRoutes from './healthRoutes';
import authRoutes from './authRoutes';
import farmerRoutes from './farmerRoutes';
import adminRoutes from './adminRoutes';
import marketRoutes from './marketRoutes';
import stallRoutes from './stallRoutes';
import productRoutes from './productRoutes';
import inventoryRoutes from './inventoryRoutes';
import orderRoutes from './orderRoutes';
import favoriteRoutes from './favoriteRoutes';
import notificationRoutes from './notificationRoutes';
import reviewRoutes from './reviewRoutes';
import analyticsRoutes from './analyticsRoutes';
import forecastingRoutes from './forecastingRoutes';
import aiRoutes from './aiRoutes';

const router = Router();

// Phase 1 & 2 — Preserved
router.use('/', healthRoutes);
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);

// Phase 3 — Marketplace
router.use('/farmers', farmerRoutes);
router.use('/markets', marketRoutes);
router.use('/stalls', stallRoutes);
router.use('/products', productRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/orders', orderRoutes);
router.use('/favorites', favoriteRoutes);
router.use('/notifications', notificationRoutes);
router.use('/reviews', reviewRoutes);

// Phase 4 — Analytics & Smart Vendor Insights
router.use('/analytics', analyticsRoutes);

// Phase 5 — AI Demand Forecasting
router.use('/forecasting', forecastingRoutes);

// Phase 6 - AI Marketplace Intelligence
router.use('/ai', aiRoutes);

export default router;
