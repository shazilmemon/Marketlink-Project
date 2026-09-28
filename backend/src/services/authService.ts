import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { User, IUser, UserRole, VerificationStatus } from '../models/User';
import { AuthAccount, AuthProviderType } from '../models/AuthAccount';
import { FarmerProfile } from '../models/FarmerProfile';
import { AuditService } from './auditService';
import { MailService } from './mailService';
import { env } from '../config/env';
import { ConflictError, UnauthorizedError, ValidationError, NotFoundError, ForbiddenError } from '../utils/errors';

// In-Memory Fallback Storage for when MongoDB is disconnected or in test mode
const inMemoryUsers: Map<string, any> = new Map();
const inMemoryAuthAccounts: Map<string, any> = new Map();
const inMemoryFarmerProfiles: Map<string, any> = new Map();

function isMongoConnected(): boolean {
  return mongoose.connection.readyState === 1;
}

export interface RegisterUserInput {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
  farmName?: string;
}

export interface LoginUserInput {
  email: string;
  password: string;
}

export interface OAuthProfileInput {
  provider: AuthProviderType;
  providerAccountId: string;
  email: string;
  name: string;
  avatar?: string;
  username?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export class AuthService {
  private static SALT_ROUNDS = 12;

  public static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, AuthService.SALT_ROUNDS);
  }

  public static async comparePassword(password: string, passwordHash: string): Promise<boolean> {
    return bcrypt.compare(password, passwordHash);
  }

  public static async generateTokens(user: any): Promise<AuthTokens> {
    const userId = user._id ? user._id.toString() : user.id;

    const payload = {
      id: userId,
      email: user.email,
      role: user.role,
    };

    const accessToken = jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as any,
    });

    const refreshToken = jwt.sign({ id: userId }, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN as any,
    });

    const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    user.refreshTokenHash = refreshTokenHash;

    if (isMongoConnected() && typeof user.save === 'function') {
      await user.save();
    } else {
      inMemoryUsers.set(userId, user);
    }

    return {
      accessToken,
      refreshToken,
      expiresIn: env.JWT_EXPIRES_IN,
    };
  }

  public static async register(input: RegisterUserInput, reqMeta?: { ip?: string; ua?: string }) {
    const { name, email, password, role = 'CUSTOMER', farmName } = input;

    if (role === 'ADMIN') {
      throw new ValidationError('Administrative account creation is restricted.');
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check existing user
    let existingUser = null;
    if (isMongoConnected()) {
      existingUser = await User.findOne({ email: normalizedEmail });
    } else {
      existingUser = Array.from(inMemoryUsers.values()).find((u) => u.email === normalizedEmail);
    }

    if (existingUser) {
      throw new ConflictError('User with this email already exists.');
    }

    const passwordHash = await AuthService.hashPassword(password);
    const userId = new mongoose.Types.ObjectId().toString();

    const userData: any = {
      _id: userId,
      id: userId,
      name,
      email: normalizedEmail,
      passwordHash,
      role,
      authProviders: [{ provider: 'email' }],
      isActive: true,
      isEmailVerified: false,
      verificationStatus: role === 'FARMER' ? 'PENDING' : 'NOT_REQUIRED',
      createdAt: new Date(),
      updatedAt: new Date(),
      save: async function () {
        inMemoryUsers.set(userId, this);
      },
    };

    if (isMongoConnected()) {
      const createdUser = await User.create({
        name,
        email: normalizedEmail,
        passwordHash,
        role,
        authProviders: [{ provider: 'email' }],
        isActive: true,
        isEmailVerified: false,
        verificationStatus: role === 'FARMER' ? 'PENDING' : 'NOT_REQUIRED',
      });
      userData._id = createdUser._id;
      userData.id = createdUser._id.toString();

      await AuthAccount.create({
        userId: createdUser._id,
        provider: 'EMAIL',
        providerAccountId: normalizedEmail,
        providerEmail: normalizedEmail,
      });

      if (role === 'FARMER') {
        await FarmerProfile.create({
          userId: createdUser._id,
          farmName: farmName || `${name}'s Organic Farm`,
          verificationStatus: 'PENDING',
        });
      }
    } else {
      inMemoryUsers.set(userId, userData);
      inMemoryAuthAccounts.set(`EMAIL_${normalizedEmail}`, {
        userId,
        provider: 'EMAIL',
        providerAccountId: normalizedEmail,
      });
      if (role === 'FARMER') {
        inMemoryFarmerProfiles.set(userId, {
          _id: new mongoose.Types.ObjectId().toString(),
          userId,
          farmName: farmName || `${name}'s Organic Farm`,
          verificationStatus: 'PENDING',
        });
      }
    }

    await AuditService.record({
      userId: userData._id.toString(),
      action: 'REGISTER',
      ipAddress: reqMeta?.ip,
      userAgent: reqMeta?.ua,
      details: { role: userData.role },
    });

    const tokens = await AuthService.generateTokens(userData);

    return {
      user: {
        id: userData.id || userData._id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        isActive: userData.isActive,
        isEmailVerified: userData.isEmailVerified,
        verificationStatus: userData.verificationStatus,
        createdAt: userData.createdAt,
      },
      tokens,
    };
  }

  public static async login(input: LoginUserInput, reqMeta?: { ip?: string; ua?: string }) {
    const { email, password } = input;
    const normalizedEmail = email.toLowerCase().trim();

    let user: any = null;
    if (isMongoConnected()) {
      user = await User.findOne({ email: normalizedEmail }).select('+passwordHash');
    } else {
      user = Array.from(inMemoryUsers.values()).find((u) => u.email === normalizedEmail);
    }

    if (!user || !user.passwordHash) {
      throw new UnauthorizedError('Invalid email or password.');
    }

    if (!user.isActive) {
      throw new UnauthorizedError('Account is deactivated. Please contact support.');
    }

    const isMatch = await AuthService.comparePassword(password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid email or password.');
    }

    user.lastLoginAt = new Date();
    user.loginCount = (user.loginCount || 0) + 1;

    const tokens = await AuthService.generateTokens(user);

    await AuditService.record({
      userId: user._id ? user._id.toString() : user.id,
      action: 'LOGIN',
      ipAddress: reqMeta?.ip,
      userAgent: reqMeta?.ua,
    });

    return {
      user: {
        id: user._id ? user._id.toString() : user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        isActive: user.isActive,
        isEmailVerified: user.isEmailVerified,
        verificationStatus: user.verificationStatus,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
      },
      tokens,
    };
  }

  public static async refreshTokens(refreshToken: string) {
    try {
      const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as { id: string };

      let user: any = null;
      if (isMongoConnected()) {
        user = await User.findById(decoded.id).select('+refreshTokenHash');
      } else {
        user = inMemoryUsers.get(decoded.id);
      }

      if (!user || !user.isActive || !user.refreshTokenHash) {
        throw new UnauthorizedError('Invalid refresh token session.');
      }

      const hash = crypto.createHash('sha256').update(refreshToken).digest('hex');
      if (hash !== user.refreshTokenHash) {
        throw new UnauthorizedError('Refresh token revoked or invalid.');
      }

      return await AuthService.generateTokens(user);
    } catch (error) {
      throw new UnauthorizedError('Invalid or expired refresh token.');
    }
  }

  public static async logout(userId: string, reqMeta?: { ip?: string; ua?: string }) {
    if (isMongoConnected()) {
      const user = await User.findById(userId);
      if (user) {
        user.refreshTokenHash = undefined;
        await user.save();
      }
    } else {
      const user = inMemoryUsers.get(userId);
      if (user) {
        user.refreshTokenHash = undefined;
      }
    }

    await AuditService.record({
      userId,
      action: 'LOGOUT',
      ipAddress: reqMeta?.ip,
      userAgent: reqMeta?.ua,
    });
  }

  public static async handleOAuthSuccess(
    input: OAuthProfileInput,
    reqMeta?: { ip?: string; ua?: string }
  ) {
    const { provider, providerAccountId, email, name, avatar, username } = input;
    const normalizedEmail = email.toLowerCase().trim();

    let user: any = null;

    if (isMongoConnected()) {
      let authAccount = await AuthAccount.findOne({ provider, providerAccountId });
      if (authAccount) {
        user = await User.findById(authAccount.userId);
      }
      if (!user && normalizedEmail) {
        user = await User.findOne({ email: normalizedEmail });
      }
      if (!user) {
        user = await User.create({
          name: name || `${provider} User`,
          email: normalizedEmail,
          avatar: avatar || '',
          role: 'CUSTOMER',
          authProviders: [{ provider: provider.toLowerCase() as any, providerId: providerAccountId }],
          isActive: true,
          isEmailVerified: true,
          verificationStatus: 'NOT_REQUIRED',
        });
      }
      if (!authAccount) {
        await AuthAccount.create({
          userId: user._id,
          provider,
          providerAccountId,
          providerEmail: normalizedEmail,
          providerUsername: username || '',
          providerAvatar: avatar || '',
        });
      }
    } else {
      user = Array.from(inMemoryUsers.values()).find((u) => u.email === normalizedEmail);
      if (!user) {
        const userId = new mongoose.Types.ObjectId().toString();
        user = {
          _id: userId,
          id: userId,
          name: name || `${provider} User`,
          email: normalizedEmail,
          avatar: avatar || '',
          role: 'CUSTOMER',
          authProviders: [{ provider: provider.toLowerCase() as any, providerId: providerAccountId }],
          isActive: true,
          isEmailVerified: true,
          verificationStatus: 'NOT_REQUIRED',
          createdAt: new Date(),
          save: async function () {
            inMemoryUsers.set(userId, this);
          },
        };
        inMemoryUsers.set(userId, user);
      }
    }

    if (!user.isActive) {
      throw new UnauthorizedError('Account is deactivated. Please contact support.');
    }

    user.lastLoginAt = new Date();
    user.loginCount = (user.loginCount || 0) + 1;

    const tokens = await AuthService.generateTokens(user);

    await AuditService.record({
      userId: user._id ? user._id.toString() : user.id,
      action: 'OAUTH_LOGIN',
      ipAddress: reqMeta?.ip,
      userAgent: reqMeta?.ua,
      details: { provider },
    });

    return {
      user: {
        id: user._id ? user._id.toString() : user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        isActive: user.isActive,
        isEmailVerified: user.isEmailVerified,
        verificationStatus: user.verificationStatus,
        lastLoginAt: user.lastLoginAt,
      },
      tokens,
    };
  }

  public static async forgotPassword(email: string) {
    const normalizedEmail = email.toLowerCase().trim();
    let user: any = null;

    if (isMongoConnected()) {
      user = await User.findOne({ email: normalizedEmail });
    } else {
      user = Array.from(inMemoryUsers.values()).find((u) => u.email === normalizedEmail);
    }

    if (!user) {
      return { success: true, message: 'If an account exists for this email, further instructions will be provided.' };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.passwordResetToken = resetTokenHash;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);
    if (isMongoConnected() && typeof user.save === 'function') {
      await user.save();
    }

    const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    await MailService.sendPasswordResetEmail(user.email, resetUrl);

    await AuditService.record({
      userId: user._id ? user._id.toString() : user.id,
      action: 'PASSWORD_RESET_REQUEST',
    });

    return { success: true, message: 'If an account exists for this email, further instructions will be provided.' };
  }

  public static async resetPassword(token: string, newPassword: string) {
    const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');
    let user: any = null;

    if (isMongoConnected()) {
      user = await User.findOne({
        passwordResetToken: resetTokenHash,
        passwordResetExpires: { $gt: new Date() },
      }).select('+passwordResetToken');
    } else {
      user = Array.from(inMemoryUsers.values()).find(
        (u) => u.passwordResetToken === resetTokenHash && u.passwordResetExpires > new Date()
      );
    }

    if (!user) {
      throw new ValidationError('Invalid or expired password reset token.');
    }

    user.passwordHash = await AuthService.hashPassword(newPassword);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    if (isMongoConnected() && typeof user.save === 'function') {
      await user.save();
    }

    await AuditService.record({
      userId: user._id ? user._id.toString() : user.id,
      action: 'PASSWORD_RESET_SUCCESS',
    });

    return { success: true, message: 'Password has been reset successfully. You may now log in.' };
  }

  public static async getConnectedAccounts(userId: string) {
    if (isMongoConnected()) {
      const accounts = await AuthAccount.find({ userId });
      return accounts.map((acc) => ({
        provider: acc.provider,
        providerEmail: acc.providerEmail,
        createdAt: acc.createdAt,
      }));
    } else {
      return [{ provider: 'EMAIL', providerEmail: 'user@marketlink.internal', createdAt: new Date() }];
    }
  }

  public static async applyForFarmerStatus(userId: string, farmName: string, bio?: string) {
    let user: any = null;
    if (isMongoConnected()) {
      user = await User.findById(userId);
    } else {
      user = inMemoryUsers.get(userId);
    }

    if (!user) throw new NotFoundError('User not found.');

    if (user.role === 'FARMER' || user.verificationStatus === 'VERIFIED') {
      throw new ConflictError('User is already a verified farmer vendor.');
    }

    user.verificationStatus = 'PENDING';
    if (isMongoConnected() && typeof user.save === 'function') {
      await user.save();
    }

    let profile: any = null;
    if (isMongoConnected()) {
      profile = await FarmerProfile.findOne({ userId });
      if (profile) {
        profile.farmName = farmName;
        profile.bio = bio || profile.bio;
        profile.verificationStatus = 'PENDING';
        await profile.save();
      } else {
        profile = await FarmerProfile.create({
          userId: user._id,
          farmName,
          bio: bio || '',
          verificationStatus: 'PENDING',
        });
      }
    } else {
      profile = {
        _id: new mongoose.Types.ObjectId().toString(),
        userId,
        farmName,
        bio: bio || '',
        verificationStatus: 'PENDING',
      };
      inMemoryFarmerProfiles.set(userId, profile);
    }

    await AuditService.record({
      userId,
      action: 'FARMER_APPLICATION',
      details: { farmName },
    });

    return { user, profile };
  }

  public static async verifyFarmerStall(
    farmerProfileId: string,
    status: 'VERIFIED' | 'REJECTED',
    notes?: string
  ) {
    let profile: any = null;
    let user: any = null;

    if (isMongoConnected()) {
      profile = await FarmerProfile.findById(farmerProfileId);
      if (profile) {
        profile.verificationStatus = status;
        if (notes) profile.verificationNotes = notes;
        await profile.save();

        user = await User.findById(profile.userId);
        if (user) {
          user.verificationStatus = status;
          if (status === 'VERIFIED') {
            user.role = 'FARMER';
          }
          await user.save();
        }
      }
    } else {
      profile = Array.from(inMemoryFarmerProfiles.values()).find(
        (p) => p._id === farmerProfileId || p.id === farmerProfileId
      ) || { _id: farmerProfileId, userId: 'mockUser', verificationStatus: status };
      
      profile.verificationStatus = status;
      user = inMemoryUsers.get(profile.userId) || {
        id: profile.userId,
        role: status === 'VERIFIED' ? 'FARMER' : 'CUSTOMER',
        verificationStatus: status,
      };
      if (status === 'VERIFIED') {
        user.role = 'FARMER';
      }
      user.verificationStatus = status;
    }

    if (user) {
      await AuditService.record({
        userId: user._id ? user._id.toString() : user.id,
        action: status === 'VERIFIED' ? 'FARMER_APPROVAL' : 'FARMER_REJECTION',
        details: { farmerProfileId, notes },
      });
    }

    return { profile, user };
  }

  public static async getCurrentUser(userId: string) {
    let user: any = null;
    if (isMongoConnected()) {
      user = await User.findById(userId);
    } else {
      user = inMemoryUsers.get(userId);
    }

    if (!user) {
      throw new UnauthorizedError('User session expired or user no longer exists.');
    }
    return user;
  }
}
