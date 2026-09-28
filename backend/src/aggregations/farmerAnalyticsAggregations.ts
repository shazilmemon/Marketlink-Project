import mongoose from 'mongoose';
import { Order } from '../models/Order';
import { Product } from '../models/Product';
import { Inventory } from '../models/Inventory';
import { Review } from '../models/Review';
import { MarketStall } from '../models/MarketStall';

export class FarmerAnalyticsAggregations {
  /**
   * Aggregate high-level summary KPIs for a farmer within a date range
   */
  public static async getSummaryMetrics(
    farmerProfileId: mongoose.Types.ObjectId,
    startDate: Date,
    endDate: Date
  ) {
    const orderStats = await Order.aggregate([
      {
        $match: {
          farmerProfileId,
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: {
              $cond: [{ $ne: ['$status', 'CANCELLED'] }, '$totalAmount', 0],
            },
          },
          totalOrders: { $sum: 1 },
          completedOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'PICKED_UP'] }, 1, 0] },
          },
          readyOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'READY_FOR_PICKUP'] }, 1, 0] },
          },
          confirmedOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'CONFIRMED'] }, 1, 0] },
          },
          pendingOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'PENDING'] }, 1, 0] },
          },
          cancelledOrders: {
            $sum: {
              $cond: [
                { $in: ['$status', ['CANCELLED', 'REJECTED']] },
                1,
                0,
              ],
            },
          },
          totalItemsSold: {
            $sum: {
              $cond: [
                { $ne: ['$status', 'CANCELLED'] },
                { $sum: '$items.quantity' },
                0,
              ],
            },
          },
        },
      },
    ]);

    const stats = orderStats[0] || {
      totalRevenue: 0,
      totalOrders: 0,
      completedOrders: 0,
      readyOrders: 0,
      confirmedOrders: 0,
      pendingOrders: 0,
      cancelledOrders: 0,
      totalItemsSold: 0,
    };

    const averageOrderValue =
      stats.totalOrders > 0 ? stats.totalRevenue / stats.totalOrders : 0;

    // Inventory & Active Product Counts
    const productsCount = await Product.countDocuments({
      farmerProfileId,
      isActive: true,
    });

    const inventoryStats = await Inventory.aggregate([
      {
        $lookup: {
          from: 'products',
          localField: 'productId',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: '$product' },
      { $match: { 'product.farmerProfileId': farmerProfileId } },
      {
        $group: {
          _id: null,
          lowStockCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gt: ['$quantityAvailable', 0] },
                    { $lte: ['$quantityAvailable', '$lowStockThreshold'] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          outOfStockCount: {
            $sum: { $cond: [{ $lte: ['$quantityAvailable', 0] }, 1, 0] },
          },
        },
      },
    ]);

    const lowStockProducts = inventoryStats[0]?.lowStockCount || 0;
    const outOfStockProducts = inventoryStats[0]?.outOfStockCount || 0;

    // Reviews & Rating Stats
    const reviewStats = await Review.aggregate([
      {
        $lookup: {
          from: 'products',
          localField: 'productId',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: '$product' },
      { $match: { 'product.farmerProfileId': farmerProfileId, isPublished: true } },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    const averageRating = reviewStats[0]?.avgRating || 0;
    const totalReviews = reviewStats[0]?.totalReviews || 0;

    return {
      totalRevenue: Math.round(stats.totalRevenue * 100) / 100,
      totalOrders: stats.totalOrders,
      completedOrders: stats.completedOrders,
      confirmedOrders: stats.confirmedOrders,
      pendingOrders: stats.pendingOrders,
      cancelledOrders: stats.cancelledOrders,
      totalItemsSold: stats.totalItemsSold,
      averageOrderValue: Math.round(averageOrderValue * 100) / 100,
      activeProducts: productsCount,
      lowStockProducts,
      outOfStockProducts,
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews,
    };
  }

  /**
   * Time-series sales trend grouped by day, week, or month
   */
  public static async getSalesTimeSeries(
    farmerProfileId: mongoose.Types.ObjectId,
    startDate: Date,
    endDate: Date,
    groupBy: 'day' | 'week' | 'month' = 'day'
  ) {
    let dateFormat = '%Y-%m-%d';
    if (groupBy === 'week') dateFormat = '%Y-W%V';
    if (groupBy === 'month') dateFormat = '%Y-%m';

    const series = await Order.aggregate([
      {
        $match: {
          farmerProfileId,
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $ne: 'CANCELLED' },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: dateFormat, date: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 },
          itemsSold: { $sum: { $sum: '$items.quantity' } },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return series.map((item) => ({
      date: item._id,
      revenue: Math.round(item.revenue * 100) / 100,
      orders: item.orders,
      itemsSold: item.itemsSold,
    }));
  }

  /**
   * Product performance ranking (Top products & low-performing products)
   */
  public static async getProductPerformance(
    farmerProfileId: mongoose.Types.ObjectId,
    startDate: Date,
    endDate: Date,
    limit: number = 10
  ) {
    const performance = await Order.aggregate([
      {
        $match: {
          farmerProfileId,
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $ne: 'CANCELLED' },
        },
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          unitsSold: { $sum: '$items.quantity' },
          revenue: { $sum: '$items.subtotal' },
          orderCount: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: '$product' },
      {
        $lookup: {
          from: 'inventories',
          localField: '_id',
          foreignField: 'productId',
          as: 'inventory',
        },
      },
      { $unwind: { path: '$inventory', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          name: '$product.name',
          category: '$product.category',
          price: '$product.price',
          unit: '$product.unit',
          rating: '$product.averageRating',
          reviewCount: '$product.reviewCount',
          unitsSold: 1,
          revenue: { $round: ['$revenue', 2] },
          orderCount: 1,
          currentStock: { $ifNull: ['$inventory.quantityAvailable', 0] },
          stockStatus: { $ifNull: ['$inventory.availabilityStatus', 'OUT_OF_STOCK'] },
        },
      },
      { $sort: { revenue: -1 } },
    ]);

    // Separate into top products and low performing criteria
    const topProducts = performance.slice(0, limit);
    const lowPerformingProducts = performance
      .filter((p) => p.unitsSold < 5 || p.orderCount <= 2)
      .map((p) => ({
        ...p,
        issueLabel: p.unitsSold === 0 ? 'No sales in period' : 'Low recent demand',
      }))
      .slice(0, limit);

    return { topProducts, lowPerformingProducts };
  }

  /**
   * Privacy-conscious customer aggregates for farmer
   */
  public static async getCustomerMetrics(
    farmerProfileId: mongoose.Types.ObjectId,
    startDate: Date,
    endDate: Date
  ) {
    const customerStats = await Order.aggregate([
      {
        $match: {
          farmerProfileId,
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $ne: 'CANCELLED' },
        },
      },
      {
        $group: {
          _id: '$customerId',
          orderCount: { $sum: 1 },
          totalSpent: { $sum: '$totalAmount' },
        },
      },
      {
        $group: {
          _id: null,
          totalUniqueCustomers: { $sum: 1 },
          repeatCustomers: {
            $sum: { $cond: [{ $gt: ['$orderCount', 1] }, 1, 0] },
          },
          singleOrderCustomers: {
            $sum: { $cond: [{ $eq: ['$orderCount', 1] }, 1, 0] },
          },
          avgSpentPerCustomer: { $avg: '$totalSpent' },
          avgOrdersPerCustomer: { $avg: '$orderCount' },
        },
      },
    ]);

    const res = customerStats[0] || {
      totalUniqueCustomers: 0,
      repeatCustomers: 0,
      singleOrderCustomers: 0,
      avgSpentPerCustomer: 0,
      avgOrdersPerCustomer: 0,
    };

    const repeatRate =
      res.totalUniqueCustomers > 0
        ? (res.repeatCustomers / res.totalUniqueCustomers) * 100
        : 0;

    return {
      totalUniqueCustomers: res.totalUniqueCustomers,
      repeatCustomers: res.repeatCustomers,
      singleOrderCustomers: res.singleOrderCustomers,
      repeatRate: Math.round(repeatRate * 10) / 10,
      avgSpentPerCustomer: Math.round(res.avgSpentPerCustomer * 100) / 100,
      avgOrdersPerCustomer: Math.round(res.avgOrdersPerCustomer * 10) / 10,
    };
  }

  /**
   * Rating distribution breakdown for reviews
   */
  public static async getReviewDistribution(farmerProfileId: mongoose.Types.ObjectId) {
    const distribution = await Review.aggregate([
      {
        $lookup: {
          from: 'products',
          localField: 'productId',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: '$product' },
      { $match: { 'product.farmerProfileId': farmerProfileId, isPublished: true } },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 },
        },
      },
    ]);

    const ratingCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let totalReviews = 0;
    let sumRating = 0;

    distribution.forEach((d) => {
      ratingCounts[d._id] = d.count;
      totalReviews += d.count;
      sumRating += d._id * d.count;
    });

    const averageRating = totalReviews > 0 ? sumRating / totalReviews : 0;

    return {
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews,
      distribution: ratingCounts,
    };
  }

  /**
   * Market Stall Sales Breakdown
   */
  public static async getMarketPerformance(
    farmerProfileId: mongoose.Types.ObjectId,
    startDate: Date,
    endDate: Date
  ) {
    const stalls = await MarketStall.find({ farmerProfileId }).populate('marketId', 'name city address');

    const marketStats = await Order.aggregate([
      {
        $match: {
          farmerProfileId,
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $ne: 'CANCELLED' },
        },
      },
      {
        $group: {
          _id: '$farmerProfileId',
          ordersCount: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' },
          itemsSold: { $sum: { $sum: '$items.quantity' } },
        },
      },
    ]);

    return stalls.map((stall: any) => {
      const stat = marketStats[0] || { ordersCount: 0, totalRevenue: 0, itemsSold: 0 };
      return {
        stallNumber: stall.stallNumber,
        dayOfWeek: stall.dayOfWeek,
        marketName: stall.marketId?.name || 'Local Farmers Market',
        city: stall.marketId?.city || 'Regional',
        ordersCount: stat.ordersCount,
        totalRevenue: Math.round(stat.totalRevenue * 100) / 100,
        itemsSold: stat.itemsSold,
      };
    });
  }
}
