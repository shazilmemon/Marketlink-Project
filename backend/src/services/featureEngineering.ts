import mongoose from 'mongoose';
import { Order } from '../models/Order';

export interface DailySalesObservation {
  date: string; // YYYY-MM-DD
  quantitySold: number;
  orderCount: number;
  revenue: number;
}

export interface EngineeredFeatures {
  dayOfWeek: number;
  month: number;
  sampleCount: number;
  hasEnoughData: boolean;
  lag1: number;
  lag7: number;
  lag14: number;
  rollingAverage7: number;
  rollingAverage14: number;
  rollingAverage30: number;
  recentTrend: number;
  historicalMean: number;
  historicalStdDev: number;
  minDemand: number;
  maxDemand: number;
  observations: DailySalesObservation[];
}

export class FeatureEngineering {
  /**
   * Fetches historical daily sales observations strictly BEFORE targetDate (Data Leakage Prevention)
   */
  public static async fetchHistoricalDailySales(
    farmerProfileId: mongoose.Types.ObjectId,
    productId: mongoose.Types.ObjectId,
    targetDate: Date,
    daysHistory: number = 90
  ): Promise<DailySalesObservation[]> {
    const startDate = new Date(targetDate.getTime() - daysHistory * 24 * 60 * 60 * 1000);

    const aggregations = await Order.aggregate([
      {
        $match: {
          farmerProfileId,
          status: 'PICKED_UP', // Use only valid completed fulfilled orders
          createdAt: { $gte: startDate, $lt: targetDate }, // Strictly before targetDate
          'items.productId': productId,
        },
      },
      { $unwind: '$items' },
      { $match: { 'items.productId': productId } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          quantitySold: { $sum: '$items.quantity' },
          orderCount: { $sum: 1 },
          revenue: { $sum: '$items.subtotal' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return aggregations.map((a) => ({
      date: a._id,
      quantitySold: a.quantitySold,
      orderCount: a.orderCount,
      revenue: Math.round(a.revenue * 100) / 100,
    }));
  }

  /**
   * Generates feature vectors from daily sales observations
   */
  public static buildFeatures(
    observations: DailySalesObservation[],
    targetDate: Date
  ): EngineeredFeatures {
    const targetDayOfWeek = targetDate.getDay();
    const targetMonth = targetDate.getMonth() + 1;
    const sampleCount = observations.length;

    if (sampleCount < 3) {
      return {
        dayOfWeek: targetDayOfWeek,
        month: targetMonth,
        sampleCount,
        hasEnoughData: false,
        lag1: 0,
        lag7: 0,
        lag14: 0,
        rollingAverage7: 0,
        rollingAverage14: 0,
        rollingAverage30: 0,
        recentTrend: 1.0,
        historicalMean: 0,
        historicalStdDev: 0,
        minDemand: 0,
        maxDemand: 0,
        observations,
      };
    }

    const quantities = observations.map((o) => o.quantitySold);
    const totalQty = quantities.reduce((sum, q) => sum + q, 0);
    const historicalMean = totalQty / sampleCount;

    // Variance & StdDev
    const variance =
      quantities.reduce((sum, q) => sum + Math.pow(q - historicalMean, 2), 0) / sampleCount;
    const historicalStdDev = Math.sqrt(variance);

    const minDemand = Math.min(...quantities);
    const maxDemand = Math.max(...quantities);

    // Lags
    const lag1 = quantities[quantities.length - 1] || 0;
    const lag7 = quantities.length >= 7 ? quantities[quantities.length - 7] : lag1;
    const lag14 = quantities.length >= 14 ? quantities[quantities.length - 14] : lag7;

    // Rolling Averages
    const last7 = quantities.slice(-7);
    const rollingAverage7 = last7.reduce((s, q) => s + q, 0) / last7.length;

    const last14 = quantities.slice(-14);
    const rollingAverage14 = last14.reduce((s, q) => s + q, 0) / last14.length;

    const last30 = quantities.slice(-30);
    const rollingAverage30 = last30.reduce((s, q) => s + q, 0) / last30.length;

    // Recent trend ratio (7-day rolling avg vs 30-day rolling avg)
    const recentTrend = rollingAverage30 > 0 ? rollingAverage7 / rollingAverage30 : 1.0;

    return {
      dayOfWeek: targetDayOfWeek,
      month: targetMonth,
      sampleCount,
      hasEnoughData: sampleCount >= 3,
      lag1,
      lag7,
      lag14,
      rollingAverage7: Math.round(rollingAverage7 * 10) / 10,
      rollingAverage14: Math.round(rollingAverage14 * 10) / 10,
      rollingAverage30: Math.round(rollingAverage30 * 10) / 10,
      recentTrend: Math.round(recentTrend * 100) / 100,
      historicalMean: Math.round(historicalMean * 10) / 10,
      historicalStdDev: Math.round(historicalStdDev * 10) / 10,
      minDemand,
      maxDemand,
      observations,
    };
  }
}
