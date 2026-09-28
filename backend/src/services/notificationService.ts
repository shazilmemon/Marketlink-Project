import { Notification, NotificationType } from '../models/Notification';
import { logger } from '../utils/logger';

export interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
}

export class NotificationService {
  public static async create(input: CreateNotificationInput): Promise<void> {
    try {
      await Notification.create({
        userId: input.userId,
        type: input.type,
        title: input.title,
        message: input.message,
        data: input.data || {},
      });
      logger.info(`🔔 Notification created: [${input.type}] for user: ${input.userId}`);
    } catch (error) {
      logger.error('Failed to create notification:', error);
    }
  }

  public static async notifyOrderCreated(farmerId: string, orderNumber: string, customerName: string): Promise<void> {
    await this.create({
      userId: farmerId,
      type: 'ORDER_CREATED',
      title: 'New Pre-Order Received',
      message: `${customerName} placed pre-order #${orderNumber}. Please review and confirm.`,
      data: { orderNumber },
    });
  }

  public static async notifyOrderConfirmed(customerId: string, orderNumber: string): Promise<void> {
    await this.create({
      userId: customerId,
      type: 'ORDER_CONFIRMED',
      title: 'Order Confirmed!',
      message: `Your order #${orderNumber} has been confirmed by the farmer. See you at pickup!`,
      data: { orderNumber },
    });
  }

  public static async notifyOrderRejected(customerId: string, orderNumber: string, reason?: string): Promise<void> {
    await this.create({
      userId: customerId,
      type: 'ORDER_REJECTED',
      title: 'Order Could Not Be Fulfilled',
      message: `Your order #${orderNumber} was rejected${reason ? `: ${reason}` : '.'}`,
      data: { orderNumber, reason },
    });
  }

  public static async notifyOrderReady(customerId: string, orderNumber: string): Promise<void> {
    await this.create({
      userId: customerId,
      type: 'ORDER_READY',
      title: 'Order Ready for Pickup!',
      message: `Your order #${orderNumber} is packed and ready. Please collect it at the stall.`,
      data: { orderNumber },
    });
  }

  public static async notifyOrderCancelled(farmerId: string, orderNumber: string): Promise<void> {
    await this.create({
      userId: farmerId,
      type: 'ORDER_CANCELLED',
      title: 'Order Cancelled',
      message: `Order #${orderNumber} has been cancelled by the customer.`,
      data: { orderNumber },
    });
  }

  public static async notifyLowStock(farmerId: string, productName: string, remaining: number): Promise<void> {
    await this.create({
      userId: farmerId,
      type: 'LOW_STOCK',
      title: 'Low Stock Alert',
      message: `${productName} is running low. Only ${remaining} units remaining.`,
      data: { productName, remaining },
    });
  }

  public static async notifyReviewReceived(farmerId: string, productName: string, rating: number): Promise<void> {
    await this.create({
      userId: farmerId,
      type: 'REVIEW_RECEIVED',
      title: 'New Review Received',
      message: `A customer left a ${rating}★ review for ${productName}.`,
      data: { productName, rating },
    });
  }
}
