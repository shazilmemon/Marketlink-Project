import mongoose, { Schema, Document } from 'mongoose';

export type ReviewStatus = 'PUBLISHED' | 'PENDING' | 'HIDDEN' | 'REMOVED';

export interface IReview extends Document {
  userId: mongoose.Types.ObjectId;
  customerId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  farmerId: mongoose.Types.ObjectId;
  orderId?: mongoose.Types.ObjectId;
  rating: number; // 1 to 5
  title?: string;
  comment: string;
  farmerReply?: string;
  status: ReviewStatus;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    farmerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      index: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    title: { type: String, default: '' },
    comment: { type: String, required: true, trim: true },
    farmerReply: { type: String, default: '' },
    status: {
      type: String,
      enum: ['PUBLISHED', 'PENDING', 'HIDDEN', 'REMOVED'],
      default: 'PUBLISHED',
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

ReviewSchema.virtual('customerId').get(function (this: any) {
  return this.userId;
});

ReviewSchema.index({ productId: 1, status: 1 });

export const Review = mongoose.model<IReview>('Review', ReviewSchema);
