import mongoose, { Schema, Document } from 'mongoose';

export type AvailabilityStatus = 'AVAILABLE' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'CLOSED';

export interface IInventory extends Document {
  productId: mongoose.Types.ObjectId;
  marketId?: mongoose.Types.ObjectId;
  farmerId: mongoose.Types.ObjectId;
  availableQuantity: number;
  reservedQuantity: number;
  soldQuantity: number;
  minimumOrderQuantity: number;
  maximumOrderQuantity: number;
  price: number;
  currency: string;
  inventoryDate: Date;
  availabilityStatus: AvailabilityStatus;
  isPreOrderEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const InventorySchema = new Schema<IInventory>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    marketId: {
      type: Schema.Types.ObjectId,
      ref: 'Market',
      index: true,
    },
    farmerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    availableQuantity: {
      type: Number,
      default: 0,
      min: [0, 'Available quantity cannot be negative'],
    },
    reservedQuantity: {
      type: Number,
      default: 0,
      min: [0, 'Reserved quantity cannot be negative'],
    },
    soldQuantity: {
      type: Number,
      default: 0,
      min: [0, 'Sold quantity cannot be negative'],
    },
    minimumOrderQuantity: {
      type: Number,
      default: 1,
      min: 1,
    },
    maximumOrderQuantity: {
      type: Number,
      default: 100,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    inventoryDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
    availabilityStatus: {
      type: String,
      enum: ['AVAILABLE', 'LOW_STOCK', 'OUT_OF_STOCK', 'CLOSED'],
      default: 'AVAILABLE',
      index: true,
    },
    isPreOrderEnabled: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

InventorySchema.index({ productId: 1, marketId: 1, farmerId: 1 });

export const Inventory = mongoose.model<IInventory>('Inventory', InventorySchema);
