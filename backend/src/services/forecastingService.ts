import mongoose from 'mongoose';
import { DemandForecast, IDemandForecast } from '../models/DemandForecast';
import { FeatureEngineering } from './featureEngineering';
import { ModelEvaluator } from './modelEvaluator';
import {
  TrendAdjustedTimeSeriesProvider,
  BaselineMovingAverageProvider,
  ForecastPrediction,
} from './DemandForecastProvider';
import { FarmerProfile } from '../models/FarmerProfile';
import { Product } from '../models/Product';
import { Order } from '../models/Order';
import { NotFoundError, ForbiddenError, AppError } from '../utils/errors';
import { ForecastQuery } from '../validators/forecastingValidator';

export class ForecastingService {
  /**
   * Resolves farmer profile ID for authenticated user
   */
  private static async resolveFarmerProfileId(userId: string): Promise<mongoose.Types.ObjectId> {
    const profile = await FarmerProfile.findOne({ userId });
    if (!profile) {
      throw new NotFoundError('Farmer profile not found for user');
    }
    return profile._id as mongoose.Types.ObjectId;
  }

  /**
   * Generates or retrieves cached demand forecast for a single product
   */
  public static async generateForecast(
    userId: string,
    productIdStr: string,
    targetDateStr: string,
    marketIdStr?: string
  ): Promise<IDemandForecast> {
    const farmerProfileId = await this.resolveFarmerProfileId(userId);
    const productId = new mongoose.Types.ObjectId(productIdStr);
    const targetDate = new Date(targetDateStr);
    const marketId = marketIdStr ? new mongoose.Types.ObjectId(marketIdStr) : undefined;

    // Validate product ownership
    const product = await Product.findOne({ _id: productId, farmerProfileId });
    if (!product) {
      throw new ForbiddenError('Product not found or not owned by farmer');
    }

    // Check cached valid forecast (generated within last 12 hours for same target date)
    const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);
    const cached = await DemandForecast.findOne({
      farmerProfileId,
      productId,
      targetDate: { $gte: new Date(targetDate.setHours(0, 0, 0, 0)), $lte: new Date(targetDate.setHours(23, 59, 59, 999)) },
      generatedAt: { $gte: twelveHoursAgo },
    });

    if (cached) {
      return cached;
    }

    // 1. Fetch historical sales observations (Data leakage prevention: strictly < targetDate)
    const observations = await FeatureEngineering.fetchHistoricalDailySales(
      farmerProfileId,
      productId,
      targetDate
    );

    const features = FeatureEngineering.buildFeatures(observations, targetDate);

    // 2. Data Sufficiency Check
    if (!features.hasEnoughData) {
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const insufficientForecast = await DemandForecast.create({
        farmerProfileId,
        productId,
        marketId,
        forecastDate: new Date(),
        targetDate,
        predictedQuantity: 0,
        lowerBound: 0,
        upperBound: 0,
        demandLevel: 'MEDIUM',
        confidenceLevel: 'LOW',
        status: 'INSUFFICIENT_DATA',
        insufficientDataReason: `Not enough historical sales observations (${features.sampleCount} found, minimum 3 required). Complete more market pre-order pickups to enable forecasting.`,
        modelName: 'None',
        modelVersion: '1.0.0',
        trainingSampleCount: features.sampleCount,
        explanation: 'Insufficient historical sales data to generate a reliable forecast.',
        expiresAt,
      });
      return insufficientForecast;
    }

    // 3. Chronological Model Evaluation against Baseline
    const evalResult = ModelEvaluator.evaluateChronologicalSplit(observations);

    // 4. Select Provider: Use ML Model if better/equal, else Baseline
    const mlProvider = new TrendAdjustedTimeSeriesProvider();
    const baseProvider = new BaselineMovingAverageProvider();
    const chosenProvider = evalResult.isBetterThanBaseline ? mlProvider : baseProvider;

    const prediction: ForecastPrediction = chosenProvider.predict(features);

