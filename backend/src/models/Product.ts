import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  farmerId: mongoose.Types.ObjectId;
  marketId?: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  category: string;
  subcategory?: string;
  images: string[];
  image: string;
  unit: string;
  basePrice: number;
  price: number;
  currency: string;
  stockQuantity: number;
  isSoldOut: boolean;
  tags: string[];
  origin?: string;
  farmingPractice?: string;
  isOrganic: boolean;
  isActive: boolean;
  isSurplus: boolean;
  averageRating: number;
  reviewCount: number;
  harvestDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    farmerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    marketId: {
      type: Schema.Types.ObjectId,
      ref: 'Market',
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    description: { type: String, default: '' },
    category: {
      type: String,
      required: true,
      index: true,
    },
    subcategory: { type: String, default: '' },
    images: [{ type: String }],
    unit: {
      type: String,
      default: 'kg',
    },
    basePrice: {
      type: Number,
      required: [true, 'Base price is required'],
      min: [0, 'Price cannot be negative'],
    },
    currency: {
      type: String,
      default: 'USD',
    },
    stockQuantity: {
      type: Number,
      default: 50,
      min: 0,
    },
    isSoldOut: {
      type: Boolean,
      default: false,
    },
    tags: [{ type: String }],
    origin: { type: String, default: '' },
    farmingPractice: { type: String, default: 'Organic' },
    isOrganic: { type: Boolean, default: true, index: true },
    isActive: { type: Boolean, default: true, index: true },
    isSurplus: { type: Boolean, default: false, index: true },
    averageRating: { type: Number, default: 4.8, min: 0, max: 5 },
    reviewCount: { type: Number, default: 8, min: 0 },
    harvestDate: { type: Date },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

ProductSchema.virtual('price').get(function (this: any) {
  return this.basePrice;
});

ProductSchema.virtual('image').get(function (this: any) {
  return this.images && this.images.length > 0 ? this.images[0] : '';
});

ProductSchema.index({ farmerId: 1, category: 1, isActive: 1 });
ProductSchema.index({ basePrice: 1 });
ProductSchema.index({ name: 'text', description: 'text', tags: 'text' });

export const Product = mongoose.model<IProduct>('Product', ProductSchema);
