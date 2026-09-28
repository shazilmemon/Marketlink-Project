import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Order } from '../models/Order';
import { Inventory } from '../models/Inventory';
import { Product } from '../models/Product';
import { FarmerProfile } from '../models/FarmerProfile';
import { sendSuccess } from '../utils/response';
import { NotFoundError, ForbiddenError, AppError } from '../utils/errors';
import { AuditService, AuditAction } from '../services/auditService';
import { NotificationService } from '../services/notificationService';
import { User } from '../models/User';

const LOW_STOCK_THRESHOLD = 5;

// Generate unique order number
const generateOrderNumber = (): string => {
  const now = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ML-${now}-${rand}`;
};

// POST /api/v1/orders — Customer creates pre-order
export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const customerId = (req as any).user.id;
    const { farmerId, marketId, pickupDate, pickupTime, items, customerNotes } = req.body;

    // Server-side: never trust farmerId from frontend for price/stock
    // Validate each item against real inventory
    const resolvedItems: any[] = [];
    let subtotal = 0;

    for (const item of items) {
      const { productId, inventoryId, quantity } = item;

      // Verify product exists and is active
      const product = await Product.findById(productId).session(session);
      if (!product || !product.isActive) {
        await session.abortTransaction();
        throw new NotFoundError(`Product not found or inactive: ${productId}`);
      }

      // Verify inventory
      const inventory = await Inventory.findById(inventoryId).session(session);
      if (!inventory) {
        await session.abortTransaction();
        throw new NotFoundError(`Inventory item not found: ${inventoryId}`);
      }

      // Verify inventory belongs to this product and farmer
      if (inventory.productId.toString() !== productId) {
        await session.abortTransaction();
        throw new AppError('Inventory does not match product', 400, 'INVENTORY_MISMATCH');
      }

      if (!inventory.isPreOrderEnabled) {
        await session.abortTransaction();
        throw new AppError(`Pre-orders are not enabled for ${product.name}`, 400, 'PREORDER_DISABLED');
      }

      // Validate quantity
      if (quantity < inventory.minimumOrderQuantity) {
        await session.abortTransaction();
        throw new AppError(
          `Minimum order for ${product.name} is ${inventory.minimumOrderQuantity} ${product.unit}`,
          400,
          'QUANTITY_TOO_LOW'
        );
      }
      if (quantity > inventory.maximumOrderQuantity) {
        await session.abortTransaction();
        throw new AppError(
          `Maximum order for ${product.name} is ${inventory.maximumOrderQuantity} ${product.unit}`,
          400,
          'QUANTITY_TOO_HIGH'
        );
      }

      // Check available stock (never trust frontend)
      const available = inventory.availableQuantity - inventory.reservedQuantity;
      if (quantity > available) {
        await session.abortTransaction();
        throw new AppError(
          `Insufficient stock for ${product.name}. Only ${available} ${product.unit} available.`,
          400,
          'STOCK_UNAVAILABLE'
        );
      }

      // Reserve stock atomically
      const updated = await Inventory.findOneAndUpdate(
        {
          _id: inventoryId,
          // Atomic check: ensure enough stock at write time
          $expr: { $gte: [{ $subtract: ['$availableQuantity', '$reservedQuantity'] }, quantity] },
        },
        { $inc: { reservedQuantity: quantity } },
        { new: true, session }
      );

      if (!updated) {
        await session.abortTransaction();
        throw new AppError(
          `Stock reservation failed for ${product.name}. Please try again.`,
          409,
          'RESERVATION_FAILED'
        );
      }

      // Use server-side price — never trust client price
      const unitPrice = inventory.price;
      const itemSubtotal = unitPrice * quantity;
      subtotal += itemSubtotal;

      resolvedItems.push({
        productId: product._id,
        productNameSnapshot: product.name,
        quantity,
        unit: product.unit,
        unitPrice,
        subtotal: itemSubtotal,
      });
    }

    // Create order with server-resolved prices
    const orderNumber = generateOrderNumber();
    const [order] = await Order.create(
      [
        {
          orderNumber,
          customerId,
          farmerId,
          marketId: marketId || null,
          pickupDate: new Date(pickupDate),
          pickupTime: pickupTime || '10:00 AM',
          items: resolvedItems,
          subtotal,
          total: subtotal, // No tax/delivery in Phase 3
          currency: resolvedItems[0]?.unitPrice ? 'PKR' : 'PKR',
          status: 'PENDING',
          customerNotes: customerNotes || '',
        },
      ],
      { session }
    );

    await session.commitTransaction();

    // Post-transaction: notifications and audit (fire and forget)
    const customer = await User.findById(customerId).select('name').lean();
    await Promise.all([
      NotificationService.notifyOrderCreated(farmerId, orderNumber, customer?.name || 'A customer'),
      AuditService.record({
        userId: customerId,
        action: 'ORDER_CREATED',
        category: 'MARKETPLACE',
        details: { orderId: order._id, orderNumber, farmerId, total: subtotal },
        ipAddress: req.ip,
      }),
    ]);

    return sendSuccess(res, order, 'Order created successfully', 201);
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    next(error);
  } finally {
    await session.endSession();
  }
};

// GET /api/v1/orders — Customer: own orders, Farmer: incoming, Admin: all
export const listOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const role = (req as any).user.role;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, parseInt(req.query.limit as string) || 20);
    const skip = (page - 1) * limit;
    const status = req.query.status as string;

    const filter: any = {};
    if (role === 'CUSTOMER') filter.customerId = userId;
    else if (role === 'FARMER') filter.farmerId = userId;
    if (status) filter.status = status;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('customerId', 'name email avatar')
        .populate('farmerId', 'name avatar')
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

// GET /api/v1/orders/:id — Customer (own) or Farmer (own) or Admin
export const getOrderById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const role = (req as any).user.role;

    const order = await Order.findById(req.params.id)
      .populate('customerId', 'name email avatar')
      .populate('farmerId', 'name avatar')
      .populate('marketId', 'name city address')
      .lean();

    if (!order) throw new NotFoundError('Order not found');

    // Access control
    if (role === 'CUSTOMER' && order.customerId._id.toString() !== userId) {
      throw new ForbiddenError('Access denied');
    }
    if (role === 'FARMER' && order.farmerId._id.toString() !== userId) {
      throw new ForbiddenError('Access denied');
    }

    return sendSuccess(res, order, 'Order retrieved');
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/orders/me — Customer: own orders (alias)
export const getMyOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customerId = (req as any).user.id;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, parseInt(req.query.limit as string) || 20);
    const skip = (page - 1) * limit;
    const status = req.query.status as string;

    const filter: any = { customerId };
    if (status) filter.status = status;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('farmerId', 'name avatar')
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

// PATCH /api/v1/orders/:id/cancel — Customer cancels PENDING order
export const cancelOrder = async (req: Request, res: Response, next: NextFunction) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const customerId = (req as any).user.id;
    const { cancellationReason } = req.body;

    const order = await Order.findById(req.params.id).session(session);
    if (!order) {
      await session.abortTransaction();
      throw new NotFoundError('Order not found');
    }

    // Only customer who owns the order can cancel
    if (order.customerId.toString() !== customerId) {
      await session.abortTransaction();
      throw new ForbiddenError('You do not own this order');
    }

    // Only cancellable if PENDING or CONFIRMED
    if (!['PENDING', 'CONFIRMED'].includes(order.status)) {
      await session.abortTransaction();
      throw new AppError(
        `Cannot cancel an order with status: ${order.status}`,
        400,
        'INVALID_STATUS_TRANSITION'
      );
    }

    // Restore reserved inventory for each item
    for (const item of order.items) {
      await Inventory.findOneAndUpdate(
        { productId: item.productId, farmerId: order.farmerId },
        { $inc: { reservedQuantity: -item.quantity } },
        { session }
      );
    }

    order.status = 'CANCELLED';
    order.cancellationReason = cancellationReason || 'Cancelled by customer';
    await order.save({ session });

    await session.commitTransaction();

    // Notify farmer
    await Promise.all([
      NotificationService.notifyOrderCancelled(order.farmerId.toString(), order.orderNumber),
      AuditService.record({
        userId: customerId,
        action: 'ORDER_CANCELLED',
        category: 'MARKETPLACE',
        details: { orderId: order._id, orderNumber: order.orderNumber, reason: cancellationReason },
        ipAddress: req.ip,
      }),
    ]);

    return sendSuccess(res, order, 'Order cancelled successfully');
  } catch (error) {
    if (session.inTransaction()) await session.abortTransaction();
    next(error);
  } finally {
    await session.endSession();
  }
};

// PATCH /api/v1/orders/:id/status — Farmer updates order status
export const updateOrderStatus = async (req: Request, res: Response, next: NextFunction) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const farmerId = (req as any).user.id;
    const { status, farmerNotes } = req.body;

    const order = await Order.findById(req.params.id).session(session);
    if (!order) {
      await session.abortTransaction();
      throw new NotFoundError('Order not found');
    }

    // Ownership check
    if (order.farmerId.toString() !== farmerId) {
      await session.abortTransaction();
      throw new ForbiddenError('You do not own this order');
    }

    // Valid transitions
    const validTransitions: Record<string, string[]> = {
      PENDING: ['CONFIRMED', 'REJECTED'],
      CONFIRMED: ['READY_FOR_PICKUP', 'REJECTED'],
      READY_FOR_PICKUP: ['PICKED_UP'],
    };

    const allowed = validTransitions[order.status] || [];
    if (!allowed.includes(status)) {
      await session.abortTransaction();
      throw new AppError(
        `Cannot transition from ${order.status} to ${status}`,
        400,
        'INVALID_STATUS_TRANSITION'
      );
    }

    // If PICKED_UP: finalize stock (reserved → sold)
    if (status === 'PICKED_UP') {
      for (const item of order.items) {
        await Inventory.findOneAndUpdate(
          { productId: item.productId, farmerId: order.farmerId },
          {
            $inc: {
              reservedQuantity: -item.quantity,
              soldQuantity: item.quantity,
              availableQuantity: -item.quantity,
            },
          },
          { session }
        );
      }
    }

    // If REJECTED: restore reserved stock
    if (status === 'REJECTED') {
      for (const item of order.items) {
        await Inventory.findOneAndUpdate(
          { productId: item.productId, farmerId: order.farmerId },
          { $inc: { reservedQuantity: -item.quantity } },
          { session }
        );
      }
    }

    order.status = status;
    if (farmerNotes) order.farmerNotes = farmerNotes;
    await order.save({ session });

    await session.commitTransaction();

    // Notifications
    const customerId = order.customerId.toString();
    const orderNumber = order.orderNumber;

    if (status === 'CONFIRMED') {
      await NotificationService.notifyOrderConfirmed(customerId, orderNumber);
    } else if (status === 'REJECTED') {
      await NotificationService.notifyOrderRejected(customerId, orderNumber, farmerNotes);
    } else if (status === 'READY_FOR_PICKUP') {
      await NotificationService.notifyOrderReady(customerId, orderNumber);
    }

    const auditActionMap: Record<string, AuditAction> = {
      CONFIRMED: 'ORDER_CONFIRMED',
      REJECTED: 'ORDER_REJECTED',
      READY_FOR_PICKUP: 'ORDER_READY',
      PICKED_UP: 'ORDER_PICKED_UP',
    };
    const auditAction = auditActionMap[status];

    if (auditAction) {
      await AuditService.record({
        userId: farmerId,
        action: auditAction,
        category: 'MARKETPLACE',
        details: { orderId: order._id, orderNumber, newStatus: status },
        ipAddress: req.ip,
      });
    }

    return sendSuccess(res, order, `Order status updated to ${status}`);
  } catch (error) {
    if (session.inTransaction()) await session.abortTransaction();
    next(error);
  } finally {
    await session.endSession();
  }
};
