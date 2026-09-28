import { Request, Response, NextFunction } from 'express';
import { Review } from '../models/Review';
import { Order } from '../models/Order';
import { Product } from '../models/Product';
import { FarmerProfile } from '../models/FarmerProfile';
import { sendSuccess } from '../utils/response';
import { NotFoundError, ForbiddenError, ConflictError, AppError } from '../utils/errors';
import { AuditService } from '../services/auditService';
import { NotificationService } from '../services/notificationService';

// Helper: recalculate product and farmer rating
const recalculateRatings = async (productId: string, farmerId: string): Promise<void> => {
  const productReviews = await Review.find({ productId, status: 'PUBLISHED' }).lean();
  if (productReviews.length > 0) {
    const avgRating = productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length;
    await Product.findByIdAndUpdate(productId, {
      averageRating: parseFloat(avgRating.toFixed(2)),
      reviewCount: productReviews.length,
    });
  }

  const farmerReviews = await Review.find({ farmerId, status: 'PUBLISHED' }).lean();
  if (farmerReviews.length > 0) {
    const avgRating = farmerReviews.reduce((sum, r) => sum + r.rating, 0) / farmerReviews.length;
    await FarmerProfile.findOneAndUpdate(
      { userId: farmerId },
      {
        averageRating: parseFloat(avgRating.toFixed(2)),
        reviewCount: farmerReviews.length,
      }
    );
  }
};

// GET /api/v1/products/:productId/reviews — Public
export const listProductReviews = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, parseInt(req.query.limit as string) || 10);
    const skip = (page - 1) * limit;

    const filter: any = { productId: req.params.productId, status: 'PUBLISHED' };

    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .populate('userId', 'name avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Review.countDocuments(filter),
    ]);

    return sendSuccess(res, reviews, 'Reviews retrieved', 200, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/products/:productId/reviews — Customer with eligible order
export const createReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const { productId } = req.params;
    // Rating must come from body and be validated server-side (1–5 enforced by Zod + model)
    const { orderId, rating, title, comment } = req.body;

    // 1. Verify product exists
    const product = await Product.findById(productId);
    if (!product) throw new NotFoundError('Product not found');

    // 2. Customer cannot review their own product (if farmer is also a customer)
    if (product.farmerId.toString() === userId) {
      throw new ForbiddenError('You cannot review your own product');
    }

    // 3. Verify order exists and belongs to this customer
    const order = await Order.findById(orderId);
    if (!order) throw new NotFoundError('Order not found');
    if (order.customerId.toString() !== userId) {
      throw new ForbiddenError('This order does not belong to you');
    }

    // 4. Order must be PICKED_UP (completed) for review eligibility
    if (order.status !== 'PICKED_UP') {
      throw new AppError(
        'You can only review after completing the pickup',
        400,
        'ORDER_NOT_COMPLETED'
      );
    }

    // 5. Order must contain this product
    const hasProduct = order.items.some((item) => item.productId.toString() === productId);
    if (!hasProduct) {
      throw new AppError('This product was not part of the order', 400, 'PRODUCT_NOT_IN_ORDER');
    }

    // 6. Prevent duplicate review for same order + product
    const existing = await Review.findOne({ userId, orderId, productId });
    if (existing) throw new ConflictError('You have already reviewed this product for this order');

    // 7. Rating value enforced by Zod schema (1–5) and model validation
    const review = await Review.create({
      userId,
      productId,
      farmerId: product.farmerId,
      orderId,
      rating,
      title: title || '',
      comment,
      status: 'PUBLISHED',
    });

    // 8. Recalculate ratings
    await recalculateRatings(productId, product.farmerId.toString());

    // 9. Notify farmer
    await NotificationService.notifyReviewReceived(
      product.farmerId.toString(),
      product.name,
      rating
    );

    await AuditService.record({
      userId,
      action: 'REVIEW_CREATED',
      category: 'MARKETPLACE',
      details: { reviewId: review._id, productId, rating },
      ipAddress: req.ip,
    });

    return sendSuccess(res, review, 'Review submitted successfully', 201);
  } catch (error) {
    next(error);
  }
};

// PATCH /api/v1/reviews/:id — Admin moderation
export const moderateReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const adminId = (req as any).user.id;
    const { status } = req.body;

    const review = await Review.findById(req.params.id);
    if (!review) throw new NotFoundError('Review not found');

    review.status = status;
    await review.save();

    // Recalculate ratings after moderation
    await recalculateRatings(
      review.productId.toString(),
      review.farmerId.toString()
    );

    await AuditService.record({
      userId: adminId,
      action: 'REVIEW_MODERATED',
      category: 'MARKETPLACE',
      details: { reviewId: review._id, newStatus: status },
      ipAddress: req.ip,
    });

    return sendSuccess(res, review, 'Review moderated successfully');
  } catch (error) {
    next(error);
  }
};

// DELETE /api/v1/reviews/:id — Admin only (hard remove)
export const deleteReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const adminId = (req as any).user.id;

    const review = await Review.findById(req.params.id);
    if (!review) throw new NotFoundError('Review not found');

    const { productId, farmerId } = review;
    await review.deleteOne();

    await recalculateRatings(productId.toString(), farmerId.toString());

    await AuditService.record({
      userId: adminId,
      action: 'REVIEW_MODERATED',
      category: 'MARKETPLACE',
      details: { reviewId: req.params.id, action: 'DELETED' },
      ipAddress: req.ip,
    });

    return sendSuccess(res, null, 'Review deleted');
  } catch (error) {
    next(error);
  }
};