    // Calculate expiration (7 days after generation)
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const forecast = await DemandForecast.create({
      farmerProfileId,
      productId,
      marketId,
      forecastDate: new Date(),
      targetDate,
      horizonDays: 7,
      predictedQuantity: prediction.predictedQuantity,
      lowerBound: prediction.lowerBound,
      upperBound: prediction.upperBound,
      demandLevel: prediction.demandLevel,
      confidenceLevel: prediction.confidenceLevel,
      status: 'VALID',
      modelName: prediction.modelName,
      modelVersion: prediction.modelVersion,
      trainingDataStart: observations[0] ? new Date(observations[0].date) : undefined,
      trainingDataEnd: observations[observations.length - 1] ? new Date(observations[observations.length - 1].date) : undefined,
      trainingSampleCount: features.sampleCount,
      evaluationMetrics: {
        mae: evalResult.mae,
        rmse: evalResult.rmse,
        baselineMae: evalResult.baselineMae,
      },
      featureSummary: {
        rollingAverage7: features.rollingAverage7,
        rollingAverage30: features.rollingAverage30,
        recentTrend: features.recentTrend,
        historicalMean: features.historicalMean,
      },
      explanation: prediction.explanation,
      expiresAt,
    });

    return forecast;
  }

  /**
   * Bulk forecast generation for farmer products
   */
  public static async generateBulkForecast(
    userId: string,
    productIds: string[],
    targetDateStr: string,
    marketIdStr?: string
  ): Promise<IDemandForecast[]> {
    const results: IDemandForecast[] = [];
    for (const pid of productIds) {
      try {
        const fc = await this.generateForecast(userId, pid, targetDateStr, marketIdStr);
        results.push(fc);
      } catch (err) {
        // Skip failed individual product
      }
    }
    return results;
  }

  /**
   * Retrieves farmer forecasts with filters
   */
  public static async getFarmerForecasts(userId: string, query: ForecastQuery) {
    const farmerProfileId = await this.resolveFarmerProfileId(userId);
    const filter: Record<string, any> = { farmerProfileId };

    if (query.productId) filter.productId = query.productId;
    if (query.marketId) filter.marketId = query.marketId;
    if (query.demandLevel) filter.demandLevel = query.demandLevel;
    if (query.status) filter.status = query.status;

    return DemandForecast.find(filter)
      .sort({ createdAt: -1 })
      .limit(query.limit || 20)
      .populate('productId', 'name category price unit')
      .populate('marketId', 'name city');
  }

  /**
   * Retrieves single forecast by ID
   */
  public static async getForecastById(userId: string, forecastId: string) {
    const farmerProfileId = await this.resolveFarmerProfileId(userId);
    const forecast = await DemandForecast.findOne({ _id: forecastId, farmerProfileId })
      .populate('productId', 'name category price unit')
      .populate('marketId', 'name city');

    if (!forecast) {
      throw new NotFoundError('Demand forecast not found');
    }
    return forecast;
  }

  /**
   * Actual vs Forecast Error Evaluation after target date passes
   */
  public static async evaluatePastForecasts(userId: string): Promise<any[]> {
    const farmerProfileId = await this.resolveFarmerProfileId(userId);
    const pastForecasts = await DemandForecast.find({
      farmerProfileId,
      status: 'VALID',
      targetDate: { $lt: new Date() },
    })
      .limit(10)
      .populate('productId', 'name unit');

    for (const fc of pastForecasts) {
      if (fc.actualQuantity === undefined) {
        // Compute actual sales on target date
        const nextDay = new Date(fc.targetDate.getTime() + 24 * 60 * 60 * 1000);
        const actualAgg = await Order.aggregate([
          {
            $match: {
              farmerProfileId,
              status: 'PICKED_UP',
              createdAt: { $gte: fc.targetDate, $lt: nextDay },
              'items.productId': fc.productId,
            },
          },
          { $unwind: '$items' },
          { $match: { 'items.productId': fc.productId } },
          { $group: { _id: null, qty: { $sum: '$items.quantity' } } },
        ]);

        const actualQty = actualAgg[0]?.qty || 0;
        fc.actualQuantity = actualQty;
        fc.absoluteError = Math.abs(fc.predictedQuantity - actualQty);
        await fc.save();
      }
    }

    return pastForecasts;
  }
}
