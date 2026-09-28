import mongoose from 'mongoose';
import { FarmerProfile } from '../models/FarmerProfile';
import { FarmerAnalyticsAggregations } from '../aggregations/farmerAnalyticsAggregations';
import { SmartInsightService } from './smartInsightService';
import { parseAnalyticsDateRange, AnalyticsQuery } from '../validators/analyticsValidator';
import { NotFoundError } from '../utils/errors';

export class AnalyticsService {
  /**
   * Resolves farmerProfileId from userId or farmerProfileId
   */
  public static async resolveFarmerProfileId(userId: string): Promise<mongoose.Types.ObjectId> {
    const profile = await FarmerProfile.findOne({ userId });
    if (!profile) {
      throw new NotFoundError('Farmer profile not found for user');
    }
    return profile._id as mongoose.Types.ObjectId;
  }

  /**
   * Helper to calculate percentage change safely without dividing by zero
   */
  private static calculateChange(current: number, previous: number): { changeAmount: number; changePct: number | null } {
    const changeAmount = Math.round((current - previous) * 100) / 100;
    if (previous === 0) {
      return { changeAmount, changePct: null };
    }
    const changePct = Math.round(((current - previous) / previous) * 1000) / 10;
    return { changeAmount, changePct };
  }

  /**
   * GET Farmer Analytics Overview
   */
  public static async getFarmerOverview(userId: string, query: AnalyticsQuery) {
    const farmerProfileId = await this.resolveFarmerProfileId(userId);
    const { startDate, endDate, prevStartDate, prevEndDate, preset } = parseAnalyticsDateRange(query);

    const [currentMetrics, prevMetrics, insights] = await Promise.all([
      FarmerAnalyticsAggregations.getSummaryMetrics(farmerProfileId, startDate, endDate),
      FarmerAnalyticsAggregations.getSummaryMetrics(farmerProfileId, prevStartDate, prevEndDate),
      SmartInsightService.generateInsights(farmerProfileId, startDate, endDate, prevStartDate, prevEndDate),
    ]);

    const comparisons = {
      revenue: this.calculateChange(currentMetrics.totalRevenue, prevMetrics.totalRevenue),
      orders: this.calculateChange(currentMetrics.totalOrders, prevMetrics.totalOrders),
      itemsSold: this.calculateChange(currentMetrics.totalItemsSold, prevMetrics.totalItemsSold),
      aov: this.calculateChange(currentMetrics.averageOrderValue, prevMetrics.averageOrderValue),
    };

    return {
      period: {
        preset,
        startDate,
        endDate,
        prevStartDate,
        prevEndDate,
      },
      currentMetrics,
      previousMetrics: prevMetrics,
      comparisons,
      smartInsightsCount: insights.length,
      featuredInsights: insights.slice(0, 3),
    };
  }

  /**
   * GET Sales Time Series
   */
  public static async getFarmerSales(userId: string, query: AnalyticsQuery) {
    const farmerProfileId = await this.resolveFarmerProfileId(userId);
    const { startDate, endDate, preset } = parseAnalyticsDateRange(query);

    const series = await FarmerAnalyticsAggregations.getSalesTimeSeries(
      farmerProfileId,
      startDate,
      endDate,
      query.groupBy
    );

    return {
      period: { preset, startDate, endDate, groupBy: query.groupBy },
      data: series,
    };
  }

  /**
   * GET Order Breakdown Analytics
   */
  public static async getFarmerOrders(userId: string, query: AnalyticsQuery) {
    const farmerProfileId = await this.resolveFarmerProfileId(userId);
    const { startDate, endDate } = parseAnalyticsDateRange(query);

    const metrics = await FarmerAnalyticsAggregations.getSummaryMetrics(farmerProfileId, startDate, endDate);
    const total = metrics.totalOrders;

    const breakdown = [
      { status: 'PENDING', count: metrics.pendingOrders, percentage: total > 0 ? Math.round((metrics.pendingOrders / total) * 1000) / 10 : 0 },
      { status: 'CONFIRMED', count: metrics.confirmedOrders, percentage: total > 0 ? Math.round((metrics.confirmedOrders / total) * 1000) / 10 : 0 },
      { status: 'PICKED_UP', count: metrics.completedOrders, percentage: total > 0 ? Math.round((metrics.completedOrders / total) * 1000) / 10 : 0 },
      { status: 'CANCELLED', count: metrics.cancelledOrders, percentage: total > 0 ? Math.round((metrics.cancelledOrders / total) * 1000) / 10 : 0 },
    ];

    return {
      totalOrders: total,
      breakdown,
    };
  }

