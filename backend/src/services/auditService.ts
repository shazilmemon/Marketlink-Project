import { AuditLog } from '../models/AuditLog';
import { logger } from '../utils/logger';

export type AuditAction =
  | 'LOGIN'
  | 'LOGOUT'
  | 'REGISTER'
  | 'OAUTH_LOGIN'
  | 'OAUTH_LINK'
  | 'ROLE_CHANGE'
  | 'FARMER_APPLICATION'
  | 'FARMER_APPROVAL'
  | 'FARMER_REJECTION'
  | 'PASSWORD_RESET_REQUEST'
  | 'PASSWORD_RESET_SUCCESS'
  // Phase 3 Marketplace Actions
  | 'PRODUCT_CREATED'
  | 'PRODUCT_UPDATED'
  | 'PRODUCT_DELETED'
  | 'INVENTORY_UPDATED'
  | 'ORDER_CREATED'
  | 'ORDER_CONFIRMED'
  | 'ORDER_REJECTED'
  | 'ORDER_CANCELLED'
  | 'ORDER_READY'
  | 'ORDER_PICKED_UP'
  | 'REVIEW_CREATED'
  | 'REVIEW_MODERATED'
  | 'FAVORITE_ADDED'
  | 'FAVORITE_REMOVED'
  | 'MARKET_CREATED'
  | 'MARKET_UPDATED'
  | 'MARKET_DELETED'
  | 'STALL_CREATED'
  | 'STALL_UPDATED'
  | 'FARMER_PROFILE_UPDATED';

export interface RecordAuditInput {
  userId?: string;
  action: AuditAction;
  category?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export class AuditService {
  public static async record(input: RecordAuditInput): Promise<void> {
    try {
      const sanitizedDetails = { ...input.details };
      // Security enforcement: Ensure sensitive fields are stripped
      delete sanitizedDetails.password;
      delete sanitizedDetails.passwordHash;
      delete sanitizedDetails.token;
      delete sanitizedDetails.accessToken;
      delete sanitizedDetails.refreshToken;

      await AuditLog.create({
        userId: input.userId,
        action: input.action,
        category: input.category || 'AUTHENTICATION',
        details: sanitizedDetails,
        ipAddress: input.ipAddress || '',
        userAgent: input.userAgent || '',
      });

      logger.info(`📝 Audit logged: [${input.action}] for user: ${input.userId || 'ANONYMOUS'}`);
    } catch (error) {
      logger.error('Failed to write audit log:', error);
    }
  }
}
