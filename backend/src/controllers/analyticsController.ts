import { Request, Response, NextFunction } from 'express';
import { AnalyticsService } from '../services/analyticsService';
import { analyticsQuerySchema } from '../validators/analyticsValidator';
import { sendSuccess } from '../utils/response';

const getUserId = (req: Request): string => {
  const user = (req as any).user;
  return user?.id || user?._id || user?.userId || '';
};

// GET /api/v1/analytics/farmer/overview
export const getFarmerOverview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = analyticsQuerySchema.parse(req.query);
    const userId = getUserId(req);
    const data = await AnalyticsService.getFarmerOverview(userId, query);
    return sendSuccess(res, data, 'Farmer analytics overview retrieved');
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/analytics/farmer/sales
export const getFarmerSales = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = analyticsQuerySchema.parse(req.query);
    const userId = getUserId(req);
    const data = await AnalyticsService.getFarmerSales(userId, query);
    return sendSuccess(res, data, 'Sales time-series analytics retrieved');
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/analytics/farmer/orders
export const getFarmerOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = analyticsQuerySchema.parse(req.query);
    const userId = getUserId(req);
    const data = await AnalyticsService.getFarmerOrders(userId, query);
    return sendSuccess(res, data, 'Order status analytics retrieved');
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/analytics/farmer/products
export const getFarmerProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = analyticsQuerySchema.parse(req.query);
    const userId = getUserId(req);
    const data = await AnalyticsService.getFarmerProducts(userId, query);
    return sendSuccess(res, data, 'Product performance analytics retrieved');
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/analytics/farmer/inventory
export const getFarmerInventory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = analyticsQuerySchema.parse(req.query);
    const userId = getUserId(req);
    const overview = await AnalyticsService.getFarmerOverview(userId, query);
    const products = await AnalyticsService.getFarmerProducts(userId, query);

    const data = {
      lowStockProducts: overview.currentMetrics.lowStockProducts,
      outOfStockProducts: overview.currentMetrics.outOfStockProducts,
      activeProducts: overview.currentMetrics.activeProducts,
      products: products.topProducts,
    };
    return sendSuccess(res, data, 'Inventory movement analytics retrieved');
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/analytics/farmer/customers
export const getFarmerCustomers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = analyticsQuerySchema.parse(req.query);
    const userId = getUserId(req);
    const data = await AnalyticsService.getFarmerCustomers(userId, query);
    return sendSuccess(res, data, 'Customer aggregate analytics retrieved');
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/analytics/farmer/reviews
export const getFarmerReviews = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const data = await AnalyticsService.getFarmerReviews(userId);
    return sendSuccess(res, data, 'Review rating distribution retrieved');
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/analytics/farmer/markets
export const getFarmerMarkets = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = analyticsQuerySchema.parse(req.query);
    const userId = getUserId(req);
    const data = await AnalyticsService.getFarmerMarkets(userId, query);
    return sendSuccess(res, data, 'Market stall performance analytics retrieved');
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/analytics/farmer/insights
export const getFarmerInsights = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = analyticsQuerySchema.parse(req.query);
    const userId = getUserId(req);
    const data = await AnalyticsService.getFarmerInsights(userId, query);
    return sendSuccess(res, data, 'Smart Vendor Insights retrieved');
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/analytics/farmer/export
export const exportFarmerAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = analyticsQuerySchema.parse(req.query);
    const userId = getUserId(req);
    const csvContent = await AnalyticsService.generateCsvExport(userId, query);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=farmer-analytics-${query.preset}.csv`);
    return res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
};
