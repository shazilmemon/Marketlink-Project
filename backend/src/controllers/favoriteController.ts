import { Request, Response, NextFunction } from 'express';
import { Favorite } from '../models/Favorite';
import { Product } from '../models/Product';
import { sendSuccess } from '../utils/response';
import { NotFoundError, ConflictError } from '../utils/errors';
import { AuditService } from '../services/auditService';

// GET /api/v1/favorites — Customer: own favorites
export const listFavorites = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, parseInt(req.query.limit as string) || 20);
    const skip = (page - 1) * limit;

    const [favorites, total] = await Promise.all([
      Favorite.find({ userId })
        .populate({
          path: 'productId',
          select: 'name slug category images basePrice currency unit isOrganic averageRating isActive farmerId',
          populate: {
            path: 'farmerId',
            select: 'name avatar',
          },
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Favorite.countDocuments({ userId }),
    ]);

    // Filter out soft-deleted products
    const active = favorites.filter((f) => (f.productId as any)?.isActive !== false);

    return sendSuccess(res, active, 'Favorites retrieved', 200, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/favorites — Customer adds favorite
export const addFavorite = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const { productId } = req.body;

    if (!productId) throw new NotFoundError('productId is required');

    // Verify product exists and is active
    const product = await Product.findById(productId);
    if (!product || !product.isActive) throw new NotFoundError('Product not found or inactive');

    // Check duplicate
    const existing = await Favorite.findOne({ userId, productId });
    if (existing) throw new ConflictError('Product already in favorites');

    const favorite = await Favorite.create({ userId, productId });

    await AuditService.record({
      userId,
      action: 'FAVORITE_ADDED',
      category: 'MARKETPLACE',
      details: { productId, productName: product.name },
      ipAddress: req.ip,
    });

    return sendSuccess(res, favorite, 'Added to favorites', 201);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/v1/favorites/:productId — Customer removes favorite
export const removeFavorite = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const { productId } = req.params;

    const favorite = await Favorite.findOneAndDelete({ userId, productId });
    if (!favorite) throw new NotFoundError('Favorite not found');

    await AuditService.record({
      userId,
      action: 'FAVORITE_REMOVED',
      category: 'MARKETPLACE',
      details: { productId },
      ipAddress: req.ip,
    });

    return sendSuccess(res, null, 'Removed from favorites');
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/favorites/check/:productId — Check if product is favorited
export const checkFavorite = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const { productId } = req.params;
    const favorite = await Favorite.findOne({ userId, productId }).lean();
    return sendSuccess(res, { isFavorited: !!favorite }, 'Favorite status retrieved');
  } catch (error) {
    next(error);
  }
};
