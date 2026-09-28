import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { FarmerProfile } from '../models/FarmerProfile';
import { User } from '../models/User';
import { Product } from '../models/Product';
import { Order } from '../models/Order';
import { Inventory } from '../models/Inventory';
import { sendSuccess } from '../utils/response';
import { NotFoundError, ForbiddenError } from '../utils/errors';
import { AuditService } from '../services/auditService';

const isDbConnected = () => mongoose.connection.readyState === 1;

// GET /api/v1/farmers — Public: list all verified/active farmers
export const listFarmers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!isDbConnected()) {
      return sendSuccess(res, [], 'Farmers service running in offline mode. Connect MongoDB for live data.', 200, {
        page: 1, limit: 20, total: 0, totalPages: 0,
      });
    }

    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, parseInt(req.query.limit as string) || 20);
    const skip = (page - 1) * limit;
    const q = req.query.q as string;
    const city = req.query.city as string;

    const filter: any = { isActive: true };
    if (q) {
      filter.$text = { $search: q };
    }
    if (city) {
      filter['farmLocation.city'] = { $regex: city, $options: 'i' };
    }

    const [farmers, total] = await Promise.all([
      FarmerProfile.find(filter)
        .populate('userId', 'name email avatar')
        .sort({ averageRating: -1, reviewCount: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      FarmerProfile.countDocuments(filter),
    ]);

    return sendSuccess(res, farmers, 'Farmers retrieved successfully', 200, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/farmers/:id — Public: get farmer by id
export const getFarmerById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const farmer = await FarmerProfile.findById(req.params.id)
      .populate('userId', 'name email avatar')
      .populate('marketIds', 'name city address openingTime closingTime marketDays')
      .lean();

    if (!farmer) throw new NotFoundError('Farmer profile not found');

    return sendSuccess(res, farmer, 'Farmer retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/farmers/me — Farmer: get own profile
export const getMyFarmerProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!isDbConnected()) {
      return sendSuccess(res, null, 'Farmer profile service is in offline mode. Connect MongoDB to view your profile.');
    }
    const userId = (req as any).user.id;
    const farmer = await FarmerProfile.findOne({ userId })
      .populate('userId', 'name email avatar')
      .populate('marketIds', 'name city address openingTime closingTime marketDays')
      .lean();

    if (!farmer) throw new NotFoundError('Farmer profile not found. Please complete your application.');

    return sendSuccess(res, farmer, 'Farmer profile retrieved');
  } catch (error) {
    next(error);
  }
};

// PATCH /api/v1/farmers/profile — Farmer: update own profile
export const updateFarmerProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const farmer = await FarmerProfile.findOne({ userId });
    if (!farmer) throw new NotFoundError('Farmer profile not found');

    // Allowed fields (never trust role or verificationStatus from frontend)
    const {
      businessName,
      displayName,
      bio,
      phone,
      email,
      profileImage,
      coverImage,
      farmName,
      farmLocation,
      farmingPractices,
      specialties,
      operatingDays,
      pickupSlots,
    } = req.body;

    if (businessName !== undefined) farmer.businessName = businessName;
    if (displayName !== undefined) farmer.displayName = displayName;
    if (bio !== undefined) farmer.bio = bio;
    if (phone !== undefined) farmer.phone = phone;
    if (email !== undefined) farmer.email = email;
    if (profileImage !== undefined) farmer.profileImage = profileImage;
    if (coverImage !== undefined) farmer.coverImage = coverImage;
    if (farmName !== undefined) farmer.farmName = farmName;
    if (farmLocation !== undefined) farmer.farmLocation = farmLocation;
    if (farmingPractices !== undefined) farmer.farmingPractices = farmingPractices;
    if (specialties !== undefined) farmer.specialties = specialties;
    if (operatingDays !== undefined) farmer.operatingDays = operatingDays;
    if (pickupSlots !== undefined) farmer.pickupSlots = pickupSlots;

    await farmer.save();

    await AuditService.record({
      userId,
      action: 'FARMER_PROFILE_UPDATED',
      category: 'MARKETPLACE',
      details: { farmerId: farmer._id },
      ipAddress: req.ip,
    });

    return sendSuccess(res, farmer, 'Farmer profile updated successfully');
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/farmers/me/inventory — Farmer: own inventory
export const getMyInventory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!isDbConnected()) {
      return sendSuccess(res, [], 'Inventory service offline. Connect MongoDB.', 200, {
        page: 1, limit: 20, total: 0, totalPages: 0,
      });
    }
    const userId = (req as any).user.id;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, parseInt(req.query.limit as string) || 20);
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Inventory.find({ farmerId: userId })
        .populate('productId', 'name slug category unit images isActive')
        .populate('marketId', 'name city')
        .sort({ inventoryDate: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Inventory.countDocuments({ farmerId: userId }),
    ]);

    return sendSuccess(res, items, 'Inventory retrieved', 200, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/farmers/me/orders — Farmer: incoming orders
export const getMyFarmerOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!isDbConnected()) {
      return sendSuccess(res, [], 'Orders service offline. Connect MongoDB.', 200, {
        page: 1, limit: 20, total: 0, totalPages: 0,
      });
    }
    const userId = (req as any).user.id;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, parseInt(req.query.limit as string) || 20);
    const skip = (page - 1) * limit;
    const status = req.query.status as string;

    const filter: any = { farmerId: userId };
    if (status) filter.status = status;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('customerId', 'name email avatar')
        .populate('marketId', 'name city')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(filter),
    ]);

    return sendSuccess(res, orders, 'Orders retrieved', 200, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
};
