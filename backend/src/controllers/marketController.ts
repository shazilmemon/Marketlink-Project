import { Request, Response, NextFunction } from 'express';
import { Market } from '../models/Market';
import { MarketStall } from '../models/MarketStall';
import { FarmerProfile } from '../models/FarmerProfile';
import { sendSuccess } from '../utils/response';
import { NotFoundError, ForbiddenError } from '../utils/errors';
import { AuditService } from '../services/auditService';

// Helper: generate slug from name
const generateSlug = (name: string): string =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();

// GET /api/v1/markets — Public
export const listMarkets = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, parseInt(req.query.limit as string) || 20);
    const skip = (page - 1) * limit;
    const q = req.query.q as string;
    const city = req.query.city as string;

    const filter: any = { isActive: true };
    if (q) filter.$text = { $search: q };
    if (city) filter.city = { $regex: city, $options: 'i' };

    const [markets, total] = await Promise.all([
      Market.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Market.countDocuments(filter),
    ]);

    return sendSuccess(res, markets, 'Markets retrieved', 200, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/markets/:id — Public
export const getMarketById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const market = await Market.findById(req.params.id).lean();
    if (!market) throw new NotFoundError('Market not found');

    // Also get stall count
    const stallCount = await MarketStall.countDocuments({ marketId: req.params.id, isActive: true });

    return sendSuccess(res, { ...market, stallCount }, 'Market retrieved');
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/markets — Admin only
export const createMarket = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const { name, latitude, longitude, ...rest } = req.body;

    let slug = generateSlug(name);
    // Ensure unique slug
    const existing = await Market.findOne({ slug });
    if (existing) slug = `${slug}-${Date.now()}`;

    const market = await Market.create({
      name,
      slug,
      latitude,
      longitude,
      location: { type: 'Point', coordinates: [longitude, latitude] },
      createdBy: userId,
      ...rest,
    });

    await AuditService.record({
      userId,
      action: 'MARKET_CREATED',
      category: 'MARKETPLACE',
      details: { marketId: market._id, name },
      ipAddress: req.ip,
    });

    return sendSuccess(res, market, 'Market created successfully', 201);
  } catch (error) {
    next(error);
  }
};

// PATCH /api/v1/markets/:id — Admin only
export const updateMarket = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const market = await Market.findById(req.params.id);
    if (!market) throw new NotFoundError('Market not found');

    const { latitude, longitude, name, ...rest } = req.body;

    if (name) {
      market.name = name;
      let slug = generateSlug(name);
      const existing = await Market.findOne({ slug, _id: { $ne: market._id } });
      if (existing) slug = `${slug}-${Date.now()}`;
      market.slug = slug;
    }

    if (latitude !== undefined && longitude !== undefined) {
      market.latitude = latitude;
      market.longitude = longitude;
      market.location = { type: 'Point', coordinates: [longitude, latitude] };
    }

    Object.assign(market, rest);
    await market.save();

    await AuditService.record({
      userId,
      action: 'MARKET_UPDATED',
      category: 'MARKETPLACE',
      details: { marketId: market._id },
      ipAddress: req.ip,
    });

    return sendSuccess(res, market, 'Market updated successfully');
  } catch (error) {
    next(error);
  }
};

// DELETE /api/v1/markets/:id — Admin only
export const deleteMarket = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const market = await Market.findById(req.params.id);
    if (!market) throw new NotFoundError('Market not found');

    // Soft delete
    market.isActive = false;
    await market.save();

    await AuditService.record({
      userId,
      action: 'MARKET_DELETED',
      category: 'MARKETPLACE',
      details: { marketId: market._id, name: market.name },
      ipAddress: req.ip,
    });

    return sendSuccess(res, null, 'Market deactivated successfully');
  } catch (error) {
    next(error);
  }
};

// ─── Market Stalls ─────────────────────────────────────────────────

// GET /api/v1/markets/:marketId/stalls — Public
export const listMarketStalls = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stalls = await MarketStall.find({
      marketId: req.params.marketId,
      isActive: true,
    })
      .populate('farmerId', 'name avatar')
      .lean();

    // Enrich with farmer profile
    const enriched = await Promise.all(
      stalls.map(async (stall) => {
        const profile = await FarmerProfile.findOne({ userId: stall.farmerId }).select(
          'farmName businessName averageRating reviewCount specialties profileImage'
        ).lean();
        return { ...stall, farmerProfile: profile };
      })
    );

    return sendSuccess(res, enriched, 'Stalls retrieved');
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/markets/:marketId/stalls — Farmer
export const createStall = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const role = (req as any).user.role;
    const { marketId } = req.params;

    // Verify market exists
    const market = await Market.findById(marketId);
    if (!market || !market.isActive) throw new NotFoundError('Market not found');

    // Farmer must have a profile
    if (role === 'FARMER') {
      const profile = await FarmerProfile.findOne({ userId });
      if (!profile) throw new NotFoundError('Farmer profile not found. Complete your profile first.');
    }

    const stall = await MarketStall.create({
      marketId,
      farmerId: userId,
      ...req.body,
    });

    // Add marketId to FarmerProfile.marketIds
    await FarmerProfile.findOneAndUpdate(
      { userId },
      { $addToSet: { marketIds: marketId } }
    );

    await AuditService.record({
      userId,
      action: 'STALL_CREATED',
      category: 'MARKETPLACE',
      details: { stallId: stall._id, marketId },
      ipAddress: req.ip,
    });

    return sendSuccess(res, stall, 'Stall created successfully', 201);
  } catch (error) {
    next(error);
  }
};

// PATCH /api/v1/stalls/:id — Farmer (own) or Admin
export const updateStall = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const role = (req as any).user.role;

    const stall = await MarketStall.findById(req.params.id);
    if (!stall) throw new NotFoundError('Stall not found');

    // Ownership check
    if (role === 'FARMER' && stall.farmerId.toString() !== userId) {
      throw new ForbiddenError('You do not own this stall');
    }

    Object.assign(stall, req.body);
    await stall.save();

    await AuditService.record({
      userId,
      action: 'STALL_UPDATED',
      category: 'MARKETPLACE',
      details: { stallId: stall._id },
      ipAddress: req.ip,
    });

    return sendSuccess(res, stall, 'Stall updated');
  } catch (error) {
    next(error);
  }
};

// DELETE /api/v1/stalls/:id — Farmer (own) or Admin
export const deleteStall = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const role = (req as any).user.role;

    const stall = await MarketStall.findById(req.params.id);
    if (!stall) throw new NotFoundError('Stall not found');

    if (role === 'FARMER' && stall.farmerId.toString() !== userId) {
      throw new ForbiddenError('You do not own this stall');
    }

    stall.isActive = false;
    await stall.save();

    return sendSuccess(res, null, 'Stall removed');
  } catch (error) {
    next(error);
  }
};
