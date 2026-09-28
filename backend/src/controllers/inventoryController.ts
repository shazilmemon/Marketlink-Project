import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Inventory } from '../models/Inventory';
import { Product } from '../models/Product';
import { sendSuccess } from '../utils/response';
import { NotFoundError, ForbiddenError, AppError } from '../utils/errors';
import { AuditService } from '../services/auditService';
import { NotificationService } from '../services/notificationService';

const LOW_STOCK_THRESHOLD = 5;

// GET /api/v1/inventory — Farmer sees own inventory, Admin sees all
export const listInventory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const role = (req as any).user.role;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, parseInt(req.query.limit as string) || 20);
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (role === 'FARMER') filter.farmerId = userId;
    if (req.query.productId) filter.productId = req.query.productId;
    if (req.query.marketId) filter.marketId = req.query.marketId;

    const [items, total] = await Promise.all([
      Inventory.find(filter)
        .populate('productId', 'name slug category unit images isActive')
        .populate('marketId', 'name city')
        .sort({ inventoryDate: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Inventory.countDocuments(filter),
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

// GET /api/v1/inventory/:id
export const getInventoryById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const role = (req as any).user.role;

    const item = await Inventory.findById(req.params.id)
      .populate('productId', 'name slug category unit images')
      .populate('marketId', 'name city address')
      .lean();

    if (!item) throw new NotFoundError('Inventory item not found');

    // Farmers can only see their own
    if (role === 'FARMER' && item.farmerId.toString() !== userId) {
      throw new ForbiddenError('Access denied');
    }

    return sendSuccess(res, item, 'Inventory item retrieved');
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/inventory — Farmer only
export const createInventory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const { productId, marketId, availableQuantity, price, ...rest } = req.body;

    // Verify product ownership
    const product = await Product.findById(productId);
    if (!product) throw new NotFoundError('Product not found');
    if (product.farmerId.toString() !== userId) {
      throw new ForbiddenError('You do not own this product');
    }
    if (!product.isActive) {
      throw new AppError('Cannot create inventory for an inactive product', 400, 'PRODUCT_INACTIVE');
    }

    const item = await Inventory.create({
      productId,
      marketId: marketId || null,
      farmerId: userId,
      availableQuantity,
      price,
      ...rest,
    });

    await AuditService.record({
      userId,
      action: 'INVENTORY_UPDATED',
      category: 'MARKETPLACE',
      details: { inventoryId: item._id, productId, availableQuantity, price },
      ipAddress: req.ip,
    });

    return sendSuccess(res, item, 'Inventory created successfully', 201);
  } catch (error) {
    next(error);
  }
};

// PATCH /api/v1/inventory/:id — Farmer (own) or Admin
export const updateInventory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const role = (req as any).user.role;

    const item = await Inventory.findById(req.params.id);
    if (!item) throw new NotFoundError('Inventory item not found');

    if (role === 'FARMER' && item.farmerId.toString() !== userId) {
      throw new ForbiddenError('You do not own this inventory item');
    }

    // Never allow negative quantity from update
    if (req.body.availableQuantity !== undefined && req.body.availableQuantity < 0) {
      throw new AppError('Available quantity cannot be negative', 400, 'INVALID_QUANTITY');
    }

    const { farmerId: _f, productId: _p, reservedQuantity: _r, soldQuantity: _s, ...safeUpdates } = req.body;
    Object.assign(item, safeUpdates);

    // Auto-update availability status based on quantity
    if (safeUpdates.availableQuantity !== undefined) {
      const qty = safeUpdates.availableQuantity;
      if (qty <= 0) item.availabilityStatus = 'OUT_OF_STOCK';
      else if (qty <= LOW_STOCK_THRESHOLD) {
        item.availabilityStatus = 'LOW_STOCK';
        // Notify farmer of low stock
        const product = await Product.findById(item.productId).lean();
        if (product) {
          await NotificationService.notifyLowStock(userId, product.name, qty);
        }
      } else item.availabilityStatus = 'AVAILABLE';
    }

    await item.save();

    await AuditService.record({
      userId,
      action: 'INVENTORY_UPDATED',
      category: 'MARKETPLACE',
      details: { inventoryId: item._id, updates: safeUpdates },
      ipAddress: req.ip,
    });

    return sendSuccess(res, item, 'Inventory updated');
  } catch (error) {
    next(error);
  }
};

// DELETE /api/v1/inventory/:id — Farmer (own) or Admin
export const deleteInventory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const role = (req as any).user.role;

    const item = await Inventory.findById(req.params.id);
    if (!item) throw new NotFoundError('Inventory item not found');

    if (role === 'FARMER' && item.farmerId.toString() !== userId) {
      throw new ForbiddenError('You do not own this inventory item');
    }

    // Only delete if no reserved stock
    if (item.reservedQuantity > 0) {
      throw new AppError('Cannot delete inventory with reserved stock', 400, 'HAS_RESERVED_STOCK');
    }

    await item.deleteOne();
    return sendSuccess(res, null, 'Inventory item deleted');
  } catch (error) {
    next(error);
  }
};
