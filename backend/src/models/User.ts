import mongoose, { Schema, Document } from 'mongoose';

export type UserRole = 'CUSTOMER' | 'FARMER' | 'ADMIN' | 'PARTNER' | 'customer' | 'farmer' | 'admin';
export type VerificationStatus = 'NOT_REQUIRED' | 'PENDING' | 'VERIFIED' | 'REJECTED';

export interface IAuthProvider {
  provider: 'email' | 'google' | 'github' | 'linkedin';
  providerId?: string;
}

export interface IUser extends Document {
  name: string;
  username: string;
  email: string;
  passwordHash?: string;
  avatar?: string;
  role: UserRole;
  contactNumber?: string;
  address?: string;
  favoriteFarmers: mongoose.Types.ObjectId[];
  favoriteProducts: mongoose.Types.ObjectId[];
  authProviders: IAuthProvider[];
  isActive: boolean;
  isEmailVerified: boolean;
  verificationStatus: VerificationStatus;
  lastLoginAt?: Date;
  loginCount: number;
  refreshTokenHash?: string;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    username: {
      type: String,
      trim: true,
      default: function (this: any) {
        return this.email ? this.email.split('@')[0] : '';
      },
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: false,
      select: false,
    },
    avatar: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      enum: ['CUSTOMER', 'FARMER', 'ADMIN', 'PARTNER', 'customer', 'farmer', 'admin'],
      default: 'CUSTOMER',
      index: true,
      set: (val: string) => val ? val.toUpperCase() : 'CUSTOMER',
    },
    contactNumber: {
      type: String,
      default: '',
    },
    address: {
      type: String,
      default: '',
    },
    favoriteFarmers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'FarmerProfile',
      },
    ],
    favoriteProducts: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
    authProviders: [
      {
        provider: {
          type: String,
          enum: ['email', 'google', 'github', 'linkedin'],
          required: true,
        },
        providerId: { type: String },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    verificationStatus: {
      type: String,
      enum: ['NOT_REQUIRED', 'PENDING', 'VERIFIED', 'REJECTED'],
      default: 'NOT_REQUIRED',
      index: true,
    },
    lastLoginAt: {
      type: Date,
    },
    loginCount: {
      type: Number,
      default: 0,
    },
    refreshTokenHash: {
      type: String,
      select: false,
    },
    emailVerificationToken: {
      type: String,
      select: false,
    },
    emailVerificationExpires: {
      type: Date,
    },
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_doc, ret: Record<string, any>) {
        delete ret.passwordHash;
        delete ret.refreshTokenHash;
        delete ret.emailVerificationToken;
        delete ret.passwordResetToken;
        delete ret.__v;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

UserSchema.index({ email: 1, role: 1 });

export const User = mongoose.model<IUser>('User', UserSchema);
