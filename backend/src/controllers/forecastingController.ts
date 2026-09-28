import { Request, Response, NextFunction } from 'express';
import { ForecastingService } from '../services/forecastingService';
import {
  generateForecastSchema,
  generateBulkForecastSchema,
  forecastQuerySchema,
} from '../validators/forecastingValidator';
import { sendSuccess } from '../utils/response';

const getUserId = (req: Request): string => {
  const user = (req as any).user;
  return user?.id || user?._id || user?.userId || '';
};

// POST /api/v1/forecasting/farmer/generate
export const generateForecast = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = generateForecastSchema.parse(req.body);
    const userId = getUserId(req);
    const forecast = await ForecastingService.generateForecast(
      userId,
      input.productId,
      input.targetDate,
      input.marketId
    );
    return sendSuccess(res, forecast, 'Demand forecast generated successfully');
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/forecasting/farmer/generate-bulk
export const generateBulkForecast = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = generateBulkForecastSchema.parse(req.body);
    const userId = getUserId(req);
    const forecasts = await ForecastingService.generateBulkForecast(
      userId,
      input.productIds,
      input.targetDate,
      input.marketId
    );
    return sendSuccess(res, forecasts, 'Bulk demand forecasts generated successfully');
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/forecasting/farmer
export const getFarmerForecasts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = forecastQuerySchema.parse(req.query);
    const userId = getUserId(req);
    const forecasts = await ForecastingService.getFarmerForecasts(userId, query);
    return sendSuccess(res, forecasts, 'Farmer demand forecasts retrieved');
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/forecasting/farmer/evaluations
export const getForecastEvaluations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const evaluations = await ForecastingService.evaluatePastForecasts(userId);
    return sendSuccess(res, evaluations, 'Past forecast error evaluations retrieved');
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/forecasting/farmer/:id
export const getForecastById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const forecast = await ForecastingService.getForecastById(userId, req.params.id);
    return sendSuccess(res, forecast, 'Demand forecast details retrieved');
  } catch (error) {
    next(error);
  }
};
