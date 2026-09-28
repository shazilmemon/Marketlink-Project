import { Request, Response, NextFunction } from 'express';
import { ForbiddenError, UnauthorizedError } from '../utils/errors';
import { UserRole } from '../models/User';

export const requireRole = (...allowedRoles: (UserRole | string)[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user) {
      return next(new UnauthorizedError('Authentication required.'));
    }

    const userRoleNormalized = (user.role || '').toString().toUpperCase();
    const allowedNormalized = allowedRoles.map((r) => r.toString().toUpperCase());

    if (!allowedNormalized.includes(userRoleNormalized)) {
      return next(
        new ForbiddenError(
          `Role '${user.role}' is not authorized to access this route.`
        )
      );
    }

    next();
  };
};

export const requireAdmin = requireRole('ADMIN', 'admin');
export const requireFarmer = requireRole('FARMER', 'farmer');
export const requireCustomer = requireRole('CUSTOMER', 'customer');
