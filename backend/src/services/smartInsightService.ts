import mongoose from 'mongoose';
import { Inventory } from '../models/Inventory';
import { Product } from '../models/Product';
import { Order } from '../models/Order';
import { FarmerAnalyticsAggregations } from '../aggregations/farmerAnalyticsAggregations';

export interface SmartInsight {
  id: string;
  type:
    | 'HIGH_DEMAND_PRODUCT'
    | 'LOW_STOCK_RISK'
    | 'OUT_OF_STOCK'
    | 'SALES_GROWTH'
    | 'SALES_DECLINE'
    | 'REPEAT_CUSTOMER_GROWTH'
    | 'LOW_PERFORMING_PRODUCT'
    | 'HIGH_RATING_PRODUCT'
    | 'MARKET_OPPORTUNITY'
    | 'CANCELLATION_RATE_HIGH';
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low' | 'info';
  supportingMetrics: Record<string, any>;
  generatedAt: string;
}

export class SmartInsightService {
  /**
   * Generates deterministic, rule-based Smart Vendor Insights from real DB data
   */
  public static async generateInsights(
    farmerProfileId: mongoose.Types.ObjectId,
    startDate: Date,
    endDate: Date,
    prevStartDate: Date,
    prevEndDate: Date
  ): Promise<SmartInsight[]> {
    const insights: SmartInsight[] = [];
    const nowIso = new Date().toISOString();

    // 1. Fetch Summary Metrics for current & previous periods
    const [currentMetrics, prevMetrics] = await Promise.all([
      FarmerAnalyticsAggregations.getSummaryMetrics(farmerProfileId, startDate, endDate),
      FarmerAnalyticsAggregations.getSummaryMetrics(farmerProfileId, prevStartDate, prevEndDate),
    ]);

    // Rule 1: Revenue Growth / Decline
    if (prevMetrics.totalRevenue > 0) {
      const revDiff = currentMetrics.totalRevenue - prevMetrics.totalRevenue;
      const pctChange = (revDiff / prevMetrics.totalRevenue) * 100;

      if (pctChange >= 10) {
        insights.push({
          id: `ins-growth-${Date.now()}`,
          type: 'SALES_GROWTH',
          title: 'Strong Sales Growth',
          description: `Total revenue increased by ${Math.round(pctChange)}% compared to the previous period ($${currentMetrics.totalRevenue} vs $${prevMetrics.totalRevenue}).`,
          severity: 'info',
          supportingMetrics: {
            currentRevenue: currentMetrics.totalRevenue,
            previousRevenue: prevMetrics.totalRevenue,
            percentageChange: Math.round(pctChange * 10) / 10,
          },
          generatedAt: nowIso,
        });
      } else if (pctChange <= -10) {
        insights.push({
          id: `ins-decline-${Date.now()}`,
          type: 'SALES_DECLINE',
          title: 'Revenue Drop Detected',
          description: `Total revenue decreased by ${Math.abs(Math.round(pctChange))}% compared to the previous period ($${currentMetrics.totalRevenue} vs $${prevMetrics.totalRevenue}).`,
          severity: 'medium',
          supportingMetrics: {
            currentRevenue: currentMetrics.totalRevenue,
            previousRevenue: prevMetrics.totalRevenue,
            percentageChange: Math.round(pctChange * 10) / 10,
          },
          generatedAt: nowIso,
        });
      }
    } else if (currentMetrics.totalRevenue > 0) {
      insights.push({
        id: `ins-firstrev-${Date.now()}`,
        type: 'SALES_GROWTH',
        title: 'New Revenue Generated',
        description: `Your farm generated $${currentMetrics.totalRevenue} in revenue during this selected period.`,
        severity: 'info',
        supportingMetrics: { currentRevenue: currentMetrics.totalRevenue },
        generatedAt: nowIso,
      });
    }

    // Rule 2: High Cancellation Rate
    if (currentMetrics.totalOrders >= 5) {
      const cancelRate = (currentMetrics.cancelledOrders / currentMetrics.totalOrders) * 100;
      if (cancelRate >= 15) {
        insights.push({
          id: `ins-cancel-${Date.now()}`,
          type: 'CANCELLATION_RATE_HIGH',
          title: 'High Order Cancellation Rate',
          description: `${Math.round(cancelRate)}% of recent pre-orders were cancelled or rejected (${currentMetrics.cancelledOrders} of ${currentMetrics.totalOrders} orders).`,
          severity: 'high',
          supportingMetrics: {
            cancelledOrders: currentMetrics.cancelledOrders,
            totalOrders: currentMetrics.totalOrders,
            cancellationRate: Math.round(cancelRate * 10) / 10,
          },
          generatedAt: nowIso,
        });
      }
    }

    // Rule 3: Low Stock & Out of Stock Products
    const inventories = await Inventory.aggregate([
      {
        $lookup: {
          from: 'products',
          localField: 'productId',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: '$product' },
      { $match: { 'product.farmerProfileId': farmerProfileId, 'product.isActive': true } },
    ]);

    inventories.forEach((inv) => {
      if (inv.quantityAvailable === 0) {
        insights.push({
          id: `ins-oos-${inv._id}`,
          type: 'OUT_OF_STOCK',
          title: `Stockout: ${inv.product.name}`,
          description: `"${inv.product.name}" is currently completely out of stock. Update your inventory to accept new pre-orders.`,
          severity: 'high',
          supportingMetrics: {
            productId: inv.productId,
            productName: inv.product.name,
            quantityAvailable: 0,
          },
          generatedAt: nowIso,
        });
      } else if (inv.quantityAvailable <= inv.lowStockThreshold) {
        insights.push({
          id: `ins-low-${inv._id}`,
          type: 'LOW_STOCK_RISK',
          title: `Low Stock Warning: ${inv.product.name}`,
          description: `"${inv.product.name}" has only ${inv.quantityAvailable} ${inv.product.unit}s remaining (Threshold: ${inv.lowStockThreshold}).`,
          severity: 'medium',
          supportingMetrics: {
            productId: inv.productId,
            productName: inv.product.name,
            quantityAvailable: inv.quantityAvailable,
            lowStockThreshold: inv.lowStockThreshold,
          },
          generatedAt: nowIso,
        });
      }
    });

    // Rule 4: High Demand & Top Performing Products
    const { topProducts, lowPerformingProducts } =
      await FarmerAnalyticsAggregations.getProductPerformance(farmerProfileId, startDate, endDate, 5);

    topProducts.forEach((p) => {
      if (p.currentStock > 0 && p.currentStock <= 15 && p.unitsSold >= 10) {
        insights.push({
          id: `ins-demand-${p._id}`,
          type: 'HIGH_DEMAND_PRODUCT',
          title: `High Demand & Low Remaining Stock: ${p.name}`,
          description: `"${p.name}" has sold ${p.unitsSold} units recently while remaining stock is down to ${p.currentStock} ${p.unit}s.`,
          severity: 'medium',
          supportingMetrics: {
            productId: p._id,
            unitsSold: p.unitsSold,
            currentStock: p.currentStock,
          },
          generatedAt: nowIso,
        });
      }
      if (p.rating >= 4.8 && p.reviewCount >= 2) {
        insights.push({
          id: `ins-rating-${p._id}`,
          type: 'HIGH_RATING_PRODUCT',
          title: `Top-Rated Product: ${p.name}`,
          description: `"${p.name}" holds an average customer rating of ${p.rating}★ across ${p.reviewCount} verified reviews.`,
          severity: 'info',
          supportingMetrics: {
            productId: p._id,
            rating: p.rating,
            reviewCount: p.reviewCount,
          },
          generatedAt: nowIso,
        });
      }
    });

    // Rule 5: Low Performing Produce
    lowPerformingProducts.forEach((p) => {
      insights.push({
        id: `ins-lowperf-${p._id}`,
        type: 'LOW_PERFORMING_PRODUCT',
        title: `Low Sales Velocity: ${p.name}`,
        description: `"${p.name}" has recorded low recent sales volume (${p.unitsSold} ${p.unit}s sold). Consider running a surplus discount promotion.`,
        severity: 'low',
        supportingMetrics: {
          productId: p._id,
          unitsSold: p.unitsSold,
          orderCount: p.orderCount,
          issueLabel: p.issueLabel,
        },
        generatedAt: nowIso,
      });
    });

    // Rule 6: Customer Repeat Rate Growth
    const customerMetrics = await FarmerAnalyticsAggregations.getCustomerMetrics(farmerProfileId, startDate, endDate);
    if (customerMetrics.repeatRate >= 25 && customerMetrics.totalUniqueCustomers >= 3) {
      insights.push({
        id: `ins-cust-${Date.now()}`,
        type: 'REPEAT_CUSTOMER_GROWTH',
        title: 'Strong Customer Loyalty',
        description: `${customerMetrics.repeatRate}% of your customers are returning repeat buyers (${customerMetrics.repeatCustomers} out of ${customerMetrics.totalUniqueCustomers} unique buyers).`,
        severity: 'info',
        supportingMetrics: {
          repeatRate: customerMetrics.repeatRate,
          repeatCustomers: customerMetrics.repeatCustomers,
          totalUniqueCustomers: customerMetrics.totalUniqueCustomers,
        },
        generatedAt: nowIso,
      });
    }

    return insights;
  }
}
