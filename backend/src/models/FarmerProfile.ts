import mongoose, { Schema, Document } from 'mongoose';

export type VerificationStatus = 'NOT_REQUIRED' | 'PENDING' | 'VERIFIED' | 'REJECTED';

export interface IFarmerProfile extends Document {
  userId: mongoose.Types.ObjectId;
  businessName: string;
  displayName: string;
  farmName: string;
  bio?: string;
  phone?: string;
  email?: string;
  profileImage?: string;
  coverImage?: string;
  farmLocation?: {
    address?: string;
    city?: string;
    coordinates?: number[]; // [lng, lat]
  };
  latitude: number;
  longitude: number;
  marketsServed: string[];
  operatingDays: string[];
  pickupSlots: string[];
  farmingPractices: string[];
  specialties: string[];
  verificationStatus: VerificationStatus;
  verificationNotes?: string;
  stallNumber?: string;
  marketIds: mongoose.Types.ObjectId[];
  averageRating: number;
  ratingAverage: number;
  reviewCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const FarmerProfileSchema = new Schema<IFarmerProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    businessName: { type: String, default: '' },
    displayName: { type: String, default: '' },
    farmName: {
      type: String,
      required: [true, 'Farm name is required'],
      trim: true,
    },
    bio: { type: String, default: '' },
    phone: { type: String, default: '' },
    email: { type: String, default: '' },
    profileImage: { type: String, default: '' },
    coverImage: { type: String, default: '' },
    farmLocation: {
      address: { type: String, default: '' },
      city: { type: String, default: '' },
      coordinates: { type: [Number], default: [0, 0] },
    },
    latitude: { type: Number, default: 37.8044 },
    longitude: { type: Number, default: -122.2712 },
    marketsServed: [{ type: String }],
    operatingDays: [{ type: String, default: ['Saturday', 'Sunday'] }],
    pickupSlots: [{ type: String, default: ['08:00 AM - 11:00 AM', '11:00 AM - 02:00 PM'] }],
    farmingPractices: [{ type: String }],
    specialties: [{ type: String }],
    verificationStatus: {
      type: String,
      enum: ['NOT_REQUIRED', 'PENDING', 'VERIFIED', 'REJECTED'],
      default: 'PENDING',
      index: true,
    },
    verificationNotes: { type: String, default: '' },
    stallNumber: { type: String, default: '' },
    marketIds: [{ type: Schema.Types.ObjectId, ref: 'Market', index: true }],
    averageRating: { type: Number, default: 4.8, min: 0, max: 5 },
    reviewCount: { type: Number, default: 12, min: 0 },
    isActive: { type: Boolean, default: true, index: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

FarmerProfileSchema.virtual('ratingAverage').get(function (this: any) {
  return this.averageRating;
});

FarmerProfileSchema.index({ farmName: 'text', bio: 'text', specialties: 'text' });

export const FarmerProfile = mongoose.model<IFarmerProfile>('FarmerProfile', FarmerProfileSchema);
