import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Product } from '../models/Product';
import { FarmerProfile } from '../models/FarmerProfile';
import { Inventory } from '../models/Inventory';
import { sendSuccess } from '../utils/response';
import { NotFoundError, ForbiddenError, ConflictError } from '../utils/errors';
import { AuditService } from '../services/auditService';

const isDbConnected = () => mongoose.connection.readyState === 1;

// Helper: generate slug
const generateSlug = (name: string, farmerId: string): string => {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
  return `${base}-${farmerId.slice(-6)}-${Date.now()}`;
};

// GET /api/v1/products — Public with full filtering + pagination
export const listProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Graceful fallback when MongoDB not connected
    if (!isDbConnected()) {
      return sendSuccess(res, [], 'Products service running in offline mode. Connect MongoDB for live data.', 200, {
        page: 1, limit: 20, total: 0, totalPages: 0,
      });
    }

    const {
      q,
      category,
      subcategory,
      farmer,
      market,
      minPrice,
      maxPrice,
      availability,
      organic,
      farmingPractice,
      tags,
      sort = 'newest',
      page = '1',
      limit = '20',
    } = req.query as Record<string, string>;

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(50, parseInt(limit) || 20);
    const skip = (pageNum - 1) * limitNum;

    const filter: any = { isActive: true };

    if (q) {
      filter.$text = { $search: q };
    }
    if (category) filter.category = { $regex: category, $options: 'i' };
    if (subcategory) filter.subcategory = { $regex: subcategory, $options: 'i' };
    if (farmer) filter.farmerId = farmer;
    if (market) filter.marketId = market;
    if (minPrice || maxPrice) {
      filter.basePrice = {};
      if (minPrice) filter.basePrice.$gte = parseFloat(minPrice);
      if (maxPrice) filter.basePrice.$lte = parseFloat(maxPrice);
    }
    if (organic === 'true') filter.isOrganic = true;
    if (organic === 'false') filter.isOrganic = false;
    if (farmingPractice) filter.farmingPractice = { $regex: farmingPractice, $options: 'i' };
    if (tags) filter.tags = { $in: tags.split(',').map((t) => t.trim()) };

    // Availability filter requires joining Inventory
    let productIds: string[] | null = null;
    if (availability) {
      const inventoryItems = await Inventory.find({ availabilityStatus: availability }).select('productId').lean();
      productIds = inventoryItems.map((i) => i.productId.toString());
      filter._id = { $in: productIds };
    }

    // Sort options
    let sortQuery: any = { createdAt: -1 };
    if (sort === 'price_asc') sortQuery = { basePrice: 1 };
    else if (sort === 'price_desc') sortQuery = { basePrice: -1 };
    else if (sort === 'rating') sortQuery = { averageRating: -1 };
    else if (sort === 'popularity') sortQuery = { reviewCount: -1 };
    else if (sort === 'relevance' && q) sortQuery = { score: { $meta: 'textScore' } };
    else if (sort === 'newest') sortQuery = { createdAt: -1 };

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate('farmerId', 'name avatar')
        .sort(sortQuery)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Product.countDocuments(filter),
    ]);

    // Enrich with farmer profile and latest inventory
    const enriched = await Promise.all(
      products.map(async (product) => {
        const [farmerProfile, latestInventory] = await Promise.all([
          FarmerProfile.findOne({ userId: product.farmerId }).select('farmName businessName averageRating verificationStatus').lean(),
          Inventory.findOne({ productId: product._id, isPreOrderEnabled: true })
            .sort({ inventoryDate: -1 })
            .select('availableQuantity reservedQuantity price currency availabilityStatus isPreOrderEnabled')
            .lean(),
        ]);
        return { ...product, farmerProfile, inventory: latestInventory };
      })
    );

    return sendSuccess(res, enriched, 'Products retrieved', 200, {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/products/:slug — Public
export const getProductBySlug = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug, isActive: true })
      .populate('farmerId', 'name email avatar')
      .lean();

    if (!product) throw new NotFoundError('Product not found');

    const [farmerProfile, inventory] = await Promise.all([
      FarmerProfile.findOne({ userId: product.farmerId })
        .populate('marketIds', 'name city address openingTime closingTime marketDays')
        .lean(),
      Inventory.find({ productId: product._id })
        .populate('marketId', 'name city address')
        .sort({ inventoryDate: -1 })
        .lean(),
    ]);

    return sendSuccess(res, { ...product, farmerProfile, inventory }, 'Product retrieved');
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/products — Farmer only
export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;

    // Verify farmer profile exists
    const farmerProfile = await FarmerProfile.findOne({ userId });
    if (!farmerProfile) throw new NotFoundError('Farmer profile not found. Complete your profile first.');

    const { name, ...rest } = req.body;
    const slug = generateSlug(name, userId);

    const product = await Product.create({
      farmerId: userId,
      name,
      slug,
      ...rest,
    });

    await AuditService.record({
      userId,
      action: 'PRODUCT_CREATED',
      category: 'MARKETPLACE',
      details: { productId: product._id, name, slug },
      ipAddress: req.ip,
    });

    return sendSuccess(res, product, 'Product created successfully', 201);
  } catch (error) {
    next(error);
  }
};

// PATCH /api/v1/products/:id — Farmer (own) or Admin
export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const role = (req as any).user.role;

    const product = await Product.findById(req.params.id);
    if (!product) throw new NotFoundError('Product not found');

    // Ownership check - never trust farmerId from frontend
    if (role === 'FARMER' && product.farmerId.toString() !== userId) {
      throw new ForbiddenError('You do not own this product');
    }

    // Do not allow farmer to change farmerId
    const { farmerId: _farmerId, slug: _slug, ...safeUpdates } = req.body;

    Object.assign(product, safeUpdates);
    await product.save();

    await AuditService.record({
      userId,
      action: 'PRODUCT_UPDATED',
      category: 'MARKETPLACE',
      details: { productId: product._id },
      ipAddress: req.ip,
    });

    return sendSuccess(res, product, 'Product updated successfully');
  } catch (error) {
    next(error);
  }
};

// DELETE /api/v1/products/:id — Farmer (own) or Admin
export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const role = (req as any).user.role;

    const product = await Product.findById(req.params.id);
    if (!product) throw new NotFoundError('Product not found');

    if (role === 'FARMER' && product.farmerId.toString() !== userId) {
      throw new ForbiddenError('You do not own this product');
    }

    // Soft delete
    product.isActive = false;
    await product.save();

    await AuditService.record({
      userId,
      action: 'PRODUCT_DELETED',
      category: 'MARKETPLACE',
      details: { productId: product._id, name: product.name },
      ipAddress: req.ip,
    });

    return sendSuccess(res, null, 'Product deactivated successfully');
  } catch (error) {
    next(error);
  }
};
