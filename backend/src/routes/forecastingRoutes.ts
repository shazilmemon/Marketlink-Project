import { Router } from 'express';
import {
  generateForecast,
  generateBulkForecast,
  getFarmerForecasts,
  getForecastById,
  getForecastEvaluations,
} from '../controllers/forecastingController';
import { requireAuth } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/roleMiddleware';

const router = Router();

// All forecasting endpoints require authenticated FARMER or ADMIN roles
router.use(requireAuth, requireRole('FARMER', 'ADMIN'));

router.post('/farmer/generate', generateForecast);
router.post('/farmer/generate-bulk', generateBulkForecast);
router.get('/farmer', getFarmerForecasts);
router.get('/farmer/evaluations', getForecastEvaluations);
router.get('/farmer/:id', getForecastById);

export default router;