  /**
   * GET Product Performance Analytics
   */
  public static async getFarmerProducts(userId: string, query: AnalyticsQuery) {
    const farmerProfileId = await this.resolveFarmerProfileId(userId);
    const { startDate, endDate } = parseAnalyticsDateRange(query);

    const performance = await FarmerAnalyticsAggregations.getProductPerformance(
      farmerProfileId,
      startDate,
      endDate,
      query.limit
    );

    return performance;
  }

  /**
   * GET Customer Aggregate Metrics
   */
  public static async getFarmerCustomers(userId: string, query: AnalyticsQuery) {
    const farmerProfileId = await this.resolveFarmerProfileId(userId);
    const { startDate, endDate } = parseAnalyticsDateRange(query);

    return FarmerAnalyticsAggregations.getCustomerMetrics(farmerProfileId, startDate, endDate);
  }

  /**
   * GET Review Distribution
   */
  public static async getFarmerReviews(userId: string) {
    const farmerProfileId = await this.resolveFarmerProfileId(userId);
    return FarmerAnalyticsAggregations.getReviewDistribution(farmerProfileId);
  }

  /**
   * GET Market Performance
   */
  public static async getFarmerMarkets(userId: string, query: AnalyticsQuery) {
    const farmerProfileId = await this.resolveFarmerProfileId(userId);
    const { startDate, endDate } = parseAnalyticsDateRange(query);

    return FarmerAnalyticsAggregations.getMarketPerformance(farmerProfileId, startDate, endDate);
  }

  /**
   * GET Smart Insights
   */
  public static async getFarmerInsights(userId: string, query: AnalyticsQuery) {
    const farmerProfileId = await this.resolveFarmerProfileId(userId);
    const { startDate, endDate, prevStartDate, prevEndDate } = parseAnalyticsDateRange(query);

    return SmartInsightService.generateInsights(
      farmerProfileId,
      startDate,
      endDate,
      prevStartDate,
      prevEndDate
    );
  }

  /**
   * Generate CSV Export for Farmer Analytics
   */
  public static async generateCsvExport(userId: string, query: AnalyticsQuery): Promise<string> {
    const overview = await this.getFarmerOverview(userId, query);
    const sales = await this.getFarmerSales(userId, query);

    let csv = 'MarketLink — Farmer Analytics Export\n';
    csv += `Generated At,${new Date().toISOString()}\n`;
    csv += `Period,${overview.period.preset} (${overview.period.startDate.toISOString().split('T')[0]} to ${overview.period.endDate.toISOString().split('T')[0]})\n\n`;

    csv += 'KPI Metric,Value\n';
    csv += `Total Revenue,$${overview.currentMetrics.totalRevenue}\n`;
    csv += `Total Orders,${overview.currentMetrics.totalOrders}\n`;
    csv += `Completed Orders,${overview.currentMetrics.completedOrders}\n`;
    csv += `Pending Orders,${overview.currentMetrics.pendingOrders}\n`;
    csv += `Total Items Sold,${overview.currentMetrics.totalItemsSold}\n`;
    csv += `Average Order Value,$${overview.currentMetrics.averageOrderValue}\n`;
    csv += `Active Products,${overview.currentMetrics.activeProducts}\n`;
    csv += `Low Stock Items,${overview.currentMetrics.lowStockProducts}\n`;
    csv += `Average Rating,${overview.currentMetrics.averageRating}\n\n`;

    csv += 'Date,Revenue ($),Orders Count,Items Sold\n';
    sales.data.forEach((row: any) => {
      csv += `${row.date},${row.revenue},${row.orders},${row.itemsSold}\n`;
    });

    return csv;
  }
}
