import { Request, Response, NextFunction } from 'express';
import { Notification } from '../models/Notification';
import { sendSuccess } from '../utils/response';
import { NotFoundError, ForbiddenError } from '../utils/errors';

// GET /api/v1/notifications — Authenticated user: own notifications
export const listNotifications = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, parseInt(req.query.limit as string) || 20);
    const skip = (page - 1) * limit;
    const unreadOnly = req.query.unread === 'true';

    const filter: any = { userId };
    if (unreadOnly) filter.isRead = false;

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Notification.countDocuments(filter),
      Notification.countDocuments({ userId, isRead: false }),
    ]);

    return sendSuccess(res, { notifications, unreadCount }, 'Notifications retrieved', 200, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/v1/notifications/:id/read — Mark single as read
export const markNotificationRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const notification = await Notification.findById(req.params.id);
    if (!notification) throw new NotFoundError('Notification not found');
    if (notification.userId.toString() !== userId) throw new ForbiddenError('Access denied');

    notification.isRead = true;
    await notification.save();

    return sendSuccess(res, notification, 'Notification marked as read');
  } catch (error) {
    next(error);
  }
};

// PATCH /api/v1/notifications/read-all — Mark all as read
export const markAllNotificationsRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    await Notification.updateMany({ userId, isRead: false }, { isRead: true });
    return sendSuccess(res, null, 'All notifications marked as read');
  } catch (error) {
    next(error);
  }
};
