import mongoose, { Schema, Document } from 'mongoose';

export interface IMarket extends Document {
  name: string;
  slug: string;
  description?: string;
  address: string;
  city: string;
  area?: string;
  latitude: number;
  longitude: number;
  location: {
    type: string;
    coordinates: number[]; // [lng, lat]
  };
  mapProvider: string;
  mapPlaceId?: string;
  openingTime: string;
  closingTime: string;
  timings: string;
  marketDays: string[]; // e.g. ['Saturday', 'Sunday']
  operatingDays: string[];
  contactInfo?: {
    phone?: string;
    email?: string;
    website?: string;
  };
  image?: string;
  isActive: boolean;
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const MarketSchema = new Schema<IMarket>(
  {
    name: {
      type: String,
      required: [true, 'Market name is required'],
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
    address: { type: String, required: true },
    city: { type: String, required: true, index: true },
    area: { type: String, default: '' },
    latitude: { type: Number, required: true, default: 37.8044 },
    longitude: { type: Number, required: true, default: -122.2712 },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        required: true,
        default: [-122.2712, 37.8044],
      },
    },
    mapProvider: { type: String, default: 'openstreetmap' },
    mapPlaceId: { type: String, default: '' },
    openingTime: { type: String, default: '08:00 AM' },
    closingTime: { type: String, default: '02:00 PM' },
    marketDays: [{ type: String, default: ['Saturday', 'Sunday'] }],
    contactInfo: {
      phone: { type: String, default: '' },
      email: { type: String, default: '' },
      website: { type: String, default: '' },
    },
    image: { type: String, default: '' },
    isActive: { type: Boolean, default: true, index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

MarketSchema.virtual('operatingDays').get(function (this: any) {
  return this.marketDays;
});

MarketSchema.virtual('timings').get(function (this: any) {
  return `${this.openingTime} - ${this.closingTime}`;
});

MarketSchema.index({ location: '2dsphere' });
MarketSchema.index({ name: 'text', city: 'text', address: 'text' });

export const Market = mongoose.model<IMarket>('Market', MarketSchema);
