import mongoose, { Schema, Document } from 'mongoose';

export type NotificationType =
  | 'ORDER_CREATED'
  | 'ORDER_CONFIRMED'
  | 'ORDER_REJECTED'
  | 'ORDER_READY'
  | 'ORDER_CANCELLED'
  | 'ORDER_PICKED_UP'
  | 'LOW_STOCK'
  | 'REVIEW_RECEIVED'
  | 'FARMER_STATUS_CHANGED';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  isRead: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        'ORDER_CREATED',
        'ORDER_CONFIRMED',
        'ORDER_REJECTED',
        'ORDER_READY',
        'ORDER_CANCELLED',
        'ORDER_PICKED_UP',
        'LOW_STOCK',
        'REVIEW_RECEIVED',
        'FARMER_STATUS_CHANGED',
      ],
      required: true,
      index: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    data: { type: Schema.Types.Mixed, default: {} },
    isRead: { type: Boolean, default: false, index: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

NotificationSchema.index({ userId: 1, isRead: 1 });
NotificationSchema.index({ createdAt: -1 });

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
