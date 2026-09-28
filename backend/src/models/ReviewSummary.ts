import { Schema, model, Document } from 'mongoose';

export interface IReviewSummary extends Document {
  productId: Schema.Types.ObjectId;
  summary: string;
  positiveThemes: string[];
  negativeThemes: string[];
  reviewCount: number;
  generatedAt: Date;
}

const reviewSummarySchema = new Schema<IReviewSummary>({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  summary: { type: String, required: true },
  positiveThemes: [{ type: String }],
  negativeThemes: [{ type: String }],
  reviewCount: { type: Number, required: true },
  generatedAt: { type: Date, default: Date.now }
});

export const ReviewSummary = model<IReviewSummary>('ReviewSummary', reviewSummarySchema);
