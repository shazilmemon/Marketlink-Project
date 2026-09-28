import mongoose, { Schema, Document } from 'mongoose';

export type AuthProviderType = 'EMAIL' | 'GOOGLE' | 'GITHUB' | 'LINKEDIN';

export interface IAuthAccount extends Document {
  userId: mongoose.Types.ObjectId;
  provider: AuthProviderType;
  providerAccountId: string;
  providerEmail?: string;
  providerUsername?: string;
  providerAvatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AuthAccountSchema = new Schema<IAuthAccount>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    provider: {
      type: String,
      enum: ['EMAIL', 'GOOGLE', 'GITHUB', 'LINKEDIN'],
      required: true,
    },
    providerAccountId: {
      type: String,
      required: true,
    },
    providerEmail: {
      type: String,
      lowercase: true,
      trim: true,
    },
    providerUsername: {
      type: String,
      default: '',
    },
    providerAvatar: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// Unique compound index: (provider, providerAccountId)
AuthAccountSchema.index({ provider: 1, providerAccountId: 1 }, { unique: true });
AuthAccountSchema.index({ userId: 1, provider: 1 });

export const AuthAccount = mongoose.model<IAuthAccount>('AuthAccount', AuthAccountSchema);
