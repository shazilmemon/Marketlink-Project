import mongoose, { Schema, Document } from 'mongoose';

export interface IMarketStall extends Document {
  marketId: mongoose.Types.ObjectId;
  farmerId: mongoose.Types.ObjectId;
  stallName: string;
  stallNumber: string;
  locationDescription?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MarketStallSchema = new Schema<IMarketStall>(
  {
    marketId: {
      type: Schema.Types.ObjectId,
      ref: 'Market',
      required: true,
      index: true,
    },
    farmerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    stallName: { type: String, required: true, trim: true },
    stallNumber: { type: String, required: true, trim: true },
    locationDescription: { type: String, default: '' },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

MarketStallSchema.index({ marketId: 1, farmerId: 1 }, { unique: true });

export const MarketStall = mongoose.model<IMarketStall>('MarketStall', MarketStallSchema);
